// Shared setup for interactive party encounters. Combat resolution is added separately.
export function partyEnemyTarget(enemy,heroes,random){
 const alive=heroes.filter(hero=>!hero.dead&&hero.hp>0),current=alive.find(hero=>hero.id===enemy.targetHeroId);
 if(current)return current;
 const target=alive.length?alive[random.int(0,alive.length-1)]:null;enemy.targetHeroId=target?.id??null;return target;
}
export function preparePartyCombat(heroes,enemies,random){
 const members=structuredClone(heroes),foes=enemies.map((enemy,index)=>({...structuredClone(enemy),id:enemy.id??'guard-'+(index+1),name:(enemy.name??'Страж')+' №'+(index+1),targetHeroId:null}));
 const order=[...members.map(hero=>({id:hero.id,name:hero.name,side:'hero',bonus:hero.initiative??0})),...foes.map(enemy=>({id:enemy.id,name:enemy.name,side:'enemy',bonus:enemy.initiative??0}))].map((actor,index)=>{const roll=random.int(1,20);return {...actor,index,roll,total:roll+actor.bonus};}).sort((a,b)=>b.total-a.total||(a.side===b.side?0:a.side==='hero'?-1:1)||a.index-b.index);
 const events=[{type:'окружение отряда',text:foes.some(enemy=>enemy.webAttack)?"В конце туннеля вы выходите в большой коридор с рельсами, и нежданно на вас нападает огромный кислотный паук.":foes.some(enemy=>enemy.kind==='bandit')?'Бандиты вскидывают оружие.':'Стражи буквально окружают вас и атакуют со всех сторон. В этом беспорядочном бою построение не защищает от выбора целью.'},{type:'инициатива отряда',order:structuredClone(order)}];
 for(const enemy of foes){const target=partyEnemyTarget(enemy,members,random);if(target)events.push({type:'цель Стража',enemy:enemy.name,target:target.name,targetHeroId:target.id});}
 return {heroes:members,enemies:foes,order,events,status:'pending',round:1};
}

export function updatePartyCasualties(combat){
 const fallen=combat.heroes.filter(hero=>hero.dead||hero.hp<=0),alive=combat.heroes.filter(hero=>!hero.dead&&hero.hp>0),known=new Set(combat.fallenIds??[]),fresh=fallen.filter(hero=>!known.has(hero.id));
 for(const hero of fallen){hero.hp=0;hero.dead=true;known.add(hero.id);}combat.fallenIds=[...known];
 if(!alive.length){combat.status='defeat';delete combat.casualtyDecision;return combat.status;}
 if(fresh.length){combat.status='casualty';combat.casualtyDecision={fallenIds:fresh.map(hero=>hero.id),survivorIds:alive.map(hero=>hero.id)};combat.events.push({type:'потеря отряда',text:fallen.map(hero=>hero.name).join(', ')+' повержен. Бой приостановлен: сбежать с оставшимся героем или драться до последнего.'});}
 return combat.status;
}
export function decidePartyCasualty(combat,decision){
 if(combat.status!=='casualty'||!combat.casualtyDecision)throw Error('Сейчас нет выбора после потери героя.');
 if(!['escape','fight'].includes(decision))throw Error('Выбери: сбежать или продолжить бой.');
 combat.events.push({type:'потеря отряда',text:decision==='escape'?'Вы отступаете, оставив поверженного товарища.':'Вы остаётесь и сражаетесь до последнего.'});
 combat.status=decision==='escape'?'escaped':'running';delete combat.casualtyDecision;return combat.status;
}

export function beginPartyRecovery(combat){
 if(combat.status==='recovery')return combat;
 if(combat.status!=='victory'||combat.enemies.some(enemy=>enemy.hp>0)||!combat.heroes.some(hero=>!hero.dead&&hero.hp>0))throw Error('Восстановление доступно только после победы.');
 for (const hero of combat.heroes) {
  if (!hero.dead && hero.hp > 0) continue;
  hero.dead = false;
  hero.hp = 1;
  combat.events.push({type:'потеря отряда',text:hero.name+' приходит в себя с 1 HP.'});
 }
 combat.status = 'recovery';
 delete combat.casualtyDecision;
 return combat;
}
import {heroAttackStats,evasionAtDistance,hits,damageAfterArmor,weaponMaxDistance,dualPistolsActive,distanceFromMargin,nationalityHealing,perceptionCheck,weaponJammed,applyAutoStimulator} from './combat.js';
import {ITEMS,TECHNOPARK} from './data.js';

// A hero keeps a target until it falls; personal attackers take priority.
export function partyHeroTarget(hero,combat){
 const alive=combat.enemies.filter(e=>e.hp>0),personal=alive.filter(e=>e.targetHeroId===hero.id),pool=personal.length?personal:alive;
 const target=pool.find(e=>e.id===hero.attackTargetId)??pool[0]??null;hero.attackTargetId=target?.id??null;return target;
}
export function partyBattleExperience(combat){return combat.enemies.filter(e=>e.hp<=0).reduce((xp,e)=>xp+(e.experience??TECHNOPARK.enemy.experience),0);}
export const formatPartyLogText=text=>String(text).replace(/-?\d+\.\d+/g,value=>Number(value).toLocaleString('ru-RU',{maximumFractionDigits:1,useGrouping:false}));
function say(c,text){c.events.push({type:'событие отряда',turn:c.round,text:formatPartyLogText(text)});}
function armorDamage(c,target,raw,type,random,piercing=false){
 let armor=piercing?0:type==='thermal'?(target.thermalArmor??0):(target.armor??0);
 if(!piercing&&target.firstHitArmor&&!target.paddingSpent){armor+=target.firstHitArmor;target.paddingSpent=true;say(c,target.name+': ватник слетает.');}
 let damage=damageAfterArmor(raw,armor);
 if(target.halveHeavyHit&&!target.heavyHitUsed&&damage>target.maxHp*.25){damage/=2;target.heavyHitUsed=true;}
 target.hp=Math.max(0,target.hp-damage);
 if(target.emergencyHeal&&!target.emergencyHealUsed&&target.hp<target.maxHp*.3){target.emergencyHealUsed=true;target.hp=Math.min(target.maxHp,target.hp+nationalityHealing(target,30+7*target.strength));say(c,target.name+': Живучий Уб восстанавливает здоровье.');}
 const auto=applyAutoStimulator({hero:target},random,target.hp,target);
 if(auto){target.hp=auto.hp;say(c,target.name+': Авто-стимулятор применяет «'+ITEMS[auto.item].name+'» и восстанавливает '+auto.healed+' HP.');}
 return damage;
}
function shot(c,actor,target,weapon,distance,random,hero=false,counter=false){
 const stats=hero?heroAttackStats(actor,weapon,distance,{targetHasWoundedHero:target.hurtHeroIds?.includes(actor.id),focusDamageBonus:actor.focusTarget===target.id?(weapon.type==='ranged'?10:weapon.noStrength?0:actor.strength*7):0,battleDamageBonus:actor.berserkDamage??0,hp:actor.hp,firstRanged:!actor.firstRangedSpent,correctionBonus:actor.correctionTarget===target.id?Math.min(actor.correctionMax??15,(actor.correctionShots??0)*(actor.correctionStep??0)):0}):null;
 const accuracy=hero?stats.accuracy+(actor.woundAccuracyActive?(actor.nationality?.battleWoundAccuracy??0):0)+(!actor.firstMeleeSpent&&weapon.type==='melee'?(actor.nationality?.firstMeleeAccuracy??0):0):actor.accuracy+(weapon.accuracyBonus??0),critical=random.int(1,100)<=(actor.criticalChance??(hero?5:3));
 const evasion=hero?target.evasion+(distance===0&&c.round===1?(target.openingCloseEvasionBonus??0):0):evasionAtDistance(target,distance,target.hp,(distance===0&&c.round===1?(target.openingCloseEvasionBonus??0):0)+(target.woundedInBattle?(target.nationality?.woundedEvasion??0):0));
 const roll=critical?null:random.int(1,100),hit=critical||hits(roll,accuracy,evasion);let damage=0;
 if(hero&&weapon.type==='ranged'){actor.firstRangedSpent=true;actor.correctionShots=actor.correctionTarget===target.id?(actor.correctionShots??0)+1:1;actor.correctionTarget=target.id;}
 if(hero&&weapon.type==='melee')actor.firstMeleeSpent=true;if(hit&&!hero){target.woundedInBattle=true;const n=target.nationality??{};target.berserkDamage=Math.min(n.berserkCap??0,(target.berserkDamage??0)+(n.berserkOnHit??0));}if(hit&&!hero)(actor.hurtHeroIds??=[]).push(target.id);
 if(hit)for(let n=0;n<(weapon.damageRolls??1);n++){
  let raw=random.int(weapon.min,weapon.max)+(stats?stats.bonus-stats.damagePenalty:0);raw*=stats?.damageMultiplier??1;if(critical)raw*=1.5;
  if(critical&&!hero)raw*=1-(target.nationality?.criticalDamageReductionPercent??0)/100;
  damage+=armorDamage(c,target,raw,weapon.damageType??'physical',random,weapon.piercing);
 }
 say(c,`${actor.name} → ${target.name}: ${weapon.name??ITEMS[weapon.item]?.name??weapon.item??'атака'} — ${hit?(critical?'КРИТ ':'')+damage+' урона, '+target.hp+' HP':'промах'}.`);
 if(hit&&weapon.type==='melee'&&target.thorns){
  const reflected=random.int(target.thorns.min,target.thorns.max);
  actor.hp=Math.max(0,actor.hp-reflected);
  say(c,target.name+': шипы наносят '+reflected+' урона противнику '+actor.name+'.');
 }
 if(!hero&&hit&&(target.battleStartHp??target.maxHp)-target.hp>=target.maxHp*.2)target.woundAccuracyActive=true;
 if(!hero&&!hit&&!counter&&distance===0&&target.hp>0&&actor.hp>0&&target.nationality?.counterOnMiss&&!target.counterUsed){const w=target.weapons?.main;if(w){target.counterUsed=true;shot(c,target,actor,w,0,random,true,true);}}
 return hit;
}
function blast(c,actor,item,random,repeat=false){
 const dark=item==='darkGrasp',spec=dark?{min:20,max:80,dodgeDc:14}:ITEMS[item],underfoot=!dark&&!repeat&&random.int(1,100)<=(actor.nationality?.grenadeSelfChance??5),strong=!dark&&!repeat&&random.int(1,100)<=10;
 const base=(random.int(spec.min,spec.max)+(dark?0:actor.nationality?.grenadeDamage??0))*(dark?actor.perception:1)*(strong?1.5:1);
 const opponents=actor.kind==='bandit'?c.heroes:c.enemies;
 const living=opponents.filter(target=>target.hp>0);
 const targets=actor.kind==='bandit'&&underfoot?[]:dark?living.slice(0,1):living;
 if(underfoot||repeat&&actor.burningSelf)targets.push(actor);
 for(const target of targets){const dodge=random.int(1,20)+(target.agility??target.stealth??0)>spec.dodgeDc;const damage=armorDamage(c,target,base*(dodge?.5:1),spec.damageType??'thermal',random);say(c,`${actor.name}: ${dark?'Тёмная хватка':repeat?'огонь Молотова':underfoot?'граната взорвалась под ногами':'граната'}${strong?' · сильный взрыв':''} → ${target.name}: ${damage} урона${dodge?' (уворот)':''}.`);}
 if(item==='molotov'&&!repeat){actor.burningRound=c.round+1;actor.burningSelf=underfoot;}
}
export function advancePartyCombat(combat,random,{maxActors=10000}={}){
 if(!['pending','running'].includes(combat.status))return combat;
 combat.status='running';combat.actorIndex??=0;combat.round??=1;
 if(!combat.initialized){
  combat.initialized=true;
  for(const h of combat.heroes){h.distances??={};for(const e of combat.enemies){const dc=9+(e.stealth??0),check=perceptionCheck(h,random,(h.perception??0)+(h.detectionBonus??0)+(h.nationality?.detectionBonus??0)+(h.initialPerceptionBonus??0)+(h.perceptionCheckBonus??0)-(h.checkPenalty??0),dc,{events:combat.events});h.distances[e.id]=Math.min(h.maxStartingDistance??3,distanceFromMargin(check.total-dc,h.maxStartingDistance??3)+(h.nationality?.startingDistance??0));h.battleStartHp=h.hp;}}
  // Every participating hero has their own opening grenade or Mark.
  combat.openingIndex=0;
 }
 if(combat.openingIndex!=null){
  for(;combat.openingIndex<combat.heroes.length;){const h=combat.heroes[combat.openingIndex++];if(h.hp<=0||!combat.enemies.some(e=>e.hp>0))continue;if(h.tinGrenades>0){h.tinGrenades--;blast(combat,h,'tinGrenade',random);}else if(h.molotovs>0){h.molotovs--;blast(combat,h,'molotov',random);}else if(h.grenades>0){h.grenades--;blast(combat,h,'pipeGrenade',random);}else if(h.darkGrasp)blast(combat,h,'darkGrasp',random);if(updatePartyCasualties(combat)!=='running')return combat;}delete combat.openingIndex;
 }
 for(const enemy of combat.enemies){
  if(enemy.kind!=='bandit'||enemy.hp<=0||!enemy.grenades)continue;
  enemy.grenades--;
  blast(combat,enemy,'pipeGrenade',random);
  if(updatePartyCasualties(combat)!=='running')return combat;
 }
 for(let count=0;count<maxActors;count++){
  if(!combat.enemies.some(e=>e.hp>0)){combat.status='victory';combat.experience=partyBattleExperience(combat);return combat;}
  if(combat.actorIndex>=combat.order.length&&!combat.pendingActor){combat.actorIndex=0;combat.round++;}if(combat.round>300){combat.status='limit';say(combat,'Бой остановлен: достигнут предел 300 раундов.');return combat;}
  const entry=combat.pendingActor??combat.order[combat.actorIndex++];
  const hero=entry.side==='hero',actor=(hero?combat.heroes:combat.enemies).find(x=>x.id===entry.id);if(!actor||actor.hp<=0)continue;
  if(hero){
   if(actor.burningRound&&combat.round>=actor.burningRound){delete actor.burningRound;blast(combat,actor,'molotov',random,true);}
   if(actor.hp<=0){if(updatePartyCasualties(combat)!=='running')return combat;continue;}
   if(actor.regeneration){const healed=Math.min(actor.regeneration,actor.maxHp-actor.hp);actor.hp+=healed;if(healed)say(combat,actor.name+': реген +'+healed+' = '+actor.hp);}
   if(actor.entangled){const roll=random.int(1,20),success=roll+actor.strength>13;if(success)actor.entangled=false;say(combat,`${actor.name}: освобождение ${roll} + ${actor.strength} против 13 — ${success?'успех':'опутан'}, ход потрачен.`);continue;}
   const target=partyHeroTarget(actor,combat);if(!target)continue;if(actor.firstEnemyFocus&&!actor.focusBattleUsed){actor.focusTarget=target.id;actor.focusBattleUsed=true;}const distance=actor.distances[target.id]??0,main=actor.weapons?.main;
   let weapon=distance===0?(main??actor.weapons?.ranged):main?.type==='ranged'&&distance<=weaponMaxDistance(actor,main)?main:actor.weapons?.ranged;
   if(actor.reloading){actor.reloading=false;weapon=distance===0?actor.reloadWeapon?.bayonet:null;say(combat,actor.name+': перезарядка.');}
   if(!weapon||distance>0&&(weapon.type!=='ranged'||distance>weaponMaxDistance(actor,weapon))){say(combat,actor.name+': нет оружия для дистанции '+distance);continue;}
   if(weaponJammed(weapon,random)){
    actor.ownTurnDone=true;
    say(combat,actor.name+': '+(weapon.name??ITEMS[weapon.item]?.name??'оружие')+' заклинило. Ход пропущен.');
    continue;
   }
   if(weapon.reloadMain&&(weapon===main||weapon.reloadEverySlot)){actor.reloading=true;actor.reloadWeapon=weapon;}
   if(actor.tauntFirstTurn&&!actor.ownTurnDone){target.accuracy+=10;target.evasion-=20;}
   let sequence=Array.from({length:heroAttackStats(actor,weapon,distance).attacks},()=>weapon);
   if(dualPistolsActive(actor))sequence=[main,actor.weapons.ranged].filter(w=>distance<=weaponMaxDistance(actor,w));
   else if(actor.dualWield&&distance===0&&actor.weapons?.ranged?.type==='melee')sequence=sequence.flatMap(w=>[w,{...actor.weapons.ranged,noStrength:true}]);
   if(!actor.ownTurnDone&&actor.nationality?.openingExtraAttack)sequence.push(weapon);
   for(const w of sequence){if(target.hp<=0)break;shot(combat,actor,target,w,distance,random,true);}
   if(actor.quickRetreat&&!actor.ownTurnDone&&distance===0)for(const id of Object.keys(actor.distances))actor.distances[id]=Math.min(3,actor.distances[id]+1);
   actor.ownTurnDone=true;
  }else if(actor.webAttack){
   actor.plannedAttacks??=combat.heroes.some(h=>h.hp>0&&!h.dead&&!h.entangled)?['web','main']:['main','main'];
   while(actor.hp>0&&actor.plannedAttacks.length){
    const kind=actor.plannedAttacks.shift(),alive=combat.heroes.filter(h=>h.hp>0&&!h.dead),free=alive.filter(h=>!h.entangled);
    const target=free[0]??alive.sort((a,b)=>a.hp-b.hp)[0];if(!target)break;
    const distance=target.distances?.[actor.id]??0;
    if(distance>(kind==='web'?1:0)){for(const hero of alive){hero.distances??={};hero.distances[actor.id]=Math.max(0,(hero.distances[actor.id]??distance)-1);}say(combat,actor.name+' сокращает дистанцию до '+Math.max(0,distance-1)+' вместо атаки.');continue;}
    const spec=kind==='web'?actor.webAttack:actor.mainAttack;
    const hit=shot(combat,actor,target,{...spec,type:kind==='main'?'melee':'ranged',min:spec.damageMin,max:spec.damageMax},distance,random);
    if(kind==='web'&&hit&&target.hp>0){const roll=random.int(1,20);target.entangled=roll+target.strength<=13;say(combat,target.name+': Сила '+roll+' + '+target.strength+' против 13 — '+(target.entangled?'опутан':'выстоял')+'.');}
    if(updatePartyCasualties(combat)!=='running'){if(actor.hp>0&&actor.plannedAttacks.length)combat.pendingActor=entry;else{delete actor.plannedAttacks;delete combat.pendingActor;}return combat;}
   }
   delete actor.plannedAttacks;delete combat.pendingActor;
  }else if(actor.firearm){
   const target=partyEnemyTarget(actor,combat.heroes,random);
   if(target){
    const distance=target.distances?.[actor.id]??0;
    const weapon=actor.firearm;
    if(distance>(weapon.maxDistance??Infinity)){
     for(const hero of combat.heroes)if(hero.distances)hero.distances[actor.id]=Math.max(0,(hero.distances[actor.id]??distance)-1);
     say(combat,actor.name+' сближается до '+(distance-1)+'.');
    }else{
     const accuracyBonus=(weapon.accuracyBonus??0)-(weapon.distancePenalty??15)*distance-(weapon.shotPenalty??0);
     for(let shotIndex=0;shotIndex<(weapon.shots??1)&&target.hp>0&&actor.hp>0;shotIndex++){
      shot(combat,actor,target,{...weapon,accuracyBonus},distance,random);
     }
    }
   }
  }else{
   const target=partyEnemyTarget(actor,combat.heroes,random);if(!target)continue;let distance=target.distances?.[actor.id]??0;
   if(distance>0&&!actor.rush){target.distances[actor.id]=distance-1;say(combat,actor.name+' сближается до '+(distance-1));}
   else if(distance>1){target.distances[actor.id]=distance-1;say(combat,actor.name+' сближается до '+(distance-1));}
   else{const rush=distance===1?actor.rush:null;shot(combat,actor,target,{name:rush?'Рывок':actor.attackName??'Укус',type:'melee',min:rush?.min??actor.damageMin,max:rush?.max??actor.damageMax,accuracyBonus:rush?.accuracyBonus??0,damageType:actor.damageType??'physical'},distance,random);if(rush)target.distances[actor.id]=0;target.enemyOpeningDone=true;}
  }
  if(updatePartyCasualties(combat)!=='running')return combat;
 }
 return combat;
}
