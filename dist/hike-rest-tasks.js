import {heroConfig,effectiveMaxHp,levelUp,itemValue,canUpgrade,upgradedItem} from './game.js';
import {ITEMS} from './data.js';
import {generateReward} from './reward-search.js';
import {rng,damageAfterArmor} from './combat.js';
import {grenadeSupplies} from './kolom-jrpg.js';
const living=s=>s.heroes.filter(h=>h.hp>0&&!h.dead&&!h.unconscious);
export const searchRewardLevel=(total,level)=>total<15?null:Math.max(1,level+(total<17?-3:total<20?-2:-1+Math.floor((total-20)/3)));
export function grenadeStock(s){const pool=[];for(const h of living(s))for(const [item,field]of Object.entries(grenadeSupplies))if(h[field]>0)pool.push({item,qty:h[field],take:()=>h[field]--});for(const row of s.cargo??[])if(ITEMS[row.item]?.type==='grenade'&&row.qty>0)pool.push({item:row.item,qty:row.qty,take:()=>row.qty--});return pool.sort((a,b)=>((ITEMS[a.item].min??0)+(ITEMS[a.item].max??0))-((ITEMS[b.item].min??0)+(ITEMS[b.item].max??0)));}
export function resolveRestTasks(s,random=Math.random){
 const rest=s.rest;if(rest.tasksResolved)return;rest.tasksResolved=true;const heroes=living(s),checks=[];rest.checks??=[];
 for(const h of heroes){const task=rest.assignments[h.id];if(!task||task==='none')continue;const cfg=heroConfig({heroes:s.heroes},h,'surface').hero,attribute=['air','defense','rest'].includes(task)?'strength':task==='heal'?'perception':'intelligence',bonus=(cfg[attribute]??0)+(attribute==='intelligence'?(cfg.intelligenceCheckBonus??0):attribute==='perception'?(cfg.perceptionCheckBonus??0):0)-(cfg.checkPenalty??0),roll=1+Math.floor(random()*20);
  checks.push({heroId:h.id,name:h.name,task,roll,bonus,total:roll+bonus,dc:task==='search'?15:12,success:false,xp:0});
 }
 for(const task of ['air','defense']){const rows=checks.filter(c=>c.task===task),best=rows.reduce((a,b)=>!a||b.total>a.total?b:a,null),field=task==='air'?'airTier':'defenseTier',current=rest.shelter[field],dc=[12,14,16,18,21][Math.min(4,current+1)];for(const c of rows){c.dc=dc;c.success=current<4&&c.total>=dc;c.result=c===best?'Лучший бросок':'Учтён только лучший бросок';}if(best&&best.success)rest.shelter[field]++;}
 const traps=checks.filter(c=>c.task==='traps').sort((a,b)=>b.total-a.total),bestTrap=traps[0];
 for(const c of checks){const h=s.heroes.find(h=>h.id===c.heroId);if(['air','defense'].includes(c.task)){}
  else if(c.task==='repair'){c.success=c.total>=12;const requested=c.success?1+Math.floor((c.total-12)/2):0,available=Math.max(0,(s.spentFilters??0)-(s.repairedFilters??0)),count=Math.min(requested,available);s.filters+=count;s.repairedFilters=(s.repairedFilters??0)+count;c.result=`Восстановлено фильтров: ${count}`;}
  else if(c.task==='rest'){c.success=c.total>=12;if(c.success){h.attributeLossOrder??=[];if(!h.attributeLossOrder.length){for(const [key,n]of Object.entries(h.temporaryAttributeLoss??{}))for(let i=0;i<n;i++)h.attributeLossOrder.push({key,type:'temporary'});for(let i=0;i<(h.poisonDoses??0);i++)for(const key of ['strength','agility'])if(i>=(h.poisonAttributeRecovery?.[key]??0))h.attributeLossOrder.push({key,type:'poison'});}
    let loss;while(h.attributeLossOrder.length){const next=h.attributeLossOrder.shift();if(next.type==='poison'?(h.poisonDoses??0)>(h.poisonAttributeRecovery?.[next.key]??0):(h.temporaryAttributeLoss?.[next.key]??0)>0){loss=next;break;}}
    if(loss){if(loss.type==='poison')(h.poisonAttributeRecovery??={})[loss.key]=(h.poisonAttributeRecovery?.[loss.key]??0)+1;else h.temporaryAttributeLoss[loss.key]--;c.result='Восстановлен параметр: '+loss.key;}else c.result='Потерянных параметров нет';}}
  else if(c.task==='heal'){c.success=c.total>=12;const percent=c.success?1+Math.floor((c.total-12)/2):0;for(const target of heroes)if(target.id!==h.id)target.hp=Math.min(effectiveMaxHp(target),target.hp+effectiveMaxHp(target)*percent/100);c.result=`Остальным героям восстановлено ${percent}% HP`;}
  else if(c.task==='search'){c.success=c.total>=15;const level=searchRewardLevel(c.total,s.cellLevels?.[`${s.q},${s.r}`]??5);if(level!==null){const r=rng(Math.floor(random()*4294967296)),reward=generateReward(level,r,{itemValue,canUpgrade,upgradedItem});const items=reward.items.map(row=>({...row,name:ITEMS[row.item].name,source:'shelter'}));(s.rewards??=[]).push(...items);(s.cargo??=[]).push(...structuredClone(items));s.money=(s.money??0)+reward.money;(rest.found??=[]).push(...items);rest.foundMoney=(rest.foundMoney??0)+reward.money;c.result=`Награда уровня ${level}: ${items.map(i=>i.name).join(', ')||'деньги'}; ${reward.money/10} А`;}}
  else if(c.task==='traps'){c.dc=null;const old=rest.shelter.traps;if(c!==bestTrap)c.result='Учтён лучший бросок';else if(old&&old.dc>=c.total)c.result='Старые ловушки надёжнее';else {const stock=grenadeStock(s),items=[];for(const row of stock){const count=Math.min(row.qty,2-items.length);for(let i=0;i<count;i++)items.push(row);}if(items.length<2)c.result='Не хватает двух гранат';else {for(const row of items)row.take();rest.shelter.traps={dc:c.total,items:items.map(row=>row.item)};c.success=true;c.result='Ловушки: сложность '+c.total;}}}
  if(c.success){c.xp=5;levelUp(Object.assign(h,{xp:h.xp??0}),5);}rest.checks.push(c);
 }
 const saved=s.shelters?.[`${s.q},${s.r}`];if(saved&&rest.shelter.traps)saved.traps=structuredClone(rest.shelter.traps);
}
export function springShelterTraps(s,combat,r){const traps=s.rest?.shelter?.traps;if(!traps)return;const failed=[];for(const e of combat.enemies){const roll=r.int(1,20),bonus=e.agility??0,success=roll+bonus>=traps.dc;(combat.events??=[]).push({type:'ловушка укрытия',text:`${e.name}: ловкость ${roll} + ${bonus} против ${traps.dc} — ${success?'обнаружил ловушку':'попался'}`});if(!success&&failed.length<2)failed.push(e);}
 for(const [i,e]of failed.entries()){const item=ITEMS[traps.items[i]],raw=r.int(item.min,item.max),armor=item.damageType==='physical'?(e.armor??0):(e.thermalArmor??0),damage=damageAfterArmor(raw,armor);e.hp=Math.max(0,e.hp-damage);combat.events.push({type:'взрыв ловушки',text:`${e.name}: ${item.name}, урон ${damage}`});}

 if(failed.length){delete s.rest.shelter.traps;const saved=s.shelters?.[`${s.q},${s.r}`];if(saved)delete saved.traps;}
}


