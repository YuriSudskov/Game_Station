import {ITEMS,SURFACE,TECHNOPARK} from './data.js';

export function rng(seed) {
  let state=seed>>>0;
  return { int(min,max) { state=(state+0x6D2B79F5)>>>0; let t=state; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return min+Math.floor((((t^(t>>>14))>>>0)/4294967296)*(max-min+1)); } };
}
export const distanceFromMargin = (margin,maxDistance=3) => maxDistance>=4&&margin>=15?4:margin>=10?3:margin>=5?2:margin>=1?1:0;
export function mobilityEvasionAtDistance(hero,distance,hp=hero.currentHp??hero.maxHp,extraBonus=0){
 const raw=hero.evasion+(distance===0?(hero.meleeEvasionBonus??0):0)+(hp<hero.maxHp*.5?(hero.lowHealthEvasionBonus??0):0)+extraBonus;
 return hero.evasionBonusCap==null?raw:35+Math.min(raw-35,hero.evasionBonusCap);
}
export const evasionAtDistance=(hero,distance,hp=hero.currentHp??hero.maxHp,extraBonus=0)=>mobilityEvasionAtDistance(hero,distance,hp,extraBonus)+(hero.ricochet??0);
export const hits = (roll,accuracy,evasion) => roll+accuracy>evasion;
export const damageAfterArmor = (raw,armor) => Math.max(1,raw-armor);
export function levelXp(level,xp,reward,thresholds,maxLevel=20) {
  xp+=reward;
  while(level<maxLevel && thresholds[level]!=null && xp>=thresholds[level]) { xp-=thresholds[level]; level++; }
  return {level,xp};
}
function damageRoll(random,min,max,mode) { return mode==='scaled-original'?10*random.int(min/10,max/10):random.int(min,max); }
export function heroAttackStats(hero,weapon,distance,{ambush=false,targetHasWoundedHero=false,battleDamageBonus=0,firstRanged=false,correctionBonus=0,focusDamageBonus=0,hp=hero.currentHp??hero.maxHp}={}){
  const n=hero.nationality??{},energy=['energy','flamethrower'].includes(weapon.weaponClass);const ranged=weapon.type==='ranged',pistol=ranged&&weapon.weaponClass==='pistol';
  const accuracy=hero.accuracy-(dualPistolsActive(hero)&&pistol?10:0)+correctionBonus+(ranged&&firstRanged?(hero.firstRangedAccuracyBonus??0):0)
    +(targetHasWoundedHero?n.vendettaAccuracy??0:n.unwoundedAccuracy??0)
    +(ranged?n.rangedAccuracy??0:0)
    +(pistol&&distance<=1?n.closePistolAccuracy??0:0)
    +(pistol?(n.pistolAccuracy??0):(n.otherWeaponAccuracy??0))
    +(ranged?(energy?n.energyAccuracy??0:n.firearmAccuracy??0):0)
    +(distance>0?n.distantAccuracy??0:0)
    +(weapon.origin==='crafted'?n.craftedAccuracy??0:weapon.origin==='bought'?n.boughtAccuracy??0:0)
    +(distance===0?(hero.closeAccuracyBonus??0)+(weapon.closeAccuracyBonus??0):0)
    +(weapon.accuracyBonus??0)
    +(ranged?(hero.rangedAccuracyBonus??0)-Math.max(0,(weapon.distancePenalty??15)-(['rifle','shotgun'].includes(weapon.weaponClass)?hero.longGunDistanceReduction??0:0))*distance:(hero.meleeAccuracyBonus??0)-(hero.attackAccuracyPenalty??0))
    -(pistol?(hero.pistolAccuracyPenalty??0):0)
    -(weapon.shotPenalty??0)+(weapon.shots?(hero.burstAccuracyBonus??0):0)+(ambush?15:0)-(hero.dualWieldAccuracyPenalty??0);
  const bonus=(ranged?0:(weapon.noStrength?0:10*hero.strength)+(hero.meleeDamageBonus??0))
    +focusDamageBonus+(hero.desperation&&hp<hero.maxHp*.5?(ranged?10:20):0)+(n.weaponDamage??0)+(ranged?n.rangedDamage??0:0)+(targetHasWoundedHero?n.vendettaDamage??0:0)+battleDamageBonus+(energy?n.energyDamage??0:0)+(n.mutantDamage??0)+(weapon.damageType==='thermal'?n.thermalDamage??0:0)
    +(distance===0?(hero.closeDamageBonus??0):0)+(weapon.bonus??0)+(pistol?(hero.pistolDamageBonus??0):0);
  const damagePenalty=ranged?0:hero.attackDamagePenalty??0;const damagePenaltyPercent=ranged?0:hero.attackDamagePenaltyPercent??0,damageMultiplier=1-damagePenaltyPercent/100;
  const attacks=ambush?1:dualPistolsActive(hero)&&pistol?1:ranged?(weapon.shots?weapon.shots+(hero.burstBonus??0):pistol?hero.pistolAttacks??1:1):hero.attacksPerTurn??1;
  return {accuracy,bonus,damagePenalty,damagePenaltyPercent,damageMultiplier,attacks,min:Math.max(1,(weapon.min+bonus-damagePenalty)*damageMultiplier),max:Math.max(1,(weapon.max+bonus-damagePenalty)*damageMultiplier)};
}
export function withStarterPerk(config,perk,level=1) {
  const next=structuredClone(config);next.hero.level=level;next.hero.perk=perk;
  if(perk==='melee-evasion') next.hero.meleeEvasionBonus=14*level/10;
  else if(perk==='evasion') next.hero.evasion+=5;
  else if(perk==='initiative') next.hero.initiative+=4;
  else if(perk==='double-strike') { next.hero.attacksPerTurn=2;next.hero.attackAccuracyPenalty=10;next.hero.attackDamagePenaltyPercent=15; }
  else if(perk==='armored'){next.hero.physicalArmorBonus=5;next.hero.thermalArmorBonus=5;}
  else if(perk==='double-shot'){next.hero.pistolAttacks=2;next.hero.pistolAccuracyPenalty=15;}
  else if(perk==='greedy'||perk==='gunsmith'){}
  else if(perk==='bandit-cowboy')next.hero.dualPistols=true;
  else if(perk==='bandit-nimble')next.hero.quickRetreat=true;
  else if(perk==='bandit-survivor')next.hero.emergencyHeal=true;
  else if(perk==='bandit-blur')next.hero.openingCloseEvasionBonus=15;
  else if(perk==='bandit-jargon')next.hero.tauntFirstTurn=true;
  else if(perk==='hunter-seasoned'){next.hero.perceptionCheckBonus=(next.hero.perceptionCheckBonus??0)+1;next.hero.stealthCheckBonus=(next.hero.stealthCheckBonus??0)+1;}
  else if(perk==='hunter-squirrel-eye')next.hero.longGunDistanceReduction=5;
  else if(perk==='hunter-stealthy'){next.hero.stealthCheckBonus=(next.hero.stealthCheckBonus??0)+2;next.hero.firstRangedAccuracyBonus=10;}
  else if(perk==='hunter-vigilant'){next.hero.detectionBonus=(next.hero.detectionBonus??0)+2;next.hero.trapBonus=(next.hero.trapBonus??0)+2;next.hero.lootBonus=(next.hero.lootBonus??0)+1;}
  else if(perk==='burst-fire')next.hero.burstBonus=1;
  else if(perk==='tough-cookie')next.hero.selfHealAfterBattle=5*next.hero.strength;
  else if(perk==='sharp'){next.hero.initiative+=2;next.hero.evasion+=3;}
  else if(perk!=='quick-orders'&&perk!=='none') throw new Error(`Unknown perk: ${perk}`);
  return next;
}
export function battle(config,random,startHp,{trace=false,damageMode=config.trial.damageMode,grenade=false,ambush=false,caravan=null,enemies=null}={}) {
  const h=config.hero,events=[];
  let r=config.rat;
  const note=(type,data)=>{if(trace) events.push({type,...data});};
  let hp=startHp,minimumHp=startHp,ratHp=r.hp,firstMelee=true,firstRanged=ambush||!h.ambushRangedBonusSpent,woundBonus=false,woundedEvasion=false,berserkDamage=0,counterUsed=false;const national=h.nationality??{};const woundCheck=()=>{minimumHp=Math.min(minimumHp,hp);if(!woundBonus&&national.battleWoundAccuracy&&startHp-hp>=h.maxHp*.2){woundBonus=true;}};
  if(!ambush)delete h.ambushRangedBonusSpent;
  const dc=9+r.stealth,perception=perceptionCheck(h,random,h.perception+(h.perceptionCheckBonus??0)+(h.initialPerceptionBonus??0)+(h.detectionBonus??0)+(h.nationality?.detectionBonus??0)-(h.checkPenalty??0),dc,{events,trace});
  const perceptionRoll=perception.roll,margin=perception.total-dc;
  let distance=Math.min(h.maxStartingDistance??3,distanceFromMargin(margin,h.maxStartingDistance??3)+(h.nationality?.startingDistance??0)),initialDistance=distance;
  const opponents=(enemies??[r]).map((enemy,index)=>({...enemy,name:enemies?`${enemy.name} №${index+1}`:enemy.name,hp:enemy.hp,distance}));
  let enemyIndex=0;
  let shotCount=h.ambushCorrectionShots??0,lastShotTarget=shotCount?opponents[0]:null;
  if(!ambush)delete h.ambushCorrectionShots;
  const correctionFor=weapon=>{
    if(lastShotTarget&&lastShotTarget!==r){shotCount=0;lastShotTarget=null;}
    if(weapon.type!=='ranged'||!h.correctionStep)return 0;
    const bonus=Math.min(h.correctionMax??15,shotCount*h.correctionStep);
    shotCount++;lastShotTarget=r;if(ambush)h.ambushCorrectionShots=shotCount;return bonus;
  };
  let firstOwnTurnDone=false,enemyWaveDone=false,heavyHitUsed=false,perkHealing=0;
  const focusActive=h.firstEnemyFocus&&(!h.focusBattleUsed||h.focusAmbushPending),focusedEnemy=focusActive?opponents[0]:null;
  if(h.firstEnemyFocus){h.focusBattleUsed=true;if(ambush)h.focusAmbushPending=focusActive;else delete h.focusAmbushPending;}
  const focusFor=weapon=>r===focusedEnemy?(weapon.type==='ranged'?10:weapon.noStrength?0:h.strength*7):0;
  const defense=distance=>evasionAtDistance(h,distance,hp,(distance===0&&!enemyWaveDone?(h.openingCloseEvasionBonus??0):0)+(woundedEvasion?(national.woundedEvasion??0):0));
  const reduceIncoming=(damage,turn)=>{if(h.halveHeavyHit&&!heavyHitUsed&&damage>h.maxHp*.25){heavyHitUsed=true;note('бывалый бандита',{turn,before:damage,damage:damage/2});return damage/2;}return damage;};
  const groupAlive=()=>opponents.some(enemy=>enemy.hp>0);
  const heroRoll=random.int(1,20),ratRoll=random.int(1,20);
  let heroTurn=ambush||heroRoll+h.initiative>=ratRoll+r.initiative;
  const heroFirst=heroTurn;
  note('дистанция',{roll:perceptionRoll,bonus:perception.bonus,dc,margin,distance});
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
  const grenadeItem=h.darkGrasp?false:grenade===true?'pipeGrenade':grenade;
  let burningHero=false;
  const blast=(target,agility,armor,base,dodgeDc)=>{
    const roll=random.int(1,20),dodged=roll+agility>dodgeDc;
    const damage=damageAfterArmor(base*(dodged?.5:1),armor);
    return {target,roll,agility,dodgeDc,dodged,armor,damage};
  };
  const applyBlast=(base,dodgeDc,hitHero,turn,power=1)=>{
    const targets=opponents.filter(enemy=>enemy.hp>0).map(enemy=>{
      const target=blast(enemy.name??'крыса',enemy.agility??enemy.stealth,enemy.thermalArmor??0,base+((national.mutantDamage??0)+(enemy.hurtHero?national.vendettaDamage??0:0))*power,dodgeDc);
      enemy.hp-=target.damage;
      return target;
    });
    const self=hitHero?blast('герой',h.agility-(h.checkPenalty??0),(h.thermalArmor??0)+absorbFirstHit(turn),base,dodgeDc):null;
    ratHp=opponents[enemyIndex].hp;
    triggerRage(turn);
    if(self){self.damage=reduceIncoming(self.damage,turn);hp-=self.damage;woundedEvasion=true;woundCheck();}
    return self?[...targets,self]:targets;
  };
  const finish=turns=>{
    const won=hp>0&&!groupAlive();
    return {won,minimumHp,perkHealing,hp:Math.max(0,hp),ratHp:Math.max(0,ratHp),turns,initialDistance,reason:won?'победа':'гибель',events,killed:opponents.filter(enemy=>enemy.hp<=0).length};
  };
  if(h.darkGrasp&&!ambush){
    const base=random.int(20,80)*h.perception,target=blast(opponents[0].name??'крыса',opponents[0].agility??opponents[0].stealth,opponents[0].thermalArmor??0,base,14);
    opponents[0].hp-=target.damage;ratHp=opponents[0].hp;triggerRage(0);
    note('тёмная хватка',{base,perception:h.perception,targets:[target]});
    if(!groupAlive())return finish(0);
  }
  if(grenadeItem){
    const {min,max,dodgeDc}=ITEMS[grenadeItem];
    const underfoot=random.int(1,100)<=(national.grenadeSelfChance??5),strong=random.int(1,100)<=10;
    const base=random.int(min,max)+(national.grenadeDamage??0)+(national.thermalDamage??0)+berserkDamage;
    burningHero=underfoot;
    const targets=applyBlast(base*(strong?1.5:1),dodgeDc,underfoot,0,strong?1.5:1);
    note('граната',{base,underfoot,strong,targets,grenadeItem});
    if(hp<=0||!groupAlive())return finish(0);
  }
  let reloading=false,reloadWeapon=null;
  const main=h.weapons?h.weapons.main:{type:h.weaponType??'melee',min:h.weaponMin,max:h.weaponMax,bonus:h.weaponBonus??0};
  const inRange=(weapon,distance)=>weapon?.type==='ranged'&&distance<=weaponMaxDistance(h,weapon);
  const counterAttack=turn=>{
    const weapon=reloading&&reloadWeapon===main?main?.bayonet:main;if(!weapon)return;
    counterUsed=true;if(weapon.reloadMain){reloading=true;reloadWeapon=weapon;}
    const count=weapon.shots?weapon.shots+(h.burstBonus??0):1;
    for(let attack=1;attack<=count&&ratHp>0;attack++){
      const stats=heroAttackStats(h,weapon,0,{targetHasWoundedHero:r.hurtHero,battleDamageBonus:berserkDamage,firstRanged,correctionBonus:correctionFor(weapon),focusDamageBonus:focusFor(weapon),hp});
      const accuracy=stats.accuracy+(woundBonus?national.battleWoundAccuracy:0)+(firstMelee&&weapon.type==='melee'?(national.firstMeleeAccuracy??0):0);
      if(weapon.type==='melee')firstMelee=false;if(weapon.type==='ranged')firstRanged=false;
      const criticalRoll=random.int(1,100),critical=criticalRoll<=(h.criticalChance??5),roll=critical?null:random.int(1,100),hit=critical||hits(roll,accuracy,r.evasion);
      const armor=weapon.piercing?0:r.armor+(rageTurns>0?20:0),components=[];let base=0,damage=0;
      if(hit)for(let i=0;i<(weapon.damageRolls??1);i++){const raw=damageRoll(random,weapon.min,weapon.max,damageMode);base+=raw;const dealt=damageAfterArmor((raw+stats.bonus-stats.damagePenalty)*stats.damageMultiplier*(critical?1.5:1),armor);components.push(dealt);damage+=dealt;}
      ratHp-=damage;note('атака',{counter:true,turn,attack,actor:'герой',targetName:r.name??'крыса',slot:'main',weapon:weapon.item??weapon.type,distance:0,criticalRoll,critical,roll,accuracy,evasion:r.evasion,hit,base,bonus:stats.bonus,damagePenalty:stats.damagePenalty,damagePenaltyPercent:stats.damagePenaltyPercent,armor,damage,components,heroHp:Math.max(0,hp),ratHp:Math.max(0,ratHp)});
      if(hit)triggerRage(turn);
    }
  };
  for(let turn=1;turn<=config.trial.combatTurnLimit;turn++) {
    if(heroTurn||opponents[enemyIndex].hp<=0)enemyIndex=opponents.findIndex(enemy=>enemy.hp>0);
    r=opponents[enemyIndex];
    ratHp=r.hp;
    distance=r.distance;
    if(turn===2&&grenadeItem==='molotov'){
      const {min,max,dodgeDc}=ITEMS.molotov;
      const targets=applyBlast(random.int(min,max)+(national.grenadeDamage??0)+(national.thermalDamage??0)+berserkDamage,dodgeDc,burningHero,turn);
      note('огонь Молотова',{turn,targets});
      if(hp<=0||!groupAlive())return finish(turn);
      if(ratHp<=0){
        enemyIndex=opponents.findIndex(enemy=>enemy.hp>0);
        r=opponents[enemyIndex];ratHp=r.hp;distance=r.distance;
      }
    }
    if(heroTurn&&!ambush&&h.regeneration&&hp>0&&hp<h.maxHp){const healing=Math.min(h.regeneration,h.maxHp-hp);hp+=healing;perkHealing+=healing;note('регенерация',{turn,healing,hp});}
    if(heroTurn&&!ambush&&!firstOwnTurnDone&&h.tauntFirstTurn){r.accuracy+=10;r.evasion-=20;note('жаргон',{turn,target:r.name});}
    const rush=!heroTurn&&distance===1?r.rush:null;
    const reloadTurn=heroTurn&&reloading;
    let weapon=distance===0?main:inRange(main,distance)?main:h.weapons?.ranged;
    if(ambush)weapon=inRange(main,distance)?main:h.weapons?.ranged;
    if(reloadTurn){
      reloading=false;
      const target=reloadWeapon??main;reloadWeapon=null;weapon=distance===0?target.bayonet:null;
      note('перезарядка',{turn,distance,weapon:target.item});
    }
    const openingTurn=heroTurn&&!ambush&&!h.openingExtraAttackSpent;
    if(openingTurn)h.openingExtraAttackSpent=true;
    if(reloadTurn&&!weapon) { /* The reload consumes the hero's turn. */ }
    else if(heroTurn&&(!weapon||((ambush||distance>0)&&!inRange(weapon,distance)))) note('ожидание',{turn,actor:'герой',distance,reason:ambush||distance>0?'Нет оружия для этой дистанции':'Нет основного оружия'});
    else if(!heroTurn&&distance>0&&!rush) { distance--; note('сближение',{turn,actor:r.name??'крыса',distance}); }
    else {
      if(heroTurn&&weapon.reloadMain&&(weapon===main||weapon.reloadEverySlot)){reloading=true;reloadWeapon=weapon;}
      const actor=heroTurn?'герой':(r.name??'крыса');
      const powerSwing=!heroTurn&&r.previousAttackHit?r.powerSwing:null;
      const escortTarget=!heroTurn&&caravan?.hp>0&&r.attackTarget!=='hero';
      let evasion=heroTurn?r.evasion:escortTarget?caravan.evasion:defense(distance);
      let primaryAttacks=heroTurn?heroAttackStats(h,weapon,distance,{ambush}).attacks:(r.attacksPerTurn??1);
      if(openingTurn&&national.openingExtraAttack)primaryAttacks++;
      const offhand=heroTurn&&!ambush&&distance===0&&h.dualWield?h.weapons?.ranged:null;
      const cowboy=heroTurn&&!ambush&&dualPistolsActive(h);const sequence=cowboy?[main,h.weapons.ranged].filter(w=>inRange(w,distance)):Array.from({length:primaryAttacks},()=>heroTurn&&offhand?.type==='melee'?[weapon,offhand]:[weapon]).flat();if(cowboy&&openingTurn&&national.openingExtraAttack)sequence.push(weapon);
      const attacks=sequence.length;
      for(let attack=1;attack<=attacks;attack++){
        if(heroTurn)weapon=sequence[attack-1];else if(!escortTarget)evasion=defense(distance);
        const attackStats=heroTurn?heroAttackStats(h,weapon,distance,{ambush,targetHasWoundedHero:r.hurtHero,battleDamageBonus:berserkDamage,firstRanged,correctionBonus:correctionFor(weapon),focusDamageBonus:focusFor(weapon),hp}):null;
        const accuracy=heroTurn?attackStats.accuracy+(woundBonus?national.battleWoundAccuracy:0)+(firstMelee&&weapon.type==='melee'?(national.firstMeleeAccuracy??0):0):r.accuracy+(rush?.accuracyBonus??0)-(powerSwing?.accuracyPenalty??0)+(rageTriggered?(rageTurns>0?10:-10):0);
        const armor=heroTurn?(weapon.piercing?0:r.armor):escortTarget?caravan.armor:h.armor;
        const damagePenalty=heroTurn?attackStats.damagePenalty:0;
        if(heroTurn&&weapon.type==='melee')firstMelee=false;if(heroTurn&&weapon.type==='ranged'){firstRanged=false;if(ambush)h.ambushRangedBonusSpent=true;}const criticalRoll=random.int(1,100),critical=criticalRoll<=(heroTurn?(h.criticalChance??5):(r.criticalChance??3));const roll=critical?null:random.int(1,100),hit=critical||hits(roll,accuracy,evasion);
        if(!heroTurn)r.previousAttackHit=hit;
        let base=0,bonus=0,damage=0;
        const components=[];
        const effectiveArmor=armor+(heroTurn&&!weapon.piercing&&rageTurns>0?20:0)+(!heroTurn&&!escortTarget&&hit?absorbFirstHit(turn):0);
        if(hit){
          bonus=heroTurn?attackStats.bonus:(powerSwing?.damageBonus??0)-(rageTriggered&&rageTurns===0?20:0);
          const rolls=heroTurn?(weapon.damageRolls??1):1;
          for(let i=0;i<rolls;i++){
            const raw=heroTurn?damageRoll(random,weapon.min,weapon.max,damageMode):damageRoll(random,rush?.min??r.damageMin,rush?.max??r.damageMax,damageMode);
            const dealt=damageAfterArmor((raw+bonus-damagePenalty)*(heroTurn?attackStats.damageMultiplier:1)*(critical?1.5:1)*(critical&&!heroTurn&&!escortTarget?1-(national.criticalDamageReductionPercent??0)/100:1),effectiveArmor);
            base+=raw;damage+=dealt;components.push(dealt);
          }
          if(!heroTurn&&!escortTarget){const before=damage;damage=reduceIncoming(damage,turn);if(before!==damage)for(let i=0;i<components.length;i++)components[i]*=.5;}
          if(heroTurn)ratHp-=damage;else if(escortTarget)caravan.hp=Math.max(0,caravan.hp-damage);else hp-=damage;
        }
        if(hit&&!heroTurn&&!escortTarget){r.hurtHero=true;woundedEvasion=true;berserkDamage=Math.min(national.berserkCap??0,berserkDamage+(national.berserkOnHit??0));}woundCheck();note('атака',{turn,attack,actor,...(escortTarget?{target:'караван',caravanHp:caravan.hp}:{}),...(heroTurn?{targetName:r.name??'крыса',slot:weapon===h.weapons?.ranged?'ranged':'main'}:{}),weapon:heroTurn?(weapon.item??weapon.type):(rush?'Рывок':powerSwing?'Мощный замах':r.attackName??'укус'),...(heroTurn&&weapon.isBayonet?{bayonet:true}:{}),distance,roll,criticalRoll,critical,accuracy,evasion,hit,base,bonus,damagePenalty,damagePenaltyPercent:attackStats?.damagePenaltyPercent??0,armor:effectiveArmor,damage,...(components.length>1?{components}:{}),heroHp:Math.max(0,hp),ratHp:Math.max(0,ratHp)});
        if(!heroTurn&&!escortTarget&&h.emergencyHeal&&!h.emergencyHealUsed&&hp<h.maxHp*.3){h.emergencyHealUsed=true;const before=Math.max(0,hp),amount=nationalityHealing(h,30+7*h.strength);hp=Math.min(h.maxHp,before+amount);perkHealing+=hp-before;note('живучий уб',{turn,healed:hp-before,hp,rescued:before===0});}
        if(heroTurn&&hit)triggerRage(turn);if(!heroTurn&&!hit&&!escortTarget&&distance===0&&hp>0&&ratHp>0&&national.counterOnMiss&&!counterUsed)counterAttack(turn);
        if(hp<=0||(!heroTurn&&ratHp<=0)||(ratHp<=0&&!weapon?.shots)) break;
      }
    }
    if(ambush)return {hp:Math.max(0,ratHp),events};
    if(rush){distance=0;note('сближение',{turn,actor:r.name,distance});}
    r.hp=ratHp;
    r.distance=distance;
    if(heroTurn&&!ambush&&!firstOwnTurnDone){firstOwnTurnDone=true;if(h.quickRetreat&&distance===0&&hp>0&&groupAlive()){for(const enemy of opponents)if(enemy.hp>0)enemy.distance=Math.max(enemy.distance,Math.min(3,enemy.distance+1));distance=r.distance;note('шустрый',{turn,distance:1});}}
    if(!groupAlive()||hp<=0)return finish(turn);
    const nextEnemy=heroTurn?-1:opponents.findIndex((enemy,index)=>index>enemyIndex&&enemy.hp>0);if(!heroTurn&&nextEnemy<0)enemyWaveDone=true;
    const caravanTurn=heroFirst?!heroTurn&&nextEnemy<0:heroTurn;
    if(caravan?.hp>0&&caravanTurn){
      const target=opponents.find(enemy=>enemy.hp>0&&enemy.attackTarget==='caravan')??opponents.find(enemy=>enemy.hp>0);
      const roll=random.int(1,100),accuracy=caravan.accuracy-15*target.distance,hit=hits(roll,accuracy,target.evasion);
      const damage=hit?damageAfterArmor(damageRoll(random,ITEMS.ashot.min,ITEMS.ashot.max,damageMode),target.armor):0;
      target.hp-=damage;
      ratHp=r.hp;
      note('атака',{turn,actor:'Караванщик',weapon:'ashot',roll,accuracy,evasion:target.evasion,hit,damage,heroHp:hp,ratHp:Math.max(0,target.hp),caravanHp:caravan.hp,targetName:target.name});
      if(!groupAlive())return finish(turn);
    }
    if(!heroTurn&&rageTurns>0&&--rageTurns===0)note('усталость вожака',{turn});
    if(enemies&&!heroTurn){
      const next=opponents.findIndex((enemy,index)=>index>enemyIndex&&enemy.hp>0);
      if(next>=0){enemyIndex=next;continue;}
    }
    heroTurn=!heroTurn;
    if(!heroTurn)enemyIndex=opponents.findIndex(enemy=>enemy.hp>0);
  }
  return {won:false,minimumHp,perkHealing,hp:Math.max(0,hp),ratHp,turns:config.trial.combatTurnLimit,initialDistance,reason:'лимит',events};
}
export function bandageHeal(config,random,hp,item='bandage') {
  const roll=item==='medicKit'?random.int(30,80):item==='dressingKit'?random.int(20,50):random.int(10,30),raw=nationalityHealing(config.hero,roll+10*config.hero.perception+(config.hero.medicineBonus??0),true);
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
export function expedition(config,random,{hp=config.hero.maxHp,trace=false,damageMode=config.trial.damageMode,bandages=0,dressingKits=0,medicKits=0,grenades=0,molotovs=0,caravan=null}={}) {
  if(!Number.isInteger(bandages)||bandages<0)throw new Error('Bandages must be a non-negative integer');
  const initialBandages=bandages,initialKits=dressingKits,initialMedicKits=medicKits,initialGrenades=grenades,initialMolotovs=molotovs;let bandagesUsed=0,healed=0;
  const m=config.mission,events=[],battles=[],loot=Object.fromEntries(config.loot.map(x=>[x.id,0]));
  let found=m.fixedEncounters??0,killed=0,lootSuccesses=0,extraXp=0;
  let firstEnemy=config.rat;
  if(m.ambushDc!=null){
    const {roll,bonus,success}=perceptionCheck(config.hero,random,config.hero.perception+(config.hero.perceptionCheckBonus??0)+(config.hero.detectionBonus??0)+(config.hero.nationality?.detectionBonus??0)-(config.hero.checkPenalty??0),m.ambushDc,{events,trace});
    if(trace)events.push({type:'засада',roll,bonus,dc:m.ambushDc,success});
    if(success){
      const opening=battle(config,random,hp,{trace,damageMode,ambush:true});
      firstEnemy={...firstEnemy,hp:opening.hp};
      if(trace)events.push(...opening.events.filter(e=>e.type==='атака'||e.type==='ожидание'||e.type==='соколиный глаз').map(e=>({...e,ambush:true})));
    }
    const reinforcements=firstEnemy.hp>0?random.int(1,3):0;
    found=1+reinforcements;
    if(trace&&reinforcements)events.push({type:'подкрепление',count:reinforcements});
    if(firstEnemy.hp===0)killed=1;
  }
  for(let i=0;i<m.searches;i++) { const {roll,bonus,success}=perceptionCheck(config.hero,random,config.hero.perception+(config.hero.perceptionCheckBonus??0)+(config.hero.detectionBonus??0)+(config.hero.nationality?.detectionBonus??0)-(config.hero.checkPenalty??0),m.searchDc,{events,trace}); found+=Number(success); if(trace) events.push({type:m.lootPerKill?'поиск противника':'поиск крыс',check:i+1,roll,bonus,dc:m.searchDc,success}); }
  const scoutCount=found;
  if(m.finalEnemy)found++;
  for(let i=killed;i<(m.segments??found);i++) {
    let encounterEnemies=null;
    if(caravan){
      const attacked=random.int(1,100)<=m.attackChances[i];
      if(trace)events.push({type:'участок каравана',segment:i+1,attacked});
      if(!attacked){
        const {roll,bonus,total}=perceptionCheck(config.hero,random,config.hero.perception+(config.hero.perceptionCheckBonus??0)+(config.hero.lootBonus??0)+(config.hero.nationality?.lootBonus??0)-(config.hero.checkPenalty??0),8,{events,trace}),drops=[];
        if(total>8){if(random.int(1,100)<=70)drops.push(...Array(random.int(1,2)).fill('cloth'));else drops.push('emptyBottle');}
        if(total>13){if(random.int(1,100)<=70)drops.push(...Array(random.int(2,4)).fill('metal'));else drops.push('pipe');}
        if(total>18)drops.push('rareMushrooms');
        for(const id of drops)loot[id]=(loot[id]??0)+1;
        if(trace)events.push({type:'обыск каравана',roll,bonus,drops});
        continue;
      }
      const count=random.int(1,2);
      encounterEnemies=Array.from({length:count},(_,index)=>({...config.rat,attackTarget:count===2&&index===0?'hero':'caravan'}));
      found+=count;
      if(trace)events.push({type:'упыри каравана',count});
    }
    const canThrow=m.grenadePolicy!=='first-and-final'||i===0||m.finalEnemy&&i===scoutCount;
    const grenade=config.hero.darkGrasp||!canThrow?false:grenades>0?'pipeGrenade':molotovs>0?'molotov':false;
    if(grenade==='pipeGrenade')grenades--;
    if(grenade==='molotov')molotovs--;
    const enemy=m.finalEnemy&&i===scoutCount?m.finalEnemy:i===0?firstEnemy:config.rat;
    if(trace&&enemy===m.finalEnemy)events.push({type:'появление вожака'});
    const result=battle({...config,rat:enemy},random,hp,{trace,damageMode,grenade,caravan,enemies:encounterEnemies}); hp=result.hp;healed+=result.perkHealing??0; battles.push(result);
    if(trace) events.push({type:'бой',number:i+1,...result});
    if(!result.won) return {alive:false,hp,found,killed,lootSuccesses:0,loot,xp:0,battles,events,initialBandages,bandagesUsed,bandagesLost:bandages,bandagesRemaining:0,healed,...(initialKits?{dressingKitsRemaining:0}:{}),...(initialMedicKits?{medicKitsRemaining:0}:{}),...(initialGrenades?{grenadesRemaining:0}:{}),...(initialMolotovs?{molotovsRemaining:0}:{})};
    killed+=encounterEnemies?result.killed:1;
    const maxHp=config.hero.maxHp;
    if(config.hero.selfHealAfterBattle&&bandages===0&&dressingKits===0&&medicKits===0&&hp<maxHp){
      const amount=Math.min(maxHp-hp,nationalityHealing(config.hero,config.hero.selfHealAfterBattle));
      hp+=amount;healed+=amount;
      if(trace)events.push({type:'твёрдый орешек',healed:amount});
    }
    const lightlyWounded=hp<maxHp&&hp>maxHp*.9;
    if(i<found-1&&lightlyWounded&&trace)events.push({type:'лёгкая рана',afterBattle:i+1});
    const healCaravan=caravan?.hp>0&&caravan.hp<=caravan.maxHp*.9;
    if((healCaravan||i<(m.segments??found)-1&&hp<=maxHp*.9)&&(bandages>0||dressingKits>0||medicKits>0)) {
      const item=medicKits>0?'medicKit':dressingKits>0?'dressingKit':'bandage';
      const heal=healCaravan?bandageHeal({...config,hero:{...config.hero,maxHp:caravan.maxHp}},random,caravan.hp,item):bandageHeal(config,random,hp,item);
      if(healCaravan)caravan.hp=heal.hp;else {hp=heal.hp;healed+=heal.healed;}
      if(item==='bandage'){bandages--;bandagesUsed++;}else if(item==='dressingKit')dressingKits--;else medicKits--;
      if(trace)events.push({type:'бинт между боями',afterBattle:i+1,...(healCaravan?{target:'караван'}:{}),...heal,remaining:item==='bandage'?bandages:item==='dressingKit'?dressingKits:medicKits,...(item!=='bandage'?{item}:{})});
    }
  }
  for(let i=0;i<found-Number(Boolean(m.finalEnemy))&&config.loot.length;i++) {
    const baseBonus=config.hero.perception+(config.hero.perceptionCheckBonus??0)+(config.hero.lootBonus??0)+(config.hero.nationality?.lootBonus??0)-(config.hero.checkPenalty??0);const {roll,bonus,success}=m.lootPerKill?{roll:null,bonus:baseBonus,success:true}:perceptionCheck(config.hero,random,baseBonus,m.lootDc,{events,trace});
    const drops=[];
    if(success) { lootSuccesses++; for(const item of config.loot) { const itemRoll=random.int(1,100),dropped=itemRoll<=item.chance; if(dropped) loot[item.id]++; drops.push({item:item.name??ITEMS[item.id].name,roll:itemRoll,chance:item.chance,dropped}); } }
    if(trace) events.push({type:m.lootPerKill?'добыча противника':'поиск добычи',check:i+1,roll,bonus,dc:m.lootDc??null,success,drops});
  }
  if(m.finds){
    const {roll,bonus}=perceptionCheck(config.hero,random,config.hero.perception+(config.hero.perceptionCheckBonus??0)+(config.hero.lootBonus??0)+(config.hero.nationality?.lootBonus??0)-(config.hero.checkPenalty??0),Math.min(...m.finds.map(f=>f.dc)),{events,trace});
    const drops=m.finds.map(find=>{
      const {dc,xp}=find,dropped=roll+bonus>dc;let id=find.id,qty=0;
      if(dropped){if(find.alternateId&&random.int(1,100)>find.primaryChance)id=find.alternateId;qty=find.minQty!=null?random.int(find.minQty,find.maxQty??find.minQty):1;loot[id]=(loot[id]??0)+qty;extraXp+=xp??0;}
      return {item:ITEMS[id].name,dc,dropped,qty};
    });
    if(trace)events.push({type:'обыск Технопарка',roll,bonus,drops});
  }
  const regularKills=killed-Number(Boolean(m.finalEnemy));
  return {alive:true,hp,found,killed,lootSuccesses,loot,...(caravan?{caravanHp:caravan.hp,caravanMaxHp:caravan.maxHp,money:Math.round(300*caravan.hp/caravan.maxHp)}:{}),xp:extraXp+(caravan&&caravan.hp===0?10:m.baseXp)+m.findXp*found+m.killXp*regularKills+m.lootXp*lootSuccesses,battles,events,initialBandages,bandagesUsed,bandagesLost:0,bandagesRemaining:bandages,healed,...(initialKits?{dressingKitsRemaining:dressingKits}:{}),...(initialMedicKits?{medicKitsRemaining:medicKits}:{}),...(initialGrenades?{grenadesRemaining:grenades}:{}),...(initialMolotovs?{molotovsRemaining:molotovs}:{})};
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
 for(const [name,key,item] of checks){const baseBonus=h[key]+(key==='perception'?h.perceptionCheckBonus??0:0)-(h.checkPenalty??0);const {roll,bonus,success}=key==='perception'?perceptionCheck(h,random,baseBonus,dc,{events}):(()=>{const roll=random.int(1,20);return {roll,bonus:baseBonus,success:roll+baseBonus>dc};})();let reward=0;if(success){successes++;if(item){loot[item]++;reward=1;}else{reward=random.int(1,4);money=reward*10;}}events.push({name,roll,bonus,dc,success,item,reward});}
 return {loot,money,xp:5+3*successes,successes,events};
}

export function surfaceExpedition(config,random,{hp,bandages=0,dressingKits=0,medicKits=0,grenades=0,molotovs=0}){
 const events=[],battles=[],loot={},h=config.hero;let minimumHp=hp;
 let money=0,filters=0,killed=0,found=0,xp=SURFACE.baseXp,bandagesUsed=0,healed=0;
 const note=(text,data={})=>events.push({type:'поверхность',text,...data});
 const add=(item,qty=1)=>{loot[item]=(loot[item]??0)+qty;};
 const drops=table=>{
  const rewards=[];
  for(const drop of table){
   const roll=random.int(1,100),success=roll<=drop.chance;
   const qty=success?(drop.min==null?1:random.int(drop.min,drop.max)):0;
   if(success){
    if(drop.currency==='money')money+=qty*10;
    else if(drop.currency==='filters')filters+=qty;
    else add(drop.item,qty);
   }
   rewards.push({item:drop.currency==='money'?'A':drop.currency==='filters'?'Фильтры':ITEMS[drop.item].name,roll,chance:drop.chance,qty});
  }
  events.push({type:'находки поверхности',rewards});
 };
 const heal=()=>{
  if(hp>h.maxHp*.9||!(bandages>0||dressingKits>0||medicKits>0))return;
  const item=medicKits>0?'medicKit':dressingKits>0?'dressingKit':'bandage',result=bandageHeal(config,random,hp,item);
  hp=result.hp;healed+=result.healed;
  if(item==='bandage'){bandages--;bandagesUsed++;}else if(item==='dressingKit')dressingKits--;else medicKits--;
  note('Герой применяет лечение после ловушки.',{healed:result.healed});
 };
 for(let step=1;step<=4&&hp>0;step++){
  const {roll,bonus,total}=perceptionCheck(h,random,h.perception+(h.perceptionCheckBonus??0)+(h.lootBonus??0)+(h.nationality?.lootBonus??0)-(h.checkPenalty??0),8,{inclusive:true,events});
  const tier=SURFACE.tiers.findLast(t=>total>=t.dc);
  note(`Этап ${step}. Поиск.`,{roll,bonus});
  if(!tier){note('Ничего полезного не найдено.');continue;}
  note(tier.text);
  if(tier.dc===18){
   const trap=perceptionCheck(h,random,h.perception+(h.perceptionCheckBonus??0)+(h.trapBonus??0)+(h.nationality?.trapBonus??0)-(h.checkPenalty??0),10,{events}),trapRoll=trap.roll,trapBonus=trap.bonus,safe=trap.success;
   note(safe?'Вот она, растяжечка… и Молотов целенький наш. Так, а что тут ещё припрятано?':'Звук разбитого стекла и вспышка пламени… А-а-а-а-а! Я горю!',{roll:trapRoll,bonus:trapBonus,dc:10,success:safe});
   if(safe){add('molotov');xp+=10;drops(tier.loot);continue;}
   for(let turn=1;turn<=2&&hp>0;turn++){
    const base=random.int(ITEMS.molotov.min,ITEMS.molotov.max),dodge=random.int(1,20),dodged=dodge+h.agility-(h.checkPenalty??0)>ITEMS.molotov.dodgeDc;
    const damage=damageAfterArmor(base*(dodged?.5:1),h.thermalArmor??0);
    hp=Math.max(0,hp-damage);minimumHp=Math.min(minimumHp,hp);
    note(`Ловушка, огонь ${turn}: ${damage} термического урона.`,{roll:dodge,bonus:h.agility-(h.checkPenalty??0),dc:ITEMS.molotov.dodgeDc,success:dodged,hp});
   }
   if(hp>0){heal();drops(tier.loot);note('Уф, уцелел — забираю найденное и домой.');}
   break;
  }
  drops(tier.loot);
  const stealth=random.int(1,20),stealthBonus=h.agility+(h.stealthCheckBonus??0)-(h.checkPenalty??0),hidden=stealth+stealthBonus>tier.dc;
  note(hidden?tier.hidden:tier.spotted,{roll:stealth,bonus:stealthBonus,dc:tier.dc,success:hidden});
  if(hidden)continue;
  const dog=tier.dc===8,count=random.int(2,dog?4:3),enemy=dog?SURFACE.dog:TECHNOPARK.enemy;
  const grenade=config.hero.darkGrasp?false:grenades>0?'pipeGrenade':molotovs>0?'molotov':false;
  if(grenade==='pipeGrenade')grenades--;
  if(grenade==='molotov')molotovs--;
  const result=battle({...config,rat:enemy},random,hp,{trace:true,grenade,enemies:Array(count).fill(enemy)});
  hp=result.hp;healed+=result.perkHealing??0;minimumHp=Math.min(minimumHp,result.minimumHp??hp);found+=count;killed+=result.killed??0;battles.push(result);
  events.push({type:'бой',number:battles.length,...result});
  if(!result.won){hp=0;break;}
  xp+=count*(dog?SURFACE.dogXp:SURFACE.guardXp);
  for(let i=0;i<count;i++)drops(dog?[{item:'fullLeather',chance:50},{item:'ghoulMeat',chance:10}]:TECHNOPARK.loot.map(drop=>({item:drop.id,chance:drop.chance})));
  if(h.selfHealAfterBattle&&bandages===0&&dressingKits===0&&medicKits===0&&hp<h.maxHp){
   const amount=Math.min(h.maxHp-hp,nationalityHealing(h,h.selfHealAfterBattle));hp+=amount;healed+=amount;events.push({type:'твёрдый орешек',healed:amount});
  }
  note('Всё, пора уходить.');
  break;
 }
 const alive=hp>0,radiation=Math.max(0,random.int(2,3)-h.radiationProtection);
 return {alive,minimumHp,hp,found,killed,loot:alive?loot:{},money:alive?money:0,filters:alive?filters:0,xp:alive?xp:0,radiation:alive?radiation:0,events,battles,bandagesUsed,bandagesRemaining:alive?bandages:0,dressingKitsRemaining:alive?dressingKits:0,medicKitsRemaining:alive?medicKits:0,grenadesRemaining:alive?grenades:0,molotovsRemaining:alive?molotovs:0,healed,lootSuccesses:0};
}


export function nationalityHealing(hero,amount,medicine=false){const n=hero.nationalityBonuses??hero.nationality??{};return amount*(1+(n.healingPercent??0)/100)*(medicine?1+(n.medicinePercent??0)/100:1);}

export function weaponMaxDistance(hero,weapon){const max=weapon?.maxDistance??Infinity;return hero.maxStartingDistance>=4&&max>=3?Math.max(max,4):max;}
export function perceptionCheck(hero,random,bonus,dc,{inclusive=false,events=null,trace=true}={}){
 let roll=random.int(1,20),total=roll+bonus,success=inclusive?total>=dc:total>dc;
 if(!success&&hero.perceptionReroll&&!hero.perceptionRerollUsed){
  hero.perceptionRerollUsed=true;const firstRoll=roll,firstBonus=bonus;bonus+=2;roll=random.int(1,20);total=roll+bonus;success=inclusive?total>=dc:total>dc;
  if(events&&trace)events.push({type:'соколиный глаз',firstRoll,firstBonus,roll,bonus,dc,inclusive,success});
 }
 return {roll,bonus,total,success};
}

export function dualPistolsActive(hero){return Boolean(hero.dualPistols&&hero.weapons?.main?.weaponClass==='pistol'&&hero.weapons?.ranged?.weaponClass==='pistol');}
