import {ITEMS} from './data.js';

export function rng(seed) {
  let state=seed>>>0;
  return { int(min,max) { state=(state+0x6D2B79F5)>>>0; let t=state; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return min+Math.floor((((t^(t>>>14))>>>0)/4294967296)*(max-min+1)); } };
}
export const distanceFromMargin = margin => margin>=10?3:margin>=5?2:margin>=1?1:0;
export const evasionAtDistance = (hero,distance) => hero.evasion+(distance===0?(hero.meleeEvasionBonus??0):0);
export const hits = (roll,accuracy,evasion) => roll+accuracy>evasion;
export const damageAfterArmor = (raw,armor) => Math.max(1,raw-armor);
export function levelXp(level,xp,reward,thresholds,maxLevel=20) {
  xp+=reward;
  while(level<maxLevel && thresholds[level]!=null && xp>=thresholds[level]) { xp-=thresholds[level]; level++; }
  return {level,xp};
}
function damageRoll(random,min,max,mode) { return mode==='scaled-original'?10*random.int(min/10,max/10):random.int(min,max); }
export function withStarterPerk(config,perk,level=1) {
  const next=structuredClone(config);next.hero.level=level;next.hero.perk=perk;
  if(perk==='melee-evasion') next.hero.meleeEvasionBonus=14*level/10;
  else if(perk==='evasion') next.hero.evasion+=5;
  else if(perk==='initiative') next.hero.initiative+=4;
  else if(perk==='double-strike') { next.hero.attacksPerTurn=2;next.hero.attackAccuracyPenalty=10;next.hero.attackDamagePenalty=20; }
  else if(perk==='armored'){next.hero.physicalArmorBonus=5;next.hero.thermalArmorBonus=5;}
  else if(perk==='double-shot'){next.hero.pistolAttacks=2;next.hero.pistolAccuracyPenalty=15;}
  else if(perk==='greedy'||perk==='gunsmith'){}
  else if(perk==='burst-fire')next.hero.burstBonus=1;
  else if(perk==='tough-cookie')next.hero.selfHealAfterBattle=5*next.hero.strength;
  else if(perk==='sharp'){next.hero.initiative+=2;next.hero.evasion+=3;}
  else if(perk!=='quick-orders'&&perk!=='none') throw new Error(`Unknown perk: ${perk}`);
  return next;
}
export function battle(config,random,startHp,{trace=false,damageMode=config.trial.damageMode,grenade=false,ambush=false,caravan=null}={}) {
  const h=config.hero,r=config.rat,events=[];
  const note=(type,data)=>{if(trace) events.push({type,...data});};
  let hp=startHp,ratHp=r.hp;
  const perceptionRoll=random.int(1,20),dc=9+r.stealth,margin=perceptionRoll+h.perception-(h.checkPenalty??0)-dc;
  let distance=distanceFromMargin(margin),initialDistance=distance;
  const heroRoll=random.int(1,20),ratRoll=random.int(1,20);
  let heroTurn=ambush||heroRoll+h.initiative>=ratRoll+r.initiative;
  note('дистанция',{roll:perceptionRoll,bonus:h.perception-(h.checkPenalty??0),dc,margin,distance});
  note('инициатива',{enemy:r.name??'крыса',heroRoll,heroBonus:h.initiative,ratRoll,ratBonus:r.initiative,first:heroTurn?'герой':(r.name??'крыса')});
  let padding=h.firstHitArmor??0;
  let rageTurns=0,rageTriggered=false;
  const triggerRage=turn=>{
    if(!r.rage||rageTriggered||ratHp<=0)return;
    rageTriggered=true;
    rageTurns=3;
    note('ярость вожака',{turn});
  };
  const absorbFirstHit=turn=>{
    const armor=padding;
    if(armor){padding=0;note('ватник',{turn,armor});}
    return armor;
  };
  const grenadeItem=grenade===true?'pipeGrenade':grenade;
  let burningHero=false;
  const blast=(target,agility,armor,base,dodgeDc)=>{
    const roll=random.int(1,20),dodged=roll+agility>dodgeDc;
    const damage=damageAfterArmor(base*(dodged?.5:1),armor);
    return {target,roll,agility,dodgeDc,dodged,armor,damage};
  };
  const applyBlast=(base,dodgeDc,hitHero,turn)=>{
    const enemy=blast(r.name??'крыса',r.agility??r.stealth,r.thermalArmor??0,base,dodgeDc);
    const self=hitHero?blast('герой',h.agility-(h.checkPenalty??0),(h.thermalArmor??0)+absorbFirstHit(turn),base,dodgeDc):null;
    ratHp-=enemy.damage;
    triggerRage(turn);
    if(self)hp-=self.damage;
    return self?[enemy,self]:[enemy];
  };
  const finish=turns=>{
    const won=hp>0&&ratHp<=0;
    return {won,hp:Math.max(0,hp),ratHp:Math.max(0,ratHp),turns,initialDistance,reason:won?'победа':'гибель',events};
  };
  if(grenadeItem){
    const {min,max,dodgeDc}=ITEMS[grenadeItem];
    const underfoot=random.int(1,100)<=5,strong=random.int(1,100)<=10;
    const base=random.int(min,max);
    burningHero=underfoot;
    const targets=applyBlast(base*(strong?1.5:1),dodgeDc,underfoot,0);
    note('граната',{base,underfoot,strong,targets,grenadeItem});
    if(hp<=0||ratHp<=0)return finish(0);
  }
  let reloading=false;
  let previousEnemyAttackHit=false;
  const main=h.weapons?h.weapons.main:{type:h.weaponType??'melee',min:h.weaponMin,max:h.weaponMax,bonus:h.weaponBonus??0};
  const inRange=(weapon,distance)=>weapon?.type==='ranged'&&distance<=(weapon.maxDistance??Infinity);
  for(let turn=1;turn<=config.trial.combatTurnLimit;turn++) {
    if(turn===2&&grenadeItem==='molotov'){
      const {min,max,dodgeDc}=ITEMS.molotov;
      const targets=applyBlast(random.int(min,max),dodgeDc,burningHero,turn);
      note('огонь Молотова',{turn,targets});
      if(hp<=0||ratHp<=0)return finish(turn);
    }
    const rush=!heroTurn&&distance===1?r.rush:null;
    const reloadTurn=heroTurn&&reloading;
    let weapon=distance===0?main:inRange(main,distance)?main:h.weapons?.ranged;
    if(ambush)weapon=inRange(main,distance)?main:h.weapons?.ranged;
    if(reloadTurn){
      reloading=false;
      weapon=distance===0?main.bayonet:null;
      note('перезарядка',{turn,distance,weapon:main.item});
    }
    const ranged=weapon?.type==='ranged',pistol=ranged&&weapon.weaponClass==='pistol';
    if(reloadTurn&&!weapon) { /* The reload consumes the hero's turn. */ }
    else if(heroTurn&&(!weapon||((ambush||distance>0)&&!inRange(weapon,distance)))) note('ожидание',{turn,actor:'герой',distance,reason:ambush||distance>0?'Нет оружия для этой дистанции':'Нет основного оружия'});
    else if(!heroTurn&&distance>0&&!rush) { distance--; note('сближение',{turn,actor:r.name??'крыса',distance}); }
    else {
      if(heroTurn&&weapon===main&&weapon.reloadMain) reloading=true;
      const actor=heroTurn?'герой':(r.name??'крыса');
      const powerSwing=!heroTurn&&previousEnemyAttackHit?r.powerSwing:null;
      const accuracy=heroTurn?h.accuracy+(distance===0?(h.closeAccuracyBonus??0):0)+(weapon.accuracyBonus??0)+(ranged?(h.rangedAccuracyBonus??0)-(weapon.distancePenalty??15)*distance:0)-(ranged?(pistol?(h.pistolAccuracyPenalty??0):0):(h.attackAccuracyPenalty??0)-(h.meleeAccuracyBonus??0))-(weapon.shotPenalty??0)+(weapon.shots?(h.burstAccuracyBonus??0):0)+(ambush?15:0):r.accuracy+(rush?.accuracyBonus??0)-(powerSwing?.accuracyPenalty??0)+(rageTriggered?(rageTurns>0?10:-10):0);
      const escortTarget=!heroTurn&&caravan?.hp>0;
      const evasion=heroTurn?r.evasion:escortTarget?caravan.evasion:evasionAtDistance(h,distance);
      const attacks=heroTurn?(ambush?1:ranged?(weapon.shots?weapon.shots+(h.burstBonus??0):pistol?(h.pistolAttacks??1):1):(h.attacksPerTurn??1)):(r.attacksPerTurn??1);
      const armor=heroTurn?(weapon.piercing?0:r.armor):escortTarget?caravan.armor:h.armor;
      const damagePenalty=heroTurn&&!ranged?(h.attackDamagePenalty??0):0;
      for(let attack=1;attack<=attacks;attack++){
        const roll=random.int(1,100),hit=hits(roll,accuracy,evasion);
        if(!heroTurn)previousEnemyAttackHit=hit;
        let base=0,bonus=0,damage=0;
        const components=[];
        const effectiveArmor=armor+(heroTurn&&!weapon.piercing&&rageTurns>0?20:0)+(!heroTurn&&!escortTarget&&hit?absorbFirstHit(turn):0);
        if(hit){
          bonus=heroTurn?(ranged?0:10*h.strength+(h.meleeDamageBonus??0))+(distance===0?(h.closeDamageBonus??0):0)+(weapon.bonus??0)+(pistol?(h.pistolDamageBonus??0):0):(powerSwing?.damageBonus??0)-(rageTriggered&&rageTurns===0?20:0);
          const rolls=heroTurn?(weapon.damageRolls??1):1;
          for(let i=0;i<rolls;i++){
            const raw=heroTurn?damageRoll(random,weapon.min,weapon.max,damageMode):damageRoll(random,rush?.min??r.damageMin,rush?.max??r.damageMax,damageMode);
            const dealt=damageAfterArmor(raw+bonus-damagePenalty,effectiveArmor);
            base+=raw;damage+=dealt;components.push(dealt);
          }
          if(heroTurn)ratHp-=damage;else if(escortTarget)caravan.hp=Math.max(0,caravan.hp-damage);else hp-=damage;
        }
        note('атака',{turn,attack,actor,...(escortTarget?{target:'караван',caravanHp:caravan.hp}:{}),weapon:heroTurn?(weapon.item??weapon.type):(rush?'Рывок':powerSwing?'Мощный замах':r.attackName??'укус'),...(heroTurn&&weapon.isBayonet?{bayonet:true}:{}),distance,roll,accuracy,evasion,hit,base,bonus,damagePenalty,armor:effectiveArmor,damage,...(components.length>1?{components}:{}),heroHp:Math.max(0,hp),ratHp:Math.max(0,ratHp)});
        if(heroTurn&&hit)triggerRage(turn);
        if(hp<=0||(ratHp<=0&&!weapon?.shots)) break;
      }
    }
    if(ambush)return {hp:Math.max(0,ratHp),events};
    if(rush){distance=0;note('сближение',{turn,actor:r.name,distance});}
    if(ratHp<=0||hp<=0)return finish(turn);
    if(caravan?.hp>0&&turn%2===0){
      const roll=random.int(1,100),accuracy=caravan.accuracy-15*distance,hit=hits(roll,accuracy,r.evasion);
      const damage=hit?damageAfterArmor(damageRoll(random,ITEMS.ashot.min,ITEMS.ashot.max,damageMode),r.armor):0;
      ratHp-=damage;
      note('атака',{turn,actor:'Караванщик',weapon:'ashot',roll,accuracy,evasion:r.evasion,hit,damage,heroHp:hp,ratHp:Math.max(0,ratHp),caravanHp:caravan.hp});
      if(ratHp<=0)return finish(turn);
    }
    if(!heroTurn&&rageTurns>0&&--rageTurns===0)note('усталость вожака',{turn});
    heroTurn=!heroTurn;
  }
  return {won:false,hp:Math.max(0,hp),ratHp,turns:config.trial.combatTurnLimit,initialDistance,reason:'лимит',events};
}
export function bandageHeal(config,random,hp,item='bandage') {
  const roll=item==='dressingKit'?random.int(20,50):random.int(10,30),raw=roll+10*config.hero.perception;
  return {hp:Math.min(config.hero.maxHp,hp+raw),roll,raw,healed:Math.min(config.hero.maxHp-hp,raw)};
}
// Explicit player action after a living return; not part of automatic batch strategies.
export function useBandageAfterExpedition(config,random,result) {
  if(!result.alive)return {applied:false,reason:'Герой погиб',result};
  if(result.hp>=config.hero.maxHp)return {applied:false,reason:'Здоровье полное',result};
  if(!(result.bandagesRemaining>0))return {applied:false,reason:'Нет оставшихся бинтов',result};
  const heal=bandageHeal(config,random,result.hp);
  const updated={...result,hp:heal.hp,bandagesRemaining:result.bandagesRemaining-1,bandagesUsed:(result.bandagesUsed??0)+1,healed:(result.healed??0)+heal.healed,events:[...(result.events??[]),{type:'бинт после вылазки',...heal,remaining:result.bandagesRemaining-1}]};
  return {applied:true,result:updated};
}
export function expedition(config,random,{hp=config.hero.maxHp,trace=false,damageMode=config.trial.damageMode,bandages=0,dressingKits=0,grenades=0,molotovs=0,caravan=null}={}) {
  if(!Number.isInteger(bandages)||bandages<0)throw new Error('Bandages must be a non-negative integer');
  const initialBandages=bandages,initialKits=dressingKits,initialGrenades=grenades,initialMolotovs=molotovs;let bandagesUsed=0,healed=0;
  const m=config.mission,events=[],battles=[],loot=Object.fromEntries(config.loot.map(x=>[x.id,0]));
  let found=m.fixedEncounters??0,killed=0,lootSuccesses=0,extraXp=0;
  let firstEnemy=config.rat;
  if(m.ambushDc!=null){
    const roll=random.int(1,20),bonus=config.hero.perception-(config.hero.checkPenalty??0),success=roll+bonus>m.ambushDc;
    if(trace)events.push({type:'засада',roll,bonus,dc:m.ambushDc,success});
    if(success){
      const opening=battle(config,random,hp,{trace,damageMode,ambush:true});
      firstEnemy={...firstEnemy,hp:opening.hp};
      if(trace)events.push(...opening.events.filter(e=>e.type==='атака'||e.type==='ожидание').map(e=>({...e,ambush:true})));
    }
    const reinforcements=firstEnemy.hp>0?random.int(1,3):0;
    found=1+reinforcements;
    if(trace&&reinforcements)events.push({type:'подкрепление',count:reinforcements});
    if(firstEnemy.hp===0)killed=1;
  }
  for(let i=0;i<m.searches;i++) { const roll=random.int(1,20),bonus=config.hero.perception-(config.hero.checkPenalty??0),success=roll+bonus>m.searchDc; found+=Number(success); if(trace) events.push({type:m.lootPerKill?'поиск противника':'поиск крыс',check:i+1,roll,bonus,dc:m.searchDc,success}); }
  const scoutCount=found;
  if(m.finalEnemy)found++;
  for(let i=killed;i<(m.segments??found);i++) {
    if(caravan){
      const attacked=random.int(1,100)<=m.attackChances[i];
      if(trace)events.push({type:'участок каравана',segment:i+1,attacked});
      if(!attacked){
        const roll=random.int(1,20),bonus=config.hero.perception-(config.hero.checkPenalty??0),total=roll+bonus,drops=[];
        if(total>8)drops.push(random.int(1,100)<=60?'cloth':'emptyBottle');
        if(total>13)drops.push('rareMushrooms');
        if(total>18)drops.push('rareMushrooms');
        for(const id of drops)loot[id]=(loot[id]??0)+1;
        if(trace)events.push({type:'обыск каравана',roll,bonus,drops});
        continue;
      }
      found++;
    }
    const grenade=grenades>0?'pipeGrenade':molotovs>0?'molotov':false;
    if(grenade==='pipeGrenade')grenades--;
    if(grenade==='molotov')molotovs--;
    const enemy=m.finalEnemy&&i===scoutCount?m.finalEnemy:i===0?firstEnemy:config.rat;
    if(trace&&enemy===m.finalEnemy)events.push({type:'появление вожака'});
    const result=battle({...config,rat:enemy},random,hp,{trace,damageMode,grenade,caravan}); hp=result.hp; battles.push(result);
    if(trace) events.push({type:'бой',number:i+1,...result});
    if(!result.won) return {alive:false,hp,found,killed,lootSuccesses:0,loot,xp:0,battles,events,initialBandages,bandagesUsed,bandagesLost:bandages,bandagesRemaining:0,healed,...(initialKits?{dressingKitsRemaining:0}:{}),...(initialGrenades?{grenadesRemaining:0}:{}),...(initialMolotovs?{molotovsRemaining:0}:{})};
    killed++;
    const maxHp=config.hero.maxHp;
    if(config.hero.selfHealAfterBattle&&bandages===0&&dressingKits===0&&hp<maxHp){
      const amount=Math.min(maxHp-hp,config.hero.selfHealAfterBattle);
      hp+=amount;healed+=amount;
      if(trace)events.push({type:'твёрдый орешек',healed:amount});
    }
    const lightlyWounded=hp<maxHp&&hp>maxHp*.9;
    if(i<found-1&&lightlyWounded&&trace)events.push({type:'лёгкая рана',afterBattle:i+1});
    const healCaravan=caravan?.hp>0&&caravan.hp<=caravan.maxHp*.9;
    if((healCaravan||i<(m.segments??found)-1&&hp<=maxHp*.9)&&(bandages>0||dressingKits>0)) {
      const item=bandages>0?'bandage':'dressingKit';
      const heal=healCaravan?bandageHeal({...config,hero:{...config.hero,maxHp:caravan.maxHp}},random,caravan.hp,item):bandageHeal(config,random,hp,item);
      if(healCaravan)caravan.hp=heal.hp;else {hp=heal.hp;healed+=heal.healed;}
      if(item==='bandage'){bandages--;bandagesUsed++;}else dressingKits--;
      if(trace)events.push({type:'бинт между боями',afterBattle:i+1,...(healCaravan?{target:'караван'}:{}),...heal,remaining:item==='bandage'?bandages:dressingKits,...(item==='dressingKit'?{item}:{})});
    }
  }
  for(let i=0;i<found-Number(Boolean(m.finalEnemy))&&config.loot.length;i++) {
    const roll=m.lootPerKill?null:random.int(1,20),bonus=config.hero.perception-(config.hero.checkPenalty??0),success=m.lootPerKill||roll+bonus>m.lootDc;
    const drops=[];
    if(success) { lootSuccesses++; for(const item of config.loot) { const itemRoll=random.int(1,100),dropped=itemRoll<=item.chance; if(dropped) loot[item.id]++; drops.push({item:item.name??ITEMS[item.id].name,roll:itemRoll,chance:item.chance,dropped}); } }
    if(trace) events.push({type:m.lootPerKill?'добыча противника':'поиск добычи',check:i+1,roll,bonus,dc:m.lootDc??null,success,drops});
  }
  if(m.finds){
    const roll=random.int(1,20),bonus=config.hero.perception-(config.hero.checkPenalty??0);
    const drops=m.finds.map(({id,dc,xp})=>{
      const dropped=roll+bonus>dc;
      if(dropped){loot[id]=1;extraXp+=xp??0;}
      return {item:ITEMS[id].name,dc,dropped};
    });
    if(trace)events.push({type:'обыск Технопарка',roll,bonus,drops});
  }
  const regularKills=killed-Number(Boolean(m.finalEnemy));
  return {alive:true,hp,found,killed,lootSuccesses,loot,...(caravan?{caravanHp:caravan.hp,caravanMaxHp:caravan.maxHp,money:Math.round(300*caravan.hp/caravan.maxHp)}:{}),xp:extraXp+(caravan&&caravan.hp===0?10:m.baseXp)+m.findXp*found+m.killXp*regularKills+m.lootXp*lootSuccesses,battles,events,initialBandages,bandagesUsed,bandagesLost:0,bandagesRemaining:bandages,healed,...(initialKits?{dressingKitsRemaining:dressingKits}:{}),...(initialGrenades?{grenadesRemaining:grenades}:{}),...(initialMolotovs?{molotovsRemaining:molotovs}:{})};
}
export const lootValue = (config,loot) => loot.metal*config.prices.metal+loot.meat*config.prices.meat+loot.tooth*config.prices.tooth;
export function preparedJourney(config,random,{stock=0,sellLoot=false,jacketCost=10}={}) {
  let money=config.trial.startingMoneyAfterHire-jacketCost,hp=config.hero.maxHp,xp=0,bandages=0;
  let missions=0,rests=0,deaths=0,purchased=0,used=0,lost=0,healingCost=0,sales=0,seconds=0;
  let stopReason='level2';
  while(xp<100&&missions<100) {
    if(hp===0){if(money<config.trial.reviveCost){stopReason='revive';break;}money-=config.trial.reviveCost;healingCost+=config.trial.reviveCost;hp=config.hero.maxHp;}
    while(hp<config.hero.maxHp&&money>=config.trial.restCost){money-=config.trial.restCost;healingCost+=config.trial.restCost;rests++;seconds+=config.trial.restSeconds;hp=rest(config,hp);}
    if(hp<config.hero.maxHp){stopReason='rest';break;}
    const needed=stock-bandages,cost=needed*config.prices.bandage;
    if(money<cost){stopReason='bandages';break;}
    money-=cost;purchased+=needed;bandages=stock;
    const e=expedition(config,random,{hp,bandages});missions++;seconds+=config.mission.seconds;
    used+=e.bandagesUsed;lost+=e.bandagesLost;bandages=e.bandagesRemaining;xp+=e.xp;hp=e.alive?e.hp:0;
    if(!e.alive)deaths++;
    if(sellLoot){const revenue=lootValue(config,e.loot);money+=revenue;sales+=revenue;}
  }
  if(missions===100&&xp<100)stopReason='safety-limit';
  return {reached:xp>=100,stopReason,missions,rests,deaths,purchased,used,lost,bandages,money,hp,xp,healingCost,sales,seconds,spent:jacketCost+purchased*config.prices.bandage+healingCost};
}
export function rest(config,hp) { const healed=.2*config.hero.maxHp+10*config.hero.strength; return Math.min(config.hero.maxHp,hp+healed); }
export function journeyToLevel2(config,random) {
  let hp=config.hero.maxHp,money=config.trial.startingMoneyAfterHire,xp=0,missions=0,rests=0,deaths=0,seconds=0,spent=0;
  while(xp<config.trial.nextLevelXp && missions<100) {
    if(hp===0) { if(money<config.trial.reviveCost) break; money-=config.trial.reviveCost; spent+=config.trial.reviveCost; hp=config.hero.maxHp; }
    while(hp<config.hero.maxHp && money>=config.trial.restCost) { money-=config.trial.restCost; spent+=config.trial.restCost; hp=rest(config,hp); rests++; seconds+=config.trial.restSeconds; }
    if(hp<config.hero.maxHp) break;
    const e=expedition(config,random,{hp}); hp=e.hp; missions++; seconds+=config.mission.seconds; xp+=e.xp; if(!e.alive) deaths++;
  }
  return {reached:xp>=config.trial.nextLevelXp,missions,rests,deaths,seconds,spent,money,xp,hp};
}

export function stationHelp(config,random,dc=8){
 const h=config.hero,checks=[['Сила','strength',null],['Ловкость','agility','cloth'],['Интеллект','intelligence','leather'],['Восприятие','perception','metal']],events=[],loot={cloth:0,leather:0,metal:0};let money=0,successes=0;
 for(const [name,key,item] of checks){const roll=random.int(1,20),bonus=h[key]-(h.checkPenalty??0),success=roll+bonus>dc;let reward=0;if(success){successes++;if(item){loot[item]++;reward=1;}else{reward=random.int(1,4);money=reward*10;}}events.push({name,roll,bonus,dc,success,item,reward});}
 return {loot,money,xp:5+3*successes,successes,events};
}

