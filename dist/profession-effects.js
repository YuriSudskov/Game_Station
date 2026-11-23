export const perkCount=(hero,id)=>Number((hero.startPerk??hero.perk)===id)+(hero.levelPerks??[]).filter(p=>p.perk===id).length;
export function applyProfessionRuntime(cfg,hero,items){const c=cfg.hero,has=id=>perkCount(hero,id)>0;
 c.initialPerceptionBonus=3*(perkCount(hero,'sniper-distance')+perkCount(hero,'hunter-distance'));
 c.sniperDistanceReduction=4*perkCount(hero,'sniper-range');
 if(has('sniper-eye')){c.perceptionReroll=true;c.perceptionRerollBonus=0;c.perceptionEveryCheckReroll=hero.job?.kind==='interactive';}
 if(has('medic-shooter')){c.rangedAccuracyBonus=(c.rangedAccuracyBonus??0)+5;c.pistolDamageBonus=(c.pistolDamageBonus??0)+5;}
 if(['medic-pistols','bandit-pistols'].some(has)){c.pistolAttacks=2;c.pistolAccuracyPenalty=15;}
 c.medicTrainee=has('medic-trainee');c.heavyFirstBurst=has('heavy-sharp')||(hero.profession==='heavy'&&has('sharp'));
 if(hero.profession==='heavy'&&has('sharp')){c.initiative-=2;c.evasion-=3;}
 if(hero.profession==='heavy'&&has('armored'))c.armor+=5;
 if(hero.profession==='assault'&&has('sharp'))c.evasion+=2;
 if(has('assault-reaction'))c.evasion+=1;
 if(has('assault-plates')&&['medium','heavy'].includes(items[hero.body]?.armorClass))c.assaultFirstPadding=15;
 c.assaultSuppress=has('assault-suppress');c.assaultLine=has('assault-line');c.assaultLast=has('assault-last');c.assaultLastUsed=Boolean(hero.assaultLastUsed);
 if(has('assault-tough')&&has('tough-cookie'))c.selfHealAfterBattle=10*c.strength;
 c.hunterDouble=has('hunter-double');c.hunterBait=has('hunter-bait');
 if(has('hunter-wanderer'))c.radiationProtection+=2;
 if(has('bandit-master')){c.pistolAccuracyBonus=(c.pistolAccuracyBonus??0)+4;c.pistolDamageBonus=(c.pistolDamageBonus??0)+15;}
 if(has('engineer-practical')){c.thermalArmor+=30;c.ricochet+=5;}
 for(const [slot,w]of Object.entries(c.weapons??{}))if(w)w.accuracyBonus=(w.accuracyBonus??0)+(hero[(slot==='main'?'weapon':'rangedWeapon')+'AccuracyFamiliarity']??0);
 return cfg;
}
export function applyProfessionRewards(hero,result,level,filters,random,items){
 if(result.professionRewardsDone)return;result.professionRewardsDone=true;const has=id=>perkCount(hero,id)>0;
 const integer=(a,b)=>random.int?random.int(a,b):a+Math.floor(random()*(b-a+1));
 if(has('hunter-filters'))for(let i=0;i<Math.floor(filters);i++)if(integer(1,100)<=30)result.filters=(result.filters??0)+1;
 if(has('hunter-hoarder')){const candidates=Object.keys(result.loot??{}).filter(id=>result.loot[id]>0&&(!items[id]?.rarity||items[id].rarity==='common'));if(candidates.length)result.loot[candidates[integer(0,candidates.length-1)]]++;}
 if(has('engineer-designs')&&integer(1,100)<=1){const id=integer(1,100)<=60?'weaponUpgradePlan':'armorUpgradePlan';if(items[id]){result.loot??={};result.loot[id]=(result.loot[id]??0)+1;}}
 if(has('bandit-jackpot')&&integer(1,100)<=Math.min(100,3*(hero.perception??hero.basePerception??3))){const value=10*level*integer(10,30);result.money=(result.money??0)+value;result.jackpot=value;}
}
export function refreshProfessionWorld(state){for(const hero of state.heroes??[]){if(hero.dead)continue;const chosen=(hero.levelPerks??[]).find(p=>p.perk==='bandit-connections');if(!chosen)continue;const previous=hero.connectionsAppliedLevel??chosen.pickedAtLevel??hero.level;const levels=Math.max(0,hero.level-previous);if(levels)for(const value of Object.values(state))if(value&&typeof value==='object'&&!Array.isArray(value)&&typeof value.relation==='number')value.relation=Math.min(20,value.relation+levels);hero.connectionsAppliedLevel=hero.level;}}
