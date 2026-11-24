import {expedition,perceptionCheck} from './combat.js';
import {KOLOM_ENEMIES} from './kolomenskaya.js';
import {generateReward} from './reward-search.js';
export const TUNNEL_BEETLE={name:'Радиоактивный жук',hp:35,armor:5,thermalArmor:0,evasion:45,accuracy:10,agility:3,initiative:3,stealth:4,damageMin:10,damageMax:20,attackRange:0,radiationBite:true,paralysisChance:20};
export function kolomTunnels(config,random,options,helpers){
 const h=config.hero,events=[],roll=random.int(1,100),kind=roll<=45?'spider':roll<=70?'worm':'beetle',enemy=kind==='beetle'?TUNNEL_BEETLE:KOLOM_ENEMIES[kind],count=kind==='spider'?2:kind==='worm'?1:random.int(3,4);
 const notice=perceptionCheck(h,random,h.perception+(h.perceptionCheckBonus??0)+(h.detectionBonus??0),13,{events,trace:true});
 const stealthRoll=notice.success?random.int(1,20):null,avoided=notice.success&&stealthRoll+(h.stealth??h.agility)+(h.stealthCheckBonus??0)>14;
 events.push({type:'событие отряда',text:enemy.name+' ×'+count+'. Обнаружение '+notice.roll+' + '+notice.bonus+' против 13. '+(avoided?'Герой избежал боя.':notice.success?'Уйти незамеченным не удалось.':'Противник напал из засады.')});
 const enemies=Array.from({length:count},()=>({...enemy}));
 const mission={fixedEncounters:avoided?0:count,segments:avoided?0:1,encounterGroups:avoided?[]:[enemies],baseXp:60,killXp:kind==='spider'?15:kind==='worm'?40:8,findXp:0,lootXp:0,lootPerKill:true};
 h.radiationHpCost=options.mark==='regeneration'?20:10;
 const before=h.biteRadiation??0;
 const result=expedition({...config,rat:enemy,mission,loot:kind==='spider'?KOLOM_ENEMIES.spider.loot:kind==='beetle'?[{id:'kolomenskayaBeetleCorpse',chance:10}]:[]},random,{...options,trace:true});
 const background=random.int(3,6),bite=(h.biteRadiation??0)-before;
 result.radiation=Math.max(0,(h.halveRadiation?Math.floor(background/2):background)-(h.radiationProtection??0))+bite;
 result.events.unshift(...events);result.encounter=kind;result.avoided=avoided;
 if(!result.alive)return result;
 const search=perceptionCheck(h,random,h.perception+(h.perceptionCheckBonus??0)+(h.lootBonus??0),17,{events:result.events,trace:true});
 if(search.success){const rewards=Array.from({length:search.total>=22?2:1},()=>generateReward(7,random,helpers));result.rewardItems=rewards.flatMap(r=>r.items);result.money=rewards.reduce((n,r)=>n+r.money,0);result.xp+=10;result.events.push({type:'событие отряда',text:'Найдены останки сталкера. Наград: '+rewards.length+'.'});}
 if(avoided||kind!=='beetle'){const roll=random.int(1,20),success=roll+h.agility>15;result.events.push({type:'событие отряда',text:'Ловля жука: '+roll+' + '+h.agility+' против 15 — '+(success?'успех':'провал')+'.'});if(success){result.loot.kolomenskayaBeetleCorpse=(result.loot.kolomenskayaBeetleCorpse??0)+1;result.xp+=5;if(random.int(1,100)<=5)result.loot.kolomenskayaBeetles=1;}}
 return result;
}
