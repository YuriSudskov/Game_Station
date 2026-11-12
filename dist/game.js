import {advancePartyCombat,preparePartyCombat,updatePartyCasualties,decidePartyCasualty,beginPartyRecovery} from './party-combat.js';
import {NATIONALITIES,NATIONALITY_VERSION} from './nationalities.js';
export {NATIONALITIES,NATIONALITY_VERSION};
import {HERO_HOBBIES,HOBBY_COST,STATION_BUILDINGS,STATION_BUILD_SECONDS,ACID_SPIDER,MATURE_GUARD,MEDIC_TREATMENT,INTERACTIVE_MISSIONS,ZIL_TUNNELS,LEVEL_PERKS,LEVEL_PERK_SCHEDULES,PROFESSIONS,IDENTITIES,ITEMS,PERKS,CONFIG,PATROL,CARAVAN,TECHNOPARK,SURFACE,SURFACE_SHOPS,patrolReady,RECIPES,PRODUCTIONS,productionXpThreshold,TRADE_EFFECTS,CAPACITY,STARTING_SHELVES,MAX_SHELVES,MAX_PRODUCTION_LEVEL,LOCATION_LEVELS} from './data.js';
import {perceptionCheck,rng,battle,expedition,withStarterPerk,bandageHeal,stationHelp,surfaceExpedition,zilTunnelsExpedition,nationalityHealing} from './combat.js';
const uid=()=>globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random().toString(36).slice(2)}`;
const clone=x=>JSON.parse(JSON.stringify(x));
const requireThat=(value,message)=>{if(!value)throw new Error(message);};
export const roundRatio=(value,numerator,denominator=100)=>Math.floor((value*numerator+denominator/2)/denominator);
export const PLAYER_ROLES={
 shekel:{name:'Шекель',title:'Я Шекель',motto:'Это будет моё метро целиком',description:'Продажа предметов на 10% дороже, покупка у торговцев на 20% дешевле. На старте 10 шекелей.',currency:'Шекели'},
 pin:{name:'Пин',title:'Я инженер — Пин',motto:'Мы будем делать Гуас! Майн гер!',description:'Открыто изучение «Гаус-технология». Валюта — батареи.',currency:'Батареи'},
 sova:{name:'Сова',title:'Я Сова',motto:'Мы разовьём станцию',description:'Диверсантам со 2-го уровня открывается выбор перка «Двуручный бой». Новая валюта — люди, на старте 0.',currency:'Люди'}
};
export const KEEPER_QUESTS={
 1:{id:'tooth',title:'Золотой зуб',description:'Принеси один золотой зуб из мусорных куч.',target:1,reward:300},
 2:{id:'patrol',title:'Упыри в тоннеле',description:'Иди в тоннель, патрулируй, победи трёх упырей и тогда возвращайся.',target:3,reward:500},
 3:{id:'identity',title:'А ты, собственно говоря, кто?',description:'Познакомься со Смотрителем и выбери, кем будешь на станции.',target:1,reward:0},
 4:{id:'technopark',title:'Восстановим Технопарк',description:'Иди, исследуй Технопарк. Мы хотим эту станцию восстановить. Успешно пройди её дважды.',target:2,reward:600},
 5:{id:'outfitStation',title:'Обустроить станцию',description:'Познакомься с начальником производства Алексеем Иванычем и построй любое здание на станции.',target:1},
 6:{id:'repairRoof',title:'Отремонтируй крышу Технопарка',description:'Найди материалы для ремонта в окрестностях Технопарка. Вылазка доступна на карте поверхности.',target:1}
};
export function keeperQuestView(state){
 if(state.toothQuest!=='completed')return {...KEEPER_QUESTS[1],stage:1,status:state.toothQuest==='accepted'?'accepted':'offered',progress:Math.min(1,countItem(state,'tooth'))};
 const saved=state.keeperQuest??{stage:2,status:'offered',progress:0};
 // Stage 5 with completed status was the end marker in old saves.
 const quest=saved.stage===5&&saved.status==='completed'?{stage:5,status:'offered',progress:0}:saved;
 const progress=quest.stage===5?Number(Object.values(state.stationBuildings??{}).some(Boolean)):quest.progress;
 return {...KEEPER_QUESTS[quest.stage],...quest,progress};
}
export const stationBuildingLimit=s=>2+2*Number(Boolean(s.completedLocations?.technoparkRoof))+2*Number(Boolean(s.completedLocations?.kolomenskaya));
export const stationBuildingCount=s=>Object.keys(STATION_BUILDINGS).filter(id=>!STATION_BUILDINGS[id].role&&(s.stationBuildings?.[id]||s.stationConstruction?.[id])).length;
const hasBuilding=(s,id)=>s?.stationBuildings?.[id]===true;
export const SOVA_HOUSING_CAPACITY=20;
export const sovaDevelopmentAvailable=s=>s.playerRole==='sova'&&hasBuilding(s,'housing');
export function stationBuildingCost(s,id){
 const discount=getHeroes(s).filter(h=>!h.dead).reduce((best,h)=>Math.min(best,h.nationalityBonuses?.buildingPercent??0),0);
 return roundRatio(STATION_BUILDINGS[id].cost,100+discount);
}
export function stationBuildingAvailable(s,id){
 const building=Object.hasOwn(STATION_BUILDINGS,id)?STATION_BUILDINGS[id]:null;
 return Boolean(s.alexeyMet&&building&&(!building.role||building.role===s.playerRole));
}
export const MEDIC_TENT_MINUTES=60;
function healAtMedicTent(state,hero,at){
 if(!hasBuilding(state,'medicTent')||hero.dead||hero.hp<=0||at<(state.medicTentBuiltAt??0))return 0;
 const max=effectiveMaxHp(hero),healed=Math.max(0,Math.min(max-hero.hp,max*.05));
 hero.hp+=healed;
 return healed;
}
function healAdventurePartyAtTent(state,active,now){
 for(const id of active.heroIds){
  const hero=state.heroes.find(h=>h.id===id);
  if(hero)healAtMedicTent(state,hero,now);
 }
}
function advanceMedicTentIncome(state,now,random){
 if(!hasBuilding(state,'medicTent'))return false;
 const fresh=!state.medicTentIncome;
 const income=state.medicTentIncome??={startedAt:state.medicTentBuiltAt??now,minutes:0,money:0};
 const elapsed=Math.min(MEDIC_TENT_MINUTES,Math.floor((now-income.startedAt)/60000));
 if(elapsed<=income.minutes)return fresh;
 while(income.minutes<elapsed){
  income.money+=10*(1+Math.floor(random()*8));
  income.minutes++;
 }
 return true;
}
function advanceStationConstruction(s,now){
 let changed=false;
 for(const [id,job] of Object.entries(s.stationConstruction??{})){
  if(!ready(job,now))continue;
  if(job.demolition){
   delete s.stationConstruction[id];
   addHistory(s,'Снесено: '+STATION_BUILDINGS[id].name+'.',job.endsAt);
   changed=true;
   continue;
  }
  (s.stationBuildings??={})[id]=true;
  if(id==='medicTent')s.medicTentBuiltAt=job.endsAt;
  delete s.stationConstruction[id];
  addHistory(s,'Построено: '+STATION_BUILDINGS[id].name+'.',job.endsAt);
  changed=true;
 }
 return changed;
}
export function repairMaterialsAvailable(state){
 const q=keeperQuestView(state);
 return q.stage===6&&q.status==='accepted'&&!state.completedLocations?.repairMaterials;
}
export const heroHasDualWield=hero=>Boolean(hero&&(hero.profession??'saboteur')==='saboteur'&&(hero.levelPerks??[]).some(p=>p.perk==='dual-wield'));
export const salePrice=(state,item,qty=1)=>roundRatio(itemValue(item)*qty,tradePercent(state,'salePercent'));
function recordKeeperProgress(state,hero,job){
 const q=keeperQuestView(state);
 if(q.status!=='accepted'||![2,4].includes(q.stage)||hero.dead)return;
 if(job.kind==='series'&&job.worker.dead)return;
 const runs=job.kind==='series'?job.reports??[]:[job];
 let gained=0;
 for(const run of runs){
  if(run.startedAt<(q.acceptedAt??0)||!run.result?.alive)continue;
  if(q.stage===2&&run.kind==='patrol')gained+=Math.max(0,(run.result.killed??0)-(run.special?1:0));
  if(q.stage===4&&run.kind==='technopark')gained++;
 }
 if(gained)state.keeperQuest={...state.keeperQuest,progress:Math.min(q.target,(q.progress??0)+gained)};
}
export function sellerPrice(item,qty=1,state=null){requireThat(Number.isInteger(ITEMS[typeof item==='string'?item:item.item]?.value),'Цена предмета ещё не задана.');const base=itemValue(item)*qty;const price=Math.max(roundRatio(base,120),base+10);return roundRatio(price,tradePercent(state,'buyPercent'));}
export const MERCHANTS={yuras:{name:'Юрась',cooldown:40000,buyPercent:110,sellerChance:.8,buyBudgetPerLevel:500},duren:{name:'Дурень',cooldown:120000,buyPercent:150,sellerChance:0,sellerChanceStep:5,buyBudgetPerLevel:400,buyTypes:['medicine','food','stimulant']},vasek:{name:'Васёк',cooldown:50000,buyPercent:110,sellerChance:.6,buyTypes:['weapon','body'],budgetMultiplier:2}};
export const MAX_MERCHANT_LEVEL=10;
export const MERCHANT_XP_THRESHOLDS=Object.fromEntries(Array.from({length:9},(_,i)=>[i+1,20*3**i]));
export function merchantXpThreshold(level){return MERCHANT_XP_THRESHOLDS[level]??null;}
export function gainMerchantXp(npc,xp=0){
 npc.level=Math.max(1,Math.min(MAX_MERCHANT_LEVEL,Math.trunc(npc.level??1)));npc.xp=Math.round(((npc.xp??0)+xp)*1000000)/1000000;
 while(npc.level<MAX_MERCHANT_LEVEL&&npc.xp>=merchantXpThreshold(npc.level)){npc.xp=Math.round((npc.xp-merchantXpThreshold(npc.level))*1000000)/1000000;npc.level++;}
 if(npc.level===MAX_MERCHANT_LEVEL)npc.xp=0;
}
export const YURAS_STOCK_BY_LEVEL={
 1:[{item:'jacket',qty:1},{item:'bandage',qty:5},{item:'leather',qty:2},{item:'cloth',qty:3},{item:'metal',qty:4}],
 2:[{item:'pipe',qty:1}],3:[{item:'sharpClaws',qty:3}],4:[{item:'toughLeather',qty:1},{item:'ghoulHide',qty:2}],
 5:[{item:'emptyBottle',qty:2},{item:'ghoulMeat',qty:2}],6:[{item:'sharpBlade',qty:1}],7:[{item:'antiseptic',qty:1}],
 8:[{item:'armorPlates',qty:2}],9:[{item:'rareMushrooms',qty:2}],10:[{item:'gasMaskFilter',qty:2},{item:'springMechanism',qty:1}]
};
export const VASEK_STOCK_BY_LEVEL={
 1:[{item:'crowbar',qty:1,quality:1},{item:'ashot',qty:1,quality:1},{item:'oldShotgun',qty:1,quality:1},{item:'qualityJacket',qty:1,quality:1},{item:'springMechanism',qty:4}],
 2:[{item:'pilotJacket',qty:1}],3:[{item:'browning',qty:1}],4:[{item:'shieldUni',qty:1}],
 5:[{item:'ghoulJacket',qty:1,quality:1},{item:'kazakVest',qty:1}],6:[{item:'awl',qty:1,quality:1},{item:'ak74',qty:1}],
 7:[{item:'heavyVest',qty:1},{item:'pilotJacket',qty:1,quality:2}],8:[{item:'mosin',qty:1,quality:1}],9:[{item:'butcherCleaver',qty:1,quality:1}],10:[{item:'ak47',qty:1}]
};
export const MERCHANT_STOCK=YURAS_STOCK_BY_LEVEL[1];
export function merchantSellerOffers(state,id,random=Math.random){
 if(id==='duren'){
  const gear=Object.keys(ITEMS).filter(item=>['weapon','body'].includes(ITEMS[item].type)&&Number.isInteger(ITEMS[item].value));
  return [{item:gear[Math.floor(random()*gear.length)],qty:1,quality:random()<.7?1:2}];
 }
 const level=state[id].level??1,entries=Object.entries(id==='vasek'?VASEK_STOCK_BY_LEVEL:YURAS_STOCK_BY_LEVEL).filter(([required])=>Number(required)<=level);
 const highest=entries.at(-1)[1],best=highest[Math.floor(random()*highest.length)],rest=entries.flatMap(([,rows])=>rows).filter(row=>row.item!==best.item);
 for(let i=rest.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[rest[i],rest[j]]=[rest[j],rest[i]];}
 const distinct=new Map();
 for(const row of rest)if(!distinct.has(row.item))distinct.set(row.item,row);
 const offers=clone([best,...Array.from(distinct.values()).slice(0,4)]);
 if(id==='yuras'&&level>=2){
  for(const offer of offers){
   if(!ITEMS[offer.item]?.stack||!(itemValue(offer)>0))continue;
   const target=Math.floor((0.4+0.6*random())*400*level);
   offer.qty=1;
   while(sellerPrice(offer,offer.qty+1)<=target)offer.qty++;
  }
 }
 return offers;
}
export function merchantBuyBudget(state,id){
 const merchant=MERCHANTS[id];
 return (merchant.buyBudgetPerLevel??300)*(state[id]?.level??1)*(merchant.budgetMultiplier??1);
}
export function prepareMerchantOffers(state,id,random=Math.random){
 const npc=state[id],v=npc?.visit;
 if(!v)return false;
 const level=npc.level??1;
 const buyBudget=merchantBuyBudget(state,id);
 const buyCount=id==='duren'?3:3+Math.floor((level-1)/3);
 if(v.offers!==null){
  const oldBuyerRules=v.buyBudget!==buyBudget||v.buyCount!==buyCount;
  const stockStillAvailable=v.offers.every(offer=>state.inventory.some(row=>row.uid===offer.inventoryUid&&row.item===offer.item&&row.qty>=offer.qty));
  if(v.role!=='buyer'||(!oldBuyerRules&&stockStillAvailable))return false;
  v.offers=null;
 }
 if(v.role==='seller'){
  v.offers=merchantSellerOffers(state,id,random);
  const popularity=shekelPopularity(state);
  if(tradingPostAvailable(state)&&npc.ours&&popularity>0){
   for(const offer of v.offers)if(random()*100<popularity)offer.currency='shekel';
  }
 }
 else{
  v.buyBudget=buyBudget;v.buyCount=buyCount;
  const rows=state.inventory.filter(row=>Number.isInteger(ITEMS[row.item]?.value)&&(!MERCHANTS[id].buyTypes||MERCHANTS[id].buyTypes.includes(ITEMS[row.item].type))&&tradeQuote(row,1,0,'buyer',id,state).price<=v.buyBudget);
  for(let i=rows.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[rows[i],rows[j]]=[rows[j],rows[i]];}
  v.offers=rows.slice(0,v.buyCount).map(row=>{
   let qty=1;
   if(ITEMS[row.item].stack&&row.qty>1){
    const target=Math.floor((0.5+0.5*random())*buyBudget);
    let max=row.qty;
    while(qty<max){
     const count=Math.ceil((qty+max)/2);
     if(tradeQuote(row,count,0,'buyer',id,state).price<=target)qty=count;
     else max=count-1;
    }
   }
   return {...clone(row),qty,inventoryUid:row.uid};
  });
 }
 return true;
}
export function merchantFighter(state,id){const npc=state[id],level=Math.max(1,npc?.level??1),weapon=id==='duren'?'clawKnuckles':'crowbar',body=id==='duren'?'qualityJacket':'jacket';const hero={profession:'assault',perk:'none',level,weapon,body,hp:1};hero.hp=heroMaximumHp(hero);return {hero,config:heroConfig(state,hero),equipment:[{item:weapon,qty:1},{item:body,qty:1}]};}
export function merchantRobberyLoot(state,id){return [...clone(state[id]?.visit?.role==='seller'&&Array.isArray(state[id].visit.offers)?state[id].visit.offers:MERCHANT_STOCK),...merchantFighter(state,id).equipment].map(x=>({...x,origin:'robbed'}));}
export const merchantBribeCost=(state,id)=>Math.max(1,state[id]?.level??1)*300;
export function buyerPrice(item,qty=1,merchant='yuras',state=null){requireThat(Number.isInteger(ITEMS[typeof item==='string'?item:item.item]?.value),'Цена предмета ещё не задана.');const price=roundRatio(itemValue(item)*qty,MERCHANTS[merchant].buyPercent);return roundRatio(price,tradePercent(state,'salePercent'));}
export function tradeRelationDelta(modifier,role){const benefit=role==='seller'?modifier:-modifier;return benefit===-15?-1:benefit===15?2:benefit>=10?1:0;}
export function merchantCooldown(state,id,level=state?.[id]?.level??1,relation=state?.[id]?.relation??0){return Math.round(MERCHANTS[id].cooldown*1.5**(Math.max(1,Math.min(10,level))-1)*(1-.03*Math.max(-10,Math.min(20,relation))));}
export function tradeQuote(item,qty,modifier,role,merchant='yuras',state=null){
 const npc=state?.[merchant]??{level:1,xp:0,relation:0};
 const currentRelation=Math.max(-10,Math.min(20,npc.relation??0));
 const relation=Math.max(-10,Math.min(20,currentRelation+tradeRelationDelta(modifier,role)));
 const base=role==='buyer'?buyerPrice(item,qty,merchant,state):merchant==='duren'
  ? roundRatio(itemValue(item)*qty,tradePercent(state,'buyPercent'))
  : sellerPrice(item,qty,state);
 const relationFactor=200+(role==='seller'?-currentRelation:currentRelation);
 const price=roundRatio(base,(100+modifier)*relationFactor,20000);
 const effect=TRADE_EFFECTS[role==='seller'?modifier:-modifier],xp=price/10*effect.xp*(1+.03*relation),preview={level:npc.level??1,xp:npc.xp??0};gainMerchantXp(preview,xp);
 const shekelPrice=role==='seller'&&item?.currency==='shekel'?Math.max(1,Math.ceil(price/shekelRate(state??{}))):null;
 return {price,shekelPrice,xp,relation,nextLevel:preview.level,cooldown:Math.round(merchantCooldown(state,merchant,preview.level,relation)*effect.cooldown)};
}
export function createGame(now=Date.now(),random=Math.random){return {version:1,id:uid(),welcomeSeen:false,playerRole:null,shekels:0,people:0,batteries:0,money:1500,startingMoney:1500,filters:0,completedLocations:{},totalSpent:0,spendingPartial:false,inventory:[],inventorySlotsBought:0,heroes:[],selectedHeroId:null,hero:null,productions:Object.fromEntries(Object.keys(PRODUCTIONS).map(key=>[key,{level:1,xp:0,job:null}])),shelves:Array(STARTING_SHELVES).fill(null),yuras:{level:1,xp:0,nextAt:0,visit:{id:uid(),role:random()<MERCHANTS.yuras.sellerChance?'seller':'buyer',offers:null}},history:[],createdAt:now,updatedAt:now};}
export function getHeroes(s){return Array.isArray(s.heroes)?s.heroes:(s.hero?[s.hero]:[]);}
function strengthHpBonus(hero){
 return 10*(heroEffectiveStrength(hero)-PROFESSIONS[hero.profession??'saboteur'].strength);
}
function refreshNationalityBalance(hero){
 if(!hero)return;const nation=NATIONALITIES[hero.nationalityId];
 if(!nation?.balanceRevision||(hero.nationalityBalanceRevision??0)>=nation.balanceRevision)return;
 const previousMax=effectiveMaxHp(hero),previousHp=hero.hp;
 hero.nationalityBonuses=clone(nation.bonuses);hero.nationalityBalanceRevision=nation.balanceRevision;
 hero.maxHp=heroMaximumHp(hero);hero.hp=hero.dead?0:Math.min(effectiveMaxHp(hero),Math.max(0,(previousHp??0)+effectiveMaxHp(hero)-previousMax));
}
export function normalizeGame(state){const s=clone(state);if(s.interactiveMission?.pendingCombat?.enemies?.some(enemy=>enemy.webAttack)){for(const enemy of s.interactiveMission.pendingCombat.enemies)if(enemy.webAttack&&enemy.mainAttack)enemy.mainAttack.name='Кислотный укус';for(const event of s.interactiveMission.pendingCombat.events??[])if(event.type==='окружение отряда')event.text="В конце туннеля вы выходите в большой коридор с рельсами, и нежданно на вас нападает огромный кислотный паук.";}s.darkCrystalDropped=Boolean(s.darkCrystalDropped||(s.inventory??[]).some(row=>row.item==='darkCrystal')||(s.heroes??[s.hero]).some(hero=>hero?.mark));s.usedNationalities=[...new Set([...(s.usedNationalities??[]),...(s.heroes??[]).map(h=>h.nationalityId).filter(Boolean)])];for(const id of Object.keys(MERCHANTS))if(s[id]){s[id].relation=Math.max(-10,Math.min(20,s[id].relation??0));gainMerchantXp(s[id]);}s.filters??=0;s.productions??={};for(const key of Object.keys(PRODUCTIONS)){s.productions[key]??={level:1,xp:0,job:null};gainProductionXp(s.productions[key],key,0);}if(!Number.isSafeInteger(s.totalSpent)||s.totalSpent<0){s.totalSpent=0;s.spendingPartial=true;}s.heroes=Array.isArray(s.heroes)?s.heroes:(s.hero?[s.hero]:[]);
 for(const key of ['buriedRebirths','inheritedRebirths']){
  if(s[key]?.some(slot=>slot.readyLevel!=null))s[key]=s[key].map(normalizeInheritedSlot).sort((a,b)=>b.stars-a.stars);
 }
 const previousLoss=s.lastInteractiveMission;
 if(previousLoss&&['victory','escaped','unfinished'].includes(previousLoss.outcome)){
  for(const hero of s.heroes){
   if(hero.dead&&!hero.missingOnMission&&previousLoss.recoveredHeroIds?.includes(hero.id))hero.awaitingBurial=true;
  }
 }
 if(previousLoss&&['escaped','defeat'].includes(previousLoss.outcome)){
  for(const hero of s.heroes){
   if(hero.missingOnMission&&hero.missingMission===previousLoss.id&&previousLoss.heroIds?.includes(hero.id)){
    hero.missingScene??=adventureCombatScene(previousLoss);
   }
  }
 }
 for(const h of s.heroes){h.startPerk??=h.perk;h.rangedWeapon??=null;if(!s.strengthHpRule){const series=h.job?.kind==='series'?h.job:null;for(const member of [h,series?.worker,series?.initial])if(member){member.maxHp=heroMaximumHp(member);member.hp=Math.min(member.hp,effectiveMaxHp(member));}}refreshNationalityBalance(h);if(h.shekelXpReward){grantShekelRewardXp(h,Math.max(0,SHEKEL_REWARD_XP-h.shekelXpReward.applied));delete h.shekelXpReward;}if(h.job?.kind==='series'){refreshNationalityBalance(h.job.worker);refreshNationalityBalance(h.job.initial);}if(s.playerRole==='sova'&&(h.profession??'saboteur')==='saboteur')h.rewardPerkUnlocks=[...new Set([...(h.rewardPerkUnlocks??[]),'dual-wield'])];}s.strengthHpRule=true;s.shekels??=0;s.people??=0;s.batteries??=0;s.researchUnlocks??=[];if(s.playerRole==='pin'&&!s.researchUnlocks.includes('gauss'))s.researchUnlocks.push('gauss');s.completedLocations??=Object.fromEntries(s.heroes.filter(h=>h.lastCompletedLocation).map(h=>[h.lastCompletedLocation,true]));if(s.completedLocations.caravan&&!s.vasek)s.vasek={level:1,xp:0,relation:0,nextAt:0,visit:null};prepareInteractiveRecovery(s);const selected=s.heroes.find(h=>h.id===s.selectedHeroId)||s.heroes.find(h=>h.id===s.hero?.id)||s.heroes[0]||null;s.hero=selected;s.selectedHeroId=selected?.id??null;return s;}
function normalizeInheritedSlot(slot){
 const {readyLevel,...entry}=clone(slot);
 if(readyLevel===(entry.stars+1)*10&&entry.stars<5)entry.stars++;
 return entry;
}
export function inheritedRebirths(state){return [...getHeroes(state).filter(h=>rebirthStars(h)>0).map(h=>({stars:rebirthStars(h),attributes:clone(h.rebirthAttributes??{})})),...(state.buriedRebirths??[]).map(normalizeInheritedSlot),...(state.inheritedRebirths??[]).map(normalizeInheritedSlot)].sort((a,b)=>b.stars-a.stars);}
export function restartQuote(state){const spent=Number.isSafeInteger(state.totalSpent)&&state.totalSpent>=0?state.totalSpent:0;const balance=state.money??0,inventoryValue=(state.inventory??[]).reduce((sum,row)=>sum+(ITEMS[row.item]?.value==null?0:salePrice(state,row,row.qty)),0),total=spent+balance+inventoryValue;const bonus=Math.max(0,roundRatio(total,2));return {spent,balance,inventoryValue,total,bonus,money:(state.startingMoney??1500)+bonus,inheritance:inheritedRebirths(state)};}
const RESTART_COOLDOWN_MS=10*60*1000;
export const restartAttempt=state=>Number.isSafeInteger(state.restartAttempt)&&state.restartAttempt>=1?state.restartAttempt:1;
export const restartCooldownRemaining=(state,now=Date.now())=>Math.max(0,(state.restartAvailableAt??0)-now);
export function restartGame(state,now=Date.now(),random=Math.random){
 requireThat(restartCooldownRemaining(state,now)===0,'До следующего сброса ещё не прошло 10 минут.');
 const fresh=createGame(now,random);
 fresh.restartAttempt=restartAttempt(state)+1;
 fresh.restartAvailableAt=now+RESTART_COOLDOWN_MS;
 fresh.startingMoney=restartQuote(state).money;fresh.money=fresh.startingMoney;fresh.inheritedRebirths=inheritedRebirths(state);fresh.tutorialSeen=clone(state.tutorialSeen??{});fresh.unlockedProfessions=Object.keys(PROFESSIONS).filter(id=>professionUnlocked(state,id));if(state.recipeLevelOrder==='desc')fresh.recipeLevelOrder='desc';return fresh;}
export const nextHireRebirth=s=>s.shekelFreeHire?{stars:1}:s.inheritedRebirths?.[0];
export function hireCost(s,nationalityId=null){if(s.shekelFreeHire)return 0;const count=getHeroes(s).filter(hero=>!hero.dead).length;return (count===0?500:1500*2**(count-1))+(NATIONALITIES[nationalityId]?.bonuses.hireCost??0);}
export function heroTitle(hero){const profession=PROFESSIONS[hero.profession??'saboteur']?.name??'Сталкер',perk=PERKS[hero.startPerk??hero.perk]?.shortName??PERKS[hero.startPerk??hero.perk]?.name;return `${hero.name}${perk?', '+perk.toLocaleLowerCase('ru-RU'):','} ${profession.toLocaleLowerCase('ru-RU')}${rebirthStars(hero)?' '+ '★'.repeat(rebirthStars(hero)):''}`;}
export const rebirthStars=hero=>Math.max(0,Math.min(5,Math.trunc(hero?.rebirths??0)));
export const heroLevelCap=hero=>rebirthStars(hero)<5?(rebirthStars(hero)+1)*10:Infinity;
export const rebirthXpPenalty=hero=>rebirthStars(hero)?10+10*rebirthStars(hero):0;
const hobbyXpMultiplier=hero=>hero.hobby?.option==='experience'?1.1:1;
export const heroExperience=(hero,xp)=>xp>0?Math.max(1,roundRatio(xp,(100-rebirthXpPenalty(hero))*(100-(hero.nationalityBonuses?.xpPenalty??0))*hobbyXpMultiplier(hero)/100)):0;
export function rebirthQuote(state,hero=state.hero){
 const stars=rebirthStars(hero),level=heroLevelCap(hero),cost=(stars+1)*10000;
 const equipment=['weapon','rangedWeapon','body','accessory'].filter(slot=>hero?.[slot]).map(slot=>({...clone(hero[slot+'Details']??{}),item:hero[slot],qty:1}));
 const reason=!hero?'Сначала найми героя.':stars>=5?'Получены все пять звёзд.':hero.level<level?`Нужен ${level}-й уровень.`:hero.dead?'Сначала восстанови героя.':hero.job?'Сначала получи результат задания или отдыха.':state.money<cost?'Не хватает A.':!canReceive(state,equipment)?'Освободи место в инвентаре для снаряжения.':'';
 return {stars,level,cost,equipment,reason,available:!reason};
}
export function itemQuality(row){return Number.isInteger(row?.quality)?Math.max(0,Math.min(5,row.quality)):0;}
export function equipmentRequiredLevel(row){
 const item=typeof row==='string'?row:row?.item;
 if(!['weapon','body','accessory'].includes(ITEMS[item]?.type))return 0;
 const levels=Object.values(RECIPES).filter(r=>!r.upgrade&&r.output===item).map(r=>r.level);
 const recipeLevel=levels.length?Math.min(...levels):1;
 return Math.max(row?.requiredHeroLevel??0,5*Math.floor((recipeLevel-1)/5));
}
export const canUseEquipment=(hero,row)=>hero.level>=equipmentRequiredLevel(row);
export function itemName(row){const item=ITEMS[row.item],quality=itemQuality(row),prefixes=(row.upgrades??[]).map(u=>u.prefix);const auto=prefixes.includes('Авто-');return [...prefixes.filter(prefix=>prefix!=='Авто-'),(auto?'Авто-':'')+item.name].join(' ')+(quality?' +'+quality:'');}
export function upgradeValueBonus(recipe){return recipe?.upgrade?(recipe.valueBonus??recipe.cost??0):0;}
export function itemValue(row){if(typeof row==='string')return ITEMS[row]?.value;return ITEMS[row.item].value*(1+itemQuality(row))+(row.upgrades??[]).reduce((n,u)=>n+(u.valueBonus??upgradeValueBonus(RECIPES[u.recipe])),0);}
export function itemArmor(row){return (ITEMS[row.item].armor??0)+7*itemQuality(row)+(row.upgrades??[]).reduce((n,u)=>n+(u.armorBonus??0),0);}
export function itemThorns(row){
 return (row?.upgrades??[]).map(upgrade=>RECIPES[upgrade.recipe]?.thorns).find(Boolean)??null;
}
export function itemThermalArmor(row){return (ITEMS[row?.item]?.thermalArmor??0)+5*itemQuality(row)+(row?.upgrades??[]).reduce((sum,upgrade)=>sum+(upgrade.thermalArmorBonus??0),0);}
export function itemRicochet(row){return (ITEMS[row?.item]?.ricochet??0)+(row?.upgrades??[]).reduce((sum,u)=>sum+(u.ricochetBonus??0),0);}
export function missionDuration(hero,ms){const body=hero.body&&canUseEquipment(hero,{...hero.bodyDetails,item:hero.body})?ITEMS[hero.body]:null;return Math.round(ms*(hero.perk==='quick-orders'||hasLevelPerk(hero,'quick-orders')?0.85:1)*(1+(body?.missionTimePenaltyPercent??0)/100));}
export function itemRadiationProtection(row){return (ITEMS[row?.item]?.radiationProtection??0)+(ITEMS[row?.item]?.type==='accessory'?itemQuality(row):0);}
export function qualityChance(productionLevel,recipeLevel){return Math.min(100,Math.max(0,(productionLevel-recipeLevel)*5));}
export function craftExperience(recipe,productionLevel,qty=1,qualityXp=0){
 if(productionLevel>=MAX_PRODUCTION_LEVEL)return 0;
 const percent=Math.max(0,100-15*Math.max(0,productionLevel-recipe.level));
 return Math.max(1,roundRatio((recipe.xp??0)*qty+qualityXp,percent));
}
export function craftQualityXp(job){
 if(job.rolledQualityUnits!=null)return job.rolledQualityUnits*10;
 if(!job.outputs?.length)return 0;
 const equipment=['weapon','body','accessory'].includes(ITEMS[job.outputs[0].item]?.type);
 const qualityUnits=equipment
  ?job.outputs.reduce((sum,row)=>sum+itemQuality(row)*row.qty,0)
  :job.outputs.reduce((sum,row)=>sum+row.qty,0)-(job.successes??job.qty??1);
 return Math.max(0,qualityUnits)*10;
}
function rollQuality(chance,random){
 if(chance<=0||Math.floor(random()*100)+1>chance)return 0;
 const roll=Math.floor(random()*100)+1;
 return roll<=69?1:roll<=89?2:roll<=99?3:4;
}
export const firstHitArmor=row=>(row?.upgrades??[]).reduce((total,u)=>total+(RECIPES[u.recipe]?.firstHitArmor??0),0);
const RARITIES=['','rare','unique','epic'];
export function itemRarityRank(row,seen=new Set()){
 if(!row)return 0;const id=typeof row==='string'?row:row.item;
 let rank=Math.max(RARITIES.indexOf(row.rarity),RARITIES.indexOf(ITEMS[id]?.rarity),Math.min(3,(row.upgrades??[]).length));
 if(!seen.has(id)){const next=new Set(seen).add(id);for(const recipe of Object.values(RECIPES).filter(r=>!r.upgrade&&r.output===id))for(const ingredient of Object.keys(recipe.ingredients??{}))rank=Math.max(rank,itemRarityRank({item:ingredient},next));}
 return Math.max(0,rank);
}
function ingredientRarity(state,recipe,qty=1){let rank=0;for(const [id,count]of Object.entries(recipe.ingredients)){let remaining=count*qty;for(const row of state.inventory.filter(x=>x.item===id)){if(remaining<=0)break;rank=Math.max(rank,itemRarityRank(row));remaining-=Math.min(remaining,row.qty);}}return rank;}
export function itemTier(row){return Math.min(3,(row?.upgrades??[]).length);}
export function canUpgrade(row,recipeId){
 const recipe=RECIPES[recipeId],upgrades=row?.upgrades??[];
 if(recipe?.raisesQuality)return ITEMS[row?.item]?.type===recipe.target&&itemQuality(row)<5;
 const replacing=upgrades.some(upgrade=>upgrade.recipe===recipe?.replaces);
 return Boolean(row&&recipe?.upgrade
  &&(recipe.target==='body'?ITEMS[row.item]?.type==='body':(ITEMS[row.item]?.combat===(recipe.target??'melee')||((recipe.target??'melee')==='melee'&&ITEMS[row.item]?.bayonet)))
  &&(!recipe.weaponClasses||recipe.weaponClasses.includes(ITEMS[row.item]?.weaponClass))
  &&!recipe.excludedWeaponClasses?.includes(ITEMS[row.item]?.weaponClass)
  &&(itemTier(row)<3||replacing)
  &&!upgrades.some(upgrade=>upgrade.recipe===recipeId||RECIPES[upgrade.recipe]?.replaces===recipeId));
}
export function isRecipeSuperseded(state,recipeId){
 const replacement=RECIPES[RECIPES[recipeId]?.supersededBy];
 return Boolean(replacement&&state.productions[replacement.production]?.level>=replacement.level);
}
export function canRetryUpgrade(state,productionId,now=Date.now()){
 const production=state.productions[productionId],job=production?.job,recipe=RECIPES[job?.recipe];
 if(!ready(job,now)||!recipe?.upgrade||job.success!==false)return false;
 const next=clone(production);
 gainProductionXp(next,productionId,craftExperience(recipe,job.productionLevel??production.level));
 const preview={...state,productions:{...state.productions,[productionId]:next}};
 return !isRecipeSuperseded(preview,job.recipe)&&canUpgrade(job.target,job.recipe)&&state.money>=recipe.cost
  &&Object.entries(recipe.ingredients).every(([item,count])=>countItem(state,item)>=count);
}
function beginUpgrade(state,recipeId,row,now,random,fromInventory){
 requireThat(!autoProductionBusy(state,RECIPES[recipeId]?.production),'Это производство занято.');
 const recipe=RECIPES[recipeId],production=state.productions[recipe?.production];
 requireThat(recipe?.upgrade,'Нет такого улучшения.');
 requireThat(!isRecipeSuperseded(state,recipeId),'Этот рецепт заменён новым улучшением.');
 requireThat(!production.job,'Сначала получи результат улучшения.');
 requireThat(production.level>=recipe.level,'Недостаточный уровень производства.');
 requireThat(canUpgrade(row,recipeId),'Нужен подходящий предмет без этого улучшения и со свободным местом для приписки.');
 for(const [item,count]of Object.entries(recipe.ingredients))requireThat(countItem(state,item)>=count,'Не хватает материалов.');
 pay(state,recipe.cost);
 const target=clone(row),rarityRank=Math.max(itemRarityRank(row),ingredientRarity(state,recipe));
 if(fromInventory)removeRow(state,row.uid);
 for(const [item,count]of Object.entries(recipe.ingredients))removeItem(state,item,count);
 const chance=upgradeChance(state,recipeId,target);
 production.job={recipe:recipeId,productionLevel:production.level,target,rarityRank,chance,success:Math.floor(random()*100)+1<=chance,startedAt:now,endsAt:now+recipe.seconds*1000};
 addHistory(state,`Начато улучшение: ${itemName(target)}.`,now);
}
export function upgradedItem(row,recipeId){
 if(RECIPES[recipeId]?.raisesQuality)return {...clone(row),quality:Math.min(5,itemQuality(row)+1)};
 const baseRecipe=RECIPES[recipeId],recipe=baseRecipe.otherRanged&&ITEMS[row.item]?.weaponClass!=='shotgun'?{...baseRecipe,...baseRecipe.otherRanged}:baseRecipe,output=clone(row),upgrades=output.upgrades??[];
 const replacedValue=upgrades.filter(upgrade=>upgrade.recipe===recipe.replaces)
  .reduce((sum,upgrade)=>sum+(upgrade.valueBonus??upgradeValueBonus(RECIPES[upgrade.recipe])),0);
 output.upgrades=[
  ...upgrades.filter(upgrade=>upgrade.recipe!==recipe.replaces),
  {recipe:recipeId,prefix:recipe.prefix,bonus:recipe.bonus??0,armorBonus:recipe.armorBonus??0,accuracyBonus:recipe.accuracyBonus??0,valueBonus:upgradeValueBonus(recipe)+replacedValue,
   ...(recipe.blocksAimedShots?{blocksAimedShots:true}:{}),
   ...(recipe.thermalArmorBonus?{thermalArmorBonus:recipe.thermalArmorBonus}:{}),
   ...(recipe.ricochetBonus?{ricochetBonus:recipe.ricochetBonus}:{}),
   ...(recipe.minBonus!=null?{minBonus:recipe.minBonus,maxBonus:recipe.maxBonus}:{})}
 ];
 output.rarity=RARITIES[Math.max(itemRarityRank(row),itemRarityRank(output))];
 return output;
}
const hasLevelPerk=(hero,perk)=>(hero.levelPerks??[]).some(choice=>choice.perk===perk);
export function upgradeChance(state,recipeId,row=null){
 const recipe=RECIPES[recipeId];
 if(!recipe)return 0;
 const engineers=getHeroes(state).filter(hero=>hero.profession==='engineer');
 const assistants=engineers.filter(hero=>hasLevelPerk(hero,'engineer-assistant')).length;
 const baseChance=recipe.raisesQuality?100-20*itemQuality(row):recipe.chance??100;
 if(baseChance<=0)return 0;
 return Math.max(0,Math.min(100,baseChance+5*assistants+(baseChance<100?nationalProductionModifier(state,recipe,'success'):0)));
}
function paySideJob(state,hero,firstLevel,now){
 if(firstLevel>hero.level||!hasLevelPerk(hero,'engineer-side-job'))return;
 let reward=0;
 for(let level=firstLevel;level<=hero.level;level++)reward+=800+100*level;
 state.money+=reward;
 addHistory(state,`${hero.name}: «Халтурка», +${reward/10} A.`,now);
}
export function nationalityMoneyBonus(hero,money=0){return hero.nationalityBonuses?.questMoneyPercent>0?Math.max(10,roundRatio(money,hero.nationalityBonuses.questMoneyPercent)):0;}
export function nationalityClaimBonus(hero,job){if(!job||job.kind==='series')return 0;const n=hero.nationalityBonuses??{};if(n.safeMoneyBase&&job.kind!=='rest'&&job.result?.alive!==false&&(job.result?.minimumHp??hero.hp)>=(job.startMaxHp??effectiveMaxHp(hero))*2/3)return n.safeMoneyBase+(job.claimLevel??hero.level)*n.safeMoneyLevel;if(hero.nationalityBonuses?.combatMoneyBase&&job.result?.alive&&(job.result.killed??0)>0)return hero.nationalityBonuses.combatMoneyBase+(job.claimLevel??hero.level)*hero.nationalityBonuses.combatMoneyLevel;if(isCombatRun(job)&&!job.result.alive)return 0;const hasReward=job.kind==='rest'?job.healing>0&&hero.hp<effectiveMaxHp(hero):(job.result.xp??0)>0||(job.result.money??0)>0||Object.values(job.result.loot).some(q=>q>0);return hasReward?nationalityMoneyBonus(hero,job.result?.money??0):0;}
export function claimBonus(hero,job){if((hero.perk!=='greedy'&&!hasLevelPerk(hero,'greedy'))||!job)return 0;let level=hero.level,hasReward=false;
 if(job.kind==='series'){if(job.worker.dead)return 0;level=job.worker.level;hasReward=job.xp>0||job.money>0||Object.values(job.loot).some(q=>q>0)||job.location==='rest'&&job.completed>0;}
 else if(job.kind==='rest')hasReward=job.healing>0&&hero.hp<effectiveMaxHp(hero);
 else {const e=job.result;if(isCombatRun(job)&&!e.alive)return 0;hasReward=(e.xp??0)>0||(e.money??0)>0||Object.values(e.loot).some(q=>q>0);const preview=clone(hero);levelUp(preview,e.xp??0);level=preview.level;}
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
 if(production.level>=MAX_PRODUCTION_LEVEL){production.level=MAX_PRODUCTION_LEVEL;production.xp=0;}
}
function addHistory(s,text,now){s.history.unshift({at:now,text});s.history=s.history.slice(0,50);}
export const countItem=(s,item)=>s.inventory.filter(x=>x.item===item).reduce((n,x)=>n+x.qty,0);
function addToInventory(inventory,item,qty,details={}){if(qty<=0)return;if(ITEMS[item].stack){const row=inventory.find(x=>x.item===item&&itemRarityRank(x)===itemRarityRank({...details,item}));if(row)row.qty+=qty;else inventory.push({...clone(details),uid:details.uid??uid(),item,qty});}else for(let i=0;i<qty;i++)inventory.push({...clone(details),uid:details.uid??uid(),item,qty:1});}
export const inventoryCapacity=s=>CAPACITY+(s.inventorySlotsBought??0)+(hasBuilding(s,'housing')?4:0);
export function inventorySlotCost(state){
 const bought=state.inventorySlotsBought??0;
 if(bought<5)return Math.max(5,bought*10)*10;
 const k=bought-4;
 return (40+10*k+3*k*k)*10;
}
export const shelfCost=s=>20*(s.shelves.length-STARTING_SHELVES+1)*10;
export function canReceive(s,entries){const inventory=clone(s.inventory);for(const e of entries)if(e.item!=='gasMaskFilter')addToInventory(inventory,e.item,e.qty,e);return inventory.length<=Math.max(inventoryCapacity(s),s.inventory.length);}
function receive(s,entries){requireThat(canReceive(s,entries),'В инвентаре не хватает места. Освободи ячейки и вернись за результатом.');for(const e of entries)if(e.item==='gasMaskFilter')s.filters=(s.filters??0)+e.qty;else addToInventory(s.inventory,e.item,e.qty,e);}
export function maxCraftQuantity(s,recipeId){const r=RECIPES[recipeId],p=r&&s.productions[r.production];if(!r?.batch||r.upgrade||!p||p.job||p.level<r.level)return 0;return Math.max(0,Math.min(1000,r.cost>0?Math.floor(s.money/r.cost):1000,...Object.entries(r.ingredients).map(([item,n])=>Math.floor(countItem(s,item)/n))));}
function removeItem(s,item,qty,craftMode=null){
 requireThat(Number.isInteger(qty)&&qty>0,'Неверное количество.');
 const rows=s.inventory.filter(row=>row.item===item&&(craftMode!=='auto'||itemQuality(row)===0)),consumed=[];
 requireThat(rows.reduce((total,row)=>total+row.qty,0)>=qty,'Не хватает предметов.');
 if(craftMode==='manual')rows.sort((a,b)=>itemQuality(b)-itemQuality(a));
 let remaining=qty;
 for(const row of rows){
  const take=Math.min(remaining,row.qty);
  if(craftMode)consumed.push({...row,qty:take});
  row.qty-=take;
  remaining-=take;
  if(!remaining)break;
 }
 s.inventory=s.inventory.filter(row=>row.qty>0);
 return consumed;
}
function removeRow(s,id,qty=1){const row=s.inventory.find(x=>x.uid===id);requireThat(row&&Number.isInteger(qty)&&qty>0&&row.qty>=qty,'Предмета уже нет или не хватает количества.');row.qty-=qty;s.inventory=s.inventory.filter(x=>x.qty>0);}
const pay=(s,cost)=>{requireThat(s.money>=cost,'Не хватает патронов.');s.money-=cost;s.totalSpent+=cost;};
function idleHero(s,allowRest=false){requireThat(s.hero,'Сначала найми сталкера.');requireThat(!s.hero.dead,'Сначала восстанови сталкера.');requireThat(!s.hero.job||allowRest&&s.hero.job.kind==='rest','Сталкер занят. Сначала получи результат.');return s.hero;}
export const radiationBlocksMissions=hero=>100*(hero.mark==='regeneration'?20:10)*(hero.radiation??0)>=95*hero.maxHp;
export const effectiveMaxHp=hero=>Math.max(1,hero.maxHp-(hero.mark==='regeneration'?20:10)*(hero.radiation??0));
export function jobRadiation(job){
 if(job?.kind==='series')return (job.reports??[]).reduce((total,run)=>total+(run.result?.radiation??0),0);
 return job?.result?.radiation??0;
}
export function interactiveMissionReady(id='zilRoute'){const mission=INTERACTIVE_MISSIONS[id];return Boolean(mission?.entry&&mission.nodes[mission.entry]&&mission.nodes[mission.entry].playable!==false);}
export const isCombatJob=kind=>kind==='mission'||kind==='patrol'||kind==='technopark'||kind==='caravan'||kind==='surface'||kind==='zilTunnels'||kind==='surfaceShops';
export function heroAttributes(hero){const p=PROFESSIONS[hero.profession??'saboteur'];return Object.fromEntries(['strength','agility','intelligence','perception'].map(key=>[key,Math.max(0,Math.min(10,p[key]+(hero.rebirthAttributes?.[key]??0)+(hero.nationalityBonuses?.attributes?.[key]??0)+Number(hero.hobby?.option===key)+(hero.levelPerks??[]).filter(({perk})=>LEVEL_PERKS[perk]?.attributeBonus===key).length)-(hero.temporaryAttributeLoss?.[key]??0))]));}
export function needsAdventureRecovery(hero){return Boolean(hero?.needsAdventureRest||Object.values(hero?.temporaryAttributeLoss??{}).some(value=>value>0));}
export function heroEffectiveStrength(hero){const base=heroAttributes({...hero,temporaryAttributeLoss:{...hero.temporaryAttributeLoss,strength:0}}).strength;return Math.max(0,base+(hero.leaderKebabRuns>0?2:0)-(hero.temporaryAttributeLoss?.strength??0));}
function restoreAdventureAttributes(hero){hero.temporaryAttributeLoss={};hero.needsAdventureRest=false;hero.maxHp=heroMaximumHp(hero);hero.hp=Math.min(hero.hp,effectiveMaxHp(hero));}
export function consumableLimit(hero){return Math.max(0,1+2*heroAttributes(hero).strength+(hero.nationalityBonuses?.supplyLimit??0));}
export function bestSuppliesPlan(state,hero=state.hero,category=null){
 if(!hero)return [];
 const plan=[],limit=consumableLimit(hero);
 const groups=[
  [['medicKit','medicKits'],['dressingKit','dressingKits'],['bandage','bandages']],
  [['molotov','molotovs'],['pipeGrenade','grenades'],['tinGrenade','tinGrenades']].sort((a,b)=>{const power=id=>(ITEMS[id].min+ITEMS[id].max)*(id==='molotov'?2:1);return power(b[0])-power(a[0])||(ITEMS[b[0]].value??0)-(ITEMS[a[0]].value??0);})
 ];
 for(const [index,group] of groups.entries()){
  if(category&&category!==(index===0?'medicine':'grenades'))continue;
  let free=Math.max(0,limit-group.reduce((sum,[,key])=>sum+(hero[key]??0),0));
  for(const [item] of group){
   const qty=Math.min(free,countItem(state,item));
   if(qty>0){plan.push({item,qty});free-=qty;}
  }
 }
 return plan;
}
export function perkSchedule(hero,limit=Number.isFinite(heroLevelCap(hero))?heroLevelCap(hero):hero.level+20){
 const intelligence=heroAttributes(hero).intelligence;
 if(intelligence>=10)return Array.from({length:Math.max(0,limit-1)},(_,i)=>i+2);
 const pattern=(LEVEL_PERK_SCHEDULES[intelligence]??[]).filter(level=>level<=20),levels=[];
 for(let offset=0;offset<limit;offset+=20)for(const level of pattern)if(level+offset<=limit)levels.push(level+offset);
 return levels;
}
export function earnedPerkLevels(hero){return perkSchedule(hero,hero.level);}
export function availablePerkLevels(hero){const chosen=new Set((hero.levelPerks??[]).map(p=>p.level));return [...earnedPerkLevels(hero).filter(level=>!chosen.has(level)),...Array(hero.extraPerkChoices??0).fill(null)];}
export function levelPerkOptions(hero){return Object.entries(LEVEL_PERKS).filter(([id,p])=>(p.profession==='all'||p.profession===(hero.profession??'saboteur'))&&!p.legacy&&(!p.hobby||(hero.hobby?.id===p.hobby&&!(hero.levelPerks??[]).some(entry=>LEVEL_PERKS[entry.perk]?.hobby&&entry.pickedAtLevel===hero.level)))&&hero.level>=p.minLevel&&hero.level<=(p.maxPickLevel??Infinity)&&(!p.rewardRole||(hero.rewardPerkUnlocks??[]).includes(id))&&id!==(hero.startPerk??hero.perk)&&(p.repeatable||!(hero.levelPerks??[]).some(x=>x.perk===id))).map(([id,p])=>({id,...p}));}
const levelPerkHpBonus=h=>(h.levelPerks??[]).reduce((hp,{perk})=>hp+(perk==='enduring'?30:(LEVEL_PERKS[perk]?.hpBonus??0)+(LEVEL_PERKS[perk]?.maxHpBonus??0)),0);
export const hasAutoStimulator=row=>Boolean(row?.upgrades?.some(upgrade=>RECIPES[upgrade.recipe]?.autoHeal));
export function heroConfig(s,hero=s.hero,location=hero?.job?.location??hero?.job?.kind??null){const h={...hero};for(const slot of ['weapon','rangedWeapon','body','accessory'])if(h[slot]&&!canUseEquipment(h,{...h[slot+'Details'],item:h[slot]})){h[slot]=null;h[slot+'Details']=null;}const p=PROFESSIONS[h.profession??'saboteur'],base=clone(CONFIG);Object.assign(base.hero,heroAttributes(h),{strength:heroEffectiveStrength(h),initiative:heroAttributes(h).agility,accuracy:5*rebirthStars(h)+(p.accuracy??0)+1.25*Math.max(0,(h.level??1)-1)+(h.nationalityBonuses?.accuracy??0)+(h.activeStimulant&&h.activeStimulant!=='cardioStimulator'?5*(h.nationalityBonuses?.stimulantPercent?1.5:1):0),pistolDamageBonus:h.nationalityBonuses?.pistolDamage??0,evasion:35+7.5*heroAttributes(h).agility+(p.evasionBonus??0)+5*rebirthStars(h)});let c=withStarterPerk(base,h.perk,h.level);for(const id of new Set((h.levelPerks??[]).map(x=>LEVEL_PERKS[x.perk]?.starterEffect).filter(Boolean))){if(id!==h.perk)c=withStarterPerk(c,id,h.level);}c.hero.perk=h.perk;for(const chosen of h.levelPerks??[]){const development=LEVEL_PERKS[chosen.perk];c.hero.evasion+=development?.evasionBonus??0;c.hero.physicalArmorBonus=(c.hero.physicalArmorBonus??0)+(development?.physicalArmorBonus??0);c.hero.thermalArmorBonus=(c.hero.thermalArmorBonus??0)+(development?.thermalArmorBonus??0);if(chosen.perk==='favorite-close'){c.hero.closeAccuracyBonus=(c.hero.closeAccuracyBonus??0)+5;c.hero.closeDamageBonus=(c.hero.closeDamageBonus??0)+5;}if(chosen.perk==='quick-reaction'){c.hero.initiative+=2;c.hero.evasion+=3;}if(chosen.perk==='samurai')c.hero.meleeDamageBonus=(c.hero.meleeDamageBonus??0)+4*Math.max(0,h.level-chosen.pickedAtLevel+1);
 if(chosen.perk==='hunter-correction'){c.hero.correctionStep=3;c.hero.correctionMax=15;}if(chosen.perk==='hunter-falcon-eye')c.hero.perceptionReroll=true;if(chosen.perk==='hunter-distance'){c.hero.initialPerceptionBonus=2;c.hero.maxStartingDistance=4;}
 if(chosen.perk==='bandit-alert'){c.hero.evasion+=4*c.hero.perception;c.hero.earMeleeAccuracy=4*c.hero.perception;}if(chosen.perk==='bandit-mark')c.hero.firstEnemyFocus=true;if(chosen.perk==='bandit-seasoned')c.hero.halveHeavyHit=true;if(chosen.perk==='bandit-rampage'){c.hero.desperation=true;c.hero.lowHealthEvasionBonus=5;}
 if(chosen.perk==='assault-accurate')c.hero.accuracy+=5;
 if(chosen.perk==='assault-reaction'){c.hero.initiative+=2;c.hero.evasion+=4;}
 if(chosen.perk==='assault-burst')c.hero.burstAccuracyBonus=10;
 if(chosen.perk==='engineer-shooter')c.hero.rangedAccuracyBonus=5;
 if(chosen.perk==='engineer-armorer')c.hero.physicalArmorBonus=(c.hero.physicalArmorBonus??0)+10;
}
Object.assign(c.hero,{nationality:clone(h.nationalityBonuses??{}),medicineBonus:h.nationalityBonuses?.medicineBonus??0});c.hero.initiative+=h.nationalityBonuses?.initiative??0;c.hero.evasion+=h.nationalityBonuses?.evasion??0;c.hero.accuracy+=h.hobby?.option==='accuracy'?5:0;c.hero.accuracy-=ITEMS[h.body]?.accuracyPenalty??0;c.hero.maxHp=effectiveMaxHp(h);c.hero.currentHp=h.hp;c.hero.evasionBonusCap=ITEMS[h.body]?.evasionBonusCap;c.hero.ricochet=itemRicochet({item:h.body,...h.bodyDetails});c.hero.autoStimulator=Boolean(h.body&&hasAutoStimulator(h.bodyDetails));c.hero.missionTimePenaltyPercent=ITEMS[h.body]?.missionTimePenaltyPercent??0;c.hero.regeneration=h.mark==='regeneration'?3:0;c.hero.darkGrasp=h.mark==='darkGrasp';c.hero.firstHitArmor=h.body?firstHitArmor(h.bodyDetails):0;c.hero.armor=(h.body?itemArmor({...h.bodyDetails,item:h.body}):0)+(c.hero.physicalArmorBonus??0);c.hero.thorns=itemThorns(h.bodyDetails);c.hero.thermalArmor=(h.body?itemThermalArmor({item:h.body,...h.bodyDetails}):0)+(c.hero.thermalArmorBonus??0);c.hero.radiationProtection=itemRadiationProtection({item:h.body,...h.bodyDetails})+itemRadiationProtection({item:h.accessory,...h.accessoryDetails});c.hero.armor+=h.nationalityBonuses?.armor??0;c.hero.thermalArmor+=(h.nationalityBonuses?.thermalArmor??0)+(h.hobby?.option==='thermal'?10:0);c.hero.radiationProtection+=(h.nationalityBonuses?.radiationProtection??0)+(h.levelPerks??[]).reduce((sum,choice)=>sum+(LEVEL_PERKS[choice.perk]?.radiationProtectionBonus??0),0);c.hero.meleeAccuracyBonus=(ITEMS[h.body]?.meleeAccuracyBonus??0)+(h.nationalityBonuses?.meleeAccuracy??0)+(c.hero.earMeleeAccuracy??0);c.hero.meleeDamageBonus=(c.hero.meleeDamageBonus??0)+(h.nationalityBonuses?.meleeDamage??0);c.hero.rangedAccuracyBonus=(c.hero.rangedAccuracyBonus??0);c.hero.pistolDamageBonus=h.nationalityBonuses?.pistolDamage??0;const weapon=ITEMS[h.weapon];const spec=(item,details,familiarity=0)=>{
 if(!item)return null;
 const {combat,weaponClass,min,max,piercing,maxDistance,strengthMultiplier,damageType,distancePenalty,shots,damageRolls,shotPenalty,jamChance,usesHeavyAmmo,reloadMain,reloadEverySlot,bayonet,closeAccuracyBonus}=ITEMS[item];
 const upgrades=details?.upgrades??[];
 const bonuses=(type,range)=>upgrades.filter(u=>!bayonet||(RECIPES[u.recipe]?.target??'melee')===type)
  .reduce((out,u)=>({
   min:out.min+(u.minBonus??0),max:out.max+(u.maxBonus??0),
   bonus:out.bonus+(u.bonus??0),accuracyBonus:out.accuracyBonus+(u.accuracyBonus??0)
  }),{min:range.min+10*itemQuality(details),max:range.max+10*itemQuality(details),bonus:familiarity,accuracyBonus:(ITEMS[item].accuracyBonus??0)+4*itemQuality(details)});
 return {origin:details?.origin??'unknown',item,name:itemName({item,...details}),type:combat,weaponClass,piercing,maxDistance,strengthMultiplier,damageType,distancePenalty,shots,damageRolls,shotPenalty,jamChance,usesHeavyAmmo,reloadMain,reloadEverySlot,closeAccuracyBonus,blocksAimedShots:upgrades.some(u=>u.blocksAimedShots||RECIPES[u.recipe]?.blocksAimedShots),...bonuses(combat,{min,max}),
  bayonet:bayonet?{item,type:'melee',isBayonet:true,...bonuses('melee',bayonet)}:null};
};c.hero.heavyAmmo=h.heavyAmmo??0;c.hero.weapons={main:spec(h.weapon,h.weaponDetails,h.weaponFamiliarity??0),ranged:spec(h.rangedWeapon,h.rangedWeaponDetails,h.rangedWeaponFamiliarity??0)};if(heroHasDualWield(h)&&c.hero.weapons.ranged?.type==='melee'){c.hero.dualWield=true;c.hero.dualWieldAccuracyPenalty=10;c.hero.weapons.ranged.noStrength=true;}c.hero.weaponType=weapon?.combat??'melee';c.hero.weaponMin=weapon?.min??10;c.hero.weaponMax=weapon?.max??30;c.hero.weaponBonus=(h.weaponDetails?.upgrades??[]).reduce((sum,u)=>sum+(u.bonus??0),0);if(h.wounds>0){c.hero.accuracy-=10; // Separate percentile penalty is not stacked until rules are clarified.
 c.hero.checkPenalty=2;c.hero.initiative-=2;
 }if(location){const n=h.nationalityBonuses??{},checks=(location==='surface'||location==='surfaceShops')?n.surfaceChecks??0:n.undergroundChecks??0;c.hero.perceptionCheckBonus=(c.hero.perceptionCheckBonus??0)+checks;c.hero.stealthCheckBonus=(c.hero.stealthCheckBonus??0)+checks;}return c;}
export function stimulantEffects(item,quality=0,hero={}){
 const rank=itemQuality({quality});
 const scale=hero.nationalityBonuses?.stimulantPercent?1.5:1;
 return item==='cardioStimulator'
  ? {hp:0,hpPercent:(15+2*rank)*scale,accuracy:0}
  : {hp:(40+5*rank)*scale,hpPercent:0,accuracy:5*scale};
}
export function heroMaximumHp(h){const strength=heroAttributes(h).strength;const base=Math.max(1,((120+30*strength+(h.nationalityBonuses?.hp??0))+(h.level-1)*(10+10*strength/3+(h.nationalityBonuses?.hpPerLevel??0)))*(1+rebirthStars(h)*.1)+levelPerkHpBonus(h)+(PERKS[h.startPerk??h.perk]?.maxHpBonus??0)-(h.permanentHpLoss??0));const effect=h.activeStimulant?stimulantEffects(h.activeStimulant,h.stimulantQuality,h):{hp:0,hpPercent:0};return Math.max(1,((base+effect.hp)*(h.hobby?.option==='endurance'?1.1:1)+strengthHpBonus(h))*(1+effect.hpPercent/100));}
function levelUp(h,xp){const cap=heroLevelCap(h);h.xp+=xp;while(h.level<cap&&h.xp>=100*h.level){h.xp-=100*h.level;h.level++;gainFamiliarity(h);grantNationalityMilestones(h);h.maxHp=heroMaximumHp(h);}if(h.level>=cap)h.xp=0;}
export function locationOwner(state,kind){return getHeroes(state).find(hero=>hero.job&&(hero.job.kind==='series'?hero.job.location:hero.job.kind)===kind)??null;}
function requireLocationLevel(hero,kind,special=false){requireThat(!needsAdventureRecovery(hero),'После приключения герою нужен отдых для восстановления параметров.');requireThat(!radiationBlocksMissions(hero),'Сильное облучение. Сначала сними радиацию.');requireThat(!(isCombatJob(kind)||special)||PROFESSIONS[hero.profession??'saboteur'].combatReady,'Боевые параметры этой профессии ещё не заданы.');requireThat(hero.level>=(LOCATION_LEVELS[kind]??1),`${locationName(kind)}: требуется ${LOCATION_LEVELS[kind]??1}-й уровень героя.`);}
function requireFreeLocation(state,kind){const owner=locationOwner(state,kind);requireThat(!owner,`Локация занята: ${owner?.name??''}. Сначала получи результат.`);}
export const locationName=kind=>({mission:'Мусорные кучи',patrol:'Патрулирование тоннелей',technopark:'Исследовать Технопарк',caravan:'С караваном на Павелецкую',surface:'Рыскать в окрестностях станции',zilTunnels:ZIL_TUNNELS.name,surfaceShops:SURFACE_SHOPS.name,help:'Помогать на станции',rest:REST_OPTIONS.station.name}[kind]??'Задание');
export const HERO_MARKS={regeneration:{name:'Регенерация',description:'В начале своего хода в бою восстанавливает 3 HP. После успешного прохождения локации — полное здоровье до доступного максимума. Каждая единица облучения блокирует 20 HP.'},darkGrasp:{name:'Тёмная хватка',description:'В первый ход героя каждого боя после стартовой гранаты наносит выбранному противнику (20–80) × Восприятие термического урона. Уворот против сложности 14 уменьшает урон вдвое. Гранаты не расходуются.'}};
export const SPECIAL_LOCATIONS={
 help:{name:'Тревога! Нападение крыс!',chance:7,description:'Четыре проверки сложности 10. Каждый успех приводит к бою с бешеной крысой (70 HP, укус 30–40). Награды удваиваются, за каждую победу ещё 5 A и 5 опыта.'},
 mission:{name:'Поймай Крысиного короля!',chance:8,seconds:30,description:'Проверка Ловкости против 12. Король имеет 350 HP и кусает дважды за ход, по 40–120 урона. Если он ускользнёт, придётся отбиться от четырёх обычных крыс.'},
 patrol:{name:'Защита: стая упырей и вожак!',chance:6,seconds:40,description:'Сначала 1–3 упыря-разведчика, затем вожак с 450 HP. После первого попадания вожак ярится три своих хода, затем слабеет.'}
};
export const activeSpecialLocation=(state,kind)=>state.specialLocations?.[kind]?SPECIAL_LOCATIONS[kind]:null;
export const isCombatRun=run=>isCombatJob(run.kind)||Boolean(run.special);

function advanceSpecialLocations(state,now){
 let changed=false;
 for(const hero of getHeroes(state)){
  const job=hero.job,series=job?.kind==='series',kind=series?job.location:job?.kind;
  const special=SPECIAL_LOCATIONS[kind];
  if(!special)continue;
  if(series&&job.reports.some(run=>run.special)&&activeSpecialLocation(state,kind)){
   delete state.specialLocations[kind];
   changed=true;
  }
  if(!ready(job,now)||job.specialChecked)continue;
  job.specialChecked=true;
  changed=true;
  const runs=series?job.reports:[job];
  if(runs.some(run=>run?.special)){
   delete state.specialLocations?.[kind];
  }else if(runs.some(run=>Number.isInteger(run?.seed)&&rng(run.seed^0x9e3779b9).int(1,100)<=special.chance)){
   (state.specialLocations??={})[kind]=true;
  }
 }
 return changed;
}

function specialExpedition(kind,config,random,options){
 if(kind==='patrol'){
  const finalEnemy={...PATROL.enemy,name:'Упыриный вожак',hp:450,accuracy:20,damageMin:60,damageMax:140,attackName:'Когти',rage:true};
  const mission={...PATROL.mission,searches:0,fixedEncounters:random.int(1,3),finalEnemy,grenadePolicy:'first-and-final'};
  const result=expedition({...config,rat:PATROL.enemy,mission,loot:PATROL.loot},random,options);
  if(result.alive){
   result.xp+=50;
   result.money=300;
   result.loot.leather=random.int(1,2);
   for(const [item,chance] of [['toughLeather',50],['leaderKebab',10],['weaponUpgradePlan',10]]){
    if(random.int(1,100)<=chance)result.loot[item]=(result.loot[item]??0)+1;
   }
  }
  return result;
 }
 const mission={...config.mission,searches:0};
 if(kind==='help'){
  const help=stationHelp(config,random,10);
  const rat={...config.rat,name:'Бешеная крыса',hp:config.rat.hp-10,damageMin:config.rat.damageMin+10,damageMax:config.rat.damageMax+10};
  Object.assign(mission,{fixedEncounters:help.successes,baseXp:help.xp*2,findXp:0,killXp:5,lootXp:0,lootPerKill:true});
  const result=expedition({...config,rat,mission,loot:[]},random,options);
  result.events.unshift(...help.events.map(event=>event.type==='соколиный глаз'?event:({...event,type:'тревога'})));
  if(result.alive){
   result.loot=Object.fromEntries(Object.entries(help.loot).map(([id,qty])=>[id,qty*2]));
   result.money=help.money*2+50*result.killed;
  }
  return result;
 }
 const roll=random.int(1,20),bonus=config.hero.agility-(config.hero.checkPenalty??0),dc=12;
 const success=roll+bonus>dc;
 mission.fixedEncounters=success?1:4;
 const rat=success?{...config.rat,name:'Двухголовая крыса-мутант',hp:350,evasion:45,accuracy:15,stealth:1,agility:1,damageMin:40,damageMax:120,attacksPerTurn:2}:config.rat;
 if(success)Object.assign(mission,{baseXp:50,findXp:0,killXp:0,lootXp:0,lootPerKill:true});
 const result=expedition({...config,rat,mission,loot:success?[]:config.loot},random,options);
 result.events.unshift({type:'крысиный король',roll,bonus,dc,success});
 if(success&&result.alive){
  result.loot={tooth:2,metal:random.int(4,6)};
  result.money=200;
 }
 return result;
}
export const REST_OPTIONS = {
 station: {name:'Отдохнуть в кафе «Столовая»', seconds:15, cost:100, healing:hero=>nationalityHealing(hero,.2*hero.maxHp+10*heroAttributes(hero).strength)},
 stationFull: {name:'В столовой до полного восстановления',seconds:15,cost:100,healing:hero=>REST_OPTIONS.station.healing(hero)}
};
export function fullRestQuote(hero){
 const healing=REST_OPTIONS.station.healing(hero);
 const missing=Math.max(0,effectiveMaxHp(hero)-hero.hp);
 const cycles=Math.max(needsAdventureRecovery(hero)?1:0,Math.ceil(missing/healing));
 return {cycles,cost:cycles*REST_OPTIONS.station.cost,seconds:cycles*REST_OPTIONS.station.seconds,healing:missing};
}
function advanceFullRest(state,now){
 let changed=false;
 for(const hero of getHeroes(state)){
  const job=hero.job;
  if(job?.restType!=='stationFull'||job.fullRestDone)continue;
  while(now>=job.cycleEndsAt&&!job.fullRestDone){
   changed=true;
   const missing=Math.max(0,effectiveMaxHp(hero)-hero.hp-job.healing);
   job.healing+=Math.min(missing,job.cycleHealing);
   job.completedCycles++;
   if(hero.hp+job.healing>=effectiveMaxHp(hero)-1e-9||state.money<REST_OPTIONS.station.cost){
    job.fullRestDone=true;
    job.endsAt=job.cycleEndsAt;
    job.reason=hero.hp+job.healing>=effectiveMaxHp(hero)-1e-9?'Здоровье восстановлено полностью':'Не хватает A на следующий отдых';
   }else{
    pay(state,REST_OPTIONS.station.cost);
    job.paid+=REST_OPTIONS.station.cost;
    job.cycleStartedAt=job.cycleEndsAt;
    job.cycleEndsAt+=REST_OPTIONS.station.seconds*1000;
   }
  }
 }
 return changed;
}
function spendStrengthBonus(hero){
 if(hero.leaderKebabRuns>0&&--hero.leaderKebabRuns===0){hero.maxHp=heroMaximumHp(hero);hero.hp=Math.min(hero.hp,effectiveMaxHp(hero));}
}
function locationXpPenalty(heroLevel,kind){return Math.min(100,10*Math.max(0,heroLevel-(LOCATION_LEVELS[kind]??1)-2));}
export function locationExperience(xp,heroLevel,kind){return Math.max(1,roundRatio(xp,100-locationXpPenalty(heroLevel,kind)));}
function makeRun(s,hero,kind,at,seed,allowSpecial=true){
 startStimulant(hero,kind);const config=heroConfig(s,hero,kind),run=createRun(s,hero,kind,at,seed,allowSpecial,config);
 if(ITEMS[hero.rangedWeapon]?.usesHeavyAmmo&&run.result){
  run.result.heavyAmmoRemaining=config.hero.heavyAmmo;
  run.result.heavyAmmoSpent=(hero.heavyAmmo??0)-config.hero.heavyAmmo;
 }run.claimLevel=hero.level;run.startMaxHp=effectiveMaxHp(hero);if(run.result)run.result.minimumHp=Math.min(hero.hp,run.result.hp??hero.hp,run.result.minimumHp??Infinity,...(run.result.battles??[]).map(b=>b.minimumHp??b.hp));if(hero.activeStimulant)run.stimulant=true;if(run.result?.alive!==false&&run.result){const n=hero.nationalityBonuses??{};if((run.result.money??0)>0){const combat=(run.result.battles?.length??0)>0;run.result.money=roundRatio(run.result.money,100+(n.questMoneyPercent<0?n.questMoneyPercent:0)+(combat?0:n.noncombatMoneyPercent??0));}}
 if(run.result&&run.result.alive!==false){
  if(hero.mark==='regeneration'){
   const before=run.result.hp??hero.hp;run.result.hp=effectiveMaxHp({...hero,radiation:(hero.radiation??0)+(run.result.radiation??0)});
   (run.result.events??=[]).push({type:'восстановление метки',healing:Math.max(0,run.result.hp-before),hp:run.result.hp});
  }
  run.result.xpBeforePenalty=run.result.xp;
  run.result.xpPenalty=locationXpPenalty(hero.level,kind);
  run.result.rebirthXpPenalty=rebirthXpPenalty(hero);
  run.result.xp=heroExperience(hero,locationExperience(run.result.xp,hero.level,kind));
 }
 return run;
}
function createRun(s,hero,kind,at,seed,allowSpecial,baseConfig){
 if(kind==='surface'){
  requireThat([SURFACE.baseXp,SURFACE.dogXp,SURFACE.guardXp].every(Number.isFinite),'Нужно уточнить опыт и награды локации.');
  requireThat(s.filters>=1,'Для выхода на поверхность нужен один фильтр.');
  s.filters--;
  const config=baseConfig;
  const result=surfaceExpedition(config,rng(seed),{hp:hero.hp,bandages:hero.bandages,dressingKits:hero.dressingKits,medicKits:hero.medicKits,grenades:hero.grenades,molotovs:hero.molotovs,tinGrenades:hero.tinGrenades});
  const seconds=missionDuration(hero,SURFACE.seconds*1000)/1000;
  return {kind,seed,startedAt:at,endsAt:at+Math.round(seconds*1000),result};
 }
 const duration=ms=>missionDuration(hero,ms);
 if(kind==='surfaceShops'){
  requireThat(s.completedLocations[SURFACE_SHOPS.unlockedBy],'Сначала успешно осмотри окрестности станции.');
  requireThat(s.filters>=SURFACE_SHOPS.filtersPerHero,'Для выхода к магазинам нужны 2 фильтра.');
  s.filters-=SURFACE_SHOPS.filtersPerHero;
  const result=surfaceExpedition(baseConfig,rng(seed),{
   hp:hero.hp,bandages:hero.bandages,dressingKits:hero.dressingKits,medicKits:hero.medicKits,
   grenades:hero.grenades,molotovs:hero.molotovs,tinGrenades:hero.tinGrenades
  },SURFACE_SHOPS);
  return {kind,seed,startedAt:at,endsAt:at+duration(SURFACE_SHOPS.seconds*1000),result};
 }
 if(kind==='zilTunnels'){
  requireThat(s.completedLocations[ZIL_TUNNELS.unlockedBy],'Сначала заверши вылазку «Открыть путь на ЗИЛ».');
  requireThat(s.filters>=ZIL_TUNNELS.filtersPerHero,'Для выхода в тоннели ЗИЛ нужны 2 фильтра.');
  s.filters-=ZIL_TUNNELS.filtersPerHero;
  const result=zilTunnelsExpedition(baseConfig,rng(seed),{
   hp:hero.hp,bandages:hero.bandages,dressingKits:hero.dressingKits,medicKits:hero.medicKits,
   grenades:hero.grenades,molotovs:hero.molotovs,tinGrenades:hero.tinGrenades,trace:true
  });
  return {kind,seed,startedAt:at,endsAt:at+duration(ZIL_TUNNELS.seconds*1000),result};
 }
 if(allowSpecial&&activeSpecialLocation(s,kind)){
  const options={hp:hero.hp,bandages:hero.bandages,dressingKits:hero.dressingKits,medicKits:hero.medicKits,grenades:hero.grenades,molotovs:hero.molotovs,tinGrenades:hero.tinGrenades,trace:true};
  const seconds=SPECIAL_LOCATIONS[kind].seconds??(kind==='patrol'?PATROL.mission.seconds:kind==='help'?10:7);
  const random=rng(seed),result=specialExpedition(kind,baseConfig,random,options);
  if(kind==='mission'&&result.alive&&result.events.some(event=>event.type==='крысиный король'&&event.success)&&!s.darkCrystalDropped&&random.int(1,100)<=50){
   result.loot.darkCrystal=1;s.darkCrystalDropped=true;
  }
  return {kind,special:true,seed,startedAt:at,endsAt:at+duration(seconds*1000),result};
 }
 if(kind==='caravan'){
  const config={...baseConfig,rat:CARAVAN.enemy,mission:CARAVAN.mission,loot:CARAVAN.loot};
  const caravan={...CARAVAN.escort,maxHp:CARAVAN.escort.hp};
  const result=expedition(config,rng(seed),{hp:hero.hp,bandages:hero.bandages,dressingKits:hero.dressingKits,medicKits:hero.medicKits,grenades:hero.grenades,molotovs:hero.molotovs,tinGrenades:hero.tinGrenades,trace:true,caravan});
  return {kind,seed,startedAt:at,endsAt:at+duration(CARAVAN.seconds*1000),result};
 }
 if(kind==='technopark'){
  const config={...baseConfig,rat:TECHNOPARK.enemy,mission:TECHNOPARK.mission,loot:TECHNOPARK.loot};
  const random=rng(seed),locationRadiation=random.int(TECHNOPARK.radiation.min,TECHNOPARK.radiation.max);
  const result=expedition(config,random,{hp:hero.hp,bandages:hero.bandages,dressingKits:hero.dressingKits,medicKits:hero.medicKits,grenades:hero.grenades,molotovs:hero.molotovs,tinGrenades:hero.tinGrenades,trace:true});
  result.locationRadiation=locationRadiation;
  result.radiation=result.alive?Math.max(0,locationRadiation-config.hero.radiationProtection):0;
  result.events.unshift({type:'радиация локации',level:locationRadiation,protection:config.hero.radiationProtection,received:result.radiation});
  return {kind,seed,startedAt:at,endsAt:at+duration(TECHNOPARK.seconds*1000),result};
 }
 if(kind==='patrol'){requireThat(patrolReady(),'Характеристики упыря-разведчика ещё уточняются.');const config=baseConfig;config.rat=clone(PATROL.enemy);config.mission=clone(PATROL.mission);config.loot=clone(PATROL.loot);return {kind,seed,startedAt:at,endsAt:at+duration(PATROL.mission.seconds*1000),result:expedition(config,rng(seed),{hp:hero.hp,bandages:hero.bandages,dressingKits:hero.dressingKits,medicKits:hero.medicKits,grenades:hero.grenades,molotovs:hero.molotovs,tinGrenades:hero.tinGrenades,trace:true})};}
 if(kind==='mission')return {kind,seed,startedAt:at,endsAt:at+duration(CONFIG.mission.seconds*1000),result:expedition(baseConfig,rng(seed),{hp:hero.hp,bandages:hero.bandages,dressingKits:hero.dressingKits,medicKits:hero.medicKits,grenades:hero.grenades,molotovs:hero.molotovs,tinGrenades:hero.tinGrenades,trace:true})};
 if(kind==='help')return {kind,seed,startedAt:at,endsAt:at+duration(10000),result:stationHelp(heroConfig(s,hero,kind),rng(seed))};
 requireThat(kind==='rest','Нет такой локации.');requireThat(hero.hp<effectiveMaxHp(hero),'Здоровье уже полное.');pay(s,100);return {kind,startedAt:at,endsAt:at+30000,healing:.2*hero.maxHp+10*heroConfig(s,hero,kind).hero.strength};
}
function settleHeavyAmmo(state,hero,result,now){
 if(result?.heavyAmmoRemaining==null||hero.dead)return null;
 hero.heavyAmmo=result.heavyAmmoRemaining;
 const missing=Math.max(0,(hero.heavyAmmoTarget??0)-hero.heavyAmmo);
 const spent=result.heavyAmmoSpent??0,weapon=ITEMS[hero.rangedWeapon];
 if(!weapon?.usesHeavyAmmo||(!spent&&(!hero.autoHeavyReload||!missing)))return null;
 const report={weapon:weapon.name,spent,loaded:0,failed:false};
 if(hero.autoHeavyReload&&missing){
  if(state.money<missing*10)report.failed=true;
  else{
   pay(state,missing*10);
   hero.heavyAmmo+=missing;
   report.loaded=missing;
  }
 }
 addHistory(state,weapon.name+' · потрачено '+spent+' · перезаряжено '+report.loaded+(report.failed?' · не хватило А':''),now);
 return report;
}
function stopSeries(job,reason){job.phase='done';job.reason=reason;}
function finishReadyRests(state,now){let changed=false;for(const hero of getHeroes(state)){const job=hero.job;if(job?.kind!=='rest'||!ready(job,now))continue;const before=hero.hp,bonus=claimBonus(hero,job)+nationalityClaimBonus(hero,job),completed=job.restoresAdventureAttributes??(job.restType==='stationFull'?(job.completedCycles??0)>0:now>=job.endsAt),full=job.restType==='stationFull'&&hero.hp+job.healing>=effectiveMaxHp(hero)-1e-9;if(completed&&needsAdventureRecovery(hero))restoreAdventureAttributes(hero);hero.hp=full&&completed?effectiveMaxHp(hero):Math.min(effectiveMaxHp(hero),hero.hp+job.healing);state.money+=bonus;hero.lastRest={finishedAt:now,healed:Math.max(0,hero.hp-before),hp:hero.hp};hero.job=null;changed=true;}return changed;}
export function advanceSeries(state,now=Date.now()){
 let changed=advanceFullRest(state,now);changed=finishReadyRests(state,now)||changed;
 for(const hero of getHeroes(state)){
  const job=hero.job;if(job?.kind!=='series'||job.phase==='done')continue;
  // At most five runs and four pauses, including when returning after a long absence.
  while(job.phase!=='done'&&now>=job.endsAt){changed=true;const at=job.endsAt,worker=job.worker;
   if(job.phase==='break'){
    if(state.filters<(job.location==='surfaceShops'?SURFACE_SHOPS.filtersPerHero:job.location==='zilTunnels'?ZIL_TUNNELS.filtersPerHero:job.location==='surface'?1:0)){stopSeries(job,'Не хватает фильтров для следующего выхода');break;}
    if(job.location==='rest'&&(worker.hp>=effectiveMaxHp(worker)||state.money<100)){stopSeries(job,worker.hp>=effectiveMaxHp(worker)?'Здоровье полное':'Не хватает A на отдых');break;}
    job.run=makeRun(state,worker,job.location,at,job.seeds[job.completed],false);job.phase='running';job.startedAt=at;job.endsAt=job.run.endsAt;continue;
   }
   const run=job.run,e=run.result;job.completed++;const report=clone(run);job.reports.push(report);
   if(run.kind!=='rest')spendStrengthBonus(worker);
   if(isCombatRun(run)&&!e.alive){for(const key of ['level','xp','maxHp','extraPerkChoices','nationalityPerkMilestones','weaponFamiliarity','rangedWeaponFamiliarity'])worker[key]=clone(job.initial[key]??(key==='nationalityPerkMilestones'?{}:0));finishStimulant(worker,run);worker.maxHp=heroMaximumHp(worker);worker.stimulants=0;worker.dead=true;worker.hp=0;worker.bandages=0;worker.dressingKits=0;worker.medicKits=0;worker.grenades=0;worker.molotovs=0;worker.tinGrenades=0;job.loot={};job.money=0;job.filters=0;job.nationalityBonus=0;job.xp=0;stopSeries(job,'Герой погиб. Весь результат серии потерян');break;}
   if(run.kind==='rest')worker.hp=Math.min(effectiveMaxHp(worker),worker.hp+run.healing);
   else{
    for(const [item,qty]of Object.entries(e.loot))job.loot[item]=(job.loot[item]??0)+qty;
    job.money+=e.money??0;job.filters=(job.filters??0)+(e.filters??0);job.xp+=e.xp;levelUp(worker,e.xp);if(worker.wounds>0)worker.wounds--;
    if(isCombatRun(run)){worker.hp=e.hp;worker.bandages=e.bandagesRemaining;worker.dressingKits=e.dressingKitsRemaining??0;worker.medicKits=e.medicKitsRemaining??0;worker.grenades=e.grenadesRemaining??0;worker.molotovs=e.molotovsRemaining??0;worker.tinGrenades=e.tinGrenadesRemaining??0;}
   }
   const nationalBonus=nationalityClaimBonus(worker,run);job.nationalityBonus=(job.nationalityBonus??0)+nationalBonus;job.money+=nationalBonus;
   if(e.heavyAmmoRemaining!=null)worker.heavyAmmo=e.heavyAmmoRemaining;
   finishStimulant(worker,run);if(worker.mark==='regeneration')worker.hp=effectiveMaxHp(worker);if(run.kind!=='rest')report.medicTentHealing=healAtMedicTent(state,worker,at);if(job.completed>=job.total)stopSeries(job,'Все прохождения завершены');
   else if(worker.hp/effectiveMaxHp(worker)<job.threshold/100&&job.location!=='rest')stopSeries(job,`Здоровье ниже ${job.threshold}%`);
   else if(job.location==='rest'&&worker.hp>=effectiveMaxHp(worker))stopSeries(job,'Здоровье полное');
   else {job.phase='break';job.startedAt=at;job.endsAt=at+3000;}
  }
 }
 return advanceSpecialLocations(state,now)||changed;
}
export function grenadeSummary(job){
 const total={used:0,damage:0};
 const walk=events=>{for(const e of events??[]){if(e.type==='граната')total.used++;if(e.type==='граната'||e.type==='огонь Молотова')for(const target of e.targets??[])if(target.target!=='герой')total.damage+=target.damage??0;if(e.events)walk(e.events);}};
 for(const run of job?.kind==='series'?job.reports??[]:[job]){if(!run?.result)continue;const result=run.result;if(Array.isArray(result.battles))for(const b of result.battles)walk(b.events);else walk(result.events);}
 return total;
}
export function reportTurnCount(run){if(!isCombatRun(run))return 0;const battles=run.result?.battles;return Array.isArray(battles)&&battles.every(b=>Number.isInteger(b.turns))?battles.reduce((sum,b)=>sum+b.turns,0):null;}
export function seriesTurnCount(job){const counts=(job.reports??[]).map(reportTurnCount);return counts.some(n=>n===null)?null:counts.reduce((sum,n)=>sum+n,0);}
export function ready(job,now=Date.now()){return Boolean(job&&(job.kind==='series'?job.phase==='done':now>=job.endsAt));}
function startCraftRun(s,recipeId,qty,now,random,mode='manual'){
 const recipe=RECIPES[recipeId];
 const equipment=['weapon','body','accessory'].includes(ITEMS[recipe.output]?.type);
 const stimulant=ITEMS[recipe.output]?.type==='stimulant';
 const inherited=Array(qty).fill(0);
 let rarityRank=itemRarityRank({item:recipe.output});
 pay(s,recipe.cost*qty);
 for(const [item,count] of Object.entries(recipe.ingredients)){
  const consumed=removeItem(s,item,count*qty,mode);
  const gearIngredient=['weapon','body','accessory'].includes(ITEMS[item]?.type);
  let unit=0;
  for(const row of consumed){
   rarityRank=Math.max(rarityRank,itemRarityRank(row));
   if(!equipment||!gearIngredient)continue;
   for(let n=0;n<row.qty;n++,unit++){
    const index=Math.floor(unit/count);
    inherited[index]=Math.max(inherited[index],itemQuality(row));
   }
  }
 }
 const job={recipe:recipeId,productionLevel:s.productions[recipe.production].level,qty,startedAt:now,endsAt:now+recipe.seconds*qty*1000};
 if(recipe.chance!=null){
  const chance=upgradeChance(s,recipeId);
  let successes=0;
  for(let attempt=0;attempt<qty;attempt++)if(Math.floor(random()*100)+1<=chance)successes++;
  Object.assign(job,{chance,successes});
 }
 const qualityPercent=recipeQualityChance(s,recipeId);
 const successes=job.successes??qty;
 job.qualityChance=qualityPercent;
 job.qualitySuccesses=0;
 job.rolledQualityUnits=0;
 job.outputs=[];
 for(let i=0;i<successes;i++){
  const rolledQuality=rollQuality(qualityPercent,random);
  if(rolledQuality>inherited[i]){
   job.qualitySuccesses++;
   job.rolledQualityUnits+=rolledQuality;
  }
  const quality=Math.max(rolledQuality,inherited[i]);
  const item={origin:'crafted',rarity:RARITIES[rarityRank],item:recipe.output,qty:equipment||stimulant?1:(recipe.outputQty??1)+quality,...((equipment||stimulant)&&quality?{quality}:{}),...(equipment&&recipe.level>=6?{requiredHeroLevel:5*Math.floor((recipe.level-1)/5)}:{})};
  const group=job.outputs.find(row=>itemQuality(row)===itemQuality(item));
  if(group)group.qty+=item.qty;else job.outputs.push(item);
 }
 return job;
}
export function autoRecipeAvailable(s,id){
 const r=Object.hasOwn(RECIPES,id)?RECIPES[id]:null;
 return Boolean(r&&!r.batch&&!r.upgrade&&!r.legacy&&ITEMS[r.output]&&r.output!=='gasMaskFilter'&&(r.outputQty??1)===1&&s.productions[r.production].level>=r.level&&!isRecipeSuperseded(s,id));
}
export function maxAutoQuantity(s,id){
 if(!autoRecipeAvailable(s,id))return 0;
 const r=RECIPES[id];
 return Math.max(0,Math.min(r.cost?Math.floor(s.money/r.cost):Infinity,...Object.entries(r.ingredients).map(([item,qty])=>Math.floor(s.inventory.reduce((total,row)=>total+(row.item===item&&itemQuality(row)===0?row.qty:0),0)/qty))));
}
export const autoProductionSeconds=(recipe,qty)=>recipe.seconds*qty+2*Math.max(0,qty-1);
export const autoProductionBusy=(s,id)=>Boolean(s.autoProduction&&!s.autoProduction.done&&RECIPES[s.autoProduction.recipe].production===id);
export function advanceAutoProduction(s,now,random){
 const job=s.autoProduction;
 if(!job||job.done)return false;
 const recipe=RECIPES[job.recipe];
 let changed=false;
 while(!job.done){
  if(!job.run){
   if(now<job.nextAt)break;
   changed=true;
   if(maxAutoQuantity(s,job.recipe)<1){job.done=true;job.reason='resources';break;}
   job.run=startCraftRun(s,job.recipe,1,job.nextAt,random,'auto');
  }
  if(now<job.run.endsAt)break;
  changed=true;
  for(const row of job.run.outputs){
   if(job.keep.includes(itemQuality(row)))job.items.push(row);
   else job.money+=itemValue(row)*row.qty;
  }
  if(recipe.refundOnFailure&&job.run.successes===0){
   for(const [item,qty] of Object.entries(recipe.ingredients)){
    const row=job.items.find(row=>row.item===item);
    if(row)row.qty+=qty;else job.items.push({item,qty});
   }
  }
  const xp=Math.max(1,Math.round(craftExperience(recipe,job.run.productionLevel,1,craftQualityXp(job.run))/2));
  const production=s.productions[recipe.production];
  if(production.level<MAX_PRODUCTION_LEVEL){
   gainProductionXp(production,recipe.production,xp);
   job.xp+=xp;
  }
  job.completed++;
  job.nextAt=job.run.endsAt+2000;
  job.run=null;
  if(job.completed===job.total)job.done=true;
 }
 return changed;
}
export const SHEKEL_UNIT_COST=18;
const SHEKEL_UNIT_MS=600;
export const tradingPostAvailable=s=>s.playerRole==='shekel'&&hasBuilding(s,'tradingPost');
export const shekelPopularity=s=>Math.min(50,(s.tradingPostUpgrades?.popularity??0)*5);
export const shekelUnitCost=s=>Math.max(3,SHEKEL_UNIT_COST-(s.tradingPostUpgrades?.production??0));
export const shekelUnitMs=s=>Math.round(SHEKEL_UNIT_MS*shekelUnitCost(s)/SHEKEL_UNIT_COST);
export function auctionDiscount(s){
 const count=s.tradingPostUpgrades?.auction??0;
 return count>0?Math.max(1,25-3*(count-1)):null;
}
export function tradingPostUpgradeQuote(state,kind){
 const count=state.tradingPostUpgrades?.[kind]??0;
 if(kind==='popularity')return {cost:30+20*count,currency:'shekel',seconds:30+15*count,maxed:shekelPopularity(state)===50};
 if(kind==='production')return {cost:1500+500*count,currency:'ammo',seconds:120+60*count,maxed:shekelUnitCost(state)===3};
 if(kind==='auction')return {cost:50+10*count,currency:'shekel',seconds:60+30*count,maxed:auctionDiscount(state)===1};
 return null;
}
export const SHEKEL_QUEST_TARGET=200;
export const SHEKEL_REWARD_XP=2000;
export const DUREN_QUEST_RELATION=10;
export const DUREN_QUEST_FEE=300;
export const durenQuestBribe=s=>Math.max(0,DUREN_QUEST_RELATION-(s.duren?.relation??0))*1000;
export const durenExpeditionAvailable=s=>s.playerRole==='shekel'&&s.shekelQuest?.stage===2&&s.shekelQuest.durenPaid&&!s.completedLocations?.durenExpedition;
export function shekelQuestView(s){
 const stage=s.shekelQuest?.stage??1;
 const progress=Math.min(SHEKEL_QUEST_TARGET,s.shekelsInCirculation??0);
 return {stage,progress,ready:stage===1&&tradingPostAvailable(s)&&progress>=SHEKEL_QUEST_TARGET};
}
function grantShekelRewardXp(hero,xp){
 if(hero.dead||xp<=0)return;
 levelUp(hero,xp);
 const series=hero.job?.kind==='series'?hero.job:null;
 if(series){
  if(!series.worker.dead)levelUp(series.worker,xp);
  levelUp(series.initial,xp);
 }
}
export const shekelRate=s=>30+Math.floor((s.shekelsInCirculation??0)/100);
function purchaseMerchantShekels(s,npc,random){
 const relation=npc.relation??0;
 if(!tradingPostAvailable(s)||!npc.ours||relation<0)return;
 if(random()>=Math.min(1,(10+9*relation)/100))return;
 const wanted=Math.max(1,Math.round(5*(npc.level??1)*relation/10));
 const qty=Math.min(s.shekels??0,wanted);
 const amount=qty*shekelRate(s);
 npc.visit.shekelPurchase={qty,amount};
 if(!qty)return;
 s.shekels-=qty;
 s.shekelsInCirculation=(s.shekelsInCirculation??0)+qty;
 s.shekelIncome=(s.shekelIncome??0)+amount;
}
export function visit(s,now=Date.now(),random=Math.random){let changed=advanceStationConstruction(s,now);
 if(s.shekelProduction&&ready(s.shekelProduction,now)){
  const {qty,endsAt}=s.shekelProduction;
  s.shekels=(s.shekels??0)+qty;
  s.shekelProduction=null;
  addHistory(s,'Торговый пост: произведено '+qty+' ₪.',endsAt);
  changed=true;
 }
 if(advanceMedicTentIncome(s,now,random))changed=true;
 if(advanceAutoProduction(s,now,random))changed=true;
 for(const merchant of Object.keys(MERCHANTS)){
  const npc=s[merchant];if(!npc||npc.banned)continue;
  if(!npc.visit&&now>=npc.nextAt){
   const settings=MERCHANTS[merchant];
   const sellerChance=settings.sellerChance+((npc.level??1)-1)*(settings.sellerChanceStep??0)/100;
   npc.visit={id:uid(),role:random()<sellerChance?'seller':'buyer',offers:null};
   purchaseMerchantShekels(s,npc,random);
   changed=true;
  }
  if(npc.visit&&prepareMerchantOffers(s,merchant,random))changed=true;
 }
 return changed;}
export function openYuras(s,now=Date.now(),random=Math.random,merchant='yuras'){visit(s,now,random);const v=Object.hasOwn(MERCHANTS,merchant)?s[merchant]?.visit:null;requireThat(v&&!s[merchant].banned,'Торговец ещё в пути.');if(merchant==='yuras'&&s[merchant].level>=MAX_MERCHANT_LEVEL&&!v.giftClaimed){v.giftClaimed=true;v.giftAmount=(30+Math.floor(random()*71))*10;s.money+=v.giftAmount;addHistory(s,`Подарок Юрася: +${v.giftAmount/10} A. «Вот держи, друган, твоя доля за помощь».`,now);}if(merchant==='vasek'&&s[merchant].level>=MAX_MERCHANT_LEVEL&&!v.giftClaimed){receive(s,[{item:'rareMushrooms',qty:1}]);v.giftClaimed=true;v.giftItem='rareMushrooms';v.giftQty=1;addHistory(s,'Подарок Васька: редкий подземный гриб.',now);}prepareMerchantOffers(s,merchant,random);return v;}
function adventureRegeneration(state,active,key){active.regenerationSteps??=[];if(active.regenerationSteps.includes(key))return;active.regenerationSteps.push(key);for(const id of active.heroIds){const hero=state.heroes.find(h=>h.id===id);if(hero?.mark!=='regeneration'||hero.dead||hero.hp<=0)continue;const before=hero.hp;hero.hp=Math.min(effectiveMaxHp(hero),hero.hp+30);(active.history??=[]).push({type:'регенерация приключения',heroId:id,healed:hero.hp-before,hp:hero.hp});}}
function applyAdventureRadiation(state,active){if(active.radiationApplied)return;active.radiationApplied=true;active.locationRadiation??=2;active.radiationResults=[];for(const id of active.heroIds){const hero=state.heroes.find(h=>h.id===id);if(!hero)continue;if(hero.activeStimulant==='cardioStimulator')finishStimulant(hero,{stimulant:true});if(hero.dead||hero.hp<=0)continue;const protection=heroConfig(state,hero,'surface').hero.radiationProtection,dose=Math.max(0,active.locationRadiation-protection);hero.radiation=(hero.radiation??0)+dose;hero.hp=Math.min(hero.hp,effectiveMaxHp(hero));active.radiationResults.push({heroId:id,name:hero.name,level:active.locationRadiation,protection,received:dose,total:hero.radiation});}}
function adventureCombatScene(active){
 const combat=active.pendingCombat;
 if(combat?.sceneId)return combat.sceneId;
 if(active.node!=='guardRecovery')return active.node;
 if(combat?.kind==='trap')return 'molotovCorridor';
 return {bridge:'guardBattle',stationEntrance:'matureGuardBattle',spiderTunnel:'acidSpiderBattle',stationInside:'banditBattle'}[combat?.nextNode];
}
export function adventureFallenHeroes(state,missionId){
 const previous=state.lastInteractiveMission;
 return getHeroes(state).filter(hero=>hero.missingOnMission&&hero.missingMission===missionId).map(hero=>{
  const wasInPreviousLoss=previous?.id===missionId&&['escaped','defeat'].includes(previous.outcome)&&previous.heroIds?.includes(hero.id);
  return {id:hero.id,name:hero.name,scene:hero.missingScene??(wasInPreviousLoss?adventureCombatScene(previous):null)};
 });
}
export function recoverableAdventureHeroes(state){
 const active=state.interactiveMission;
 if(!active)return [];
 const scenes=[];
 if(active.pendingCombat?.status==='recovery')scenes.push(adventureCombatScene(active));
 if(active.bridgeResolved&&(scenes.includes('matureGuardBattle')||(!active.pendingCombat&&active.node==='stationEntrance')))scenes.push('bridge');
 return adventureFallenHeroes(state,active.id).filter(hero=>hero.scene&&scenes.includes(hero.scene)&&!active.recoveredHeroIds?.includes(hero.id));
}
function returnAdventureFallen(state,active,now){
 const carried=new Set(active.recoveredHeroIds??[]);
 for(const hero of getHeroes(state)){
  if(!carried.has(hero.id)||!hero.missingOnMission||hero.missingMission!==active.id)continue;
  delete hero.missingOnMission;
  delete hero.missingMission;
  delete hero.missingScene;
  hero.awaitingBurial=true;
  addHistory(state,hero.name+': тело доставлено на станцию. Героя можно похоронить достойно.',now);
 }
}
function prepareInteractiveRecovery(state){
 const active=state.interactiveMission,combat=active?.pendingCombat;if(combat?.status!=='victory')return;
 combat.sceneId??=adventureCombatScene(active);
 if(!combat.experienceAwarded){const xp=combat.experience??combat.enemies.filter(e=>e.hp<=0).reduce((sum,e)=>sum+(e.experience??TECHNOPARK.enemy.experience),0),share=xp/active.heroIds.length;for(const id of active.heroIds){const hero=state.heroes.find(h=>h.id===id);if(hero)levelUp(hero,share*hobbyXpMultiplier(hero));}combat.experienceAwarded=true;combat.experience=xp;combat.experiencePerHero=share;}
 if(combat.enemies.some(e=>e.webAttack))combat.nextNode='spiderTunnel';beginPartyRecovery(combat);for(const fighter of combat.heroes)if(fighter.selfHealAfterBattle&&!(fighter.bandages||fighter.dressingKits||fighter.medicKits))fighter.hp=Math.min(fighter.maxHp,fighter.hp+nationalityHealing(fighter,fighter.selfHealAfterBattle));active.node='guardRecovery';
 for(const fighter of combat.heroes){const hero=state.heroes.find(hero=>hero.id===fighter.id);if(hero){hero.hp=fighter.hp;hero.dead=fighter.dead;}}
 adventureRegeneration(state,active,'battle:'+((active.battles??[]).length));for(const fighter of combat.heroes){const hero=state.heroes.find(h=>h.id===fighter.id);fighter.hp=hero.hp;}
}
function collectAdventureCombatLoot(active,combat,rolls){
 if(combat.lootClaimed)return;
 const drops={};
 const defeated=combat.enemies.filter(enemy=>enemy.hp<=0);
 for(const enemy of defeated){
  if(enemy.kind==='bandit'){
   const weapon=enemy.firearm?.item;
   if(weapon)drops[weapon]=(drops[weapon]??0)+1;
   const armor=enemy.body??'ghoulJacket';
   drops[armor]=(drops[armor]??0)+1;
   if(enemy.grenades>0)drops.pipeGrenade=(drops.pipeGrenade??0)+enemy.grenades;
   continue;
  }
  for(const item of enemy.loot??TECHNOPARK.loot){
   if(rolls.int(1,100)<=item.chance)drops[item.id]=(drops[item.id]??0)+rolls.int(item.minQty??1,item.maxQty??1);
  }
 }
 const banditVictory=defeated.length===combat.enemies.length&&defeated.some(enemy=>enemy.kind==='bandit');
 const money=banditVictory?rolls.int(20,70)*10:0;
 if(banditVictory)drops.broth=(drops.broth??0)+2;
 active.loot??={};
 for(const [item,qty] of Object.entries(drops))active.loot[item]=(active.loot[item]??0)+qty;
 active.money=(active.money??0)+money;
 combat.lootClaimed=true;
 combat.lootMoney=money;
 active.history.push({type:'обыск',loot:drops,money});
}
function receiveAdventureLoot(state,active){
 active.testRun??=Boolean(state.completedLocations?.[active.id]);
 if(active.testRun)return {entries:[],money:0};
 const entries=[...Object.entries(active.loot??{}).map(([item,qty])=>({item,qty})),...(active.items??[])];
 const money=active.money??0;
 receive(state,entries);
 state.money+=money;
 return {entries,money};
}
function settleUnfinishedAdventure(state,active,random){if(active.partialRewardsClaimed)return;const rolls=rng(Math.floor(random()*4294967296)),battles=[...(active.battles??[]),...(active.pendingCombat?[active.pendingCombat]:[])];active.loot??={};for(const combat of battles)collectAdventureCombatLoot(active,combat,rolls);const checks=(active.history??[]).flatMap(step=>step.check?[step.check]:(step.checks??[]).filter(c=>c.attribute)).filter(c=>c.success).length;const {entries,money}=receiveAdventureLoot(state,active);for(const id of active.heroIds){const hero=state.heroes.find(h=>h.id===id);if(hero&&!hero.dead&&hero.hp>0)levelUp(hero,checks*10/active.heroIds.length*hobbyXpMultiplier(hero));}active.partialRewardsClaimed=true;active.partialResult={checkXp:checks*10,entries,money};}
function finishLostInteractiveMission(state,active,outcome,now,random=Math.random){
 const combat=active.pendingCombat;
 for(const id of active.heroIds){const hero=state.heroes.find(hero=>hero.id===id),fighter=combat?.heroes.find(hero=>hero.id===id);if(!hero||!fighter)continue;
  hero.hp=Math.max(0,fighter.hp);hero.dead=Boolean(fighter.dead||fighter.hp<=0);
  if(hero.dead){hero.missingOnMission=true;hero.missingMission=active.id;hero.missingScene=fighter.fallenScene??adventureCombatScene(active);}
  if(hero.job?.kind==='interactive')hero.job=null;if(!hero.dead)hero.needsAdventureRest=true;
 }
 if(outcome==='escaped'){settleUnfinishedAdventure(state,active,random);returnAdventureFallen(state,active,now);}applyAdventureRadiation(state,active);state.lastInteractiveMission={...clone(active),outcome,finishedAt:now};state.interactiveMission=null;
 addHistory(state,outcome==='escaped'?'Сюжетная вылазка прервана: выживший вернулся, поверженный погиб и пропал на задании.':'Отряд погиб и пропал на задании. Восстановление пока невозможно.',now);
}
export function act(state,action,now=Date.now(),random=Math.random){const s=normalizeGame(state);visit(s,now,random);advanceSeries(s,now);if(action.heroId){for(const h of s.heroes){h.startPerk??=h.perk;h.rangedWeapon??=null;}s.completedLocations??=Object.fromEntries(s.heroes.filter(h=>h.lastCompletedLocation).map(h=>[h.lastCompletedLocation,true]));const selected=s.heroes.find(h=>h.id===action.heroId);requireThat(selected,'Сталкер не найден.');s.hero=selected;s.selectedHeroId=selected.id;}const h=s.hero;
 switch(action.type){
 case 'startInteractiveMission':{
  const id=action.mission??'zilRoute',mission=INTERACTIVE_MISSIONS[id];
  requireThat(mission&&s.completedLocations.surface,'Сначала вернись с первого выхода на поверхность.');
  requireThat(id!=='repairMaterials'||repairMaterialsAvailable(s),'Сначала прими квест о крыше Технопарка у Смотрителя.');
  requireThat(!s.interactiveMission&&!s.heroes.some(hero=>hero.job?.kind==='interactive'),'Другая сюжетная вылазка уже открыта.');
  const ids=action.heroIds;requireThat(Array.isArray(ids)&&ids.length>=mission.minHeroes&&ids.length<=mission.maxHeroes&&new Set(ids).size===ids.length,'Выбери одного или двух разных героев.');
  const front=ids.length===1?ids[0]:action.frontHeroId,rear=ids.length===1?null:action.rearHeroId;
  requireThat(ids.includes(front)&&(ids.length===1||ids.includes(rear)&&front!==rear),'Выбери, кто идёт впереди и кто замыкающий.');
  const orderedIds=rear?[front,rear]:[front],heroes=orderedIds.map(id=>s.heroes.find(hero=>hero.id===id));
  requireThat(heroes.every(hero=>hero&&!hero.dead&&!hero.job&&!radiationBlocksMissions(hero)&&!needsAdventureRecovery(hero)),'В отряде могут быть только живые свободные герои без сильного облучения.');
  requireThat(mission.maxHeroes===1||ids.length>1||action.soloConfirmed===true,'Одиночный выход крайне опасен. Подтверди риск.');
  const filters=mission.filtersPerHero*ids.length;requireThat(s.filters>=filters,'Не хватает фильтров для отряда.');
  requireThat(interactiveMissionReady(id),'Первый этап задания ещё готовится.');
  s.filters-=filters;s.interactiveMission={id,heroIds:orderedIds,formation:{front,rear},node:mission.entry,startedAt:now,paidFilters:filters,testRun:Boolean(s.completedLocations[id]),locationRadiation:mission.radiation??(2+Math.min(2,Math.floor(random()*3))),history:[]};
  for(const hero of heroes){if(hero.stimulantItem==='cardioStimulator')startStimulant(hero,'interactive');hero.needsAdventureRest=true;hero.job={kind:'interactive',mission:id,startedAt:now};}
  addHistory(s,mission.name+': отряд '+heroes.map(hero=>hero.name).join(', ')+', потрачено фильтров: '+filters+'.',now);break;
 }

 case 'recoverAdventureFallen':{
  const active=s.interactiveMission;
   const fallen=recoverableAdventureHeroes(s);
   requireThat(fallen.length,'На этой сцене нет погибших, которых можно забрать.');
   active.recoveredHeroIds=[...(active.recoveredHeroIds??[]),...fallen.map(hero=>hero.id)];
   active.history.push({type:'эвакуация погибших',heroIds:fallen.map(hero=>hero.id)});
   break;
 }
 case 'interactiveRecovery':{
  prepareInteractiveRecovery(s);const active=s.interactiveMission,combat=active?.pendingCombat;
  requireThat(active&&combat?.status==='recovery','Сцена восстановления недоступна.');
  const party=active.heroIds.map(id=>s.heroes.find(hero=>hero.id===id)).filter(Boolean);
  if(action.choice==='continue'){
   requireThat(combat.lootClaimed||!combat.enemies.some(enemy=>enemy.kind==='bandit'),'Сначала обыщи бандитов.');
   const next=combat.nextNode??'bridge';requireThat(INTERACTIVE_MISSIONS[active.id].nodes[next],'Следующий этап ещё не описан.');(active.battles??=[]).push(clone(combat));active.pendingCombat=null;active.node=next;active.lastChecks=[];break;
  }else if(action.choice==='loot'){
   requireThat(!combat.lootClaimed,'Трупы уже обысканы.');
   collectAdventureCombatLoot(active,combat,rng(Math.floor(random()*4294967296)));
  }else if(action.choice==='medic'){
   requireThat(!combat.medicTreatmentUsed,'Лечение Медиком уже применено после этого боя.');
   const target=party.find(hero=>hero.id===action.targetHeroId),medic=party.find(hero=>hero.id===action.medicHeroId&&hero.profession==='medic'&&!hero.dead&&hero.hp>0);
   requireThat(target&&!target.dead&&medic,'Выбери живого Медика и получателя лечения.');requireThat(target.hp<effectiveMaxHp(target),'Здоровье уже полное.');
   requireThat(heroEffectiveStrength(target)>=MEDIC_TREATMENT.strengthCost,'При Силе 0 лечение Медиком невозможно.');
   const rolls=rng(Math.floor(random()*4294967296)),perception=heroConfig(s,medic,'surface').hero.perception,raw=rolls.int(MEDIC_TREATMENT.min,MEDIC_TREATMENT.max)+MEDIC_TREATMENT.perceptionMultiplier*perception,before=target.hp;
   target.temporaryAttributeLoss={...target.temporaryAttributeLoss,strength:(target.temporaryAttributeLoss?.strength??0)+MEDIC_TREATMENT.strengthCost};target.needsAdventureRest=true;
   target.maxHp=heroMaximumHp(target);target.hp=Math.min(target.hp,effectiveMaxHp(target));target.hp=Math.min(effectiveMaxHp(target),target.hp+nationalityHealing(target,raw));
   target.medicTreatmentsReceived=(target.medicTreatmentsReceived??0)+1;combat.medicTreatmentUsed=true;
   const fighter=combat.heroes.find(hero=>hero.id===target.id);Object.assign(fighter,heroConfig(s,target,'surface').hero,{hp:target.hp});
   active.history.push({type:'лечение Медиком',medicHeroId:medic.id,heroId:target.id,raw,healed:target.hp-before,strengthCost:MEDIC_TREATMENT.strengthCost});
  }else if(action.choice==='heal'){
   const target=party.find(hero=>hero.id===action.targetHeroId),keys={medicKit:'medicKits',dressingKit:'dressingKits',bandage:'bandages'},key=keys[action.item];
   requireThat(target&&!target.dead&&key,'Выбери героя и лечебный расходник.');requireThat(target.hp<effectiveMaxHp(target),'Здоровье уже полное.');
   const source=party.find(hero=>(hero[key]??0)>0);requireThat(source,'В отряде нет этого лечебного расходника.');
   const healed=bandageHeal(heroConfig(s,target,'surface'),rng(Math.floor(random()*4294967296)),target.hp,action.item);source[key]--;target.hp=healed.hp;
   const fighter=combat.heroes.find(hero=>hero.id===target.id);fighter.hp=target.hp;active.history.push({type:'лечение отряда',heroId:target.id,sourceHeroId:source.id,item:action.item,healed:healed.healed});
  }else throw Error('Выбери лечение или обыск трупов.');
  break;
 }
 case 'leaveInteractivePreview':{
 const active=s.interactiveMission;requireThat(active,'Нет активной вылазки.');requireThat(!active.pendingCombat||['recovery','pending','limit'].includes(active.pendingCombat.status),'Сначала закончи бой или выбери отступление.');
 for(const id of active.heroIds){const hero=s.heroes.find(h=>h.id===id);if(hero?.job?.kind==='interactive'){hero.job=null;hero.needsAdventureRest=true;}}
 settleUnfinishedAdventure(s,active,random);returnAdventureFallen(s,active,now);applyAdventureRadiation(s,active);s.lastInteractiveMission={...clone(active),outcome:'unfinished',finishedAt:now};s.interactiveMission=null;addHistory(s,'ЗИЛ: возвращение с незавершённого маршрута. Фильтры не возвращаются.',now);break;
 }
 case 'interactiveCombatReport':{const combat=s.interactiveMission?.pendingCombat;requireThat(combat?.status==='recovery','Бой ещё не завершён.');combat.reportSeen=true;break;}
 case 'interactiveCombat':{
  const active=s.interactiveMission,combat=active?.pendingCombat;requireThat(combat,'Нет группового боя.');for(const fighter of combat.heroes){if(active.focusUsed?.[fighter.id])fighter.focusBattleUsed=true;fighter.perceptionRerollUsed=Boolean(active.perceptionRerolls?.[fighter.id]);const hero=s.heroes.find(h=>h.id===fighter.id);for(const key of ['bandages','dressingKits','medicKits'])fighter[key]=hero[key]??0;fighter.autoStimulatorUsed=Boolean(active.autoStimulatorUsed?.[fighter.id]);}
  advancePartyCombat(combat,rng(Math.floor(random()*4294967296)));
  for(const fighter of combat.heroes){const hero=s.heroes.find(h=>h.id===fighter.id);hero.hp=fighter.hp;hero.dead=fighter.hp<=0;hero.heavyAmmo=fighter.heavyAmmo??hero.heavyAmmo;for(const key of ['grenades','molotovs','tinGrenades','bandages','dressingKits','medicKits'])hero[key]=fighter[key]??hero[key];if(fighter.autoStimulatorUsed)(active.autoStimulatorUsed??={})[fighter.id]=true;}
  for(const fighter of combat.heroes){if(fighter.focusBattleUsed)(active.focusUsed??={})[fighter.id]=true;if(fighter.perceptionRerollUsed)(active.perceptionRerolls??={})[fighter.id]=true;}if(combat.status==='defeat')finishLostInteractiveMission(s,active,'defeat',now);else prepareInteractiveRecovery(s);break;
 }
 case 'interactiveBattleDecision':{
  const active=s.interactiveMission,combat=active?.pendingCombat;requireThat(active&&combat,'Нет сюжетного боя.');
  if(updatePartyCasualties(combat)==='defeat'){finishLostInteractiveMission(s,active,'defeat',now);break;}
  decidePartyCasualty(combat,action.decision);
  for(const fighter of combat.heroes){const hero=s.heroes.find(hero=>hero.id===fighter.id);if(hero){hero.hp=Math.max(0,fighter.hp);hero.dead=Boolean(fighter.dead||fighter.hp<=0);}}
  if(action.decision==='escape')finishLostInteractiveMission(s,active,'escaped',now,random);
  break;
 }
 case 'interactiveChoice':{
  const active=s.interactiveMission,mission=INTERACTIVE_MISSIONS[active?.id],node=mission?.nodes[active?.node];
  requireThat(active&&node,'Нет открытого сюжетного этапа.');requireThat(action.node===active.node,'Этот выбор уже обработан.');
  const choice=node.choices?.find(choice=>choice.id===action.choice);requireThat(choice,'Этот выбор недоступен.');requireThat(choice.configured!==false,'Проверки этого этапа ещё не заданы.');
  if(choice.resolve==='repairMaterials'){
   requireThat(repairMaterialsAvailable(s),'Поиск материалов уже завершён.');
   for(const id of active.heroIds){const hero=s.heroes.find(hero=>hero.id===id);hero.job=null;}
   adventureRegeneration(s,active,'finish');
   applyAdventureRadiation(s,active);
   healAdventurePartyAtTent(s,active,now);
   s.completedLocations.repairMaterials=true;
   s.keeperQuest.progress=1;
   s.lastInteractiveMission={...clone(active),outcome:'victory',finishedAt:now};
   s.interactiveMission=null;
   addHistory(s,'Места с материалами отмечены. Со Смотрителем можно обсудить ремонт крыши Технопарка.',now);
   break;
  }
  if(['bridge','gateChecks','gateGrenades','returnUnfinished'].includes(choice.resolve)){
   if(choice.resolve==='returnUnfinished')return act(s,{type:'leaveInteractivePreview'},now,random);
   const party=active.heroIds.map(id=>s.heroes.find(h=>h.id===id));requireThat(party.every(h=>h&&!h.dead&&h.job?.kind==='interactive'),'Отряд недоступен.');const rolls=rng(Math.floor(random()*4294967296)),checks=[],from=active.node;
   if(choice.resolve==='bridge'){
    requireThat(!active.bridgeResolved,'Мост уже пройден.');active.bridgeResolved=true;let fell=false;
    for(const hero of party){const h=heroConfig(s,hero,'surface').hero;for(let attempt=1;attempt<=2;attempt++){const roll=rolls.int(1,20),bonus=h.agility-(h.checkPenalty??0),success=roll+bonus>10;checks.push({heroId:hero.id,name:hero.name,attribute:'Ловкость',roll,bonus,dc:10,success});if(!success){fell=true;const raw=rolls.int(30,120),damage=Math.max(1,raw-h.armor-(h.firstHitArmor??0));hero.hp=Math.max(0,hero.hp-damage);checks.push({type:'событие отряда',text:hero.name+' падает: '+damage+' физического урона, '+hero.hp+' HP.'});break;}}}
    active.node=fell?'matureGuardBattle':'stationEntrance';
    if(fell){const fighters=party.map(hero=>({...heroConfig(s,hero,'surface').hero,id:hero.id,name:hero.name,hp:hero.hp,dead:hero.hp<=0,fallenScene:hero.hp<=0?'bridge':null,bandages:hero.bandages??0,dressingKits:hero.dressingKits??0,medicKits:hero.medicKits??0,grenades:hero.grenades??0,molotovs:hero.molotovs??0,tinGrenades:hero.tinGrenades??0}));const combat={...preparePartyCombat(fighters,[clone(MATURE_GUARD)],rolls),heroIds:[...active.heroIds],nextNode:'stationEntrance'};combat.events.push(...checks.filter(c=>c.text));active.pendingCombat=combat;combat.status='running';updatePartyCasualties(combat);if(combat.status==='running')combat.status='pending';if(combat.status==='defeat')finishLostInteractiveMission(s,active,'defeat',now);}
   }else if(choice.resolve==='gateChecks'){
    requireThat(!active.gateChecked,'Ворота уже проверены.');active.gateChecked=true;
    for(const hero of party){const h=heroConfig(s,hero,'surface').hero;for(const [attribute,label,dc]of [['intelligence','Интеллект',12],['strength','Сила',14]]){const roll=rolls.int(1,20),bonus=h[attribute]-(h.checkPenalty??0);checks.push({heroId:hero.id,name:hero.name,attribute:label,roll,bonus,dc,success:roll+bonus>dc});}}
    active.node=checks.filter(c=>c.success).length>=2?'stationBandits':'gateBlocked';
   }else{
    requireThat(active.node==='gateBlocked','Сначала попробуй открыть ворота.');requireThat(party.reduce((sum,h)=>sum+(h.grenades??0)+(h.tinGrenades??0),0)>=2,'Нужно две взрывные гранаты у героев. Молотов не подходит.');let left=2;for(const slot of ['grenades','tinGrenades'])for(const hero of party){const count=Math.min(left,hero[slot]??0);if(count)hero[slot]-=count;left-=count;}active.node='stationBandits';
   }
   active.lastChecks=checks;active.history.push({node:from,choice:choice.id,checks,next:active.node});break;
  }
  if(choice.resolve==='zilBandits'){
   requireThat(!active.pendingCombat,'Бой уже начался.');
   requireThat(choice.id!=='talk'||!active.banditTalkFailed,'Бандиты больше не хотят разговаривать.');
   const party=active.heroIds.map(id=>s.heroes.find(hero=>hero.id===id));
   requireThat(party.every(hero=>hero&&!hero.dead&&hero.job?.kind==='interactive'),'Отряд недоступен.');
   const banditLevel=4;
   const rolls=rng(Math.floor(random()*4294967296));
   const checks=[];
   if(choice.id==='talk'||choice.id==='threaten'){
    for(const hero of party){
     const fighter=heroConfig(s,hero,'surface').hero;
     const levelBonus=choice.id==='threaten'?hero.level-banditLevel:0;
     fighter.perceptionRerollUsed=Boolean(active.perceptionRerolls?.[hero.id]);
     const bonus=fighter.perception+(fighter.perceptionCheckBonus??0)-(fighter.checkPenalty??0)+levelBonus;
     const result=perceptionCheck(fighter,rolls,bonus,14,{trace:false});
     checks.push({heroId:hero.id,name:hero.name,attribute:'Восприятие',dc:14,levelBonus,...result});
     if(fighter.perceptionRerollUsed)(active.perceptionRerolls??={})[hero.id]=true;
    }
   }
   if(choice.id==='bribe')pay(s,500);
   const peaceful=choice.id==='bribe'||checks.some(check=>check.success);
   const from=active.node;
   if(choice.id==='talk'&&!peaceful){
    active.banditTalkFailed=true;
    active.lastChecks=checks;
    active.history.push({node:from,choice:choice.id,checks,next:from});
    break;
   }
   active.node=peaceful?'stationInside':'banditBattle';
   active.banditOutcome=peaceful?'peaceful':'battle';
   active.lastChecks=checks;
   active.history.push({node:from,choice:choice.id,checks,next:active.node});
   if(!peaceful){
    const fighters=party.map(hero=>{
     const config=heroConfig(s,hero,'surface').hero;
     return {...config,id:hero.id,name:hero.name,hp:hero.hp,initiative:config.initiative+(choice.id==='attack'?4:0),
      bandages:hero.bandages??0,dressingKits:hero.dressingKits??0,medicKits:hero.medicKits??0,
      grenades:hero.grenades??0,molotovs:hero.molotovs??0,tinGrenades:hero.tinGrenades??0};
    });
    const enemies=[
     {weapon:'bastard',perk:'bandit-blur',grenades:1},
     {weapon:'browning',perk:'bandit-survivor',grenades:0}
    ].map(loadout=>{
     const bandit={profession:'bandit',level:banditLevel,body:'ghoulJacket',...loadout};
     bandit.hp=heroMaximumHp(bandit);
     const spec=heroConfig(s,bandit,'surface').hero;
     return {...spec,kind:'bandit',name:'Бандит',level:banditLevel,body:bandit.body,hp:bandit.hp,criticalChance:3,
      stealth:spec.agility,firearm:spec.weapons.main,grenades:loadout.grenades,experience:15,loot:[]};
    });
    active.pendingCombat={...preparePartyCombat(fighters,enemies,rolls),nextNode:'stationInside',heroIds:[...active.heroIds]};
   }
   break;
  }
  if(choice.resolve==='finishZil'){
   requireThat(active.node==='stationInside'&&!active.pendingCombat,'Сначала заверши бой и восстановление.');
   const rolls=rng(Math.floor(random()*4294967296)),battles=active.battles??[];active.loot??={};
   for(const combat of battles)collectAdventureCombatLoot(active,combat,rolls);
   const checks=(active.history??[]).flatMap(step=>step.check?[step.check]:(step.checks??[]).filter(c=>c.attribute)).filter(c=>c.success).length;
   const combatXp=battles.reduce((sum,c)=>sum+(c.experience??0),0),extraXp=150+checks*10;
   const {entries,money}=receiveAdventureLoot(s,active);
   const gains=[];for(const id of active.heroIds){const hero=s.heroes.find(h=>h.id===id);const share=extraXp/active.heroIds.length;levelUp(hero,share*hobbyXpMultiplier(hero));hero.job=null;hero.needsAdventureRest=true;gains.push({id,name:hero.name,xp:(combatXp+extraXp)/active.heroIds.length*hobbyXpMultiplier(hero)});}
   returnAdventureFallen(s,active,now);adventureRegeneration(s,active,'finish');applyAdventureRadiation(s,active);healAdventurePartyAtTent(s,active,now);s.completedLocations.zilRoute=true;s.unlockedLocations=[...new Set([...(s.unlockedLocations??[]),'zilTunnels'])];s.lastInteractiveMission={...clone(active),outcome:'victory',finishedAt:now,result:{checks,checkXp:checks*10,combatXp,baseXp:150,totalXp:gains.reduce((sum,gain)=>sum+gain.xp,0),gains,entries,money}};s.interactiveMission=null;addHistory(s,'Путь на ЗИЛ открыт. Открыта вылазка «Осмотреть тоннели ЗИЛ».',now);break;
  }
  if(choice.resolve==='leftStash'){
   requireThat(!active.leftStashClaimed,'Схрон уже обыскан.');const rolls=rng(Math.floor(random()*4294967296));active.money=(active.money??0)+rolls.int(20,100)*10;active.items??=[];active.items.push({item:'shieldUni',qty:1,quality:1});active.leftStashClaimed=true;active.history.push({node:active.node,type:'схрон',money:active.money,item:'shieldUni',quality:1});break;
  }
  if(choice.resolve==='leftTrap'){
   if(active.leftTrapResolved){active.history.push({node:active.node,next:'leftStash'});active.node='leftStash';break;}
   const target=s.heroes.find(h=>h.id===(active.formation?.front??active.heroIds[0]));requireThat(target&&!target.dead,'Передний герой недоступен.');const h=heroConfig(s,target,'surface').hero,rolls=rng(Math.floor(random()*4294967296)),events=[];
   h.perceptionRerollUsed=Boolean(active.perceptionRerolls?.[target.id]);const check=perceptionCheck(h,rolls,h.perception+(h.perceptionCheckBonus??0)+(h.detectionBonus??0)+(h.nationality?.detectionBonus??0)-(h.checkPenalty??0),13,{events});if(h.perceptionRerollUsed)(active.perceptionRerolls??={})[target.id]=true;
   active.leftTrapResolved=true;active.lastChecks=[{heroId:target.id,name:target.name,attribute:'Обнаружение ловушки',...check,dc:13}];
   if(check.success){active.loot??={};active.loot.molotov=(active.loot.molotov??0)+1;events.push({type:'событие отряда',text:'О, ловушка найдена! Молотов добавлен к добыче.'});}
   else for(let tick=1;tick<=2&&target.hp>0;tick++){const roll=rolls.int(1,20),agility=h.agility-(h.checkPenalty??0),dodged=roll+agility>ITEMS.molotov.dodgeDc,raw=rolls.int(ITEMS.molotov.min,ITEMS.molotov.max),armor=h.thermalArmor+(tick===1?(h.firstHitArmor??0):0),damage=Math.max(1,raw*(dodged?.5:1)-armor);target.hp=Math.max(0,target.hp-damage);events.push({type:'событие отряда',text:target.name+': огонь Молотова '+tick+' — уворот '+roll+' + '+agility+' против 13; '+damage+' термического урона, '+target.hp+' HP.'});}
   const combat={kind:'trap',heroes:active.heroIds.map(id=>{const hero=s.heroes.find(h=>h.id===id);return {...heroConfig(s,hero,'surface').hero,id,name:hero.name,hp:hero.hp,dead:hero.hp<=0};}),enemies:[],events,status:'victory',order:[],nextNode:'leftStash',experience:0,lootClaimed:true,heroIds:[...active.heroIds]};active.pendingCombat=combat;active.history.push({node:active.node,next:'leftStash',check});
   if(target.hp<=0){target.dead=true;combat.status='running';updatePartyCasualties(combat);if(combat.status==='defeat')finishLostInteractiveMission(s,active,'defeat',now);}else prepareInteractiveRecovery(s);break;
  }
  if(choice.resolve==='goto'){requireThat(mission.nodes[choice.next],'Следующий этап ещё не описан.');active.history.push({node:active.node,choice:choice.id,next:choice.next});active.node=choice.next;active.lastChecks=[];const spec=mission.nodes[choice.next].combat;if(spec){const enemy=spec.enemy==='acidSpider'?ACID_SPIDER:spec.enemy==='matureGuard'?MATURE_GUARD:TECHNOPARK.enemy;active.pendingCombat={...preparePartyCombat(active.heroIds.map(id=>{const hero=s.heroes.find(h=>h.id===id);return {...heroConfig(s,hero,'surface').hero,id,name:hero.name,hp:hero.hp,grenades:hero.grenades??0,molotovs:hero.molotovs??0,tinGrenades:hero.tinGrenades??0};}),Array.from({length:spec.count},()=>clone(enemy)),rng(Math.floor(random()*4294967296))),nextNode:spec.afterRecovery,heroIds:[...active.heroIds]};}break;}
  const heroes=active.heroIds.map(id=>s.heroes.find(hero=>hero.id===id));requireThat(heroes.length&&heroes.every(hero=>hero&&!hero.dead&&hero.job?.kind==='interactive'),'Отряд недоступен.');
  const seed=Math.floor(random()*4294967296),rolls=rng(seed),checks=[];
  for(const hero of heroes){
   const h=heroConfig(s,hero,'surface').hero;h.perceptionRerollUsed=Boolean(active.perceptionRerolls?.[hero.id]);
   if(choice.resolve==='stealth'){
    const roll=rolls.int(1,20),bonus=(Number.isFinite(hero.stealth)?hero.stealth:h.agility)+(h.stealthCheckBonus??0)-(h.checkPenalty??0);
    checks.push({heroId:hero.id,name:hero.name,attribute:'Скрытность',roll,bonus,dc:12,success:roll+bonus>12});
   }else if(choice.resolve==='detour'){
    const roll=rolls.int(1,20),bonus=h.intelligence-(h.checkPenalty??0);checks.push({heroId:hero.id,name:hero.name,attribute:'Интеллект',roll,bonus,dc:11,success:roll+bonus>11});
    const result=perceptionCheck(h,rolls,h.perception+(h.perceptionCheckBonus??0)-(h.checkPenalty??0),11,{events:checks});checks.push({heroId:hero.id,name:hero.name,attribute:'Восприятие',...result,dc:11});
    if(h.perceptionRerollUsed)(active.perceptionRerolls??={})[hero.id]=true;
   }else throw Error('Правила этого выбора ещё не заданы.');
  }
  const tests=checks.filter(check=>check.attribute),success=choice.resolve==='stealth'?tests.every(check=>check.success):tests.some(check=>check.success);
  const from=active.node;active.node=choice.resolve==='stealth'?(success?'bridge':'guardBattle'):(success?'sewerHatch':'alleyDeadEnd');
  active.lastChecks=checks;(active.history??=[]).push({node:from,choice:choice.id,seed,checks,next:active.node});
  if(active.node==='guardBattle'){const fighters=heroes.map(hero=>({...heroConfig(s,hero,'surface').hero,id:hero.id,name:hero.name,hp:hero.hp,dead:hero.dead,grenades:hero.grenades??0,molotovs:hero.molotovs??0,tinGrenades:hero.tinGrenades??0}));active.pendingCombat={...preparePartyCombat(fighters,Array.from({length:5},()=>clone(TECHNOPARK.enemy)),rolls),heroIds:[...active.heroIds],nextNode:'bridge'};}
  break;
 }
 case 'prepareNationalities':{prepareNationalityOffers(s,random,action.target??'hire');break;}
 case 'updateNationality':{const hero=idleHero(s);requireThat(!hero.nationalityVersion,'Национальность уже обновлена.');applyNationality(s,hero,action,'update:'+hero.id);addHistory(s,hero.name+': национальность обновлена.',now);break;}
 case 'packStimulant':{const hero=idleHero(s,true);requireThat(!hero.stimulants,'Стимулятор уже снаряжён.');const item=action.item??'combatStimulator';requireThat(ITEMS[item]?.type==='stimulant','Это не стимулятор.');const row=s.inventory.find(x=>x.item===item&&(!action.uid||x.uid===action.uid));requireThat(row,'Нет стимулятора.');hero.stimulantItem=item;hero.stimulantQuality=itemQuality(row);hero.stimulants=row.charges??10;removeRow(s,row.uid);break;}
 case 'unpackStimulant':{const hero=idleHero(s,true);requireThat(hero.stimulants>0,'Слот пуст.');receive(s,[{item:hero.stimulantItem??'combatStimulator',qty:1,charges:hero.stimulants,...(hero.stimulantQuality?{quality:hero.stimulantQuality}:{})}]);hero.stimulants=0;delete hero.stimulantItem;delete hero.stimulantQuality;break;}
 case 'selectHero':requireThat(h,'Сталкер не найден.');break;
 case 'rebirth':{
  const hero=idleHero(s),quote=rebirthQuote(s,hero),attribute=action.attribute;
  requireThat(quote.available,quote.reason);
  requireThat(['strength','agility','intelligence','perception'].includes(attribute),'Выбери параметр для увеличения.');
  requireThat(heroAttributes(hero)[attribute]<10,'Этот параметр уже достиг максимума.');
  requireThat(PROFESSIONS[hero.profession??'saboteur'].perks.includes(action.perk),'Выбери стартовый перк своей профессии.');
  receive(s,quote.equipment);pay(s,quote.cost);
  hero.rebirths=quote.stars+1;
  hero.rebirthAttributes={...hero.rebirthAttributes,[attribute]:(hero.rebirthAttributes?.[attribute]??0)+1};
  hero.level=1;hero.xp=0;hero.levelPerks=[];hero.extraPerkChoices=0;
  hero.perk=action.perk;hero.startPerk=action.perk;
  for(const slot of ['weapon','rangedWeapon','body','accessory']){hero[slot]=null;hero[slot+'Details']=null;}hero.weaponFamiliarity=0;hero.rangedWeaponFamiliarity=0;
  for(const key of ['bandages','dressingKits','medicKits','grenades','molotovs','tinGrenades','radiation','permanentHpLoss','mushroomTeasDrunk','stimulants','activeStimulant'])hero[key]=0;
  hero.maxHp=heroMaximumHp(hero);hero.hp=hero.maxHp;
  s.heroes = [...s.heroes.filter(member => member.id !== hero.id), hero];
  addHistory(s,`${hero.name}: переподготовка ${hero.rebirths}, +1 к параметру, новый стартовый перк «${PERKS[action.perk].name}».`,now);
  break;
 }
 case 'darkCrystal':{
  const hero=idleHero(s);requireThat(HERO_MARKS[action.mark],'Выбери Метку.');requireThat(!hero.mark,'У героя уже есть Метка.');
  removeItem(s,'darkCrystal',1);hero.mark=action.mark;hero.hp=Math.min(hero.hp,effectiveMaxHp(hero));s.darkCrystalDropped=true;
  addHistory(s,`${hero.name}: получена Метка «${HERO_MARKS[action.mark].name}».`,now);break;
 }
 case 'traderNotes':{
  const hero=idleHero(s,true);
  removeItem(s,'traderNotes',1);
  hero.extraPerkChoices=(hero.extraPerkChoices??0)+1;
  addHistory(s,`${hero.name}: получен дополнительный выбор перка.`,now);break;
 }
 case 'chooseHobby':{
  const hero=idleHero(s,true),{hobby:id,option}=action;
  const hobby=Object.hasOwn(HERO_HOBBIES,id)?HERO_HOBBIES[id]:null;
  requireThat(hobby&&hasBuilding(s,id)&&Object.hasOwn(hobby.options,option),'Это хобби недоступно.');
  requireThat(hero.hobby?.id!==id||hero.hobby.option!==option,'Этот бонус уже выбран.');
  pay(s,HOBBY_COST);
  const previousScale=hero.hobby?.option==='endurance'?1.1:1;
  hero.hobby={id,option};
  const scale=option==='endurance'?1.1:1;
  hero.maxHp=heroMaximumHp(hero);
  hero.hp=Math.min(effectiveMaxHp(hero),hero.hp*scale/previousScale);
  addHistory(s,hero.name+' · хобби: '+STATION_BUILDINGS[id].name+'.',now);
  break;
 }
 case 'chooseLevelPerk':{const hero=idleHero(s,true),slots=availablePerkLevels(hero),perk=LEVEL_PERKS[action.perk];requireThat(slots.length,'Нет доступного выбора перка.');requireThat(levelPerkOptions(hero).some(p=>p.id===action.perk),'Этот перк недоступен.');if(slots[0]===null)hero.extraPerkChoices--;hero.levelPerks=[...(hero.levelPerks??[]),{level:slots[0],perk:action.perk,pickedAtLevel:hero.level}];if(perk.attributeBonus){hero.maxHp=heroMaximumHp(hero);hero.hp=Math.min(hero.hp,effectiveMaxHp(hero));}if(action.perk==='hunter-familiarity')gainFamiliarity(hero);if(perk.maxHpBonus)hero.maxHp+=perk.maxHpBonus;if(perk.clearsRadiation)hero.radiation=0;if(action.perk==='enduring')hero.maxHp+=30;if(perk.hpBonus){hero.maxHp+=perk.hpBonus;hero.hp=Math.min(effectiveMaxHp(hero),hero.hp+perk.hpBonus);}if(action.perk==='engineer-side-job')paySideJob(s,hero,hero.level,now);addHistory(s,`${hero.name}: выбран перк «${perk.name}».`,now);break;}
 case 'hire':{const profession=action.profession??'saboteur',p=PROFESSIONS[profession];requireThat(professionUnlocked(s,profession),profession==='hunter'?'Охотник открывается после знакомства с Дурнем.':profession==='bandit'?'Бандит открывается после знакомства с Пиками или Червями.':'Эта профессия пока недоступна для найма.');requireThat(p.startReady!==false,'Стартовое снаряжение и точность инженера ещё не заданы.');requireThat(p.perks.includes(action.perk),'Выбери стартовый перк этой профессии.');const offer=action.nationalityId?nationalityOffer(s,action,'hire'):null;const identity=offer?{...NATIONALITIES[offer.id],name:NATIONALITIES[offer.id][offer.gender],gender:offer.gender}:action.identity?IDENTITIES[action.identity]:null;requireThat(!action.identity||identity,'Выбери имя и национальность.');pay(s,hireCost(s,action.nationalityId));const inheritance=s.shekelFreeHire?nextHireRebirth(s):s.inheritedRebirths?.shift(),number=s.heroes.length+1,maxHp=120+30*p.strength+(identity?.bonuses?.hp??0);const hero={id:uid(),profession,identityId:action.identity??null,gender:identity?.gender??'male',headwear:identity?.headwear??null,nationality:identity?.nationality??null,nationalityBonuses:clone(identity?.bonuses??{}),name:identity?.name??(number===1?p.name:`${p.name} №${number}`),level:1,xp:0,maxHp,hp:maxHp,perk:action.perk,startPerk:action.perk,weapon:p.weapon,rangedWeapon:p.rangedWeapon??null,body:null,bandages:0,dead:false,wounds:0,job:null};if(offer)applyNationality(s,hero,action,'hire');hero.weaponDetails={origin:'start'};if(s.playerRole==='sova'&&profession==='saboteur')hero.rewardPerkUnlocks=['dual-wield'];if(inheritance){hero.rebirths=inheritance.stars;const choices=action.inheritanceAttributes??[];requireThat(Array.isArray(choices)&&choices.length===inheritance.stars,'Выбери параметр за каждую унаследованную звезду.');hero.rebirthAttributes={};for(const key of choices){requireThat(['strength','agility','intelligence','perception'].includes(key),'Выбери параметр наследования.');requireThat(heroAttributes(hero)[key]<10,'Параметр уже достиг максимума 10.');hero.rebirthAttributes[key]=(hero.rebirthAttributes[key]??0)+1;}hero.maxHp=heroMaximumHp(hero);hero.hp=hero.maxHp;}hero.maxHp=heroMaximumHp(hero);hero.hp=effectiveMaxHp(hero);s.heroes.push(hero);s.shekelFreeHire=false;s.hero=hero;s.selectedHeroId=hero.id;addHistory(s,`${hero.name} (${p.name}) принят на станцию.`,now);break;}
 case 'setRepeatPreferences':{requireThat(h,'Сначала выбери героя.');const {location,total,threshold}=action;requireThat(['mission','help','rest','patrol','technopark','caravan','surface','zilTunnels','surfaceShops'].includes(location),'Нет такой локации.');requireThat(Number.isInteger(total)&&total>=2&&total<=5,'Выбери от 2 до 5 прохождений.');requireThat([50,30,15].includes(threshold),'Выбери порог здоровья.');h.repeatPreferences={...h.repeatPreferences,[location]:{total,threshold}};break;}
 case 'startSeries':{const hero=idleHero(s),kind=action.location,total=action.total,threshold=action.threshold;requireThat(['mission','patrol','help','technopark','caravan','surface','zilTunnels','surfaceShops'].includes(kind),'Нет такой локации.');requireFreeLocation(s,kind);requireThat(!activeSpecialLocation(s,kind),'Особую локацию можно пройти только один раз за появление.');requireLocationLevel(hero,kind);requireThat(Number.isInteger(total)&&total>=2&&total<=5,'Выбери от 2 до 5 прохождений.');requireThat([50,30,15].includes(threshold),'Выбери порог здоровья.');requireThat(hero.hp/effectiveMaxHp(hero)>=threshold/100,'Здоровье уже ниже выбранного порога.');const seeds=Array.from({length:total},()=>Math.floor(random()*4294967296)),worker=clone(hero);worker.job=null;const run=makeRun(s,worker,kind,now,seeds[0]);hero.repeatPreferences={...hero.repeatPreferences,[kind]:{total,threshold}};hero.job={kind:'series',location:kind,total,threshold,seeds,worker,initial:clone(worker),run,phase:'running',completed:0,loot:{},money:0,nationalityBonus:0,xp:0,reports:[],startedAt:now,endsAt:run.endsAt};addHistory(s,`Серия: ${locationName(kind)}, ${total} прохождений.`,now);break;}
 case 'stopSeries':{requireThat(h?.job?.kind==='series'&&h.job.phase==='break','Прервать можно только во время передышки.');stopSeries(h.job,'Остановлено игроком');break;}
 case 'repeatHero':{requireThat(h&&ready(h.job,now),'Результат ещё не готов.');const kind=h.job.kind==='series'?h.job.location:h.job.kind;requireThat(kind!=='rest','Отдых запускается отдельно, без повторов.');requireThat(!h.job.special&&!h.job.reports?.some(run=>run.special),'Особую локацию нельзя повторить.');const special=Boolean(activeSpecialLocation(s,kind));requireThat(special===Boolean(action.special),'Сценарий изменился. Проверь кнопку в отчёте.');requireThat(!(isCombatRun(h.job)&&!h.job.result.alive)&&!h.job.worker?.dead,'Сначала восстанови героя.');const job=h.job;
 const claimed=act(s,{type:'claimHero',heroId:h.id},now,random);
 const next=job.kind==='series'&&!special
  ?{type:'startSeries',location:kind,total:job.total,threshold:job.threshold,heroId:h.id}
  :{type:kind,heroId:h.id};
 return act(claimed,next,now,random);}
 case 'surfaceShops':{
  const hero=idleHero(s);
  requireFreeLocation(s,'surfaceShops');
  requireLocationLevel(hero,'surfaceShops');
  hero.job=makeRun(s,hero,'surfaceShops',now,Math.floor(random()*4294967296));
  addHistory(s,hero.name+' отправился осматривать ближайшие магазины. Потрачено 2 фильтра.',now);
  break;
 }
 case 'zilTunnels':{
  const hero=idleHero(s);
  requireFreeLocation(s,'zilTunnels');
  requireLocationLevel(hero,'zilTunnels');
  hero.job=makeRun(s,hero,'zilTunnels',now,Math.floor(random()*4294967296));
  addHistory(s,hero.name+' отправился в тоннели ЗИЛ. Потрачено 2 фильтра.',now);
  break;
 }
 case 'surface':{const hero=idleHero(s);requireFreeLocation(s,'surface');requireLocationLevel(hero,'surface');hero.job=makeRun(s,hero,'surface',now,Math.floor(random()*4294967296));addHistory(s,`${hero.name} вышел на поверхность. Потрачен фильтр.`,now);break;}
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
 case 'help':{const hero=idleHero(s);requireLocationLevel(hero,'help',activeSpecialLocation(s,'help'));requireFreeLocation(s,'help');hero.job=makeRun(s,hero,'help',now,Math.floor(random()*4294967296));addHistory(s,`${hero.name} помогает на станции.`,now);break;}
 case 'acceptToothQuest':{
  requireThat(!s.toothQuest,'Квест уже принят или выполнен.');
  s.toothQuest='accepted';
  addHistory(s,'Квест Смотрителя станции: добыть золотой зуб.',now);break;
 }
 case 'acceptKeeperQuest':{
  const q=keeperQuestView(s);
  requireThat([2,4,5,6].includes(q.stage)&&q.status==='offered','Этот квест сейчас недоступен.');
  s.keeperQuest={stage:q.stage,status:'accepted',progress:0,acceptedAt:now};
  if(q.stage===5)s.alexeyMet=true;
  addHistory(s,`Принят квест Смотрителя: ${q.title}.`,now);break;
 }
 case 'finishKeeperQuest':{
  const q=keeperQuestView(s);
  requireThat([2,4,5].includes(q.stage)&&q.status==='accepted'&&q.progress>=q.target,'Условия квеста ещё не выполнены.');
  const reward=npcQuestReward(s,q.reward??0);
  s.money+=reward;
  if(q.stage===5){receive(s,[{item:'velocipedel',qty:1,origin:'quest'}]);s.unlockedProfessions=[...new Set([...(s.unlockedProfessions??[]),'heavy'])];}
  s.keeperQuest={stage:q.stage+1,status:'offered',progress:0};
  addHistory(s,`Смотритель: ${q.title}. ${reward?'Получено '+reward/10+' A.':'Квест выполнен.'}`,now);break;
 }
 case 'choosePlayerRole':{
  requireThat(keeperQuestView(s).stage===3&&!s.playerRole,'Сейчас нельзя выбирать роль.');
  requireThat(Object.hasOwn(PLAYER_ROLES,action.role),'Выбери, кто ты.');
  s.playerRole=action.role;s.shekels=action.role==='shekel'?10:0;s.people=0;s.batteries=0;if(action.role==='pin')s.researchUnlocks=[...new Set([...(s.researchUnlocks??[]),'gauss'])];
  if(action.role==='sova')for(const hero of s.heroes)if((hero.profession??'saboteur')==='saboteur')hero.rewardPerkUnlocks=[...new Set([...(hero.rewardPerkUnlocks??[]),'dual-wield'])];
  s.keeperQuest={stage:4,status:'offered',progress:0};
  addHistory(s,`Выбран путь: ${PLAYER_ROLES[action.role].title}.`,now);break;
 }
 case 'turnInToothQuest':{
  requireThat(s.toothQuest==='accepted','Сначала прими квест Смотрителя.');
  removeItem(s,'tooth',1);
  s.money+=npcQuestReward(s,300);
  s.toothQuest='completed';
  addHistory(s,'Смотритель станции принял золотой зуб. Награда 30 A.',now);break;
 }
 case 'rest': {
  const hero=idleHero(s);
  const restType=action.restType??'station';
  requireThat(Object.hasOwn(REST_OPTIONS,restType),'Нет такого варианта отдыха.');
  const option=REST_OPTIONS[restType];
  requireThat(hero.hp<effectiveMaxHp(hero)||needsAdventureRecovery(hero),'Здоровье уже полное.');
  pay(s,option.cost);
  hero.job={kind:'rest',restType,startedAt:now,endsAt:now+option.seconds*1000,healing:option.healing(hero)};
  if(restType==='stationFull'){
   const quote=fullRestQuote(hero);
   Object.assign(hero.job,{endsAt:now+quote.seconds*1000,healing:0,cycleHealing:option.healing(hero),cycleStartedAt:now,cycleEndsAt:now+option.seconds*1000,completedCycles:0,paid:option.cost,fullRestDone:false});
  }
  if((restType==='station'||restType==='stationFull')&&!s.bobrovMet){
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
  job.restoresAdventureAttributes=job.restType==='stationFull'?(job.completedCycles??0)>0:fraction>=1;
  if(job.restType==='stationFull'){
   if(!job.fullRestDone){
    const cycleFraction=Math.min(1,Math.max(0,(now-job.cycleStartedAt)/(job.cycleEndsAt-job.cycleStartedAt)));
    job.healing=Math.min(effectiveMaxHp(h)-h.hp,job.healing+job.cycleHealing*cycleFraction);
   }
   job.fullRestDone=true;
  }else job.healing*=fraction;
  job.endsAt=now;
  return act(s,{type:'claimHero',heroId:h.id},now,random);
 }
 case 'claimHero':{if(h&&!h.job&&h.lastRest)break;requireThat(h&&ready(h.job,now),'Результат ещё не готов.');const firstNewLevel=h.level+1,job=h.job,bonus=claimBonus(h,job),nationalBonus=nationalityClaimBonus(h,job);if(job.kind!=='series'&&job.kind!=='rest')spendStrengthBonus(h);if(job.kind==='series'){receive(s,Object.entries(job.loot).map(([item,qty])=>({item,qty})));s.money+=job.money;for(const key of ['hp','maxHp','level','xp','wounds','bandages','dressingKits','medicKits','grenades','molotovs','tinGrenades','dead','leaderKebabRuns','stimulants','activeStimulant','extraPerkChoices','nationalityPerkMilestones','weaponFamiliarity','rangedWeaponFamiliarity','heavyAmmo'])h[key]=job.worker[key];addHistory(s,`${locationName(job.location)}: серия завершена, +${job.xp} опыта, +${job.money/10} A. ${job.reason}.`,now);}else if(job.kind==='help'&&!job.special){const e=job.result;receive(s,Object.entries(e.loot).map(([item,qty])=>({item,qty})));s.money+=e.money;levelUp(h,e.xp);if(h.wounds>0)h.wounds--;addHistory(s,`Помощь на станции завершена: +${e.xp} опыта, +${e.money/10} A.`,now);}else if(job.kind==='rest'){const completed=job.restoresAdventureAttributes??(job.restType==='stationFull'?(job.completedCycles??0)>0:now>=job.endsAt),full=job.restType==='stationFull'&&h.hp+job.healing>=effectiveMaxHp(h)-1e-9;if(completed&&needsAdventureRecovery(h))restoreAdventureAttributes(h);h.hp=full&&completed?effectiveMaxHp(h):Math.min(effectiveMaxHp(h),h.hp+job.healing);addHistory(s,`Отдых завершён: восстановлено до ${Math.round(h.hp)} HP.`,now);}else {const e=job.result;if(!e.alive){h.dead=true;h.hp=0;h.stimulants=0;h.bandages=0;h.dressingKits=0;h.medicKits=0;h.grenades=0;h.molotovs=0;h.tinGrenades=0;addHistory(s,'Диверсант погиб. Добыча и опыт потеряны.',now);}else {receive(s,Object.entries(e.loot).map(([item,qty])=>({item,qty})));s.money+=e.money??0;h.hp=e.hp;h.bandages=e.bandagesRemaining;h.dressingKits=e.dressingKitsRemaining??0;h.medicKits=e.medicKitsRemaining??0;h.grenades=e.grenadesRemaining??0;h.molotovs=e.molotovsRemaining??0;h.tinGrenades=e.tinGrenadesRemaining??0;levelUp(h,e.xp);if(h.wounds>0)h.wounds--;addHistory(s,`Локация пройдена: +${e.xp} опыта, побеждено противников: ${e.killed}.`,now);}}if(nationalBonus){s.money+=nationalBonus;addHistory(s,`${h.name}: национальный бонус +${nationalBonus/10} A.`,now);}if(bonus){s.money+=bonus;addHistory(s,`${h.name}: «Жадный», дополнительно +${bonus/10} A.`,now);}const dose=jobRadiation(job);
 if(dose){
  h.radiation=(h.radiation??0)+dose;
  h.hp=Math.min(h.hp,effectiveMaxHp(h));
  addHistory(s,`${h.name}: Облучён (${h.radiation}).`,now);
 }
 if(job.kind!=='series')finishStimulant(h,job);h.hp=Math.min(h.hp,effectiveMaxHp(h));if(!h.dead&&h.mark==='regeneration'&&job.kind!=='rest')h.hp=effectiveMaxHp(h);
 if(!h.dead){s.filters+=job.kind==='series'?job.filters??0:job.result?.filters??0;paySideJob(s,h,firstNewLevel,now);}if(job.kind!=='series'&&job.kind!=='rest'){const healed=healAtMedicTent(s,h,job.endsAt);if(healed)addHistory(s,'Палатка медика · '+h.name+': +'+Math.round(healed*10)/10+' HP.',now);}h.lastHeavyReload=job.kind==='rest'?null:settleHeavyAmmo(s,h,job.kind==='series'?{heavyAmmoRemaining:job.worker.heavyAmmo,heavyAmmoSpent:job.reports.reduce((total,run)=>total+(run.result?.heavyAmmoSpent??0),0)}:job.result,now);recordKeeperProgress(s,h,job);const completedLocation=job.kind==='series'?job.location:job.kind;if(['mission','help','patrol','technopark','caravan','surface','zilTunnels','surfaceShops'].includes(completedLocation)&&!h.dead&&(job.kind!=='series'||job.completed>0)){
 h.lastCompletedLocation=completedLocation;
 const firstRatAlarm=completedLocation==='help'&&(job.special&&job.result?.alive||job.kind==='series'&&job.reports.some(run=>run.kind==='help'&&run.special&&run.result?.alive));
 if(firstRatAlarm&&!s.specialFirstRewards?.help){
  receive(s,[{item:'combatStimulator',qty:1,charges:10}]);(s.specialFirstRewards??={}).help=true;
  addHistory(s,'Юрась: за первое успешное отражение нападения крыс получен боевой стимулятор на 10 применений.',now);
 }
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
   if(!s.vasek){s.vasek={level:1,xp:0,relation:0,nextAt:now,visit:null};visit(s,now,random);}
   addHistory(s,'Знакомство с Васьком, торговцем оружием союзной станции. Он вручил записки бывалого торговца.',now);
   addHistory(s,'Первое прохождение каравана. Получены записки бывалого торговца.',now);
  }else if(completedLocation!=='surface'){
   s.filters++;
   addHistory(s,`Первое прохождение: ${locationName(completedLocation)}. Получен фильтр.`,now);
  }
 }
}h.job=null;break;}
 case 'buryHero':{
  requireThat(h?.awaitingBurial&&h.dead&&!h.missingOnMission&&!h.job,'Сначала доставь погибшего героя на станцию.');
  const {stars,level,equipment}=rebirthQuote(s,h);
  const supplies=[['bandages','bandage'],['dressingKits','dressingKit'],['medicKits','medicKit'],['grenades','pipeGrenade'],['molotovs','molotov'],['tinGrenades','tinGrenade']]
   .filter(([field])=>h[field]>0).map(([field,item])=>({item,qty:h[field]}));
  if(h.stimulants>0)supplies.push({item:h.stimulantItem??'combatStimulator',qty:1,charges:h.stimulants,...(h.stimulantQuality?{quality:h.stimulantQuality}:{})});
  receive(s,[...equipment,...supplies]);
  const readyForRebirth=stars<5&&h.level>=level;
  if(stars||readyForRebirth){
   (s.buriedRebirths??=[]).push({stars:stars+Number(readyForRebirth),attributes:clone(h.rebirthAttributes??{})});
  }
  s.heroes=s.heroes.filter(hero=>hero.id!==h.id);
  s.hero=s.heroes.find(hero=>!hero.dead)??s.heroes[0]??null;
  s.selectedHeroId=s.hero?.id??null;
  addHistory(s,h.name+': похоронен достойно.',now);
  break;
 }
 case 'revive':{requireThat(!h?.awaitingBurial,'Погибшего героя можно похоронить.');requireThat(!h?.missingOnMission,'Герой погиб и пропал на задании. Восстановление пока невозможно.');requireThat(h&&h.dead&&!h.job,'Герой не нуждается в восстановлении.');if(action.paid){pay(s,200*h.level);h.hp=effectiveMaxHp(h);h.wounds=0;}else{h.hp=1;h.wounds=4;}h.dead=false;h.bandages=0;h.dressingKits=0;h.medicKits=0;h.grenades=0;h.molotovs=0;h.tinGrenades=0;addHistory(s,action.paid?'Герой восстановлен с полным здоровьем.':'Герой восстановлен. Тяжёлые раны: 4 прохождения локаций.',now);break;}
 case 'leaderKebab':{
  const hero=idleHero(s,true);
  removeItem(s,'leaderKebab',1);
  const healing=60+Math.floor(random()*181);
  hero.hp=Math.min(effectiveMaxHp(hero),hero.hp+nationalityHealing(hero,healing));
  hero.leaderKebabRuns=4;
  hero.maxHp=heroMaximumHp(hero);
  break;
 }
 case 'ghoulKebab':{
  const hero=idleHero(s,true);requireThat(hero.hp<effectiveMaxHp(hero),'Здоровье уже полное.');
  removeItem(s,'ghoulKebab',1);
  hero.hp=Math.min(effectiveMaxHp(hero),hero.hp+nationalityHealing(hero,.15*hero.maxHp+7*heroAttributes(hero).strength));
  addHistory(s,'Сталкер съел шашлык из упыря.',now);break;
 }
 case 'mushroomTea':{
  const hero=idleHero(s,true),firstNewLevel=hero.level+1;
  removeItem(s,'mushroomTea',1);
  const removed=Math.min(hero.radiation??0,rng(Math.floor(random()*4294967296)).int(1,4)+heroAttributes(hero).strength);
  hero.radiation=(hero.radiation??0)-removed;
  const previousLoss=hero.permanentHpLoss??0;
  hero.mushroomTeasDrunk=(hero.mushroomTeasDrunk??Math.floor(previousLoss/5))+1;
  hero.permanentHpLoss=previousLoss+3;
  hero.maxHp=Math.max(1,hero.maxHp-3);
  const xp=heroExperience(hero,50);
  levelUp(hero,xp);
  hero.hp=Math.min(hero.hp,effectiveMaxHp(hero));
  paySideJob(s,hero,firstNewLevel,now);
  addHistory(s,`Чай из грибов: снято ${removed} РАД, +${xp} опыта, −3 к максимуму HP.`,now);break;
 }
 case 'broth':{const hero=idleHero(s,true);requireThat(hero.hp<effectiveMaxHp(hero),'Здоровье уже полное.');removeItem(s,'broth',1);hero.hp=Math.min(effectiveMaxHp(hero),hero.hp+nationalityHealing(hero,.1*hero.maxHp+5*heroConfig(s).hero.strength));addHistory(s,'Сталкер выпил отвар из крысы.',now);break;}
 case 'medicKit':
 case 'dressingKit':
 case 'bandage':{const hero=idleHero(s,true);requireThat(hero.hp<effectiveMaxHp(hero),'Здоровье уже полное.');const item=action.type,key=item==='bandage'?'bandages':item==='medicKit'?'medicKits':'dressingKits';if(hero[key]>0)hero[key]--;else removeItem(s,item,1);const heal=bandageHeal(heroConfig(s,hero),rng(Math.floor(random()*4294967296)),hero.hp,item);hero.hp=heal.hp;addHistory(s,`${ITEMS[item].name}: +${Math.round(heal.healed)} HP.`,now);break;}
 case 'fillPartySupplies':{
  requireThat(['medicine','grenades'].includes(action.category),'Неверный раздел расходников.');
  const ids=action.heroIds;
  requireThat(Array.isArray(ids)&&ids.length>=1&&ids.length<=2&&new Set(ids).size===ids.length,'Выбери одного или двух разных героев.');
  for(const id of ids){
   const hero=s.heroes.find(member=>member.id===id);
   requireThat(hero&&!hero.dead&&!hero.job&&!radiationBlocksMissions(hero)&&!needsAdventureRecovery(hero),'Один из выбранных героев недоступен.');
  }
  const selectedHeroId=s.selectedHeroId;
  let filled=s;
  for(const id of ids){
   const hero=filled.heroes.find(member=>member.id===id);
   if(bestSuppliesPlan(filled,hero,action.category).length){
    filled=act(filled,{type:'fillSupplies',category:action.category,heroId:id},now,random);
   }
  }
  requireThat(filled!==s,'Нет доступных расходников или слоты уже заполнены.');
  filled.selectedHeroId=selectedHeroId;
  filled.hero=filled.heroes.find(hero=>hero.id===selectedHeroId)??null;
  return filled;
 }
 case 'fillSupplies':{
  requireThat(action.category==null||['medicine','grenades'].includes(action.category),'Неверный раздел расходников.');
  const hero=idleHero(s,true),plan=bestSuppliesPlan(s,hero,action.category);
  requireThat(plan.length,'Нет доступных расходников или слоты уже заполнены.');
  let filled=s;
  for(const entry of plan)filled=act(filled,{type:'pack',...entry},now,random);
  addHistory(filled,`${hero.name}: ${action.category==='medicine'?'лечение':action.category==='grenades'?'гранаты':'лечение и гранаты'} пополнены.`,now);
  return filled;
 }
 case 'pack': {
  const hero=idleHero(s,true);
  const item=action.item??'bandage';
  requireThat(['bandage','dressingKit','medicKit'].includes(item)||ITEMS[item]?.type==='grenade','Этот предмет нельзя взять с собой.');
  const grenade=ITEMS[item].type==='grenade';
  const key={pipeGrenade:'grenades',molotov:'molotovs',tinGrenade:'tinGrenades',bandage:'bandages',dressingKit:'dressingKits',medicKit:'medicKits'}[item];
  const carried=grenade?(hero.grenades??0)+(hero.molotovs??0)+(hero.tinGrenades??0):hero.bandages+(hero.dressingKits??0)+(hero.medicKits??0);
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
 case 'loadHeavyAmmo':
 case 'toggleHeavyReload':{
  const hero=idleHero(s,true);
  requireThat(ITEMS[hero.rangedWeapon]?.usesHeavyAmmo,'Сначала экипируй тяжёлое оружие.');
  if(action.type==='toggleHeavyReload'){
   hero.autoHeavyReload=!hero.autoHeavyReload;
   hero.heavyAmmoTarget=Math.max(hero.heavyAmmoTarget??0,hero.heavyAmmo??0);
  }else{
   requireThat(Number.isSafeInteger(action.qty)&&action.qty>0&&action.qty<=Math.floor(s.money/10),'Выбери доступное количество патронов.');
   pay(s,action.qty*10);
   hero.heavyAmmo=(hero.heavyAmmo??0)+action.qty;
   hero.heavyAmmoTarget=hero.heavyAmmo;
  }
  break;
 }
 case 'equip':{const hero=idleHero(s,true);const row=s.inventory.find(x=>x.uid===action.uid);requireThat(row,'Предмета уже нет.');const item=ITEMS[row.item];requireThat(canUseEquipment(hero,row),`Требуется ${equipmentRequiredLevel(row)}-й уровень героя.`);requireThat(['body','weapon','accessory'].includes(item.type),'Этот предмет нельзя надеть.');requireThat(!action.slot||['main','ranged'].includes(action.slot),'Неверный слот.');const key=item.type==='accessory'?'accessory':item.type==='body'?'body':action.slot==='main'?'weapon':action.slot==='ranged'?'rangedWeapon':item.combat==='ranged'?'rangedWeapon':'weapon';requireThat(key!=='rangedWeapon'||item.combat==='ranged'||heroHasDualWield(hero)&&item.combat==='melee','В дополнительный слот можно только дистанционное оружие.');requireThat(!item.rangedSlotOnly||key==='rangedWeapon','Это оружие можно надеть только в дополнительный слот.');const target=item.twoSlots?'weapon':key;
 const displaced=item.twoSlots?['weapon','rangedWeapon']:key==='rangedWeapon'&&ITEMS[hero.weapon]?.twoSlots?['weapon',key]:[key];
 removeRow(s,row.uid,1);
 receive(s,displaced.filter(slot=>hero[slot]).map(slot=>({...hero[slot+'Details'],item:hero[slot],qty:1})));
 for(const slot of displaced){hero[slot]=null;hero[slot+'Details']=null;if(['weapon','rangedWeapon'].includes(slot))hero[slot+'Familiarity']=0;}
 hero[target]=row.item;hero[target+'Details']={...clone(row),qty:1};break;}
 case 'moveWeapon':{const hero=idleHero(s,true);requireThat(['main','ranged'].includes(action.slot),'Неверный слот.');const from=action.slot==='main'?'weapon':'rangedWeapon',to=from==='weapon'?'rangedWeapon':'weapon',moving=hero[from],familiarity=hero[from+'Familiarity']??0,previousFamiliarity=hero[to+'Familiarity']??0,details=clone(hero[from+'Details']??null);requireThat(moving,'Слот пуст.');requireThat(to!=='weapon'||!ITEMS[moving]?.rangedSlotOnly,'Это оружие можно надеть только в дополнительный слот.');requireThat(!ITEMS[hero.weapon]?.twoSlots,'Это оружие занимает оба слота.');requireThat(to!=='rangedWeapon'||ITEMS[moving].combat==='ranged'||heroHasDualWield(hero)&&ITEMS[moving].combat==='melee','В дополнительный слот можно только дистанционное оружие.');const previous=hero[to],previousDetails=clone(hero[to+'Details']??null),swap=previous&&!ITEMS[previous].rangedSlotOnly&&(from==='weapon'||ITEMS[previous].combat==='ranged'||heroHasDualWield(hero));if(previous&&!swap)receive(s,[{...previousDetails,item:previous,qty:1}]);hero[to]=moving;hero[to+'Details']=details;hero[from]=swap?previous:null;hero[from+'Details']=swap?previousDetails:null;hero[to+'Familiarity']=familiarity;hero[from+'Familiarity']=swap?previousFamiliarity:0;break;}
 case 'unequipWeapon':{const hero=idleHero(s,true),key=action.slot==='ranged'?'rangedWeapon':'weapon';requireThat(hero[key],'Слот оружия пуст.');receive(s,[{...hero[key+'Details'],item:hero[key],qty:1}]);hero[key]=null;hero[key+'Details']=null;hero[key+'Familiarity']=0;break;}
 case 'unequipAccessory':{const hero=idleHero(s,true);requireThat(hero.accessory,'Дополнительный слот пуст.');receive(s,[{...hero.accessoryDetails,item:hero.accessory,qty:1}]);hero.accessory=null;hero.accessoryDetails=null;break;}
 case 'unequipBody':{const hero=idleHero(s,true);requireThat(hero.body,'Броня не надета.');receive(s,[{...hero.bodyDetails,item:hero.body,qty:1}]);hero.body=null;hero.bodyDetails=null;break;}
 case 'discard':{const row=s.inventory.find(x=>x.uid===action.uid);requireThat(row,'Предмета уже нет.');removeRow(s,row.uid,action.qty??1);break;}
 case 'claimMedicTentIncome':{
  const income=s.medicTentIncome;
  requireThat(hasBuilding(s,'medicTent')&&(income?.money??0)>0,'Палатка пока не принесла дохода.');
  s.money+=income.money;
  s.medicTentIncome={startedAt:now,minutes:0,money:0};
  addHistory(s,'Палатка медика: получено '+income.money/10+' А.',now);
  break;
 }
 case 'appeaseDurenForQuest':
 case 'hireDurenForQuest':{
  requireThat(tradingPostAvailable(s)&&shekelQuestView(s).stage===2&&s.duren&&!s.duren.banned&&!s.shekelQuest.durenPaid,'Подготовка к вылазке сейчас недоступна.');
  const bribe=durenQuestBribe(s);
  if(action.type==='appeaseDurenForQuest'){
   requireThat(bribe>0,'Дурень уже готов к разговору.');
   pay(s,bribe);
   s.duren.relation=DUREN_QUEST_RELATION;
   addHistory(s,'Дурень: отношение +10, можно обсудить вылазку.',now);
  }else{
   requireThat(bribe===0,'Сначала задобри Дурня до отношения +10.');
   requireThat(s.shekels>=DUREN_QUEST_FEE,'Не хватает шекелей.');
   s.shekels-=DUREN_QUEST_FEE;
   s.shekelQuest.durenPaid=true;
   addHistory(s,'На карте открылась вылазка с Дурнем.',now);
  }
  break;
 }
 case 'repairTechnoparkRoof':{
  const quest=keeperQuestView(s);
  requireThat(quest.stage===6&&quest.status==='accepted'&&s.completedLocations?.repairMaterials&&!s.completedLocations.technoparkRoof,'Сначала найди материалы для ремонта.');
  s.completedLocations.technoparkRoof=true;
  s.keeperQuest={stage:7,status:'completed',progress:0};
  addHistory(s,'Крыша Технопарка отремонтирована.',now);
  break;
 }
 case 'claimSovaQuestReward':
 case 'claimShekelQuestReward':{
  const sova=action.type==='claimSovaQuestReward';
  requireThat(sova?s.playerRole==='sova'&&s.completedLocations?.technoparkRoof&&!s.sovaQuest?.reward:s.playerRole==='shekel'&&shekelQuestView(s).ready,sova?'Сначала отремонтируй крышу Технопарка.':'Сначала пусти в оборот 200 шекелей.');
  requireThat(['experience','recruit','money'].includes(action.reward),'Выбери награду.');
  if(action.reward==='experience'){
   for(const hero of getHeroes(s))grantShekelRewardXp(hero,SHEKEL_REWARD_XP);
  }else if(action.reward==='recruit')s.shekelFreeHire=true;
  else s.money+=20000;
  if(sova)s.sovaQuest={stage:2,reward:action.reward};
  else s.shekelQuest={stage:2,reward:action.reward};
  addHistory(s,sova?'Сова: крыша Технопарка отремонтирована. Награда получена.':'Шекель: Торговый пост развёрнут. Награда получена.',now);
  break;
 }
 case 'claimShekelIncome':{
  requireThat(tradingPostAvailable(s)&&(s.shekelIncome??0)>0,'Дохода пока нет.');
  s.money+=s.shekelIncome;
  s.shekelIncome=0;
  break;
 }
 case 'upgradeTradingPost':{
  requireThat(tradingPostAvailable(s),'Сначала построй торговый пост.');
  requireThat(now>=(s.tradingPostUpgradeEndsAt??0),'Общее улучшение торгового поста ещё на кулдауне.');
  const kind=action.upgrade,quote=tradingPostUpgradeQuote(s,kind);
  requireThat(quote&&!quote.maxed,'Улучшение недоступно или уже на максимуме.');
  if(quote.currency==='shekel'){
   requireThat((s.shekels??0)>=quote.cost,'Не хватает шекелей.');
   s.shekels-=quote.cost;
  }else pay(s,quote.cost);
  const upgrades=s.tradingPostUpgrades??={};
  upgrades[kind]=(upgrades[kind]??0)+1;
  s.tradingPostUpgradeEndsAt=now+quote.seconds*1000;
  break;
 }
 case 'produceShekels':{
  const qty=action.qty,unitCost=shekelUnitCost(s);
  requireThat(tradingPostAvailable(s),'Сначала построй торговый пост.');
  requireThat(!s.shekelProduction,'Шекели уже производятся.');
  requireThat(Number.isSafeInteger(qty)&&qty>0&&qty<=Math.floor(s.money/unitCost),'Выбери доступное количество шекелей.');
  pay(s,qty*unitCost);
  s.shekelProduction={qty,startedAt:now,endsAt:now+qty*shekelUnitMs(s)};
  break;
 }
 case 'demolishStationBuilding':{
  const id=action.building,job=s.stationConstruction?.[id];
  requireThat(stationBuildingAvailable(s,id)&&(hasBuilding(s,id)||job&&!job.demolition),'Эту постройку нельзя снести.');
  if(s.stationBuildings)delete s.stationBuildings[id];
  (s.stationConstruction??={})[id]={startedAt:now,endsAt:now+STATION_BUILD_SECONDS*1000,demolition:true};
  if(id==='medicTent'){
   delete s.medicTentIncome;
   delete s.medicTentBuiltAt;
  }
  for(const hero of getHeroes(s)){
   const series=hero.job?.kind==='series'?hero.job:null;
   for(const member of [hero,series?.worker,series?.initial]){
    if(member?.hobby?.id!==id)continue;
    const scale=member.hobby.option==='endurance'?1.1:1;
    delete member.hobby;
    member.maxHp=heroMaximumHp(member);
    member.hp=Math.min(effectiveMaxHp(member),member.hp/scale);
   }
  }
  addHistory(s,'Начат снос: '+STATION_BUILDINGS[id].name+'.',now);
  break;
 }
 case 'startStationBuilding':{
  const id=action.building;
  requireThat(stationBuildingAvailable(s,id),'Эта постройка пока недоступна.');
  requireThat(!s.stationBuildings?.[id]&&!s.stationConstruction?.[id],'Эта постройка уже занята.');
  const building=STATION_BUILDINGS[id];
  requireThat(building.role||stationBuildingCount(s)<stationBuildingLimit(s),'Нет свободных мест для построек.');
  pay(s,stationBuildingCost(s,id));
  for(const [item,qty] of Object.entries(building.ingredients))removeItem(s,item,qty);
  (s.stationConstruction??={})[id]={startedAt:now,endsAt:now+STATION_BUILD_SECONDS*1000};
  addHistory(s,'Начато строительство: '+building.name+'.',now);
  break;
 }
 case 'startAutoProduction':{
  const {recipe:id,qty,keep}=action;
  requireThat(s.alexeyMet&&!s.autoProduction&&autoRecipeAvailable(s,id),'Автопроизводство недоступно.');
  const recipe=RECIPES[id];
  requireThat(!s.productions[recipe.production].job,'Это производство занято.');
  requireThat(Number.isSafeInteger(qty)&&qty>0&&qty<=maxAutoQuantity(s,id),'Выбери доступное количество повторов.');
  requireThat(Array.isArray(keep)&&keep.every(q=>Number.isInteger(q)&&q>=1&&q<=4),'Выбери качество от +1 до +4.');
  s.autoProduction={recipe:id,total:qty,keep:[...new Set(keep)],startedAt:now,endsAt:now+autoProductionSeconds(recipe,qty)*1000,completed:0,money:0,xp:0,items:[],run:startCraftRun(s,id,1,now,random,'auto')};
  break;
 }
 case 'stopAutoProduction':{
  const job=s.autoProduction;
  requireThat(job&&!job.done,'Автопроизводство уже завершено.');
  job.done=true;job.reason='stopped';job.run=null;
  break;
 }
 case 'claimAutoProduction':{
  const job=s.autoProduction;
  requireThat(job?.done,'Автопроизводство ещё идёт.');
  receive(s,job.items);
  s.money+=job.money;
  addHistory(s,`Автопроизводство: ${RECIPES[job.recipe].name} · ${job.completed}/${job.total} · +${job.money/10} А.`,now);
  s.autoProduction=null;
  break;
 }
 case 'craft':{const recipe=RECIPES[action.recipe];requireThat(recipe&&!recipe.upgrade&&!recipe.legacy,'Рецепт ещё не описан.');const production=s.productions[recipe.production];requireThat(!production.job&&!autoProductionBusy(s,recipe.production),'Это производство занято.');requireThat(production.level>=recipe.level,'Недостаточный уровень производства.');requireThat(!action.max||recipe.batch,'В этом рецепте нельзя выбрать количество.');const qty=recipe.batch?(action.max?maxCraftQuantity(s,action.recipe):(action.qty??1)):1;requireThat(!action.max||qty>0,'Не хватает ресурсов для производства.');requireThat(Number.isSafeInteger(qty)&&qty>0&&qty<=1000,'Выбери количество от 1 до 1000.');for(const [item,count]of Object.entries(recipe.ingredients))requireThat(countItem(s,item)>=count*qty,'Не хватает материалов.');production.job=startCraftRun(s,action.recipe,qty,now,random);
 addHistory(s,`Начато изготовление: ${recipe.name} ×${qty}.`,now);break;}
 case 'upgrade':{
  const row=s.inventory.find(item=>item.uid===action.uid);
  beginUpgrade(s,action.recipe,row,now,random,true);
  break;
 }
 case 'retryUpgrade':{
  requireThat(canRetryUpgrade(s,action.production,now),'Повтор недоступен: не хватает ресурсов или рецепт уже заменён.');
  const production=s.productions[action.production],job=production.job,recipe=RECIPES[job.recipe];
  const xp=craftExperience(recipe,job.productionLevel??production.level);
  gainProductionXp(production,action.production,xp);
  production.job=null;
  beginUpgrade(s,job.recipe,job.target,now,random,false);
  break;
 }
 case 'claimCraft':{const production=s.productions[action.production];requireThat(production&&ready(production.job,now),'Изделие ещё не готово.');const job=production.job,recipe=RECIPES[job.recipe],qty=job.qty??1;let output;
 if(recipe.upgrade){output=clone(job.target);if(job.success)output=upgradedItem(job.target,job.recipe);if(job.success)output.rarity=RARITIES[Math.max(itemRarityRank(output),job.rarityRank??0)];receive(s,[output]);addHistory(s,job.success?`Улучшение удалось: ${itemName(output)}.`:`Улучшение не удалось: ${itemName(output)} возвращён без изменений.`,now);}else if(job.successes!=null){
  const failed=qty-job.successes;
  const returned=recipe.refundOnFailure&&failed>0?Object.entries(recipe.ingredients).map(([item,count])=>({item,qty:count*failed})):[];
  if(recipe.output==='gasMaskFilter')s.filters+=(job.outputs??[{qty:job.successes}]).reduce((sum,row)=>sum+row.qty,0);
  else receive(s,[...(job.outputs??[{item:recipe.output,qty:job.successes}]),...returned]);
  addHistory(s,`${recipe.name}: успешно ${job.successes} из ${qty}.${returned.length?' Материалы за провалы возвращены.':''}`,now);
 }else{receive(s,job.outputs??[{item:recipe.output,qty}]);addHistory(s,`Изготовлено: ${recipe.name} ×${qty}.`,now);}
 const level=job.productionLevel??production.level;
 const xp=craftExperience(recipe,level,qty,craftQualityXp(job));
 const qualityXp=xp-craftExperience(recipe,level,qty);
 gainProductionXp(production,recipe.production,xp);
 if(qualityXp)addHistory(s,`Качество: дополнительно +${qualityXp} опыта производства.`,now);
 production.job=null;break;}
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
 case 'sell':{const row=s.inventory.find(x=>x.uid===action.uid);requireThat(row,'Предмета уже нет.');const qty=action.all&&ITEMS[row.item].stack?row.qty:(action.qty??1);requireThat(Number.isInteger(qty)&&qty>0&&qty<=row.qty,'Неверное количество товара.');const slot=s.shelves.findIndex(x=>!x);requireThat(slot>=0,'Все полки заняты.');requireThat(Number.isInteger(ITEMS[row.item].value),'Цена предмета ещё не задана.');const details=clone(row),price=salePrice(s,row,qty);removeRow(s,row.uid,qty);s.shelves[slot]={...details,id:uid(),item:row.item,qty,price,startedAt:now,endsAt:now+price*200};break;}
 case 'auctionSales':{
  const discount=auctionDiscount(s);
  requireThat(tradingPostAvailable(s)&&discount!==null,'Сначала открой аукцион в торговом посту.');
  const slots=s.shelves.flatMap((sale,index)=>sale&&!sale.auctioned&&!ready(sale,now)?[index]:[]);
  requireThat(slots.length,'Нет товаров для аукциона.');
  let proceeds=0;
  for(const slot of slots){
   proceeds+=roundRatio(s.shelves[slot].price,100-discount);
   s.shelves[slot]=null;
  }
  s.money+=proceeds;
  addHistory(s,`Получено с аукциона: ${proceeds/10} A.`,now);
  break;
 }
 case 'claimAllSales':
 case 'claimSale':{
  const slots=action.type==='claimAllSales'
   ?s.shelves.flatMap((sale,index)=>ready(sale,now)?[index]:[])
   :ready(s.shelves[action.slot],now)?[action.slot]:[];
  requireThat(slots.length,action.type==='claimAllSales'?'Нет завершённых продаж.':'Товар ещё не продан.');
  let proceeds=0;
  for(const slot of slots){
   proceeds+=s.shelves[slot].price;
   s.shelves[slot]=null;
  }
  s.money+=proceeds;
  addHistory(s,`Получено за продажу: ${proceeds/10} A.`,now);
  break;
 }
 case 'cancelSale':{const sale=s.shelves[action.slot];requireThat(sale,'Полка пуста.');requireThat(!sale.auctioned&&!ready(sale,now),'Товар уже продан или выставлен на аукцион.');receive(s,[{...sale,item:sale.item,qty:sale.qty}]);s.shelves[action.slot]=null;break;}
 case 'openYuras':openYuras(s,now,random,action.merchant);break;
 case 'trade':{const merchant=action.merchant??'yuras',npc=Object.hasOwn(MERCHANTS,merchant)?s[merchant]:null,v=npc?.visit;requireThat(v&&v.id===action.visitId,'Этот визит уже завершён.');requireThat(!npc.banned&&(npc.relation??0)>-10,'Торговец отказывается торговать.');requireThat(TRADE_EFFECTS[action.modifier],'Неверный вариант торга.');const offer=v.offers?.[action.offer];requireThat(offer,'Предложение недоступно.');const quote=tradeQuote(offer,offer.qty,action.modifier,v.role,merchant,s);if(v.role==='seller'){requireThat(canReceive(s,[offer]),'В инвентаре не хватает места.');if(quote.shekelPrice!==null){requireThat((s.shekels??0)>=quote.shekelPrice,'Не хватает шекелей.');s.shekels-=quote.shekelPrice;}else pay(s,quote.price);const {currency,...goods}=offer;receive(s,[{...goods,origin:'bought'}]);}else{requireThat(tradeQuote(offer,offer.qty,0,'buyer',merchant,s).price<=(v.buyBudget??merchantBuyBudget(s,merchant)),'Торговец не готов заплатить столько за один предмет.');const row=s.inventory.find(x=>x.uid===offer.inventoryUid);requireThat(row&&row.item===offer.item&&row.qty>=offer.qty,'Этого предмета уже нет в инвентаре.');removeRow(s,row.uid,offer.qty);s.money+=quote.price;}npc.relation=quote.relation;const previousLevel=npc.level;gainMerchantXp(npc,quote.xp);if(npc.level>previousLevel)addHistory(s,`${MERCHANTS[merchant].name}: уровень ${npc.level}.`,now);npc.nextAt=now+quote.cooldown;npc.visit=null;addHistory(s,`Сделка · ${MERCHANTS[merchant].name}: ${ITEMS[offer.item].name}, ${quote.shekelPrice===null?quote.price/10+' A':quote.shekelPrice+' ₪'}.`,now);break;}
 case 'bribeMerchant':{const id=action.merchant,npc=Object.hasOwn(MERCHANTS,id)?s[id]:null;requireThat(npc?.visit&&!npc.banned&&npc.relation===-10,'Задобрить торговца сейчас нельзя.');pay(s,merchantBribeCost(s,id));npc.relation=-8;addHistory(s,MERCHANTS[id].name+': торговец задобрен, отношение −8.',now);break;}
 case 'robMerchant':{const id=action.merchant,npc=Object.hasOwn(MERCHANTS,id)?s[id]:null;requireThat(npc?.visit&&!npc.banned&&npc.relation===-10,'Ограбление сейчас недоступно.');const bandit=s.heroes.find(x=>x.id===action.banditId);requireThat(bandit?.profession==='bandit'&&!bandit.dead&&!bandit.job,'Нужен живой свободный бандит.');const loot=merchantRobberyLoot(s,id);requireThat(canReceive(s,loot),'Освободи место в инвентаре для всей добычи торговца.');const foe=merchantFighter(s,id),f=foe.config.hero,w=ITEMS[foe.hero.weapon];const enemy={name:MERCHANTS[id].name,hp:foe.hero.hp,initiative:f.initiative,stealth:f.perception,agility:f.agility,accuracy:f.accuracy,evasion:f.evasion,armor:f.armor,thermalArmor:f.thermalArmor??0,damageMin:w.min+f.strength*10,damageMax:w.max+f.strength*10,attackName:w.name};const config=heroConfig(s,bandit);config.rat=enemy;const result=battle(config,rng(Math.floor(random()*4294967296)),bandit.hp,{trace:true});bandit.hp=result.hp;bandit.dead=result.hp<=0;if(bandit.dead)for(const key of ['bandages','dressingKits','medicKits','grenades','molotovs','tinGrenades','stimulants'])bandit[key]=0;npc.visit=null;npc.nextAt=now+merchantCooldown(s,id);let stolen=null;if(result.won){receive(s,loot);npc.banned=true;}else{const slots=['weapon','body'].filter(key=>bandit[key]);if(slots.length){const key=slots[Math.min(slots.length-1,Math.floor(random()*slots.length))];stolen={...clone(bandit[key+'Details']??{}),item:bandit[key],qty:1};bandit[key]=null;bandit[key+'Details']=null;addHistory(s,MERCHANTS[id].name+' забрал у бандита: '+itemName(stolen)+'.',now);}}npc.lastRobbery={...result,stolen,banditName:bandit.name,loot:result.won?loot:[],merchant:id};addHistory(s,result.won?bandit.name+' ограбил '+MERCHANTS[id].name+'. Торговец больше не вернётся.':'Так тебе и надо. '+MERCHANTS[id].name+' ушёл до следующего визита, отношение −10.',now);break;}
 case 'banMerchant':{const merchant=action.merchant,npc=Object.hasOwn(MERCHANTS,merchant)?s[merchant]:null;requireThat(npc?.visit&&!npc.banned&&npc.relation===-10,'Нельзя прогнать торговца.');npc.banned=true;npc.visit=null;addHistory(s,MERCHANTS[merchant].name+' прогнан со станции навсегда.',now);break;}
 case 'promoteShekels':{const merchant=action.merchant,npc=Object.hasOwn(MERCHANTS,merchant)?s[merchant]:null;requireThat(s.playerRole==='shekel'&&npc?.visit&&!npc.banned&&!npc.ours,'Продвижение недоступно.');requireThat(!npc.visit.promotionAttempted,'В этот визит проверка уже была.');const roll=Math.floor(random()*20)+1,relation=npc.relation??0,total=roll+relation;npc.visit.promotionAttempted=true;npc.lastPromotion={roll,relation,total};if(total>=20)npc.ours=true;addHistory(s,'Продвигать шекели · '+MERCHANTS[merchant].name+': '+roll+' + ('+relation+') = '+total+(npc.ours?' · Наш.':' · Неудача.'),now);break;}
 case 'dismissYuras':{
  const merchant=action.merchant??'yuras',npc=Object.hasOwn(MERCHANTS,merchant)?s[merchant]:null;
  requireThat(npc?.visit,'Торговец уже ушёл.');
  npc.visit=null;npc.nextAt=now+merchantCooldown(s,merchant);
  addHistory(s,`${MERCHANTS[merchant].name} ушёл без сделки.`,now);break;
 }
 default:throw new Error('Неизвестное действие.');
 }if(action.type==='interactiveChoice'&&s.interactiveMission&&!s.interactiveMission.pendingCombat){adventureRegeneration(s,s.interactiveMission,'step:'+action.node+':'+action.choice);}advanceSpecialLocations(s,now);s.updatedAt=now;return s;
}


// Nationalities are versioned independently from saved game version 1.
export function nationalityOffer(state,action,target='hire'){
 const offer=state.nationalityOffers?.[target]?.find(o=>o.id===action.nationalityId);
 requireThat(offer&&NATIONALITIES[offer.id]&&!(state.usedNationalities??[]).includes(offer.id),'Этот вариант национальности недоступен. Открой выбор заново.');return offer;
}
export function prepareNationalityOffers(state,random=Math.random,target='hire'){
 state.nationalityOffers??={};const used=new Set(state.usedNationalities??[]);
 const previous=state.nationalityOffers[target];if(previous?.length&&previous.every(o=>NATIONALITIES[o.id]&&!used.has(o.id)))return previous;
 const pool=Object.keys(NATIONALITIES).filter(id=>!used.has(id));
 for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 return state.nationalityOffers[target]=pool.slice(0,5).map(id=>({id,gender:random()<.5?'male':'female'}));
}
function applyNationality(state,hero,action,target){
 const offer=nationalityOffer(state,action,target),n=NATIONALITIES[offer.id],oldMax=hero.maxHp;
 const missing=Math.max(0,effectiveMaxHp(hero)-hero.hp);
 Object.assign(hero,{nationalityId:offer.id,nationalityVersion:NATIONALITY_VERSION,nationalityBalanceRevision:n.balanceRevision??0,identityId:offer.id,name:n[offer.gender],gender:offer.gender,headwear:n.headwear,nationality:n.nationality,nationalityBonuses:clone(n.bonuses)});
 hero.extraPerkChoices=(hero.extraPerkChoices??0)+(n.bonuses.extraPerks??0);grantNationalityMilestones(hero);
 hero.radiation=(hero.radiation??0)+(n.bonuses.radiation??0);
 receive(state,n.bonuses.startItems??[]);state.money+=(n.bonuses.startMoney??0)-(target==='hire'&&!state.shekelFreeHire?n.bonuses.hireDebt??0:0);state.totalSpent+=(target==='hire'&&!state.shekelFreeHire?n.bonuses.hireDebt??0:0);
 hero.maxHp=heroMaximumHp(hero);hero.hp=Math.max(1,effectiveMaxHp(hero)-missing);
 state.usedNationalities=[...new Set([...(state.usedNationalities??[]),offer.id])];delete state.nationalityOffers[target];
}
export function tradePercent(state,key){return Math.max(0,100+(key==='salePercent'&&hasBuilding(state,'tradingPost')?5:0)+(state?.playerRole==='shekel'?(key==='buyPercent'?-20:10):0)+(state?getHeroes(state).filter(h=>!h.dead).reduce((sum,h)=>sum+(h.nationalityBonuses?.[key]??0),0):0));}
export function npcQuestReward(state,base){return roundRatio(base,100+getHeroes(state).filter(h=>!h.dead).reduce((sum,h)=>sum+(h.nationalityBonuses?.npcQuestPercent??0),0));}
export function nationalProductionModifier(state,recipe,kind){
 const mods=getHeroes(state).filter(h=>!h.dead&&!h.job).map(h=>{const n=h.nationalityBonuses??{};return (n[kind]?.[recipe.production]??0)+(kind==='quality'&&ITEMS[recipe.output]?.type==='food'?(n.foodQuality??0):0);});
 return Math.max(0,...mods)+Math.min(0,...mods);
}
export function recipeQualityChance(state,id){const r=RECIPES[id];return !r||r.upgrade?0:Math.max(0,Math.min(100,qualityChance(state.productions[r.production].level,r.level)+nationalProductionModifier(state,r,'quality')+productionPerkQualityBonus(state,r.production)+(r.production==='science'&&hasBuilding(state,'laboratory')?5:0)));}
function startStimulant(hero,kind){if(kind==='rest'||!(hero.stimulants>0))return;hero.stimulants--;hero.activeStimulant=hero.stimulantItem??'combatStimulator';const effect=stimulantEffects(hero.activeStimulant,hero.stimulantQuality,hero);hero.maxHp=heroMaximumHp(hero);hero.hp=Math.min(effectiveMaxHp(hero),hero.hp*(1+effect.hpPercent/100)+effect.hp);}
function finishStimulant(hero,run){if(!run.stimulant)return;hero.activeStimulant=false;hero.maxHp=heroMaximumHp(hero);hero.hp=Math.min(hero.hp,effectiveMaxHp(hero));}

export function productionPerkQualityBonus(state,production){return (PERKS.gunsmith.qualityProductions??[]).includes(production)?5*getHeroes(state).filter(h=>h.profession==='engineer'&&(h.perk==='gunsmith'||hasLevelPerk(h,'gunsmith'))).length:0;}

function grantNationalityMilestones(hero){
 const milestones=hero.nationalityBonuses?.perkMilestones;if(!milestones)return;
 hero.nationalityPerkMilestones??={};
 for(const [level,count]of Object.entries(milestones)){const key=hero.nationalityId+':'+level;if(hero.level>=Number(level)&&!hero.nationalityPerkMilestones[key]){hero.extraPerkChoices=(hero.extraPerkChoices??0)+count;hero.nationalityPerkMilestones[key]=true;}}
}

export function professionUnlocked(state,id){return Boolean(PROFESSIONS[id]?.available&&((state.unlockedProfessions??[]).includes(id)||(id!=='heavy'&&(id!=='hunter'||state.duren)&&(id!=='bandit'||state.npcMeetings?.piki||state.npcMeetings?.chervi))));}

function gainFamiliarity(hero){
 if(!hasLevelPerk(hero,'hunter-familiarity'))return;
 for(const slot of ['weapon','rangedWeapon'])if(hero[slot])hero[slot+'Familiarity']=Math.min(25,(hero[slot+'Familiarity']??0)+5);
}
