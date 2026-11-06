import {LEVEL_PERKS,LEVEL_PERK_SCHEDULES,PROFESSIONS,IDENTITIES,ITEMS,PERKS,CONFIG,PATROL,CARAVAN,TECHNOPARK,patrolReady,RECIPES,PRODUCTIONS,productionXpThreshold,TRADE_EFFECTS,CAPACITY,STARTING_SHELVES,MAX_SHELVES} from './data.js';
import {rng,expedition,withStarterPerk,bandageHeal,stationHelp} from './combat.js';
const uid=()=>globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random().toString(36).slice(2)}`;
const clone=x=>JSON.parse(JSON.stringify(x));
const requireThat=(value,message)=>{if(!value)throw new Error(message);};
export const roundRatio=(value,numerator,denominator=100)=>Math.floor((value*numerator+denominator/2)/denominator);
export function sellerPrice(item,qty=1){requireThat(Number.isInteger(ITEMS[typeof item==='string'?item:item.item]?.value),'Цена предмета ещё не задана.');const base=itemValue(item)*qty;return Math.max(roundRatio(base,120),base+10);}
export const MERCHANTS={yuras:{name:'Юрась',cooldown:25000,buyPercent:110},duren:{name:'Дурень',cooldown:120000,buyPercent:150}};
export function buyerPrice(item,qty=1,merchant='yuras'){requireThat(Number.isInteger(ITEMS[typeof item==='string'?item:item.item]?.value),'Цена предмета ещё не задана.');return roundRatio(itemValue(item)*qty,MERCHANTS[merchant].buyPercent);}
export function tradeQuote(item,qty,modifier,role,merchant='yuras'){const quote=role==='seller'?sellerPrice(item,qty):buyerPrice(item,qty,merchant);const price=roundRatio(quote,100+modifier);const effect=TRADE_EFFECTS[role==='seller'?modifier:-modifier];return {price,xp:price/10*effect.xp,cooldown:MERCHANTS[merchant].cooldown*effect.cooldown};}
export function createGame(now=Date.now(),random=Math.random){return {version:1,id:uid(),welcomeSeen:false,money:1500,startingMoney:1500,filters:0,completedLocations:{},totalSpent:0,spendingPartial:false,inventory:[],inventorySlotsBought:0,heroes:[],selectedHeroId:null,hero:null,productions:Object.fromEntries(Object.keys(PRODUCTIONS).map(key=>[key,{level:1,xp:0,job:null}])),shelves:Array(STARTING_SHELVES).fill(null),yuras:{level:1,xp:0,nextAt:0,visit:{id:uid(),role:random()<.9?'seller':'buyer',offers:null}},history:[],createdAt:now,updatedAt:now};}
export function getHeroes(s){return Array.isArray(s.heroes)?s.heroes:(s.hero?[s.hero]:[]);}
export function normalizeGame(state){const s=clone(state);s.filters??=0;s.productions??={};for(const key of Object.keys(PRODUCTIONS))s.productions[key]??={level:1,xp:0,job:null};if(!Number.isSafeInteger(s.totalSpent)||s.totalSpent<0){s.totalSpent=0;s.spendingPartial=true;}s.heroes=Array.isArray(s.heroes)?s.heroes:(s.hero?[s.hero]:[]);for(const h of s.heroes){h.startPerk??=h.perk;h.rangedWeapon??=null;}s.completedLocations??=Object.fromEntries(s.heroes.filter(h=>h.lastCompletedLocation).map(h=>[h.lastCompletedLocation,true]));const selected=s.heroes.find(h=>h.id===s.selectedHeroId)||s.heroes.find(h=>h.id===s.hero?.id)||s.heroes[0]||null;s.hero=selected;s.selectedHeroId=selected?.id??null;const offers=s.yuras?.visit?.offers;if(s.yuras?.visit?.role==='seller'&&Array.isArray(offers)){for(const offer of [{item:'cloth',qty:3},{item:'pipe',qty:1}])if(!offers.some(x=>x.item===offer.item))offers.push(offer);}return s;}
export function restartQuote(state){const spent=Number.isSafeInteger(state.totalSpent)&&state.totalSpent>=0?state.totalSpent:0;const bonus=roundRatio(spent,2);return {spent,bonus,money:(state.startingMoney??1500)+bonus};}
export function restartGame(state,now=Date.now(),random=Math.random){const fresh=createGame(now,random);fresh.startingMoney=restartQuote(state).money;fresh.money=fresh.startingMoney;return fresh;}
export function hireCost(s){const count=getHeroes(s).length;return count===0?500:1500*2**(count-1);}
export function heroTitle(hero){const profession=PROFESSIONS[hero.profession??'saboteur']?.name??'Сталкер',perk=PERKS[hero.startPerk??hero.perk]?.shortName??PERKS[hero.startPerk??hero.perk]?.name;return `${hero.name}${perk?', '+perk.toLocaleLowerCase('ru-RU'):','} ${profession.toLocaleLowerCase('ru-RU')}`;}
export function itemName(row){const item=ITEMS[row.item];return [...(row.upgrades??[]).map(u=>u.prefix),item.name].join(' ');}
export function upgradeValueBonus(recipe){return recipe?.upgrade?(recipe.valueBonus??recipe.cost??0):0;}
export function itemValue(row){if(typeof row==='string')return ITEMS[row]?.value;return ITEMS[row.item].value+(row.upgrades??[]).reduce((n,u)=>n+(u.valueBonus??upgradeValueBonus(RECIPES[u.recipe])),0);}
export function itemArmor(row){return (ITEMS[row.item].armor??0)+(row.upgrades??[]).reduce((n,u)=>n+(u.armorBonus??0),0);}
export const firstHitArmor=row=>(row?.upgrades??[]).reduce((total,u)=>total+(RECIPES[u.recipe]?.firstHitArmor??0),0);
export function itemTier(row){return Math.min(3,(row?.upgrades??[]).length);}
export function canUpgrade(row,recipeId){const recipe=RECIPES[recipeId];return Boolean(row&&recipe?.upgrade&&(recipe.target==='body'?ITEMS[row.item]?.type==='body':(ITEMS[row.item]?.combat===(recipe.target??'melee')||((recipe.target??'melee')==='melee'&&ITEMS[row.item]?.bayonet)))&&itemTier(row)<3&&!(row.upgrades??[]).some(u=>u.recipe===recipeId));}
const hasLevelPerk=(hero,perk)=>(hero.levelPerks??[]).some(choice=>choice.perk===perk);
export function upgradeChance(state,recipeId){
 const recipe=RECIPES[recipeId];
 if(!recipe)return 0;
 const engineers=getHeroes(state).filter(hero=>hero.profession==='engineer');
 const gunsmiths=recipe.production==='upgrade'?engineers.filter(hero=>hero.perk==='gunsmith').length:0;
 const assistants=engineers.filter(hero=>hasLevelPerk(hero,'engineer-assistant')).length;
 return Math.min(100,(recipe.chance??100)+5*(gunsmiths+assistants));
}
function paySideJob(state,hero,firstLevel,now){
 if(firstLevel>hero.level||!hasLevelPerk(hero,'engineer-side-job'))return;
 let reward=0;
 for(let level=firstLevel;level<=hero.level;level++)reward+=800+100*level;
 state.money+=reward;
 addHistory(state,`${hero.name}: «Халтурка», +${reward/10} A.`,now);
}
export function nationalityMoneyBonus(hero,money=0){return hero.nationalityBonuses?.questMoneyPercent?Math.max(10,roundRatio(money,hero.nationalityBonuses.questMoneyPercent)):0;}
export function nationalityClaimBonus(hero,job){if(!job||job.kind==='series')return 0;if(isCombatJob(job.kind)&&!job.result.alive)return 0;const hasReward=job.kind==='rest'?job.healing>0&&hero.hp<effectiveMaxHp(hero):(job.result.xp??0)>0||(job.result.money??0)>0||Object.values(job.result.loot).some(q=>q>0);return hasReward?nationalityMoneyBonus(hero,job.result?.money??0):0;}
export function claimBonus(hero,job){if(hero.perk!=='greedy'||!job)return 0;let level=hero.level,hasReward=false;
 if(job.kind==='series'){if(job.worker.dead)return 0;level=job.worker.level;hasReward=job.xp>0||job.money>0||Object.values(job.loot).some(q=>q>0)||job.location==='rest'&&job.completed>0;}
 else if(job.kind==='rest')hasReward=job.healing>0&&hero.hp<effectiveMaxHp(hero);
 else {const e=job.result;if(isCombatJob(job.kind)&&!e.alive)return 0;hasReward=(e.xp??0)>0||(e.money??0)>0||Object.values(e.loot).some(q=>q>0);const preview=clone(hero);levelUp(preview,e.xp??0);level=preview.level;}
 return hasReward?10*level:0;
}
function gainProductionXp(production,id,xp){
 production.xp+=xp??0;
 let threshold=productionXpThreshold(id,production.level);
 while(threshold&&production.xp>=threshold){
  production.xp-=threshold;
  production.level++;
  threshold=productionXpThreshold(id,production.level);
 }
}
function addHistory(s,text,now){s.history.unshift({at:now,text});s.history=s.history.slice(0,50);}
export const countItem=(s,item)=>s.inventory.filter(x=>x.item===item).reduce((n,x)=>n+x.qty,0);
function addToInventory(inventory,item,qty,details={}){if(qty<=0)return;if(ITEMS[item].stack){const row=inventory.find(x=>x.item===item);if(row)row.qty+=qty;else inventory.push({uid:uid(),item,qty});}else for(let i=0;i<qty;i++)inventory.push({...clone(details),uid:details.uid??uid(),item,qty:1});}
export const inventoryCapacity=s=>CAPACITY+(s.inventorySlotsBought??0);
export const inventorySlotCost=s=>Math.max(5,(s.inventorySlotsBought??0)*10)*10;
export const shelfCost=s=>20*(s.shelves.length-STARTING_SHELVES+1)*10;
export function canReceive(s,entries){const inventory=clone(s.inventory);for(const e of entries)addToInventory(inventory,e.item,e.qty,e);return inventory.length<=Math.max(inventoryCapacity(s),s.inventory.length);}
function receive(s,entries){requireThat(canReceive(s,entries),'В инвентаре не хватает места. Освободи ячейки и вернись за результатом.');for(const e of entries)addToInventory(s.inventory,e.item,e.qty,e);}
export function maxCraftQuantity(s,recipeId){const r=RECIPES[recipeId],p=r&&s.productions[r.production];if(!r?.batch||r.upgrade||!p||p.job||p.level<r.level)return 0;return Math.max(0,Math.min(1000,r.cost>0?Math.floor(s.money/r.cost):1000,...Object.entries(r.ingredients).map(([item,n])=>Math.floor(countItem(s,item)/n))));}
function removeItem(s,item,qty){requireThat(Number.isInteger(qty)&&qty>0,'Неверное количество.');requireThat(countItem(s,item)>=qty,'Не хватает предметов.');let remaining=qty;for(const row of s.inventory.filter(x=>x.item===item)){const take=Math.min(remaining,row.qty);row.qty-=take;remaining-=take;if(!remaining)break;}s.inventory=s.inventory.filter(x=>x.qty>0);}
function removeRow(s,id,qty=1){const row=s.inventory.find(x=>x.uid===id);requireThat(row&&Number.isInteger(qty)&&qty>0&&row.qty>=qty,'Предмета уже нет или не хватает количества.');row.qty-=qty;s.inventory=s.inventory.filter(x=>x.qty>0);}
const pay=(s,cost)=>{requireThat(s.money>=cost,'Не хватает патронов.');s.money-=cost;s.totalSpent+=cost;};
function idleHero(s){requireThat(s.hero,'Сначала найми сталкера.');requireThat(!s.hero.dead,'Сначала восстанови сталкера.');requireThat(!s.hero.job,'Сталкер занят. Сначала получи результат.');return s.hero;}
export const radiationBlocksMissions=hero=>1000*(hero.radiation??0)>=95*hero.maxHp;
export const effectiveMaxHp=hero=>Math.max(1,hero.maxHp-10*(hero.radiation??0));
export function jobRadiation(job){
 if(job?.kind==='series')return (job.reports??[]).reduce((total,run)=>total+(run.result?.radiation??0),0);
 return job?.result?.radiation??0;
}
export const isCombatJob=kind=>kind==='mission'||kind==='patrol'||kind==='technopark'||kind==='caravan';
export function heroAttributes(hero){const p=PROFESSIONS[hero.profession??'saboteur'];return {strength:p.strength,agility:p.agility,intelligence:p.intelligence,perception:p.perception};}
export function consumableLimit(hero){return 1+2*heroAttributes(hero).strength;}
export function earnedPerkLevels(hero){return (LEVEL_PERK_SCHEDULES[heroAttributes(hero).intelligence]??[]).filter(level=>level<=hero.level);}
export function availablePerkLevels(hero){const chosen=new Set((hero.levelPerks??[]).map(p=>p.level));return [...earnedPerkLevels(hero).filter(level=>!chosen.has(level)),...Array(hero.extraPerkChoices??0).fill(null)];}
export function levelPerkOptions(hero){return Object.entries(LEVEL_PERKS).filter(([id,p])=>p.profession===(hero.profession??'saboteur')&&hero.level>=p.minLevel&&id!==(hero.startPerk??hero.perk)&&(p.repeatable||!(hero.levelPerks??[]).some(x=>x.perk===id))).map(([id,p])=>({id,...p}));}
const levelPerkHpBonus=h=>(h.levelPerks??[]).reduce((hp,{perk})=>hp+(perk==='enduring'?30:(LEVEL_PERKS[perk]?.hpBonus??0)),0);
export function heroConfig(s,hero=s.hero){const h=hero,p=PROFESSIONS[h.profession??'saboteur'],base=clone(CONFIG);Object.assign(base.hero,heroAttributes(h),{initiative:p.agility,accuracy:(p.accuracy??0)+1.25*Math.max(0,(h.level??1)-1)+(h.nationalityBonuses?.accuracy??0),pistolDamageBonus:h.nationalityBonuses?.pistolDamage??0,evasion:35+7.5*p.agility+(p.evasionBonus??0)});let c=withStarterPerk(base,h.perk,h.level);for(const id of new Set((h.levelPerks??[]).map(x=>LEVEL_PERKS[x.perk]?.starterEffect).filter(Boolean))){if(id!==h.perk)c=withStarterPerk(c,id,h.level);}c.hero.perk=h.perk;for(const chosen of h.levelPerks??[]){if(chosen.perk==='favorite-close'){c.hero.closeAccuracyBonus=(c.hero.closeAccuracyBonus??0)+5;c.hero.closeDamageBonus=(c.hero.closeDamageBonus??0)+5;}if(chosen.perk==='quick-reaction'){c.hero.initiative+=2;c.hero.evasion+=3;}if(chosen.perk==='samurai')c.hero.meleeDamageBonus=(c.hero.meleeDamageBonus??0)+4*Math.max(0,h.level-chosen.pickedAtLevel+1);
 if(chosen.perk==='assault-accurate')c.hero.accuracy+=5;
 if(chosen.perk==='assault-reaction'){c.hero.initiative+=2;c.hero.evasion+=4;}
 if(chosen.perk==='assault-burst')c.hero.burstAccuracyBonus=10;
 if(chosen.perk==='engineer-shooter')c.hero.rangedAccuracyBonus=5;
 if(chosen.perk==='engineer-armorer')c.hero.physicalArmorBonus=(c.hero.physicalArmorBonus??0)+10;
}
c.hero.maxHp=effectiveMaxHp(h);c.hero.firstHitArmor=h.body?firstHitArmor(h.bodyDetails):0;c.hero.armor=(h.body?itemArmor({...h.bodyDetails,item:h.body}):0)+(c.hero.physicalArmorBonus??0);c.hero.thermalArmor=(h.body?ITEMS[h.body].thermalArmor??0:0)+(c.hero.thermalArmorBonus??0);c.hero.radiationProtection=ITEMS[h.body]?.radiationProtection??0;c.hero.meleeAccuracyBonus=ITEMS[h.body]?.meleeAccuracyBonus??0;const weapon=ITEMS[h.weapon];const spec=(item,details)=>{
 if(!item)return null;
 const {combat,weaponClass,min,max,piercing,maxDistance,distancePenalty,shots,damageRolls,shotPenalty,reloadMain,bayonet}=ITEMS[item];
 const upgrades=details?.upgrades??[];
 const bonuses=(type,range)=>upgrades.filter(u=>!bayonet||(RECIPES[u.recipe]?.target??'melee')===type)
  .reduce((out,u)=>({
   min:out.min+(u.minBonus??0),max:out.max+(u.maxBonus??0),
   bonus:out.bonus+(u.bonus??0),accuracyBonus:out.accuracyBonus+(u.accuracyBonus??0)
  }),{...range,bonus:0,accuracyBonus:0});
 return {item,type:combat,weaponClass,piercing,maxDistance,distancePenalty,shots,damageRolls,shotPenalty,reloadMain,...bonuses(combat,{min,max}),
  bayonet:bayonet?{item,type:'melee',isBayonet:true,...bonuses('melee',bayonet)}:null};
};c.hero.weapons={main:spec(h.weapon,h.weaponDetails),ranged:spec(h.rangedWeapon,h.rangedWeaponDetails)};c.hero.weaponType=weapon?.combat??'melee';c.hero.weaponMin=weapon?.min??10;c.hero.weaponMax=weapon?.max??30;c.hero.weaponBonus=(h.weaponDetails?.upgrades??[]).reduce((sum,u)=>sum+(u.bonus??0),0);if(h.wounds>0){c.hero.accuracy-=10; // Separate percentile penalty is not stacked until rules are clarified.
 c.hero.checkPenalty=2;c.hero.initiative-=2;
 }return c;}
function levelUp(h,xp){h.xp+=xp;while(h.level<20&&h.xp>=100*h.level){h.xp-=100*h.level;h.level++;h.maxHp=(120+30*heroAttributes(h).strength+(h.nationalityBonuses?.hp??0))+(h.level-1)*(10+10*heroAttributes(h).strength/3)+levelPerkHpBonus(h)-(h.permanentHpLoss??0);h.maxHp=Math.max(1,h.maxHp);}if(h.level===20)h.xp=0;}
export function locationOwner(state,kind){return getHeroes(state).find(hero=>hero.job&&(hero.job.kind==='series'?hero.job.location:hero.job.kind)===kind)??null;}
function requireLocationLevel(hero,kind){requireThat(!radiationBlocksMissions(hero),'Сильное облучение. Сначала сними радиацию.');requireThat(!isCombatJob(kind)||PROFESSIONS[hero.profession??'saboteur'].combatReady,'Боевые параметры этой профессии ещё не заданы.');requireThat(kind!=='patrol'||hero.level>=PATROL.requiredLevel,`Патрулирование тоннелей доступно герою со ${PATROL.requiredLevel}-го уровня.`);}
function requireFreeLocation(state,kind){const owner=locationOwner(state,kind);requireThat(!owner,`Локация занята: ${owner?.name??''}. Сначала получи результат.`);}
export const locationName=kind=>({mission:'Мусорные кучи',patrol:'Патрулирование тоннелей',technopark:'Исследовать Технопарк',caravan:'С караваном на Павелецкую',help:'Помогать на станции',rest:REST_OPTIONS.station.name}[kind]??'Задание');
export const REST_OPTIONS = {
 station: {name:'Отдохнуть в кафе «Столовая»', seconds:15, cost:100, healing:hero=>.2*hero.maxHp+10*heroAttributes(hero).strength},
 meal: {name:'Поспать и поесть', seconds:600, cost:50, healing:hero=>(10+heroAttributes(hero).strength)*hero.level}
};
function makeRun(s,hero,kind,at,seed){
 const duration=ms=>Math.round(ms*(hero.perk==='quick-orders'?0.85:1));
 if(kind==='caravan'){
  const config={...heroConfig(s,hero),rat:CARAVAN.enemy,mission:CARAVAN.mission,loot:CARAVAN.loot};
  const caravan={...CARAVAN.escort,maxHp:CARAVAN.escort.hp};
  const result=expedition(config,rng(seed),{hp:hero.hp,bandages:hero.bandages,dressingKits:hero.dressingKits,grenades:hero.grenades,molotovs:hero.molotovs,trace:true,caravan});
  return {kind,seed,startedAt:at,endsAt:at+duration(CARAVAN.seconds*1000),result};
 }
 if(kind==='technopark'){
  const config={...heroConfig(s,hero),rat:TECHNOPARK.enemy,mission:TECHNOPARK.mission,loot:TECHNOPARK.loot};
  const result=expedition(config,rng(seed),{hp:hero.hp,bandages:hero.bandages,dressingKits:hero.dressingKits,grenades:hero.grenades,molotovs:hero.molotovs,trace:true});
  result.radiation=result.alive?Math.max(0,TECHNOPARK.radiation-config.hero.radiationProtection):0;
  return {kind,seed,startedAt:at,endsAt:at+duration(TECHNOPARK.seconds*1000),result};
 }
 if(kind==='patrol'){requireThat(patrolReady(),'Характеристики упыря-разведчика ещё уточняются.');const config=heroConfig(s,hero);config.rat=clone(PATROL.enemy);config.mission=clone(PATROL.mission);config.loot=clone(PATROL.loot);return {kind,seed,startedAt:at,endsAt:at+duration(14000),result:expedition(config,rng(seed),{hp:hero.hp,bandages:hero.bandages,dressingKits:hero.dressingKits,grenades:hero.grenades,molotovs:hero.molotovs,trace:true})};}
 if(kind==='mission')return {kind,seed,startedAt:at,endsAt:at+duration(7000),result:expedition(heroConfig(s,hero),rng(seed),{hp:hero.hp,bandages:hero.bandages,dressingKits:hero.dressingKits,grenades:hero.grenades,molotovs:hero.molotovs,trace:true})};
 if(kind==='help')return {kind,seed,startedAt:at,endsAt:at+duration(10000),result:stationHelp(heroConfig(s,hero),rng(seed))};
 requireThat(kind==='rest','Нет такой локации.');requireThat(hero.hp<effectiveMaxHp(hero),'Здоровье уже полное.');pay(s,100);return {kind,startedAt:at,endsAt:at+30000,healing:.2*hero.maxHp+10*heroConfig(s,hero).hero.strength};
}
function stopSeries(job,reason){job.phase='done';job.reason=reason;}
export function advanceSeries(state,now=Date.now()){
 let changed=false;
 for(const hero of getHeroes(state)){
  const job=hero.job;if(job?.kind!=='series'||job.phase==='done')continue;
  // At most five runs and four pauses, including when returning after a long absence.
  while(job.phase!=='done'&&now>=job.endsAt){changed=true;const at=job.endsAt,worker=job.worker;
   if(job.phase==='break'){
    if(job.location==='rest'&&(worker.hp>=effectiveMaxHp(worker)||state.money<100)){stopSeries(job,worker.hp>=effectiveMaxHp(worker)?'Здоровье полное':'Не хватает A на отдых');break;}
    job.run=makeRun(state,worker,job.location,at,job.seeds[job.completed]);job.phase='running';job.startedAt=at;job.endsAt=job.run.endsAt;continue;
   }
   const run=job.run,e=run.result;job.completed++;job.reports.push(clone(run));
   if(isCombatJob(run.kind)&&!e.alive){for(const key of ['level','xp','maxHp'])worker[key]=job.initial[key];worker.dead=true;worker.hp=0;worker.bandages=0;worker.dressingKits=0;worker.grenades=0;worker.molotovs=0;job.loot={};job.money=0;job.nationalityBonus=0;job.xp=0;stopSeries(job,'Герой погиб. Весь результат серии потерян');break;}
   if(run.kind==='rest')worker.hp=Math.min(effectiveMaxHp(worker),worker.hp+run.healing);
   else{
    for(const [item,qty]of Object.entries(e.loot))job.loot[item]=(job.loot[item]??0)+qty;
    job.money+=e.money??0;job.xp+=e.xp;levelUp(worker,e.xp);if(worker.wounds>0)worker.wounds--;
    if(isCombatJob(run.kind)){worker.hp=e.hp;worker.bandages=e.bandagesRemaining;worker.dressingKits=e.dressingKitsRemaining??0;worker.grenades=e.grenadesRemaining??0;worker.molotovs=e.molotovsRemaining??0;}
   }
   const nationalBonus=nationalityMoneyBonus(worker,run.result?.money??0);job.nationalityBonus=(job.nationalityBonus??0)+nationalBonus;job.money+=nationalBonus;
   if(job.completed>=job.total)stopSeries(job,'Все прохождения завершены');
   else if(worker.hp/effectiveMaxHp(worker)<job.threshold/100&&job.location!=='rest')stopSeries(job,`Здоровье ниже ${job.threshold}%`);
   else if(job.location==='rest'&&worker.hp>=effectiveMaxHp(worker))stopSeries(job,'Здоровье полное');
   else {job.phase='break';job.startedAt=at;job.endsAt=at+3000;}
  }
 }
 return changed;
}
export function reportTurnCount(run){if(!isCombatJob(run.kind))return 0;const battles=run.result?.battles;return Array.isArray(battles)&&battles.every(b=>Number.isInteger(b.turns))?battles.reduce((sum,b)=>sum+b.turns,0):null;}
export function seriesTurnCount(job){const counts=(job.reports??[]).map(reportTurnCount);return counts.some(n=>n===null)?null:counts.reduce((sum,n)=>sum+n,0);}
export function ready(job,now=Date.now()){return Boolean(job&&(job.kind==='series'?job.phase==='done':now>=job.endsAt));}
export function visit(s,now=Date.now(),random=Math.random){let changed=false;
 for(const merchant of Object.keys(MERCHANTS)){
  const npc=s[merchant];
  if(!npc||npc.visit||now<npc.nextAt)continue;
  npc.visit={id:uid(),role:merchant==='yuras'&&random()<.9?'seller':'buyer',offers:null};
  changed=true;
 }
 return changed;}
export function openYuras(s,now=Date.now(),random=Math.random,merchant='yuras'){visit(s,now,random);const v=Object.hasOwn(MERCHANTS,merchant)?s[merchant]?.visit:null;requireThat(v,'Торговец ещё в пути.');if(v.offers===null){if(v.role==='seller')v.offers=[{item:'jacket',qty:1},{item:'bandage',qty:5},{item:'leather',qty:2},{item:'cloth',qty:3},{item:'pipe',qty:1}];else {const rows=s.inventory.filter(x=>Number.isInteger(ITEMS[x.item]?.value)&&(merchant==='yuras'||['medicine','food','stimulant'].includes(ITEMS[x.item].type)));for(let i=rows.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[rows[i],rows[j]]=[rows[j],rows[i]];}v.offers=rows.slice(0,3).map(x=>({item:x.item,qty:1,inventoryUid:x.uid,upgrades:clone(x.upgrades??[])}));}}return v;}
export function act(state,action,now=Date.now(),random=Math.random){const s=normalizeGame(state);visit(s,now,random);advanceSeries(s,now);if(action.heroId){for(const h of s.heroes){h.startPerk??=h.perk;h.rangedWeapon??=null;}s.completedLocations??=Object.fromEntries(s.heroes.filter(h=>h.lastCompletedLocation).map(h=>[h.lastCompletedLocation,true]));const selected=s.heroes.find(h=>h.id===action.heroId);requireThat(selected,'Сталкер не найден.');s.hero=selected;s.selectedHeroId=selected.id;}const h=s.hero;
 switch(action.type){
 case 'selectHero':requireThat(h,'Сталкер не найден.');break;
 case 'traderNotes':{
  const hero=idleHero(s);
  removeItem(s,'traderNotes',1);
  hero.extraPerkChoices=(hero.extraPerkChoices??0)+1;
  addHistory(s,`${hero.name}: получен дополнительный выбор перка.`,now);break;
 }
 case 'chooseLevelPerk':{const hero=idleHero(s),slots=availablePerkLevels(hero),perk=LEVEL_PERKS[action.perk];requireThat(slots.length,'Нет доступного выбора перка.');requireThat(levelPerkOptions(hero).some(p=>p.id===action.perk),'Этот перк недоступен.');if(slots[0]===null)hero.extraPerkChoices--;hero.levelPerks=[...(hero.levelPerks??[]),{level:slots[0],perk:action.perk,pickedAtLevel:hero.level}];if(action.perk==='enduring')hero.maxHp+=30;if(perk.hpBonus){hero.maxHp+=perk.hpBonus;hero.hp=Math.min(effectiveMaxHp(hero),hero.hp+perk.hpBonus);}if(action.perk==='engineer-side-job')paySideJob(s,hero,hero.level,now);addHistory(s,`${hero.name}: выбран перк «${perk.name}».`,now);break;}
 case 'hire':{const profession=action.profession??'saboteur',p=PROFESSIONS[profession];requireThat(p?.available,'Эта профессия пока недоступна для найма.');requireThat(p.startReady!==false,'Стартовое снаряжение и точность инженера ещё не заданы.');requireThat(p.perks.includes(action.perk),'Выбери стартовый перк этой профессии.');const identity=action.identity?IDENTITIES[action.identity]:null;requireThat(!action.identity||identity,'Выбери имя и национальность.');pay(s,hireCost(s));const number=s.heroes.length+1,maxHp=120+30*p.strength+(identity?.bonuses?.hp??0);const hero={id:uid(),profession,identityId:action.identity??null,nationality:identity?.nationality??null,nationalityBonuses:clone(identity?.bonuses??{}),name:identity?.name??(number===1?p.name:`${p.name} №${number}`),level:1,xp:0,maxHp,hp:maxHp,perk:action.perk,startPerk:action.perk,weapon:p.weapon,rangedWeapon:p.rangedWeapon??null,body:null,bandages:0,dead:false,wounds:0,job:null};s.heroes.push(hero);s.hero=hero;s.selectedHeroId=hero.id;addHistory(s,`${hero.name} (${p.name}) принят на станцию.`,now);break;}
 case 'setRepeatPreferences':{requireThat(h,'Сначала выбери героя.');const {location,total,threshold}=action;requireThat(['mission','help','rest','patrol','technopark','caravan'].includes(location),'Нет такой локации.');requireThat(Number.isInteger(total)&&total>=2&&total<=5,'Выбери от 2 до 5 прохождений.');requireThat([50,30,15].includes(threshold),'Выбери порог здоровья.');h.repeatPreferences={...h.repeatPreferences,[location]:{total,threshold}};break;}
 case 'startSeries':{const hero=idleHero(s),kind=action.location,total=action.total,threshold=action.threshold;requireThat(['mission','patrol','help','technopark','caravan'].includes(kind),'Нет такой локации.');requireFreeLocation(s,kind);requireLocationLevel(hero,kind);requireThat(Number.isInteger(total)&&total>=2&&total<=5,'Выбери от 2 до 5 прохождений.');requireThat([50,30,15].includes(threshold),'Выбери порог здоровья.');requireThat(hero.hp/effectiveMaxHp(hero)>=threshold/100,'Здоровье уже ниже выбранного порога.');const seeds=Array.from({length:total},()=>Math.floor(random()*4294967296)),worker=clone(hero);worker.job=null;const run=makeRun(s,worker,kind,now,seeds[0]);hero.repeatPreferences={...hero.repeatPreferences,[kind]:{total,threshold}};hero.job={kind:'series',location:kind,total,threshold,seeds,worker,initial:clone(worker),run,phase:'running',completed:0,loot:{},money:0,nationalityBonus:0,xp:0,reports:[],startedAt:now,endsAt:run.endsAt};addHistory(s,`Серия: ${locationName(kind)}, ${total} прохождений.`,now);break;}
 case 'stopSeries':{requireThat(h?.job?.kind==='series'&&h.job.phase==='break','Прервать можно только во время передышки.');stopSeries(h.job,'Остановлено игроком');break;}
 case 'repeatHero':{requireThat(h&&ready(h.job,now),'Результат ещё не готов.');const kind=h.job.kind==='series'?h.job.location:h.job.kind;requireThat(kind!=='rest','Отдых запускается отдельно, без повторов.');requireThat(!(isCombatJob(h.job.kind)&&!h.job.result.alive)&&!h.job.worker?.dead,'Сначала восстанови героя.');const job=h.job;
 const claimed=act(s,{type:'claimHero',heroId:h.id},now,random);
 const next=job.kind==='series'
  ?{type:'startSeries',location:kind,total:job.total,threshold:job.threshold,heroId:h.id}
  :{type:kind,heroId:h.id};
 return act(claimed,next,now,random);}
 case 'caravan':{
  const hero=idleHero(s);
  requireFreeLocation(s,'caravan');
  requireLocationLevel(hero,'caravan');
  hero.job=makeRun(s,hero,'caravan',now,Math.floor(random()*4294967296));
  addHistory(s,`${hero.name} сопровождает караван на Павелецкую.`,now);break;
 }
 case 'technopark':{
  const hero=idleHero(s);
  requireFreeLocation(s,'technopark');
  requireLocationLevel(hero,'technopark');
  hero.job=makeRun(s,hero,'technopark',now,Math.floor(random()*4294967296));
  addHistory(s,`${hero.name} отправился исследовать Технопарк.`,now);
  break;
 }
 case 'patrol':{const hero=idleHero(s);requireFreeLocation(s,'patrol');requireLocationLevel(hero,'patrol');hero.job=makeRun(s,hero,'patrol',now,Math.floor(random()*4294967296));addHistory(s,`${hero.name} отправился патрулировать тоннели.`,now);break;}
 case 'mission':{const hero=idleHero(s);requireLocationLevel(hero,'mission');requireFreeLocation(s,'mission');hero.job=makeRun(s,hero,'mission',now,Math.floor(random()*4294967296));addHistory(s,'Диверсант отправился расчищать мусорные кучи.',now);break;}
 case 'help':{const hero=idleHero(s);requireLocationLevel(hero,'help');requireFreeLocation(s,'help');hero.job=makeRun(s,hero,'help',now,Math.floor(random()*4294967296));addHistory(s,`${hero.name} помогает на станции.`,now);break;}
 case 'acceptToothQuest':{
  requireThat(!s.toothQuest,'Поручение уже принято или выполнено.');
  s.toothQuest='accepted';
  addHistory(s,'Поручение Смотрителя станции: добыть золотой зуб.',now);break;
 }
 case 'turnInToothQuest':{
  requireThat(s.toothQuest==='accepted','Сначала прими поручение Смотрителя.');
  removeItem(s,'tooth',1);
  s.money+=300;
  s.toothQuest='completed';
  addHistory(s,'Смотритель станции принял золотой зуб. Награда 30 A.',now);break;
 }
 case 'rest': {
  const hero=idleHero(s);
  const restType=action.restType??'station';
  requireThat(Object.hasOwn(REST_OPTIONS,restType),'Нет такого варианта отдыха.');
  const option=REST_OPTIONS[restType];
  requireThat(hero.hp<effectiveMaxHp(hero),'Здоровье уже полное.');
  pay(s,option.cost);
  hero.job={kind:'rest',restType,startedAt:now,endsAt:now+option.seconds*1000,healing:option.healing(hero)};
  if(restType==='station'&&!s.bobrovMet){
   s.bobrovMet=true;
   addHistory(s,'Знакомство с тов. Бобровым в кафе «Столовая».',now);
  }
  addHistory(s,`${hero.name}: ${option.name}.`,now);
  break;
 }
 case 'interruptRest': {
  requireThat(h?.job?.kind==='rest','Сталкер сейчас не отдыхает.');
  const job=h.job;
  const fraction=ready(job,now)?1:Math.max(0,(now-job.startedAt)/(job.endsAt-job.startedAt));
  job.healing*=fraction;
  job.endsAt=now;
  return act(s,{type:'claimHero',heroId:h.id},now,random);
 }
 case 'claimHero':{requireThat(h&&ready(h.job,now),'Результат ещё не готов.');const firstNewLevel=h.level+1,job=h.job,bonus=claimBonus(h,job),nationalBonus=nationalityClaimBonus(h,job);if(job.kind==='series'){receive(s,Object.entries(job.loot).map(([item,qty])=>({item,qty})));s.money+=job.money;for(const key of ['hp','maxHp','level','xp','wounds','bandages','dressingKits','grenades','molotovs','dead'])h[key]=job.worker[key];addHistory(s,`${locationName(job.location)}: серия завершена, +${job.xp} опыта, +${job.money/10} A. ${job.reason}.`,now);}else if(job.kind==='help'){const e=job.result;receive(s,Object.entries(e.loot).map(([item,qty])=>({item,qty})));s.money+=e.money;levelUp(h,e.xp);if(h.wounds>0)h.wounds--;addHistory(s,`Помощь на станции завершена: +${e.xp} опыта, +${e.money/10} A.`,now);}else if(job.kind==='rest'){h.hp=Math.min(effectiveMaxHp(h),h.hp+job.healing);addHistory(s,`Отдых завершён: восстановлено до ${Math.round(h.hp)} HP.`,now);}else {const e=job.result;if(!e.alive){h.dead=true;h.hp=0;h.bandages=0;h.dressingKits=0;h.grenades=0;h.molotovs=0;addHistory(s,'Диверсант погиб. Добыча и опыт потеряны.',now);}else {receive(s,Object.entries(e.loot).map(([item,qty])=>({item,qty})));s.money+=e.money??0;h.hp=e.hp;h.bandages=e.bandagesRemaining;h.dressingKits=e.dressingKitsRemaining??0;h.grenades=e.grenadesRemaining??0;h.molotovs=e.molotovsRemaining??0;levelUp(h,e.xp);if(h.wounds>0)h.wounds--;addHistory(s,`Вылазка завершена: +${e.xp} опыта, побеждено противников: ${e.killed}.`,now);}}if(nationalBonus){s.money+=nationalBonus;addHistory(s,`${h.name}: национальный бонус +${nationalBonus/10} A.`,now);}if(bonus){s.money+=bonus;addHistory(s,`${h.name}: «Жадный», дополнительно +${bonus/10} A.`,now);}const dose=jobRadiation(job);
 if(dose){
  h.radiation=(h.radiation??0)+dose;
  h.hp=Math.min(h.hp,effectiveMaxHp(h));
  addHistory(s,`${h.name}: Облучён (${h.radiation}).`,now);
 }
 if(!h.dead)paySideJob(s,h,firstNewLevel,now);const completedLocation=job.kind==='series'?job.location:job.kind;if(['mission','help','patrol','technopark','caravan'].includes(completedLocation)&&!h.dead&&(job.kind!=='series'||job.completed>0)){
 h.lastCompletedLocation=completedLocation;
 if(completedLocation==='technopark'&&!s.duren){
  receive(s,[{item:'sharpBlade',qty:1}]);
  s.duren={level:1,xp:0,nextAt:now,visit:null};
  visit(s,now,random);
  addHistory(s,'Знакомство с Дурнем. Получено острое лезвие.',now);
 }
 if(!s.completedLocations[completedLocation]){
  s.completedLocations[completedLocation]=true;
  if(completedLocation==='caravan'){
   receive(s,[{item:'traderNotes',qty:1}]);
   addHistory(s,'Первое прохождение каравана. Получены записки бывалого торговца.',now);
  }else{
   s.filters++;
   addHistory(s,`Первое прохождение: ${locationName(completedLocation)}. Получен фильтр.`,now);
  }
 }
}h.job=null;break;}
 case 'revive':{requireThat(h&&h.dead&&!h.job,'Герой не нуждается в восстановлении.');if(action.paid){pay(s,200*h.level);h.hp=effectiveMaxHp(h);h.wounds=0;}else{h.hp=1;h.wounds=4;}h.dead=false;h.bandages=0;h.dressingKits=0;h.grenades=0;h.molotovs=0;addHistory(s,action.paid?'Герой восстановлен с полным здоровьем.':'Герой восстановлен. Тяжёлые раны: 4 вылазки.',now);break;}
 case 'ghoulKebab':{
  const hero=idleHero(s);requireThat(hero.hp<effectiveMaxHp(hero),'Здоровье уже полное.');
  removeItem(s,'ghoulKebab',1);
  hero.hp=Math.min(effectiveMaxHp(hero),hero.hp+.15*hero.maxHp+7*heroAttributes(hero).strength);
  addHistory(s,'Сталкер съел шашлык из упыря.',now);break;
 }
 case 'mushroomTea':{
  const hero=idleHero(s),firstNewLevel=hero.level+1;
  removeItem(s,'mushroomTea',1);
  const removed=Math.min(hero.radiation??0,rng(Math.floor(random()*4294967296)).int(1,4)+heroAttributes(hero).strength);
  hero.radiation=(hero.radiation??0)-removed;
  const previousLoss=hero.permanentHpLoss??0;
  hero.mushroomTeasDrunk=(hero.mushroomTeasDrunk??Math.floor(previousLoss/5))+1;
  hero.permanentHpLoss=previousLoss+3;
  hero.maxHp=Math.max(1,hero.maxHp-3);
  levelUp(hero,50);
  hero.hp=Math.min(hero.hp,effectiveMaxHp(hero));
  paySideJob(s,hero,firstNewLevel,now);
  addHistory(s,`Чай из грибов: снято ${removed} РАД, +50 опыта, −3 к максимуму HP.`,now);break;
 }
 case 'broth':{const hero=idleHero(s);requireThat(hero.hp<effectiveMaxHp(hero),'Здоровье уже полное.');removeItem(s,'broth',1);hero.hp=Math.min(effectiveMaxHp(hero),hero.hp+.1*hero.maxHp+5*heroConfig(s).hero.strength);addHistory(s,'Сталкер выпил отвар из крысы.',now);break;}
 case 'dressingKit':
 case 'bandage':{const hero=idleHero(s);requireThat(hero.hp<effectiveMaxHp(hero),'Здоровье уже полное.');const item=action.type,key=item==='bandage'?'bandages':'dressingKits';if(hero[key]>0)hero[key]--;else removeItem(s,item,1);const heal=bandageHeal(heroConfig(s,hero),rng(Math.floor(random()*4294967296)),hero.hp,item);hero.hp=heal.hp;addHistory(s,`${ITEMS[item].name}: +${Math.round(heal.healed)} HP.`,now);break;}
 case 'pack': {
  const hero=idleHero(s);
  const item=action.item??'bandage';
  requireThat(item==='bandage'||item==='dressingKit'||ITEMS[item]?.type==='grenade','Этот предмет нельзя взять на вылазку.');
  const grenade=ITEMS[item].type==='grenade';
  const key={pipeGrenade:'grenades',molotov:'molotovs',bandage:'bandages',dressingKit:'dressingKits'}[item];
  const carried=grenade?(hero.grenades??0)+(hero.molotovs??0):hero.bandages+(hero.dressingKits??0);
  const freeSlots=Math.max(0,consumableLimit(hero)-carried);
  const available=countItem(s,item);
  if(action.max){
   requireThat(available>0,'В инвентаре нет выбранного расходника.');
   requireThat(freeSlots>0,'Достигнут лимит расходников в этом слоте.');
  }
  const qty=action.max?Math.min(available,freeSlots):action.qty;
  requireThat(Number.isInteger(qty)&&qty!==0,'Выбери количество бинтов.');
  requireThat(qty<=freeSlots,'Достигнут лимит расходников в этом слоте.');
  if(qty>0){
   removeItem(s,item,qty);
  }else{
   requireThat((hero[key]??0)>=-qty,'Нет столько расходников.');
   receive(s,[{item,qty:-qty}]);
  }
  hero[key]=(hero[key]??0)+qty;
  break;
 }
 case 'equip':{const hero=idleHero(s);const row=s.inventory.find(x=>x.uid===action.uid);requireThat(row,'Предмета уже нет.');const item=ITEMS[row.item];requireThat(item.type==='body'||item.type==='weapon','Этот предмет нельзя надеть.');requireThat(!action.slot||['main','ranged'].includes(action.slot),'Неверный слот.');const key=item.type==='body'?'body':action.slot==='main'?'weapon':action.slot==='ranged'?'rangedWeapon':item.combat==='ranged'?'rangedWeapon':'weapon';requireThat(key!=='rangedWeapon'||item.combat==='ranged','В дополнительный слот можно только дистанционное оружие.');const target=item.twoSlots?'weapon':key;
 const displaced=item.twoSlots?['weapon','rangedWeapon']:key==='rangedWeapon'&&ITEMS[hero.weapon]?.twoSlots?['weapon',key]:[key];
 removeRow(s,row.uid,1);
 receive(s,displaced.filter(slot=>hero[slot]).map(slot=>({...hero[slot+'Details'],item:hero[slot],qty:1})));
 for(const slot of displaced){hero[slot]=null;hero[slot+'Details']=null;}
 hero[target]=row.item;hero[target+'Details']={...clone(row),qty:1};break;}
 case 'moveWeapon':{const hero=idleHero(s);requireThat(['main','ranged'].includes(action.slot),'Неверный слот.');const from=action.slot==='main'?'weapon':'rangedWeapon',to=from==='weapon'?'rangedWeapon':'weapon',moving=hero[from],details=clone(hero[from+'Details']??null);requireThat(moving,'Слот пуст.');requireThat(!ITEMS[hero.weapon]?.twoSlots,'Это оружие занимает оба слота.');requireThat(to!=='rangedWeapon'||ITEMS[moving].combat==='ranged','В дополнительный слот можно только дистанционное оружие.');const previous=hero[to],previousDetails=clone(hero[to+'Details']??null),swap=previous&&(from==='weapon'||ITEMS[previous].combat==='ranged');if(previous&&!swap)receive(s,[{...previousDetails,item:previous,qty:1}]);hero[to]=moving;hero[to+'Details']=details;hero[from]=swap?previous:null;hero[from+'Details']=swap?previousDetails:null;break;}
 case 'unequipWeapon':{const hero=idleHero(s),key=action.slot==='ranged'?'rangedWeapon':'weapon';requireThat(hero[key],'Слот оружия пуст.');receive(s,[{...hero[key+'Details'],item:hero[key],qty:1}]);hero[key]=null;hero[key+'Details']=null;break;}
 case 'unequipBody':{const hero=idleHero(s);requireThat(hero.body,'Броня не надета.');receive(s,[{...hero.bodyDetails,item:hero.body,qty:1}]);hero.body=null;hero.bodyDetails=null;break;}
 case 'discard':{const row=s.inventory.find(x=>x.uid===action.uid);requireThat(row,'Предмета уже нет.');removeRow(s,row.uid,action.qty??1);break;}
 case 'craft':{const recipe=RECIPES[action.recipe];requireThat(recipe&&!recipe.upgrade,'Рецепт ещё не описан.');const production=s.productions[recipe.production];requireThat(!production.job,'Сначала получи готовое изделие.');requireThat(production.level>=recipe.level,'Недостаточный уровень производства.');requireThat(!action.max||recipe.batch,'В этом рецепте нельзя выбрать количество.');const qty=recipe.batch?(action.max?maxCraftQuantity(s,action.recipe):(action.qty??1)):1;requireThat(!action.max||qty>0,'Не хватает ресурсов для производства.');requireThat(Number.isSafeInteger(qty)&&qty>0&&qty<=1000,'Выбери количество от 1 до 1000.');for(const [item,count]of Object.entries(recipe.ingredients))requireThat(countItem(s,item)>=count*qty,'Не хватает материалов.');pay(s,recipe.cost*qty);for(const [item,count]of Object.entries(recipe.ingredients))removeItem(s,item,count*qty);production.job={recipe:action.recipe,qty,startedAt:now,endsAt:now+recipe.seconds*qty*1000};
 if(recipe.chance!=null){
  const chance=upgradeChance(s,action.recipe);
  let successes=0;
  for(let attempt=0;attempt<qty;attempt++)if(Math.floor(random()*100)+1<=chance)successes++;
  Object.assign(production.job,{chance,successes});
 }addHistory(s,`Начато изготовление: ${recipe.name} ×${qty}.`,now);break;}
 case 'upgrade':{const recipe=RECIPES[action.recipe],production=s.productions[recipe?.production],row=s.inventory.find(x=>x.uid===action.uid);requireThat(recipe?.upgrade,'Нет такого улучшения.');requireThat(!production.job,'Сначала получи результат улучшения.');requireThat(production.level>=recipe.level,'Недостаточный уровень производства.');requireThat(canUpgrade(row,action.recipe),'Нужен подходящий предмет из инвентаря без этого улучшения и с менее чем тремя приписками.');for(const [item,count]of Object.entries(recipe.ingredients))requireThat(countItem(s,item)>=count,'Не хватает материалов.');pay(s,recipe.cost);const target=clone(row);removeRow(s,row.uid);for(const [item,count]of Object.entries(recipe.ingredients))removeItem(s,item,count);production.job={recipe:action.recipe,target,chance:upgradeChance(s,action.recipe),success:Math.floor(random()*100)+1<=upgradeChance(s,action.recipe),startedAt:now,endsAt:now+recipe.seconds*1000};addHistory(s,`Начато улучшение: ${itemName(target)}.`,now);break;}
 case 'claimCraft':{const production=s.productions[action.production];requireThat(production&&ready(production.job,now),'Изделие ещё не готово.');const job=production.job,recipe=RECIPES[job.recipe],qty=job.qty??1;let output;
 if(recipe.upgrade){output=clone(job.target);if(job.success)output.upgrades=[...(output.upgrades??[]),{recipe:job.recipe,prefix:recipe.prefix,bonus:recipe.bonus??0,armorBonus:recipe.armorBonus??0,accuracyBonus:recipe.accuracyBonus??0,valueBonus:upgradeValueBonus(recipe),...(recipe.minBonus!=null?{minBonus:recipe.minBonus,maxBonus:recipe.maxBonus}:{})}];receive(s,[output]);addHistory(s,job.success?`Улучшение удалось: ${itemName(output)}.`:`Улучшение не удалось: ${itemName(output)} возвращён без изменений.`,now);}else if(job.successes!=null){
  const failed=qty-job.successes;
  const returned=recipe.refundOnFailure&&failed>0?Object.entries(recipe.ingredients).map(([item,count])=>({item,qty:count*failed})):[];
  if(recipe.output==='gasMaskFilter')s.filters+=job.successes;
  else receive(s,[{item:recipe.output,qty:job.successes},...returned]);
  addHistory(s,`${recipe.name}: успешно ${job.successes} из ${qty}.${returned.length?' Материалы за провалы возвращены.':''}`,now);
 }else{receive(s,[{item:recipe.output,qty}]);addHistory(s,`Изготовлено: ${recipe.name} ×${qty}.`,now);}
 gainProductionXp(production,recipe.production,(recipe.xp??0)*qty);production.job=null;break;}
 case 'buyInventorySlot':{
  pay(s,inventorySlotCost(s));
  s.inventorySlotsBought=(s.inventorySlotsBought??0)+1;
  break;
 }
 case 'buyShelf':{
  requireThat(s.shelves.length<MAX_SHELVES,'Все полки уже открыты.');
  pay(s,shelfCost(s));
  s.shelves.push(null);
  break;
 }
 case 'sell':{const row=s.inventory.find(x=>x.uid===action.uid);requireThat(row,'Предмета уже нет.');const qty=action.all&&ITEMS[row.item].stack?row.qty:(action.qty??1);requireThat(Number.isInteger(qty)&&qty>0&&qty<=row.qty,'Неверное количество товара.');const slot=s.shelves.findIndex(x=>!x);requireThat(slot>=0,'Все полки заняты.');requireThat(Number.isInteger(ITEMS[row.item].value),'Цена предмета ещё не задана.');const details=clone(row),price=itemValue(row)*qty;removeRow(s,row.uid,qty);s.shelves[slot]={...details,id:uid(),item:row.item,qty,price,startedAt:now,endsAt:now+price*200};break;}
 case 'claimSale':{const sale=s.shelves[action.slot];requireThat(sale&&ready(sale,now),'Товар ещё не продан.');s.money+=sale.price;s.shelves[action.slot]=null;addHistory(s,`Получено за продажу: ${sale.price/10} A.`,now);break;}
 case 'cancelSale':{const sale=s.shelves[action.slot];requireThat(sale,'Полка пуста.');requireThat(!ready(sale,now),'Товар уже продан. Получи деньги.');receive(s,[{...sale,item:sale.item,qty:sale.qty}]);s.shelves[action.slot]=null;break;}
 case 'openYuras':openYuras(s,now,random,action.merchant);break;
 case 'trade':{const merchant=action.merchant??'yuras',npc=Object.hasOwn(MERCHANTS,merchant)?s[merchant]:null,v=npc?.visit;requireThat(v&&v.id===action.visitId,'Этот визит уже завершён.');requireThat(TRADE_EFFECTS[action.modifier],'Неверный вариант торга.');const offer=v.offers?.[action.offer];requireThat(offer,'Предложение недоступно.');const quote=tradeQuote(offer,offer.qty,action.modifier,v.role,merchant);if(v.role==='seller'){requireThat(canReceive(s,[offer]),'В инвентаре не хватает места.');pay(s,quote.price);receive(s,[offer]);}else{const row=s.inventory.find(x=>x.uid===offer.inventoryUid);requireThat(row&&row.item===offer.item&&row.qty>=offer.qty,'Этого предмета уже нет в инвентаре.');removeRow(s,row.uid,offer.qty);s.money+=quote.price;}npc.xp=Math.round((npc.xp+quote.xp)*1000000)/1000000;npc.nextAt=now+quote.cooldown;npc.visit=null;addHistory(s,`Сделка · ${MERCHANTS[merchant].name}: ${ITEMS[offer.item].name}, ${quote.price/10} A.`,now);break;}
 case 'dismissYuras':{
  const merchant=action.merchant??'yuras',npc=Object.hasOwn(MERCHANTS,merchant)?s[merchant]:null;
  requireThat(npc?.visit,'Торговец уже ушёл.');
  npc.visit=null;npc.nextAt=now+MERCHANTS[merchant].cooldown;
  addHistory(s,`${MERCHANTS[merchant].name} ушёл без сделки.`,now);break;
 }
 default:throw new Error('Неизвестное действие.');
 }s.updatedAt=now;return s;
}

