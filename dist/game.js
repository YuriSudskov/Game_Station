import {runKolom} from './kolomenskaya.js';
import {runHansa,hansaRoutePrice,hansaDuty} from './hansa-route.js';
import {doctorKitCure} from './doctor-kit.js';

export const RESEARCH_PROJECTS={
 pukGrass:{sample:'pukGrass',name:'Пук-трава',type:'Биологическое',difficulty:14,text:'Общее исследование завершено. Полученные сведения позволяют выращивать пук-траву в агроферме. Открыты два независимых исследования: средство от радиации и сильный стимулятор-ускоритель. Можно завершить оба.',item:'pukGrass'},
 radiation:{name:'Отвар из пук-травы',type:'Медицинская технология',difficulty:16,reward:{production:'medicine',level:11,name:'Отвар из пук-травы',soon:false},text:'Мы нашли способ приготовить из пук-травы безопасный отвар. Он снимает 2–5 + Сила РАД, не уменьшает максимум здоровья и не даёт опыта за применение. Открыт рецепт Медицины 11-го уровня: пук-трава и пустая бутылка, изготовление 8 А, 20 секунд.'},
 accelerator:{name:'Жвачка из травы',type:'Медицинская технология',difficulty:17,reward:{production:'medicine',level:12,name:'Жвачка из травы',soon:false},text:'Плотная травяная смесь бодрит и помогает замечать опасности. Открыт рецепт Медицины 12-го уровня: Жвачка из травы. 10 применений, +1 Ловкости, +1 к обнаружению, +25% к скорости прохождения локаций.'},
 beetles:{sampleAny:['kolomenskayaBeetles','kolomenskayaBeetleCorpse'],name:'Жуки с Коломенской: общее исследование',type:'Биологическое',difficulty:40,text:'Образцы показали: жуки накапливают радиацию в огромных количествах. Их укус оказывает парализующее действие — это свойство потенциально пригодно для создания отравляющего оружия. Насыщенные радиацией ткани также могут послужить основой источника электроэнергии. Вводные данные открывают два независимых исследования: «Отрава из жуков» и «Жучьи батареи».'},
 beetlePoison:{name:'Отрава из жуков',type:'Оружейная технология',requires:'beetles',difficulty:50,reward:{production:'melee',level:12,name:'Отравленное оружие',soon:true,prefix:'Отравленный',paralysisTurns:1,triggerChance:10,requiresDamage:true,bossEffect:'poisonAccuracy'},text:'Соединения из тканей жуков могут на короткое время обездвижить противника. Исследование откроет рецепт Цеха 12-го уровня: улучшение «Отравленный», с шансом 10% после попадания с уроном заставляет обычного противника пропустить следующий ход. На босса действует снижение точности, как у отравленного ножа. Состав и стоимость рецепта — скоро.'},
 beetleBatteries:{name:'Жучьи батареи',type:'Энергетическая технология',requires:'beetles',difficulty:60,reward:{production:'science',name:'Прототип жучьей батареи',soon:true},text:'Радиоактивные ткани жуков могут служить источником электроэнергии. Исследование откроет изготовление прототипа в Науке и дальнейшее улучшение батарей. Параметры — скоро.'},
 beetleBatteryImprovement:{name:'Улучшение жучьих батарей',type:'Энергетическая технология',requires:'beetleBatteries',difficulty:70,reward:{production:'science',name:'Качественная жучиная батарея',replaces:'Прототип жучьей батареи',soon:true},text:'Мы усовершенствовали конструкцию источника питания. Рецепт прототипа заменяется качественной жучиной батареей. Свойства обеих батарей и параметры изготовления будут определены отдельно.'},
 radioactiveGrenade:{name:'Радиоактивная граната',type:'Оружейная технология',requires:'beetleBatteryImprovement',difficulty:60,reward:{production:'science',name:'Радиоактивная граната',soon:true},proposedRecipeLevel:15,design:{targetRadiationRules:'hero',poisonDamage:0,radiationMin:12,radiationMax:24,subtractTargetRadProtection:true,dodgeDc:14,dodgeRadiationMultiplier:0.5,poisonOnDodge:false,failedDodgeSkipNextTurnChance:50},text:'Исследование направленного выброса радиоактивного содержимого жучиных батарей. Граната даёт 12–24 облучения минус РАД-защита цели. Уклонение против сложности 14: при успехе половина облучения без отравления; при провале полное облучение и 50% шанс пропустить следующий ход. Облучение противников действует по правилам героев. Отравление не наносит дополнительного урона. Рецепт Науки — скоро; согласован 15-й уровень.'},
 spike:{name:'Исследование шипа пронзателя',sample:'piercerSpike',type:'Оружейная технология',difficulty:40,reward:{name:'Клинок пронзателя',production:'melee',level:11,soon:false},text:'Мы изучили твёрдую структуру шипа и научились закреплять его в стальной основе. Открыт Клинок пронзателя — рецепт Цеха 11-го уровня. Его пробивающий удар игнорирует поглощение защиты цели.'},
 laser:{"name":"Лазерное оружие","type":"Оружейная технология","requiresPerk":"scientist-secret","difficulty":35,"reward":{"production":"science","level":12,"name":"Лазерный излучатель","soon":false},"text":"Направленный луч превращает энергию в термический удар. Открыта технология лазерного оружия, рецепт излучателя Науки 12-го уровня и исследование пистолета."},
 laserPistol:{"name":"Лазерный пистолет","requires":"laser","difficulty":40,"reward":{"production":"ranged","level":11,"name":"Лазерный пистолет","soon":false},"text":"Компактный излучатель помещён в пистолетный корпус. Открыт рецепт Стрелкового оружия 11-го уровня: 35–180 термического урона, дистанция 0–2."},
 laserRifle:{"name":"Лазерная винтовка","requires":"laserPistol","difficulty":45,"reward":{"production":"ranged","level":12,"name":"Лазерная винтовка","soon":false},"text":"Два излучателя и прочный корпус позволяют создать мощный направленный импульс. Открыт рецепт Стрелкового оружия 12-го уровня: 50–220 термического урона, дистанция 0–3."},
 heavyLaser:{"name":"Тяжёлый лазер","requires":"laserRifle","difficulty":50,"reward":{"production":"ranged","level":13,"name":"Тяжёлый лазер","soon":false},"text":"Три излучателя работают очередью. Открыт рецепт тяжёлого лазера, Стрелковое оружие 13-го уровня. Однократно подключённая к герою жучиная батарея обеспечивает постоянное питание."},
 kevlar:{"sample":"acid","name":"Кевларовый материал","type":"Технологическое","difficulty":30,"reward":{"production":"armor","level":11,"name":"Кевларовый материал","soon":false},"text":"Мы научились превращать ткань и кислотный состав в прочное многослойное полотно. Открыт рецепт кевларового материала: Броня, уровень 11."},
 kevlarLight:{"name":"Лёгкая кевларовая броня","type":"Технологическое","difficulty":30,"requires":"kevlar","reward":{"production":"armor","level":12,"name":"Лёгкая кевларовая броня","soon":false},"text":"Гибкие слои кевлара защищают лучше хитина и не сковывают движения. Открыт рецепт лёгкой кевларовой брони: Броня, уровень 12."},
 kevlarMedium:{"name":"Средняя кевларовая броня","type":"Технологическое","difficulty":30,"requires":"kevlarLight","reward":{"production":"armor","level":13,"name":"Средняя кевларовая броня","soon":false},"text":"Кевларовая подкладка удерживает осколки, а пластины принимают основной удар. Открыт рецепт средней кевларовой брони: Броня, уровень 13."},
 kevlarHeavy:{"name":"Тяжёлая кевларовая броня","type":"Технологическое","difficulty":30,"requires":"kevlarMedium","reward":{"production":"armor","level":14,"name":"Тяжёлая кевларовая броня","soon":false},"text":"Многослойный кевлар и стальной каркас образуют тяжёлый защитный комплект для самых опасных переходов. Открыт рецепт тяжёлой кевларовой брони: Броня, уровень 14."},
 kevlarCoating:{"name":"Кевларовое покрытие","type":"Технологическое","difficulty":30,"requires":"kevlarHeavy","reward":{"production":"science","level":14,"name":"Кевларовое покрытие","soon":false,"postfix":"с кевларом","physicalArmor":21,"replaces":"Укрепление брони · Наука 7"},"text":"Внешний кевларовый слой распределяет удар и удерживает осколки. Открыта технология «Кевларовое покрытие»: Наука, рецепт 14 уровня. Заменяет укрепление брони: постфикс «с кевларом», +21 физической защиты. Открыт рецепт покрытия: успех 60%, +21 физической защиты, +25% к цене брони. Заменяет штопанное или укреплённое улучшение."}
};
export function researchProjectAvailable(state,id){const p=RESEARCH_PROJECTS[id],c=state.researchCenter??{};if(!p||c.completed?.[id]||c.jobs?.some(j=>j?.id===id))return false;if(p.requiresPerk&&!getHeroes(state).some(h=>h.perk===p.requiresPerk||h.levelPerks?.some(choice=>choice.perk===p.requiresPerk)))return false;if(p.sampleAny&&!state.inventory?.some(row=>p.sampleAny.includes(row.item)&&row.qty>0))return false;if(p.sample&&!state.inventory?.some(row=>row.item===p.sample&&row.qty>0))return false;if(p.requires&&!c.completed?.[p.requires])return false;if(['radiation','accelerator'].includes(id))return Boolean(c.completed?.pukGrass);return true;}
export function researchLeader(state){return getHeroes(state).find(hero=>hero.id===state.researchCenter?.leaderId);}
export function researchPower(state){
 const center=state.researchCenter??{},leader=researchLeader(state);
 const intelligence=leader&&!leader.dead&&leader.job?.kind!=='interactive'?heroAttributes(leader).intelligence:0;
 let power=1+(center.upgrades?.base??0)+intelligence;
 for(let k=1;k<=(center.scientists??0);k++)power+=(2+(center.upgrades?.training??0))**(1/k);
 return power*(1+.1*getHeroes(state).filter(h=>!h.dead&&hasScientistPerk(h,'lab')).length);
}
export function researchScienceBonus(state){
 const leader=researchLeader(state);
 return leader&&!leader.dead?heroAttributes(leader).intelligence*(1+.3*(state.researchCenter?.upgrades?.science??0)):0;
}
export function researchUpgradeQuote(state,kind){
 const center=state.researchCenter??{},n=center.upgrades?.[kind]??0;
 const quotes={
 scientists:{cost:2000+1000*(center.scientists??0),seconds:120+60*(center.scientists??0)},
 base:{cost:20000+20000*n,seconds:300+120*n},
 training:{cost:30000+10000*n,seconds:600+180*n},
 science:{cost:15000+10000*n,seconds:300+120*n},
 filters:{cost:10000+5000*n,seconds:180+60*n,maxed:n>=11}
 };
 return quotes[kind];
}
export function advanceResearch(state,now){
 const center=state.researchCenter;if(!center)return false;
 const at=center.updatedAt??now,elapsed=Math.max(0,now-at),power=center.power??researchPower(state);
 let changed=false;
 for(const [index,job] of (center.jobs??[]).entries()){
  if(!job||job.remaining<=0)continue;
  job.remaining=Math.max(0,job.remaining-elapsed*power/(index?2:1));
  changed ||= elapsed>0;
 }
 center.updatedAt=now;center.power=researchPower(state);
 return changed;
}
function spendResearchFilters(state,qty){
 state.filters-=qty;
 const center=state.researchCenter,n=center?.upgrades?.filters??0;
 if(n)center.recoveredFilters=(center.recoveredFilters??0)+qty*Math.min(.5,.1+.04*(n-1));
}
function researchAction(state,action,now){
 requireThat(hasBuilding(state,'researchCenter'),'Сначала построй Исследовательский центр.');
 const center=state.researchCenter??={scientists:0,upgrades:{},jobs:[]};
 center.jobs??=[];center.upgrades??={};
 if(action.type==='researchLeader'){
  requireThat(!center.leaderId,'Сначала сними руководителя.');
  const hero=getHeroes(state).find(hero=>hero.id===action.leaderId);
  requireThat(hero&&!hero.dead&&!hero.missingOnMission&&!hero.awaitingBurial&&!hero.job&&!needsAdventureRecovery(hero),'Нужен свободный живой герой.');
  if(center.appointed)pay(state,1000);
  center.leaderId=hero.id;center.appointed=true;center.leaderRemoveAt=now+300000;
 }else if(action.type==='researchRemoveLeader'){
  requireThat(now>=(center.leaderRemoveAt??0),'Смена руководителя ещё на кулдауне.');
  requireThat(!researchLeader(state)?.job,'Руководитель занят.');
  delete center.leaderId;
 }else if(action.type==='researchUpgrade'){
  requireThat(now>=(center.upgradeReadyAt??0),'Улучшения центра ещё на кулдауне.');
  const quote=researchUpgradeQuote(state,action.upgrade);
  requireThat(quote&&!quote.maxed,'Улучшение недоступно.');
  pay(state,quote.cost);
  if(action.upgrade==='scientists')center.scientists=(center.scientists??0)+1;
  center.upgrades[action.upgrade]=(center.upgrades[action.upgrade]??0)+1;
  center.upgradeReadyAt=now+quote.seconds*1000;
 }else if(action.type==='researchStart'){
  requireThat(researchLeader(state)&&!researchLeader(state).dead,'Назначь руководителя.');
  const id=action.project,project=RESEARCH_PROJECTS[id];
  requireThat(project&&!project.soon&&!center.completed?.[id],'Исследование недоступно.');
  requireThat(researchProjectAvailable(state,id),'Предыдущее исследование ещё не завершено или ветка закрыта.');
  requireThat(!(center.jobs??[]).some(job=>job?.id===id),'Исследование уже идёт.');
  const slots=1+(center.upgrades.base??0);
  const index=action.slot??Array.from({length:slots},(_,i)=>i).find(i=>!center.jobs[i]);
  requireThat(Number.isInteger(index)&&index>=0&&index<slots&&!center.jobs[index],'Слот недоступен.');
  requireThat(index!=null,'Нет свободного слота.');
  center.jobs[index]={id,remaining:project.difficulty*60000};
 }else if(action.type==='researchClaim'){
  const job=center.jobs[action.slot];requireThat(job&&job.remaining<=0,'Исследование ещё не завершено.');
  const project=RESEARCH_PROJECTS[job.id],leader=researchLeader(state);
  requireThat(leader&&!leader.dead,'Назначь живого руководителя для сдачи исследования.');
  levelUp(leader,heroExperience(leader,20*project.difficulty));
  (center.completed??={})[job.id]=true;center.lastResult=job.id;center.jobs[action.slot]=null;
  state.researchUnlocks=[...new Set([...(state.researchUnlocks??[]),job.id==='pukGrass'?'pukAgroFarm':job.id])];
 }else if(action.type==='researchClaimFilters'){
  const qty=Math.floor((center.recoveredFilters??0)+1e-9);requireThat(qty>0,'Нет целых восстановленных фильтров.');
  center.recoveredFilters-=qty;state.filters+=qty;
 }
 center.power=researchPower(state);center.updatedAt=now;
}
import {hasScientistPerk,scientistRadiationReduction,scientistCheck,withScientistChecks} from './scientist.js';
import {advancePartyCombat,preparePartyCombat,updatePartyCasualties,decidePartyCasualty,beginPartyRecovery} from './party-combat.js';
import {NATIONALITIES,NATIONALITY_VERSION} from './nationalities.js';
export {NATIONALITIES,NATIONALITY_VERSION};
import {HERO_HOBBIES,HOBBY_COST,STATION_BUILDINGS,STATION_BUILD_SECONDS,ACID_SPIDER,MATURE_GUARD,MEDIC_TREATMENT,INTERACTIVE_MISSIONS,ZIL_TUNNELS,LEVEL_PERKS,LEVEL_PERK_SCHEDULES,PROFESSIONS,IDENTITIES,ITEMS,PERKS,CONFIG,PATROL,CARAVAN,LOST_CARAVAN,GHOUL_LEADER,TECHNOPARK,SURFACE,SURFACE_SHOPS,patrolReady,RECIPES,PRODUCTIONS,productionXpThreshold,TRADE_EFFECTS,CAPACITY,STARTING_SHELVES,MAX_SHELVES,MAX_PRODUCTION_LEVEL,LOCATION_LEVELS} from './data.js';
import {perceptionCheck,rng,battle,expedition,lostCaravanExpedition,pukGrassExpedition,withStarterPerk,bandageHeal,stationHelp,surfaceExpedition,zilTunnelsExpedition,nationalityHealing} from './combat.js';
const uid=()=>globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random().toString(36).slice(2)}`;
const clone=x=>JSON.parse(JSON.stringify(x));
const requireThat=(value,message)=>{if(!value)throw new Error(message);};
export const roundRatio=(value,numerator,denominator=100)=>Math.floor((value*numerator+denominator/2)/denominator);
export const FACTIONS={sparta:{name:'Спарта',minReputation:-10,maxReputation:20},piki:{name:'Пики',minReputation:-10,maxReputation:20}};
export function factionReputation(state,id){
 const faction=FACTIONS[id];
 const reputation=state.factionReputation?.[id];
 return faction&&Number.isFinite(reputation)?Math.max(faction.minReputation,Math.min(faction.maxReputation,Math.trunc(reputation))):0;
}
function teaSpartaPercent(state,hero){
 return hero?.isTea&&hasLevelPerk(hero,'tea-spartan')?3*factionReputation(state,'sparta'):0;
}
function adventureExperience(active,hero,share){
 const sparta=hero.isTea?1+(active.spartaPercent??0)/100:1;
 return heroExperience(hero,share*sparta);
}
function treatmentExperience(active,id){
 return (active.history??[]).filter(event=>event.medicHeroId===id).reduce((total,event)=>total+(event.xp??0),0);
}
function adventureXpMultiplier(active,hero){
 return hobbyXpMultiplier(hero)*(hero.isTea?1+(active.spartaPercent??0)/100:1);
}
export const PLAYER_ROLES={
 tea:{name:'Чай',title:'Я Чай',motto:'Я буду сам по себе',currency:'Репутация',description:'Пройди переподготовку и создай героя Чая.'},
 shekel:{name:'Шекель',title:'Я Шекель',motto:'Это будет моё метро целиком',description:'Продажа предметов на 10% дороже, покупка у торговцев на 10% дешевле. Торговцы возвращаются на 10% дольше. На старте 10 шекелей.',currency:'Шекели'},
 pin:{name:'Пин',title:'Я инженер — Пин',motto:'Мы будем делать Гуас! Майн гер!',description:'Открыто изучение «Гаус-технология». Валюта — батареи.',currency:'Батареи'},
 sova:{name:'Сова',title:'Я Сова',motto:'Мы разовьём станцию',description:'Диверсантам со 2-го уровня открывается выбор перка «Двуручный бой». Новая валюта — люди, на старте 0.',currency:'Люди'}
};
export const KEEPER_QUESTS={
 1:{id:'tooth',title:'Золотой зуб',description:'Принеси один золотой зуб из мусорных куч.',target:1,reward:300},
 2:{id:'patrol',title:'Упыри в тоннеле',description:'Иди в тоннель, патрулируй, победи трёх упырей и тогда возвращайся.',target:3,reward:500},
 3:{id:'identity',title:'А ты, собственно говоря, кто?',description:'Познакомься со Смотрителем и выбери, кем будешь на станции.',target:1,reward:0},
 4:{id:'technopark',title:'Обследуй технопарк',description:'Иди, исследуй Технопарк. Мы хотим эту станцию восстановить. Успешно пройди её дважды.',target:2,reward:600},
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
 return Boolean(s.alexeyMet&&building&&(id!=='researchCenter'||s.completedLocations?.technoparkRoof)&&(!building.role||building.role===s.playerRole));
}
function awardTeaReputation(state,active){
 if(state.playerRole==='tea'&&active.heroIds.length===1&&!active.teaCompanion&&state.heroes.some(hero=>hero.id===active.heroIds[0]&&hero.isTea&&!hero.dead)){
  state.teaReputation=(state.teaReputation??0)+1;
 }
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
export const localRoofTesting=['127.0.0.1','localhost','[::1]'].includes(globalThis.location?.hostname);
export function repairMaterialsAvailable(state){
 const q=keeperQuestView(state);
 return Boolean(state.testAdventureReplay?.roofRoute||state.testAdventureReplay?.repairMaterials||q.stage===6&&q.status==='accepted'&&!state.completedLocations?.repairMaterials);
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
export const MERCHANTS={molchun:{name:'Молчун',cooldown:1800000,buyPercent:100,sellerChance:.65},yuras:{name:'Юрась',cooldown:40000,buyPercent:110,sellerChance:.8,buyBudgetPerLevel:500},duren:{name:'Дурень',cooldown:120000,buyPercent:150,sellerChance:0,sellerChanceStep:5,buyBudgetPerLevel:400,buyTypes:['medicine','food','stimulant']},vasek:{name:'Васёк',cooldown:50000,buyPercent:110,sellerChance:.6,buyTypes:['weapon','body'],budgetMultiplier:2}};
MERCHANTS.pikiSix={name:'Шестёрка пик',buyPercent:110};
export const PIKI_TRADE_FEE=1000;
export const PIKI_TRADE_PROFILES={
 medicine:{name:'Медикаменты',cooldown:40000,sellerChance:.3,buyBudgetPerLevel:400},
 gear:{name:'Оружие и броня',cooldown:60000,sellerChance:.5,buyBudgetPerLevel:600,buyTypes:['weapon','body']},
 parts:{name:'Расходные детали',cooldown:45000,sellerChance:.5,buyBudgetPerLevel:500,buyTypes:['resource','loot']}
};
const PIKI_STOCK={
 medicine:[
  ["bandage:5","dressingKit:2","antiseptic","broth:3","medicKit"],
  ["combatStimulator"],
  ["dressingKit:5"],
  ["medicKit:3"],
  ["mushroomTea","znka","strongPainkiller"],
  ["combatStimulator+1"],
  ["cardioStimulator"],
  ["cardioStimulator+1"],
  ["combatStimulator+2"],
  ["cardioStimulator+2"]
 ],
 gear:[
  ["bastard+1","clawKnuckles+1","sawedOff","qualityJacket+2","hideArmor+1"],
  ["pilotJacket+1"],
  ["browning+1"],
  ["shieldUni+1"],
  ["kazakVest+1","mr73+1","lu216:5","dynamite","blueSpecialArmor","american180","poisonKnife"],
  ["ak74+1","awl+2","zauerM"],
  ["heavyVest+1","handCrossbow+1","rpk"],
  ["mosin+2","slugShotgun+1"],
  ["butcherCleaver+2","nailGun+1"],
  ["ak47+1","workshopHeavyArmor"]
 ],
 parts:[
  ["metal:8","cloth:6","fullLeather:3","pipe:2","springMechanism:3"],
  ["metalParts:4"],
  ["strongTape:2"],
  ["toughLeather:2","ghoulHide:5"],
  ["sharpBlade","intactBook"],
  ["armorPlates:2","acid:2"],
  ["electronicParts:2","acid:2"],
  ["steel:2"],
  ["hardChitinPlates:2"],
  ["weaponUpgradePlan","armorUpgradePlan"]
 ]
};
function merchantSettings(state,id){
 return id==='pikiSix'?{...MERCHANTS[id],...PIKI_TRADE_PROFILES[state?.[id]?.profile]}:MERCHANTS[id];
}
export const MAX_MERCHANT_LEVEL=10;
export const MERCHANT_XP_THRESHOLDS=Object.fromEntries([50,100,200,400,700,1100,1700,2500,3500].map((xp,i)=>[i+1,xp]));
export function merchantXpThreshold(level){return MERCHANT_XP_THRESHOLDS[level]??null;}
export function gainMerchantXp(npc,xp=0){
 npc.level=Math.max(1,Math.min(MAX_MERCHANT_LEVEL,Math.trunc(npc.level??1)));npc.xp=Math.round(((npc.xp??0)+xp)*1000000)/1000000;
 while(npc.level<MAX_MERCHANT_LEVEL&&npc.xp>=merchantXpThreshold(npc.level)){npc.xp=Math.round((npc.xp-merchantXpThreshold(npc.level))*1000000)/1000000;npc.level++;}
 if(npc.level===MAX_MERCHANT_LEVEL)npc.xp=0;
}
export const YURAS_STOCK_BY_LEVEL={
 1:[{item:'jacket',qty:1},{item:'bandage',qty:5},{item:'leather',qty:2},{item:'cloth',qty:3},{item:'metal',qty:4}],
 2:[{item:'pipe',qty:1},{item:'machete',qty:1}],3:[{item:'sharpClaws',qty:3}],4:[{item:'toughLeather',qty:1},{item:'ghoulHide',qty:2}],
 5:[{item:'emptyBottle',qty:2},{item:'ghoulMeat',qty:2}],6:[{item:'sharpBlade',qty:1}],7:[{item:'antiseptic',qty:1}],
 8:[{item:'armorPlates',qty:2}],9:[{item:'rareMushrooms',qty:2}],10:[{item:'gasMaskFilter',qty:2},{item:'springMechanism',qty:1}]
};
export const VASEK_STOCK_BY_LEVEL={
 1:[{item:'crowbar',qty:1,quality:1},{item:'ashot',qty:1,quality:1},{item:'oldShotgun',qty:1,quality:1},{item:'qualityJacket',qty:1,quality:1},{item:'springMechanism',qty:4}],
 2:[{item:'pilotJacket',qty:1}],3:[{item:'browning',qty:1}],4:[{item:'shieldUni',qty:1}],
 5:[{item:'ghoulJacket',qty:1,quality:1},{item:'kazakVest',qty:1},{item:'brenTen',qty:1},{item:'airForceJacket',qty:1},{item:'remington',qty:1}],6:[{item:'awl',qty:1,quality:1},{item:'ak74',qty:1}],
 7:[{item:'heavyVest',qty:1},{item:'pilotJacket',qty:1,quality:2},{item:'saiga20k',qty:1},{item:'fiveSeven',qty:1}],8:[{item:'mosin',qty:1,quality:1},{item:'rox',qty:1}],9:[{item:'butcherCleaver',qty:1,quality:1},{item:'improvedM16',qty:1}],10:[{item:'ak47',qty:1}]
};
export const merchantOfferCount=level=>level>=9?7:level>=6?6:5;
export function merchantNextUnlock(s,id){const next=(s[id]?.level??1)+1;if(next>10||id==='molchun')return '';const messages=[];if(next===6||next===9)messages.push(merchantOfferCount(next)+' предложений за визит');if(id==='yuras'||id==='vasek'){const pool=(id==='vasek'?VASEK_STOCK_BY_LEVEL:YURAS_STOCK_BY_LEVEL)[next]??[];messages.push(...pool.map(x=>itemName(x)));}if(id==='pikiSix')messages.push('новые товары выбранного профиля');if(id==='duren')messages.push('выше шанс прийти с находкой');return messages.join(' · ');}
export const MERCHANT_STOCK=YURAS_STOCK_BY_LEVEL[1];
export function merchantSellerOffers(state,id,random=Math.random){
 if(id==='molchun'){
  const weapons=Object.keys(ITEMS).filter(key=>ITEMS[key].type==='weapon'&&!ITEMS[key].pendingDistribution&&Number.isInteger(ITEMS[key].value));
  const item=weapons[Math.floor(random()*weapons.length)],roll=random();
  return [{item,qty:1,quality:roll<.75?2:roll<.95?3:4}];
 }
 if(id==='duren'){
  const gear=Object.keys(ITEMS).filter(item=>['weapon','body'].includes(ITEMS[item].type)&&!ITEMS[item].pendingDistribution&&Number.isInteger(ITEMS[item].value));
  return [{item:gear[Math.floor(random()*gear.length)],qty:1,quality:random()<.7?1:2}];
 }
 if(id==='pikiSix'){
  const stock=PIKI_STOCK[state[id].profile].slice(0,state[id].level);
  const latest=stock.at(-1);
  const decode=entry=>{
   const [item,amount]=entry.split(/[+:]/);
   return entry.includes('+')?{item,qty:1,quality:Number(amount)}:{item,qty:Number(amount??1)};
  };
  const featured=decode(latest[Math.floor(random()*latest.length)]);
  const pool=new Map(stock.flat().map(entry=>{const row=decode(entry);return [row.item,row];}));
  pool.delete(featured.item);
  const others=[...pool.values()],offers=[featured];
  while(offers.length<merchantOfferCount(state[id].level)&&others.length)offers.push(...others.splice(Math.floor(random()*others.length),1));
  return offers.map(row=>pikiImprovedOffer(row,state[id].level,random));
 }
 const level=state[id].level??1,entries=Object.entries(id==='vasek'?VASEK_STOCK_BY_LEVEL:YURAS_STOCK_BY_LEVEL).filter(([required])=>Number(required)<=level);
 const highest=entries.at(-1)[1],best=highest[Math.floor(random()*highest.length)],rest=entries.flatMap(([,rows])=>rows).filter(row=>row.item!==best.item);
 for(let i=rest.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[rest[i],rest[j]]=[rest[j],rest[i]];}
 const distinct=new Map();
 for(const row of rest)if(!distinct.has(row.item))distinct.set(row.item,row);
 const offers=clone([best,...Array.from(distinct.values()).slice(0,merchantOfferCount(level)-1)]);
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
 if(id==='molchun')return 10000;
 const merchant=merchantSettings(state,id);
 return (merchant.buyBudgetPerLevel??300)*(state[id]?.level??1)*(merchant.budgetMultiplier??1);
}
export function prepareMerchantOffers(state,id,random=Math.random){
 const npc=state[id],v=npc?.visit;
 if(!v)return false;
 const level=npc.level??1;
 const settings=merchantSettings(state,id);
 const buyBudget=merchantBuyBudget(state,id);
 const buyCount=id==='molchun'?5:id==='duren'?3:merchantOfferCount(level);
 if(v.offers!==null){
  const oldBuyerRules=v.buyBudget!==buyBudget||v.buyCount!==buyCount;
  const stockStillAvailable=v.offers.every(offer=>state.inventory.some(row=>row.uid===offer.inventoryUid&&row.item===offer.item&&row.qty>=offer.qty));
  if(v.role!=='buyer'||(!oldBuyerRules&&stockStillAvailable))return false;
  v.offers=null;
 }
 if(v.role==='seller'){
  v.offers=merchantSellerOffers(state,id,random);
  const popularity=shekelPopularity(state);
  if(id!=='molchun'&&tradingPostAvailable(state)&&npc.ours&&popularity>0){
   for(const offer of v.offers)if(random()*100<popularity)offer.currency='shekel';
  }
 }
 else{
  v.buyBudget=buyBudget;v.buyCount=buyCount;
  const rows=state.inventory.filter(row=>Number.isInteger(ITEMS[row.item]?.value)&&(id==='pikiSix'&&npc.profile==='medicine'?(row.item==='antiseptic'||['medicine','food','stimulant'].includes(ITEMS[row.item].type)):(!settings.buyTypes||settings.buyTypes.includes(ITEMS[row.item].type)))&&tradeQuote(row,1,0,'buyer',id,state).price<=v.buyBudget);
  for(let i=rows.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[rows[i],rows[j]]=[rows[j],rows[i]];}
  const selected=[];
  if(id==='molchun'){
   const isSupply=row=>['resource','grenade','medicine','food','stimulant'].includes(ITEMS[row.item].type);
   while(rows.length&&selected.length<buyCount){
    const supply=random()<.55;
    const index=rows.findIndex(row=>isSupply(row)===supply);
    selected.push(rows.splice(Math.max(0,index),1)[0]);
   }
  }
  v.offers=(id==='molchun'?selected:rows.slice(0,v.buyCount)).map(row=>{
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
export function merchantFighter(state,id){
 if(id==='pikiSix'){
  const level=(state[id]?.level??1)+1;
  const hero={profession:'bandit',perk:'bandit-survivor',level,weapon:level>=5?'butcherCleaver':'clawKnuckles',weaponDetails:{quality:1},body:level>=5?'kazakVest':'shieldUni',bodyDetails:{quality:1}};
  hero.hp=heroMaximumHp(hero);
  return {hero,config:heroConfig(state,hero),equipment:rebirthQuote(state,hero).equipment};
 }const npc=state[id],level=Math.max(1,npc?.level??1),weapon=id==='duren'?'clawKnuckles':'crowbar',body=id==='duren'?'qualityJacket':'jacket';const hero={profession:'assault',perk:'none',level,weapon,body,hp:1};hero.hp=heroMaximumHp(hero);return {hero,config:heroConfig(state,hero),equipment:[{item:weapon,qty:1},{item:body,qty:1}]};}
export function merchantRobberyLoot(state,id){return [...clone(state[id]?.visit?.role==='seller'&&Array.isArray(state[id].visit.offers)?state[id].visit.offers:MERCHANT_STOCK),...merchantFighter(state,id).equipment].map(x=>({...x,origin:'robbed'}));}
export const merchantBribeCost=(state,id)=>Math.max(1,state[id]?.level??1)*300;
export function buyerPrice(item,qty=1,merchant='yuras',state=null){requireThat(Number.isInteger(ITEMS[typeof item==='string'?item:item.item]?.value),'Цена предмета ещё не задана.');const price=roundRatio(itemValue(item)*qty,MERCHANTS[merchant].buyPercent);return roundRatio(price,tradePercent(state,'salePercent'));}
export function tradeRelationDelta(modifier,role){const benefit=role==='seller'?modifier:-modifier;return benefit===-15?-1:benefit===15?2:benefit>=10?1:0;}
function merchantNationalityBonus(state,key){
 return state?getHeroes(state).filter(hero=>!hero.dead).reduce((sum,hero)=>sum+(hero.nationalityBonuses?.[key]??0),0):0;
}
export function merchantCooldown(state,id,level=state?.[id]?.level??1,relation=state?.[id]?.relation??0){const roleMultiplier=state?.playerRole==='shekel'?1.1:1;if(id==='molchun')return Math.round(MERCHANTS.molchun.cooldown*roleMultiplier);return Math.round(roleMultiplier*merchantSettings(state,id).cooldown*1.3**(Math.max(1,Math.min(10,level))-1)*(1-.03*Math.max(-10,Math.min(20,relation)))*Math.max(0,1-merchantNationalityBonus(state,'merchantCooldownReduction')/100));}
export function pikiImprovedOffer(row,level,random=Math.random){
 const roll=random(),count=roll<.05?2:roll<.70?1:0;
 let result=clone(row);
 for(let i=0;i<count;i++){
  const pool=Object.entries(RECIPES).filter(([id,r])=>r.upgrade&&!r.raisesQuality&&r.level<=level&&(r.prefix||r.postfix)&&canUpgrade(result,id)&&!(result.upgrades??[]).some(u=>replacedRecipes(r).includes(u.recipe)));
  if(!pool.length)break;
  result=upgradedItem(result,pool[Math.floor(random()*pool.length)][0]);
 }
 if((result.upgrades??[]).length>(row.upgrades??[]).length)result.pikiImprovementDiscount=true;
 return result;
}
export function tradeQuote(item,qty,modifier,role,merchant='yuras',state=null){
 if(merchant==='molchun')return {price:roundRatio(itemValue(item)*qty,role==='seller'?(state?.playerRole==='shekel'?135:150):(state?.playerRole==='shekel'?110:100)),shekelPrice:null,xp:0,relation:0,cooldown:merchantCooldown(state,merchant)};
 const npc=state?.[merchant]??{level:1,xp:0,relation:0};
 const currentRelation=Math.max(-10,Math.min(20,npc.relation??0));
 const delta=tradeRelationDelta(modifier,role);
 const relation=Math.max(-10,Math.min(20,currentRelation+(delta>0?roundRatio(delta,100+merchantNationalityBonus(state,'merchantRelationBonus')):delta)));
 const base=role==='buyer'?buyerPrice(item,qty,merchant,state):merchant==='duren'
  ? roundRatio(itemValue(item)*qty,tradePercent(state,'buyPercent'))
  : sellerPrice(item,qty,state);
 const relationFactor=200+(role==='seller'?-currentRelation:currentRelation);
 const price=roundRatio(base,(100+modifier)*relationFactor*(role==='seller'&&merchant==='pikiSix'&&item.pikiImprovementDiscount?95:100),2000000);
 const effect=TRADE_EFFECTS[role==='seller'?modifier:-modifier],xp=price/10*effect.xp*(1+.03*relation)*(1+merchantNationalityBonus(state,'merchantXpBonus')/100),preview={level:npc.level??1,xp:npc.xp??0};gainMerchantXp(preview,xp);
 const shekelPrice=role==='seller'&&item?.currency==='shekel'?Math.max(1,Math.ceil(price/shekelRate(state??{}))):null;
 return {price,shekelPrice,xp,relation,nextLevel:preview.level,cooldown:Math.round(merchantCooldown(state,merchant,preview.level,relation)*effect.cooldown)};
}
export function createGame(now=Date.now(),random=Math.random){return {version:1,equipmentCategoriesVersion:1,id:uid(),welcomeSeen:false,playerRole:null,factionReputation:{sparta:0},shekels:0,people:0,batteries:0,money:1500,startingMoney:1500,filters:0,completedLocations:{},totalSpent:0,spendingPartial:false,inventory:[],inventorySlotsBought:0,heroes:[],selectedHeroId:null,hero:null,productions:Object.fromEntries(Object.keys(PRODUCTIONS).map(key=>[key,{level:1,xp:0,job:null}])),shelves:Array(STARTING_SHELVES).fill(null),yuras:{level:1,xp:0,nextAt:0,visit:{id:uid(),role:random()<MERCHANTS.yuras.sellerChance?'seller':'buyer',offers:null}},history:[],createdAt:now,updatedAt:now};}
export function getHeroes(s){return Array.isArray(s.heroes)?s.heroes:(s.hero?[s.hero]:[]);}
function strengthHpBonus(hero){
 return 10*(heroEffectiveStrength(hero)-PROFESSIONS[hero.profession??'saboteur'].strength);
}
function refreshNationalityBalance(hero){
 if(!hero)return;const nation=NATIONALITIES[hero.nationalityId];
 if(hero.nationalityId==='afroamerican_explorer'&&hero.name==='Кофий')hero.name=nation.male;
 if(!nation?.balanceRevision||(hero.nationalityBalanceRevision??0)>=nation.balanceRevision)return;
 const previousMax=effectiveMaxHp(hero),previousHp=hero.hp;
 hero.nationalityBonuses=clone(nation.bonuses);hero.nationalityBalanceRevision=nation.balanceRevision;
 hero.maxHp=heroMaximumHp(hero);hero.hp=hero.dead?0:Math.min(effectiveMaxHp(hero),Math.max(0,(previousHp??0)+effectiveMaxHp(hero)-previousMax));
}
const LEGACY_EQUIPMENT_LEVELS={"airForceJacket":0,"plasticGuardArmor":0,"beetleArmor":0,"blueSpecialArmor":0,"militaryVest":0,"m60":0,"rox3":5,"remington":0,"saiga20k":0,"improvedM16":0,"fiveSeven":0,"american180":0,"poisonKnife":0,"machete":0,"brenTen":5,"rpk":0,"rox":5,"zauerM":5,"velocipedel":0,"slugShotgun":5,"ppsh":5,"nailGun":5,"handCrossbow":5,"beamHammer":5,"metalMediumArmor":5,"chitinArmor":5,"ak47":0,"browning":0,"pilotJacket":0,"shieldUni":0,"workshopHeavyArmor":5,"heavyVest":0,"oldShotgun":0,"butcherCleaver":5,"kaBar":0,"ak74":0,"radiationCloak":0,"protectiveSuit":5,"hideArmor":0,"ghoulJacket":0,"kazakVest":5,"bastard":0,"sawedOff":0,"homemadeRifle":0,"heavyStarterArmor":0,"mosin":0,"clawKnuckles":0,"awl":0,"qualityJacket":0,"pistol":0,"mr73":5,"crowbar":0,"ashot":0,"knife":0,"jacket":0};
function preserveExistingEquipment(state){
 if(state.equipmentCategoriesVersion)return;
 const visit=value=>{
  if(!value||typeof value!=="object")return;
  if(Object.hasOwn(LEGACY_EQUIPMENT_LEVELS,value.item)){
   value.equipmentCategoryOverride=Math.max(LEGACY_EQUIPMENT_LEVELS[value.item],value.requiredHeroLevel??0);
   if(value.item==="fiveSeven")value.legacyWeaponMin=30;
  }
  for(const slot of ["weapon","rangedWeapon","body","accessory"]){
   if(typeof value[slot]==="string"&&Object.hasOwn(LEGACY_EQUIPMENT_LEVELS,value[slot])){
    const details=value[slot+"Details"]??={};
    details.equipmentCategoryOverride=Math.max(LEGACY_EQUIPMENT_LEVELS[value[slot]],details.requiredHeroLevel??0);
    if(value[slot]==="fiveSeven")details.legacyWeaponMin=30;
   }
  }
  for(const child of Object.values(value))visit(child);
 };
 visit(state);state.equipmentCategoriesVersion=1;
}
export function normalizeGame(state){const s=clone(state);if(s.researchCenter)delete s.researchCenter.branch;if(s.lastHansaMission?.result?.success)s.hansaFullCompleted=true;if(s.hansaFullCompleted)delete s.hansaReplayEnabled;else if(s.hansaShop&&s.completedLocations?.hansaExpedition){s.hansaReplayEnabled=true;s.hansaQuestAccepted=true;}if(s.stationBuildings?.researchCenter?.builtAt)s.stationBuildings.researchCenter=true;preserveExistingEquipment(s);for(const hero of getHeroes(s))hero.researchLeader=hero.id===s.researchCenter?.leaderId;
 if(s.molchun&&s.molchun.level!=null){
  s.molchun={nextAt:Math.min(s.molchun.nextAt??0,(s.updatedAt??0)+merchantCooldown(s,'molchun')),visit:s.molchun.visit?{id:s.molchun.visit.id,role:s.molchun.visit.role,offers:null}:null};
 }s.factionReputation=Object.fromEntries(Object.keys(FACTIONS).map(id=>[id,factionReputation(s,id)]));if(s.interactiveMission?.pendingCombat?.enemies?.some(enemy=>enemy.webAttack)){for(const enemy of s.interactiveMission.pendingCombat.enemies)if(enemy.webAttack&&enemy.mainAttack)enemy.mainAttack.name='Кислотный укус';for(const event of s.interactiveMission.pendingCombat.events??[])if(event.type==='окружение отряда')event.text="В конце туннеля вы выходите в большой коридор с рельсами, и нежданно на вас нападает огромный кислотный паук.";}s.darkCrystalDropped=Boolean(s.darkCrystalDropped||(s.inventory??[]).some(row=>row.item==='darkCrystal')||(s.heroes??[s.hero]).some(hero=>hero?.mark));s.usedNationalities=[...new Set([...(s.usedNationalities??[]),...(s.heroes??[]).map(h=>h.nationalityId).filter(Boolean)])];for(const id of Object.keys(MERCHANTS))if(id!=='molchun'&&s[id]){s[id].relation=Math.max(-10,Math.min(20,s[id].relation??0));gainMerchantXp(s[id]);}s.filters??=0;s.productions??={};for(const key of Object.keys(PRODUCTIONS)){s.productions[key]??={level:1,xp:0,job:null};gainProductionXp(s.productions[key],key,0);}if(!Number.isSafeInteger(s.totalSpent)||s.totalSpent<0){s.totalSpent=0;s.spendingPartial=true;}s.heroes=Array.isArray(s.heroes)?s.heroes:(s.hero?[s.hero]:[]);
 rememberDoctorUnlock(s);
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
 for(const h of s.heroes){h.startPerk??=h.perk;h.rangedWeapon??=null;if(!s.strengthHpRule){const series=h.job?.kind==='series'?h.job:null;for(const member of [h,series?.worker,series?.initial])if(member){member.maxHp=heroMaximumHp(member);member.hp=Math.min(member.hp,effectiveMaxHp(member));}}h.earnedPerkLevels??=perkSchedule(h,h.level);refreshNationalityBalance(h);if(h.isTea&&!h.name.endsWith(' — Чай'))h.name+=' — Чай';if(h.shekelXpReward){grantShekelRewardXp(h,Math.max(0,SHEKEL_REWARD_XP-h.shekelXpReward.applied));delete h.shekelXpReward;}if(h.job?.kind==='series'){for(const member of [h.job.worker,h.job.initial])if(member){member.earnedPerkLevels??=perkSchedule(member,member.level);refreshNationalityBalance(member);}}if(s.playerRole==='sova'&&(h.profession??'saboteur')==='saboteur')h.rewardPerkUnlocks=[...new Set([...(h.rewardPerkUnlocks??[]),'dual-wield'])];}s.strengthHpRule=true;s.shekels??=0;s.people??=0;s.batteries??=0;s.researchUnlocks??=[];if(s.playerRole==='pin'&&!s.researchUnlocks.includes('gauss'))s.researchUnlocks.push('gauss');s.completedLocations??=Object.fromEntries(s.heroes.filter(h=>h.lastCompletedLocation).map(h=>[h.lastCompletedLocation,true]));if(s.completedLocations.caravan&&!s.vasek)s.vasek={level:1,xp:0,relation:0,nextAt:0,visit:null};prepareInteractiveRecovery(s);const selected=s.heroes.find(h=>h.id===s.selectedHeroId)||s.heroes.find(h=>h.id===s.hero?.id)||s.heroes[0]||null;s.hero=selected;s.selectedHeroId=selected?.id??null;refreshMedicTeam(s);return s;}
function normalizeInheritedSlot(slot){
 const {readyLevel,...entry}=clone(slot);
 if(readyLevel===(entry.stars+1)*10&&entry.stars<5)entry.stars++;
 return entry;
}
export function inheritedRebirths(state){
 const queued=(state.inheritedRebirths??[]).map(normalizeInheritedSlot);
 const firstHireWithoutStars=queued[0]?.stars===0;
 const slots=[
  ...getHeroes(state).filter(h=>rebirthStars(h)>0).map(h=>({stars:rebirthStars(h),attributes:clone(h.rebirthAttributes??{})})),
  ...(state.buriedRebirths??[]).map(normalizeInheritedSlot),
  ...queued.filter(slot=>slot.stars>0),
 ].sort((a,b)=>b.stars-a.stars);
 if(firstHireWithoutStars&&slots.length)slots.unshift({stars:0,attributes:{}});
 if(state.playerRole==='tea'&&state.teaId&&slots[0]?.stars>0){
  slots[0].stars--;
  if(slots[0].stars===0){
   if(slots.length===1)slots.shift();
   else slots[0].attributes={};
  }
 }
 return slots;
}
export function restartQuote(state){const spent=Number.isSafeInteger(state.totalSpent)&&state.totalSpent>=0?state.totalSpent:0;const balance=state.money??0,inventoryValue=(state.inventory??[]).reduce((sum,row)=>sum+(ITEMS[row.item]?.value==null?0:salePrice(state,row,row.qty)),0),total=spent+balance+inventoryValue;const bonus=Math.max(0,roundRatio(total,2));return {spent,balance,inventoryValue,total,bonus,money:(state.startingMoney??1500)+bonus,inheritance:inheritedRebirths(state)};}
const RESTART_COOLDOWN_MS=10*60*1000;
export const restartAttempt=state=>Number.isSafeInteger(state.restartAttempt)&&state.restartAttempt>=1?state.restartAttempt:1;
export const restartCooldownRemaining=(state,now=Date.now())=>Math.max(0,(state.restartAvailableAt??0)-now);
export function restartGame(state,now=Date.now(),random=Math.random){
 requireThat(state.teaGameOver||restartCooldownRemaining(state,now)===0,'До следующего сброса ещё не прошло 10 минут.');
 const fresh=createGame(now,random);
 fresh.restartAttempt=restartAttempt(state)+1;
 fresh.restartAvailableAt=now+RESTART_COOLDOWN_MS;
 fresh.startingMoney=restartQuote(state).money;fresh.money=fresh.startingMoney;fresh.inheritedRebirths=inheritedRebirths(state);fresh.tutorialSeen=clone(state.tutorialSeen??{});if(professionUnlocked(state,'doctor'))fresh.doctorUnlocked=true;fresh.unlockedProfessions=Object.keys(PROFESSIONS).filter(id=>professionUnlocked(state,id));if(state.recipeLevelOrder==='desc')fresh.recipeLevelOrder='desc';return fresh;}
export const nextHireRebirth=s=>s.teaTraining??(s.shekelFreeHire?{stars:1}:s.inheritedRebirths?.[0]);
export const hireNationalityRerollCost=s=>s.teaTraining?(s.hireNationalityRerolls??0)*1000:roundRatio(hireCost(s),10*((s.hireNationalityRerolls??0)+1));
export function canRerollHireNationalities(s){
 const offered=new Set((s.nationalityOffers?.hire??[]).map(offer=>offer.id));
 const used=new Set(s.usedNationalities??[]);
 return offered.size>0&&Object.keys(NATIONALITIES).some(id=>!used.has(id)&&!offered.has(id));
}
export function hireCost(s,nationalityId=null){if(s.shekelFreeHire||s.teaTraining)return 0;const count=getHeroes(s).filter(hero=>!hero.dead).length;return (count===0?500:1500*2**(count-1))+(NATIONALITIES[nationalityId]?.bonuses.hireCost??0);}
export function heroTitle(hero){const profession=PROFESSIONS[hero.profession??'saboteur']?.name??'Сталкер',perk=PERKS[hero.startPerk??hero.perk]?.shortName??PERKS[hero.startPerk??hero.perk]?.name;return `${hero.name}${perk?', '+perk.toLocaleLowerCase('ru-RU'):','} ${profession.toLocaleLowerCase('ru-RU')}${rebirthStars(hero)?' '+ '★'.repeat(rebirthStars(hero)):''}`;}
export const rebirthStars=hero=>Math.max(0,Math.min(hero?.isTea?6:5,Math.trunc(hero?.rebirths??0)));
export const heroLevelCap=hero=>rebirthStars(hero)<5?(rebirthStars(hero)+1)*10:Infinity;
export const rebirthXpPenalty=hero=>10*rebirthStars(hero);
const hobbyXpMultiplier=hero=>hero.hobby?.option==='experience'?1.1:1;
export const heroExperience=(hero,xp)=>xp>0?Math.max(1,roundRatio(xp,(100-rebirthXpPenalty(hero))*(100-(hero.nationalityBonuses?.xpPenalty??0))*hobbyXpMultiplier(hero)*(hasScientistPerk(hero,'thirst')?1.1:1)/100)):0;
export function rebirthQuote(state,hero=state.hero){
 const stars=rebirthStars(hero),level=heroLevelCap(hero),cost=(stars+1)*10000;
 const equipment=['weapon','rangedWeapon','body','accessory','special','pet'].filter(slot=>hero?.[slot]).map(slot=>({...clone(hero[slot+'Details']??{}),item:hero[slot],qty:1}));
 const reason=!hero?'Сначала найми героя.':stars>=5?'Получены все пять звёзд.':hero.level<level?`Нужен ${level}-й уровень.`:hero.dead?'Сначала восстанови героя.':hero.job?'Сначала получи результат задания или отдыха.':state.money<cost?'Не хватает A.':!canReceive(state,equipment)?'Освободи место в инвентаре для снаряжения.':'';
 return {stars,level,cost,equipment,reason,available:!reason};
}
export function itemQuality(row){return Number.isInteger(row?.quality)?Math.max(0,Math.min(5,row.quality)):0;}
export function equipmentRequiredLevel(row){
 const item=typeof row==='string'?row:row?.item;
 if(!['weapon','body','accessory','special','pet'].includes(ITEMS[item]?.type))return 0;
 if(row?.equipmentCategoryOverride!=null)return row.equipmentCategoryOverride;
 if(ITEMS[item].equipmentCategory!=null)return ITEMS[item].equipmentCategory;
 const levels=Object.values(RECIPES).filter(r=>!r.upgrade&&r.output===item).map(r=>r.level);
 const recipeLevel=levels.length?Math.min(...levels):1;
 return Math.max(ITEMS[item].requiredHeroLevel??0,row?.requiredHeroLevel??0,5*Math.floor((recipeLevel-1)/5));
}
export const canUseEquipment=(hero,row)=>hero.level>=equipmentRequiredLevel(row);
export function itemDisplayName(row){const name=itemName(row),item=ITEMS[row.item];if(!['weapon','body','accessory','special','pet'].includes(item?.type))return name;const level=equipmentRequiredLevel(row);return name+(level>0?' (ур.'+level+'+)' :'');}
export function itemName(row){const item=ITEMS[row.item],quality=itemQuality(row),prefixes=(row.upgrades??[]).filter(u=>!RECIPES[u.recipe]?.postfix).map(u=>u.prefix==='Остро заточенный'?'Острый':u.prefix);const auto=prefixes.includes('Авто-');return [...prefixes.filter(prefix=>prefix!=='Авто-'),(auto?'Авто-':'')+item.name].join(' ')+((row.upgrades??[]).filter(u=>RECIPES[u.recipe]?.postfix).map(u=>' '+RECIPES[u.recipe].postfix).join(''))+(quality?' +'+quality:'');}
export function upgradeValueBonus(recipe){return recipe?.upgrade&&recipe.valueIncreasePercent==null&&!recipe.raisesQuality?(recipe.valueBonus??recipe.cost??0):0;}
const QUALITY_VALUE_PERCENT=[100,200,350,600,800,1100];
export function itemValue(row){
 if(typeof row==='string')return ITEMS[row]?.value;
 const upgrades=row.upgrades??[];
 const baseValue=ITEMS[row.item].value*QUALITY_VALUE_PERCENT[itemQuality(row)]/100;
 const flatBonus=upgrades.reduce((sum,u)=>sum+(RECIPES[u.recipe]?.valueIncreasePercent!=null||RECIPES[u.recipe]?.raisesQuality?0:(u.valueBonus??upgradeValueBonus(RECIPES[u.recipe]))),0);
 const valueIncrease=upgrades.reduce((sum,u)=>sum+(RECIPES[u.recipe]?.valueIncreasePercent??0),0);
 return Math.round(baseValue*(100+valueIncrease)/100+flatBonus);
}
export function itemArmor(row){return (ITEMS[row.item].armor??0)+7*itemQuality(row)+(row.upgrades??[]).reduce((n,u)=>n+(u.armorBonus??0),0);}
export function itemThorns(row){
 return (row?.upgrades??[]).map(upgrade=>RECIPES[upgrade.recipe]?.thorns).find(Boolean)??null;
}
export function itemThermalArmor(row){return (ITEMS[row?.item]?.thermalArmor??0)+5*itemQuality(row)+(row?.upgrades??[]).reduce((sum,upgrade)=>sum+(upgrade.thermalArmorBonus??0),0);}
export function itemRicochet(row){return (ITEMS[row?.item]?.ricochet??0)+(row?.upgrades??[]).reduce((sum,u)=>sum+(u.ricochetBonus??0),0);}
export function missionDuration(hero,ms){const speed=1+(activeStimulantEffects(hero).speed??0)/100;const body=hero.body&&canUseEquipment(hero,{...hero.bodyDetails,item:hero.body})?ITEMS[hero.body]:null;return Math.round(ms/speed*(hasScientistPerk(hero,'thirst')?1.1:1)*(hero.perk==='quick-orders'||hasLevelPerk(hero,'quick-orders')?0.85:1)*(1+((body?.missionTimePenaltyPercent??0)-(body?.armorClass==='heavy'&&hasLevelPerk(hero,'heavy-step')?10:0)+(['medium','heavy'].includes(body?.armorClass)&&hasLevelPerk(hero,'heavy-padding')?5:0))/100));}
export function itemRadiationProtection(row){return (ITEMS[row?.item]?.radiationProtection??0)+(ITEMS[row?.item]?.type==='accessory'?itemQuality(row):0)+(row?.upgrades??[]).reduce((n,u)=>n+(u.radiationProtectionBonus??0),0);}
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
 if(chance<=0||random()*100>=chance)return 0;
 const plusFour=chance>=36?4:0;
 const plusThree=chance>=16?4:0;
 const roll=random()*100;
 if(roll<plusFour)return 4;
 if(roll<plusFour+plusThree)return 3;
 return roll<plusFour+plusThree+Math.min(60,2*chance)?2:1;
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
const replacedRecipes=r=>Array.isArray(r?.replaces)?r.replaces:r?.replaces?[r.replaces]:[];
export function canUpgrade(row,recipeId){
 const recipe=RECIPES[recipeId],upgrades=row?.upgrades??[];
 if(recipe?.raisesQuality)return ITEMS[row?.item]?.type===recipe.target&&itemQuality(row)<5;
 const replacing=upgrades.some(upgrade=>replacedRecipes(recipe).includes(upgrade.recipe));
 return Boolean(row&&recipe?.upgrade
  &&(recipe.target==='body'?ITEMS[row.item]?.type==='body':(ITEMS[row.item]?.combat===(recipe.target??'melee')||((recipe.target??'melee')==='melee'&&ITEMS[row.item]?.bayonet)))
  &&(!recipe.weaponClasses||recipe.weaponClasses.includes(ITEMS[row.item]?.weaponClass)||recipe.weaponClasses.includes(ITEMS[row.item]?.secondaryWeaponClass))
  &&(!recipe.armorClasses||recipe.armorClasses.includes(ITEMS[row.item]?.armorClass))
  &&(!recipe.rejectsPiercing||!ITEMS[row.item]?.piercing)
  &&!recipe.excludedWeaponClasses?.includes(ITEMS[row.item]?.weaponClass)
  &&!recipe.excludedWeaponClasses?.includes(ITEMS[row.item]?.secondaryWeaponClass)
  &&(itemTier(row)<(ITEMS[row.item]?.upgradeLimit??3)||replacing)
  &&!upgrades.some(upgrade=>upgrade.recipe===recipeId||replacedRecipes(RECIPES[upgrade.recipe]).includes(recipeId)));
}
export function isRecipeSuperseded(state,recipeId){
 const replacement=RECIPES[RECIPES[recipeId]?.supersededBy];
 return Boolean(replacement&&state.productions[replacement.production]?.level>=replacement.level&&(!replacement.research||state.researchCenter?.completed?.[replacement.research]));
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

 const recipe=RECIPES[recipeId],production=state.productions[recipe?.production];
 requireThat(recipe?.upgrade,'Нет такого улучшения.');
 requireThat(!recipe.research||state.researchCenter?.completed?.[recipe.research],'Сначала заверши исследование.');
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
 production.job={recipe:recipeId,productionLevel:production.level,target,rarityRank,chance,success:Math.floor(random()*100)+1<=chance,startedAt:now,endsAt:now+recipeSeconds(state,recipe)*1000};
 addHistory(state,`Начато улучшение: ${itemName(target)}.`,now);
}
export function upgradedItem(row,recipeId){
 if(RECIPES[recipeId]?.raisesQuality)return {...clone(row),quality:Math.min(5,itemQuality(row)+1)};
 const baseRecipe=RECIPES[recipeId],recipe=baseRecipe.otherRanged&&ITEMS[row.item]?.weaponClass!=='shotgun'&&ITEMS[row.item]?.secondaryWeaponClass!=='shotgun'?{...baseRecipe,...baseRecipe.otherRanged}:baseRecipe,output=clone(row),upgrades=output.upgrades??[];
 const replacedValue=upgrades.filter(upgrade=>replacedRecipes(recipe).includes(upgrade.recipe))
  .reduce((sum,upgrade)=>sum+(upgrade.valueBonus??upgradeValueBonus(RECIPES[upgrade.recipe])),0);
 output.upgrades=[
  ...upgrades.filter(upgrade=>!replacedRecipes(recipe).includes(upgrade.recipe)),
  {recipe:recipeId,prefix:recipe.prefix,bonus:recipe.bonus??0,armorBonus:recipe.armorBonus??0,accuracyBonus:recipe.accuracyBonus??0,valueBonus:recipe.valueIncreasePercent!=null?0:upgradeValueBonus(recipe)+replacedValue,
   ...(recipe.blocksAimedShots?{blocksAimedShots:true}:{}),
   ...(recipe.thermalArmorBonus?{thermalArmorBonus:recipe.thermalArmorBonus}:{}),
   ...(recipe.ricochetBonus?{ricochetBonus:recipe.ricochetBonus}:{}),
   ...(recipe.radiationProtectionBonus?{radiationProtectionBonus:recipe.radiationProtectionBonus}:{}),
   ...(recipe.armorFactor?{armorFactor:recipe.armorFactor}:{}),
   ...(recipe.minBonus!=null?{minBonus:recipe.minBonus,maxBonus:recipe.maxBonus}:{})}
 ];
 output.rarity=RARITIES[Math.max(itemRarityRank(row),itemRarityRank(output))];
 return output;
}
const hasDoctorPerk=(hero,id)=>hero&&(hero.perk==='doctor-'+id||hasLevelPerk(hero,'doctor-'+id));
function doctorsWith(state,perk,target){
 return state?getHeroes(state).map(hero=>hero.job?.kind==='series'?hero.job.worker:hero)
  .filter(hero=>!hero.dead&&hero.hp>0&&hero.id!==target?.id&&hasDoctorPerk(hero,perk)):[];
}
const doctorMedicineBonus=state=>doctorsWith(state,'therapist').length?10:0;
const doctorRestMultiplier=state=>doctorsWith(state,'duty').length?1.2:1;
export const doctorRehabilitation=(state,hero)=>doctorsWith(state,'rehab',hero).length>0;
export const canDoctorResuscitate=(state,hero)=>Boolean(hero?.dead&&hero.awaitingBurial&&!hero.resuscitated&&doctorsWith(state,'resuscitation',hero).length);
function doctorRounds(state,hero,run,seed,now){
 if(hero.dead||hero.hp<=0||hero.hp>=effectiveMaxHp(hero)&&!(hero.radiation>0))return;
 const doctor=doctorsWith(state,'rounds',hero).sort((a,b)=>
  Number(hasDoctorPerk(b,'decontamination'))-Number(hasDoctorPerk(a,'decontamination'))||
  Number(hasDoctorPerk(b,'brigade'))-Number(hasDoctorPerk(a,'brigade'))||
  heroAttributes(b).perception-heroAttributes(a).perception)[0];
 const heroSeed=Array.from(String(hero.id??hero.name)).reduce((hash,char)=>Math.imul(hash^char.charCodeAt(0),16777619),2166136261);
 if(!doctor||rng((seed??now)^heroSeed).int(1,100)>(hasDoctorPerk(doctor,'brigade')?35:20))return;
 const before=hero.hp,radiation=hero.radiation??0;
 if(hasDoctorPerk(doctor,'decontamination'))hero.radiation=Math.max(0,radiation-1);
 hero.hp=Math.min(effectiveMaxHp(hero),hero.hp+30+10*heroAttributes(doctor).perception);
 run.doctorRounds={healed:hero.hp-before,radiation:radiation-(hero.radiation??0)};
 addHistory(state,`Обход · ${hero.name}: +${Math.round(run.doctorRounds.healed)} HP, снято облучение: ${run.doctorRounds.radiation}.`,now);
}
const hasMedicPerk=(hero,id)=>hero&&(hero.perk==='medic-'+id||hasLevelPerk(hero,'medic-'+id));
const hasLevelPerk=(hero,perk)=>(hero.levelPerks??[]).some(choice=>choice.perk===perk);
export function upgradeChance(state,recipeId,row=null){
 const recipe=RECIPES[recipeId];
 if(!recipe)return 0;
 const engineers=getHeroes(state).filter(hero=>hero.profession==='engineer');
 const assistants=engineers.filter(hero=>hasLevelPerk(hero,'engineer-assistant')).length;
 const baseChance=recipe.raisesQuality?100-20*itemQuality(row):recipe.chance??100;
 if(baseChance<=0)return 0;
 return Math.max(0,Math.min(100,baseChance+5*assistants+(recipe.production==='science'?researchScienceBonus(state)+scientistScienceBonus(state):0)+(baseChance<100?nationalProductionModifier(state,recipe,'success'):0)));
}
function paySideJob(state,hero,firstLevel,now){
 if(firstLevel>hero.level||!hasLevelPerk(hero,'engineer-side-job'))return;
 let reward=0;
 for(let level=firstLevel;level<=hero.level;level++)reward+=800+100*level;
 state.money+=reward;
 addHistory(state,`${hero.name}: «Халтурка», +${reward/10} A.`,now);
}
export function nationalityMoneyBonus(hero,money=0){return hero.nationalityBonuses?.questMoneyPercent>0?Math.max(10,roundRatio(money,hero.nationalityBonuses.questMoneyPercent)):0;}
export function nationalityClaimBonus(hero,job){if(!job||job.kind==='series')return 0;const n=hero.nationalityBonuses??{};if(n.minimumExpeditionBonus&&job.kind!=='rest'&&job.result?.alive!==false)return nationalityMoneyBonus(hero,job.result?.money??0);if(n.safeMoneyBase&&job.kind!=='rest'&&job.result?.alive!==false&&(job.result?.minimumHp??hero.hp)>=(job.startMaxHp??effectiveMaxHp(hero))*2/3)return n.safeMoneyBase+(job.claimLevel??hero.level)*n.safeMoneyLevel;if(hero.nationalityBonuses?.combatMoneyBase&&job.result?.alive&&(job.result.killed??0)>0)return hero.nationalityBonuses.combatMoneyBase+(job.claimLevel??hero.level)*hero.nationalityBonuses.combatMoneyLevel;if(isCombatRun(job)&&!job.result.alive)return 0;const hasReward=job.kind==='rest'?job.healing>0&&hero.hp<effectiveMaxHp(hero):(job.result.xp??0)>0||(job.result.money??0)>0||Object.values(job.result.loot).some(q=>q>0);return hasReward?nationalityMoneyBonus(hero,job.result?.money??0):0;}
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
const craftableLootItems=new Set(Object.values(RECIPES)
 .filter(recipe=>!recipe.upgrade&&!recipe.legacy).map(recipe=>recipe.output));
function lootWithQuality(entries,seed){
 const rolls=rng((seed^0x6c8e9cf5)>>>0);
 return entries.flatMap(entry=>{
  const quality=itemQuality(entry);
  if(entry.lootQualityResolved||!['weapon','body','accessory','stimulant'].includes(ITEMS[entry.item]?.type)
   ||craftableLootItems.has(entry.item)||quality>=5)return [entry];
  return Array.from({length:entry.qty},()=>rolls.int(1,100)<=10
   ?{...entry,qty:1,quality:quality+1}:{...entry,qty:1});
 });
}
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
export const radiationBlocksMissions=hero=>Boolean(hero.unconscious)||100*(hero.mark==='regeneration'?20:10)*(hero.radiation??0)>=95*hero.maxHp;
export const effectiveMaxHp=hero=>Math.max(1,hero.maxHp-(hero.mark==='regeneration'?20:10)*(hero.radiation??0));
export function jobRadiation(job){
 if(job?.kind==='series')return (job.reports??[]).reduce((total,run)=>total+(run.result?.radiation??0),0);
 return job?.result?.radiation??0;
}
export function interactiveMissionReady(id='zilRoute'){const mission=INTERACTIVE_MISSIONS[id];return Boolean(mission?.entry&&mission.nodes[mission.entry]&&mission.nodes[mission.entry].playable!==false);}
export const heroReviveCost=(hero,state)=>200*hero.level*(doctorRehabilitation(state,hero)?0.5:1);
export const isCombatJob=kind=>kind==='mission'||kind==='patrol'||kind==='technopark'||kind==='caravan'||kind==='surface'||kind==='zilTunnels'||kind==='surfaceShops'||kind==='pukGrassSearch';
const specialEffect=(hero,key)=>(ITEMS[hero.special]?.effect?.[key]??0)+(ITEMS[hero.pet]?.effect?.[key]??0);
export function heroAttributes(hero){const p=PROFESSIONS[hero.profession??'saboteur'];return Object.fromEntries(['strength','agility','intelligence','perception'].map(key=>[key,Math.max(0,Math.min((hero.doctorOperationAttributes?.[key]??0)>0?11:10,p[key]+(key==='agility'?(activeStimulantEffects(hero).agility??0):0)+(key==='intelligence'&&hasScientistPerk(hero,'smart')?1:0)+(key==='perception'?specialEffect(hero,'perception'):0)+(hero.rebirthAttributes?.[key]??0)+(hero.doctorOperationAttributes?.[key]??0)-(key==='strength'&&hero.resuscitated?1:0)+(hero.nationalityBonuses?.attributes?.[key]??0)+Number(hero.hobby?.option===key)+(hero.levelPerks??[]).filter(({perk})=>LEVEL_PERKS[perk]?.attributeBonus===key).length)-(hero.temporaryAttributeLoss?.[key]??0)-(['strength','agility'].includes(key)?hero.poisonDoses??0:0)+(key==='strength'?(hero.medicStrength??0):0))]));}
export function adventureCooldownRemaining(hero,now=Date.now()){
 return Math.max(0,(hero?.adventureCooldownUntil??0)-now);
}
function startAdventureCooldown(state,active,now){
 for(const id of active.heroIds){
  const hero=state.heroes.find(member=>member.id===id);
  if(!hero||hero.dead||hero.hp<=0)continue;
  const maxHp=effectiveMaxHp(hero);
  const missing=Math.max(0,maxHp-hero.hp);
  const minutes=Math.min(10,1+Math.floor(10*missing/maxHp+1e-9));
  hero.adventureCooldownUntil=now+minutes*60000;
  hero.needsAdventureRest=false;
 }
}
export function needsAdventureRecovery(hero){if(hero?.adventureCooldownUntil!=null)return true;return Boolean(hero?.needsAdventureRest||Object.values(hero?.temporaryAttributeLoss??{}).some(value=>value>0));}
export function heroEffectiveStrength(hero){const base=heroAttributes({...hero,temporaryAttributeLoss:{...hero.temporaryAttributeLoss,strength:0}}).strength;return Math.max(0,base+(hero.leaderKebabRuns>0?2:0)-(hero.temporaryAttributeLoss?.strength??0));}
function restoreAdventureAttributes(hero){hero.temporaryAttributeLoss={};hero.needsAdventureRest=false;hero.maxHp=heroMaximumHp(hero);hero.hp=Math.min(hero.hp,effectiveMaxHp(hero));}
export function consumableLimit(hero){return Math.max(0,1+2*heroAttributes(hero).strength+(hero.nationalityBonuses?.supplyLimit??0)+specialEffect(hero,'supplies'));}
export const medicalSupplyLimit=hero=>consumableLimit(hero)+(hasMedicPerk(hero,'sanitary')?3:0);
export function bestSuppliesPlan(state,hero=state.hero,category=null){
 if(!hero)return [];
 const plan=[],limit=category==='medicine'?medicalSupplyLimit(hero):consumableLimit(hero);
 const groups=[
  [['doctorKit','doctorKits'],['medicKit','medicKits'],['dressingKit','dressingKits'],['bandage','bandages']],
  [['molotov','molotovs'],['pipeGrenade','grenades'],['tinGrenade','tinGrenades'],['lu216','lu216Grenades'],['dynamite','dynamites']].sort((a,b)=>{const power=id=>(ITEMS[id].min+ITEMS[id].max)*(id==='molotov'?2:1);return power(b[0])-power(a[0])||(ITEMS[b[0]].value??0)-(ITEMS[a[0]].value??0);})
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
export function earnedPerkLevels(hero){return hero.earnedPerkLevels??perkSchedule(hero,hero.level);}
export function availablePerkLevels(hero){const chosen=new Set((hero.levelPerks??[]).map(p=>p.level));return [...earnedPerkLevels(hero).filter(level=>!chosen.has(level)),...Array(hero.extraPerkChoices??0).fill(null)];}
export function levelPerkOptions(hero){return Object.entries(LEVEL_PERKS).filter(([id,p])=>(p.profession==='all'||(p.profession==='tea'&&hero.isTea)||p.profession===(hero.profession??'saboteur'))&&!p.legacy&&(!p.requires||p.requires===(hero.startPerk??hero.perk)||hasLevelPerk(hero,p.requires))&&(!p.hobby||(hero.hobby?.id===p.hobby&&(hero.levelPerks??[]).filter(choice=>choice.perk===id).length<3))&&hero.level>=p.minLevel&&hero.level<=(p.maxPickLevel??Infinity)&&(!p.rewardRole||(hero.rewardPerkUnlocks??[]).includes(id))&&id!==(hero.startPerk??hero.perk)&&(p.repeatable||!(hero.levelPerks??[]).some(x=>x.perk===id))).map(([id,p])=>({id,...p}));}
const levelPerkHpBonus=h=>(hasDoctorPerk(h,'health')?60+5*Math.max(0,h.level-(h.levelPerks.find(p=>p.perk==='doctor-health').pickedAtLevel??3)):0)+(hasLevelPerk(h,'heavy-health')?20+7*Math.max(0,h.level-4):0)+(h.levelPerks??[]).reduce((hp,{perk})=>hp+(perk==='enduring'?30:(LEVEL_PERKS[perk]?.hpBonus??0)+(LEVEL_PERKS[perk]?.maxHpBonus??0)),0);
export const hasAutoStimulator=row=>Boolean(row?.upgrades?.some(upgrade=>RECIPES[upgrade.recipe]?.autoHeal));
function hasHeavyGunner(hero){
 return hero?.profession==='heavy'&&(hero.perk==='heavy-gunner'||hero.levelPerks?.some(choice=>choice.perk==='heavy-gunner'));
}
export function canEquipMainWeapon(hero,item){
 return !item.rangedSlotOnly||(item.weaponClass==='heavy'&&hasHeavyGunner(hero));
}
export function heavyAmmoWeapon(hero){
 return [ITEMS[hero?.rangedWeapon],ITEMS[hero?.weapon]].find(item=>item?.usesHeavyAmmo);
}
export function heroConfig(s,hero=s.hero,location=hero?.job?.location??hero?.job?.kind??null){const h={...hero};for(const slot of ['weapon','rangedWeapon','body','accessory','special','pet'])if(h[slot]&&(!canUseEquipment(h,{...h[slot+'Details'],item:h[slot]})||ITEMS[h[slot]]?.requiresBeetleBattery&&!h.beetleBatteryConnected)){h[slot]=null;h[slot+'Details']=null;}const p=PROFESSIONS[h.profession??'saboteur'],base=clone(CONFIG);Object.assign(base.hero,heroAttributes(h),{strength:heroEffectiveStrength(h),initiative:heroAttributes(h).agility,accuracy:5*rebirthStars(h)+(p.accuracy??0)+1.25*Math.max(0,(h.level??1)-1)+(h.nationalityBonuses?.accuracy??0)+(activeStimulantEffects(h).accuracy??0),pistolDamageBonus:h.nationalityBonuses?.pistolDamage??0,evasion:35+7.5*heroAttributes(h).agility+(p.evasionBonus??0)+5*rebirthStars(h)});let c=withStarterPerk(base,h.perk,h.level);for(const id of new Set((h.levelPerks??[]).map(x=>LEVEL_PERKS[x.perk]?.starterEffect).filter(Boolean))){if(id!==h.perk)c=withStarterPerk(c,id,h.level);}c.hero.perk=h.perk;c.hero.defenseCheckBonus=hasDoctorPerk(h,'composure')?2:0;c.hero.damageTakenMultiplier=hasDoctorPerk(h,'nerves')?.9:1;c.hero.medicNimble=hasMedicPerk(h,'nimble');c.hero.medicDoubleHeal=hasMedicPerk(h,'double-heal');if(hasMedicPerk(h,'shooter'))(h.nationalityBonuses={...h.nationalityBonuses,pistolAccuracy:(h.nationalityBonuses?.pistolAccuracy??0)+5});c.hero.professionPerks=[h.perk,...(h.levelPerks??[]).map(choice=>choice.perk)];if(hasLevelPerk(h,'heavy-burst'))c.hero.burstBonus=(c.hero.burstBonus??0)+1;for(const chosen of h.levelPerks??[]){const development=LEVEL_PERKS[chosen.perk];c.hero.evasion+=development?.evasionBonus??0;c.hero.physicalArmorBonus=(c.hero.physicalArmorBonus??0)+(development?.physicalArmorBonus??0);c.hero.thermalArmorBonus=(c.hero.thermalArmorBonus??0)+(development?.thermalArmorBonus??0);if(chosen.perk==='favorite-close'){c.hero.closeAccuracyBonus=(c.hero.closeAccuracyBonus??0)+5;c.hero.closeDamageBonus=(c.hero.closeDamageBonus??0)+5;}if(chosen.perk==='quick-reaction'){c.hero.initiative+=2;c.hero.evasion+=3;}if(chosen.perk==='samurai')c.hero.meleeDamageBonus=(c.hero.meleeDamageBonus??0)+4*Math.max(0,h.level-chosen.pickedAtLevel+1);
 if(chosen.perk==='hunter-correction'){c.hero.correctionStep=3;c.hero.correctionMax=15;}if(chosen.perk==='hunter-falcon-eye')c.hero.perceptionReroll=true;if(chosen.perk==='hunter-distance'){c.hero.initialPerceptionBonus=2;c.hero.maxStartingDistance=4;}
 if(chosen.perk==='bandit-alert'){c.hero.evasion+=4*c.hero.perception;c.hero.earMeleeAccuracy=4*c.hero.perception;}if(chosen.perk==='bandit-mark')c.hero.firstEnemyFocus=true;if(chosen.perk==='bandit-seasoned')c.hero.halveHeavyHit=true;if(chosen.perk==='bandit-rampage'){c.hero.desperation=true;c.hero.lowHealthEvasionBonus=5;}
 if(chosen.perk==='assault-accurate')c.hero.accuracy+=5;
 if(chosen.perk==='assault-reaction'){c.hero.initiative+=2;c.hero.evasion+=4;}
 if(chosen.perk==='assault-burst')c.hero.burstAccuracyBonus=10;
 if(chosen.perk==='engineer-shooter')c.hero.rangedAccuracyBonus=5;
 if(chosen.perk==='engineer-armorer')c.hero.physicalArmorBonus=(c.hero.physicalArmorBonus??0)+10;
}
Object.assign(c.hero,{nationality:clone(h.nationalityBonuses??{}),medicineBonus:(h.nationalityBonuses?.medicineBonus??0)+(hasMedicPerk(h,'field')?20:0)+doctorMedicineBonus(s),postBattleMedicineBonus:hasMedicPerk(h,'knowledge')?20:0});c.hero.initiative+=h.nationalityBonuses?.initiative??0;c.hero.evasion+=h.nationalityBonuses?.evasion??0;c.hero.accuracy+=h.hobby?.option==='accuracy'?5:0;c.hero.accuracy-=ITEMS[h.body]?.accuracyPenalty??0;c.hero.maxHp=effectiveMaxHp(h);c.hero.currentHp=h.hp;c.hero.evasionBonusCap=ITEMS[h.body]?.evasionBonusCap;c.hero.ricochet=itemRicochet({item:h.body,...h.bodyDetails});c.hero.autoStimulator=Boolean(h.body&&hasAutoStimulator(h.bodyDetails));c.hero.missionTimePenaltyPercent=ITEMS[h.body]?.missionTimePenaltyPercent??0;c.hero.regeneration=h.mark==='regeneration'?3:0;c.hero.darkGrasp=h.mark==='darkGrasp';c.hero.firstHitArmor=h.body?firstHitArmor(h.bodyDetails):0;c.hero.armor=(h.body?itemArmor({...h.bodyDetails,item:h.body}):0)+(c.hero.physicalArmorBonus??0);c.hero.thorns=itemThorns(h.bodyDetails);c.hero.thermalArmor=(h.body?itemThermalArmor({item:h.body,...h.bodyDetails}):0)+(c.hero.thermalArmorBonus??0);c.hero.radiationProtection=itemRadiationProtection({item:h.body,...h.bodyDetails})+itemRadiationProtection({item:h.accessory,...h.accessoryDetails});if(h.resuscitated){c.hero.armor+=10;c.hero.thermalArmor+=10;}if(hasDoctorPerk(h,'institute'))c.hero.radiationProtection+=h.level>=6?2:1;if(hasLevelPerk(h,'heavy-armor')&&ITEMS[h.body]?.accuracyPenalty){c.hero.accuracy+=Math.min(5,ITEMS[h.body].accuracyPenalty);c.hero.thermalArmor+=7;}if(hasLevelPerk(h,'heavy-padding')&&['medium','heavy'].includes(ITEMS[h.body]?.armorClass)){c.hero.armor+=15;c.hero.thermalArmor+=7;c.hero.accuracy-=5;}c.hero.armor+=h.nationalityBonuses?.armor??0;
const effect=activeStimulantEffects(h);
c.hero.strength+=effect.strength;
c.hero.evasion+=effect.evasion;
c.hero.thermalArmor+=(h.nationalityBonuses?.thermalArmor??0)+(h.hobby?.option==='thermal'?10:0);c.hero.radiationProtection+=(h.nationalityBonuses?.radiationProtection??0)+(h.levelPerks??[]).reduce((sum,choice)=>sum+(LEVEL_PERKS[choice.perk]?.radiationProtectionBonus??0),0);c.hero.meleeAccuracyBonus=(ITEMS[h.body]?.meleeAccuracyBonus??0)+(h.nationalityBonuses?.meleeAccuracy??0)+(c.hero.earMeleeAccuracy??0);c.hero.meleeDamageBonus=(c.hero.meleeDamageBonus??0)+(h.nationalityBonuses?.meleeDamage??0);c.hero.rangedAccuracyBonus=(c.hero.rangedAccuracyBonus??0);c.hero.pistolDamageBonus=h.nationalityBonuses?.pistolDamage??0;c.hero.criticalChance+=(c.hero.nationality.criticalBonus??0);c.hero.stealthCheckBonus=(c.hero.stealthCheckBonus??0)+(c.hero.nationality.stealthBonus??0);const weapon=ITEMS[h.weapon];const spec=(item,details,familiarity=0)=>{
 if(!item)return null;
 const {combat,weaponClass,secondaryWeaponClass,min,max,piercing,maxDistance,strengthMultiplier,damageType,distancePenalty,shots,damageRolls,flame,shotPenalty,jamChance,usesHeavyAmmo,reloadMain,reloadEverySlot,bayonet,closeAccuracyBonus}=ITEMS[item];
 const upgrades=details?.upgrades??[];
 const heavyAccuracy=weaponClass==='heavy'?(c.hero.heavyAccuracyBonus??0):0;
 const bonuses=(type,range)=>upgrades.filter(u=>!bayonet||(RECIPES[u.recipe]?.target??'melee')===type)
  .reduce((out,u)=>({
   min:out.min+(u.minBonus??0),max:out.max+(u.maxBonus??0),
   bonus:out.bonus+(u.bonus??0),accuracyBonus:out.accuracyBonus+(u.accuracyBonus??0)
  }),{min:(details?.legacyWeaponMin??range.min)+10*itemQuality(details),max:range.max+10*itemQuality(details),bonus:familiarity,accuracyBonus:(ITEMS[item].accuracyBonus??0)+4*itemQuality(details)+heavyAccuracy});
 return {origin:details?.origin??'unknown',item,name:itemName({item,...details}),type:combat,weaponClass,secondaryWeaponClass,piercing,maxDistance,strengthMultiplier,damageType,distancePenalty,shots,damageRolls,flame,shotPenalty,jamChance,usesHeavyAmmo,reloadMain,reloadEverySlot,closeAccuracyBonus,poison:ITEMS[item].poison,criticalBonus:ITEMS[item].criticalBonus??0,armorFactor:upgrades.reduce((factor,u)=>factor*(u.armorFactor??1),1),blocksAimedShots:upgrades.some(u=>u.blocksAimedShots||RECIPES[u.recipe]?.blocksAimedShots),...bonuses(combat,{min,max}),
  bayonet:bayonet?{item,type:'melee',isBayonet:true,...bonuses('melee',bayonet)}:null};
};
 c.hero.id=h.id;c.hero.name=h.name;c.hero.accuracy-=5*(h.poisonDoses??0);c.hero.evasion-=5*(h.poisonDoses??0);c.hero.radiation=h.radiation??0;
 c.hero.scientistControl=hasScientistPerk(h,'control');
 c.hero.scientistSafety=hasScientistPerk(h,'safety');
 c.hero.scientistSafetyUsed=Boolean(s.interactiveMission?.scientistSafetyUsed?.[h.id]);
 c.hero.scientistMechanism=hasScientistPerk(h,'mechanism');
 c.hero.scientistEureka=location==='surface'&&h.job?.kind==='interactive'&&hasScientistPerk(h,'eureka')?2:0;
 c.hero.perceptionCheckBonus=(c.hero.perceptionCheckBonus??0)+c.hero.scientistEureka;
 c.hero.stealthCheckBonus=(c.hero.stealthCheckBonus??0)+c.hero.scientistEureka;
 c.hero.scientistSearchBonus=hasScientistPerk(h,'analyst')?2:0;
 c.hero.intelligenceCheckBonus=hasScientistPerk(h,'analyst')?2:0;
 c.hero.radiationProtection+=hasScientistPerk(h,'geiger')?(h.level>=6?2:1):0;
 c.hero.heavyAmmo=h.heavyAmmo??0;c.hero.weapons={main:spec(h.weapon,h.weaponDetails,h.weaponFamiliarity??0),ranged:spec(h.rangedWeapon,h.rangedWeaponDetails,h.rangedWeaponFamiliarity??0)};if(heroHasDualWield(h)&&c.hero.weapons.ranged?.type==='melee'){c.hero.dualWield=true;c.hero.dualWieldAccuracyPenalty=10;c.hero.weapons.ranged.noStrength=true;}c.hero.weaponType=weapon?.combat??'melee';c.hero.weaponMin=weapon?.min??10;c.hero.weaponMax=weapon?.max??30;c.hero.weaponBonus=(h.weaponDetails?.upgrades??[]).reduce((sum,u)=>sum+(u.bonus??0),0);if(h.wounds>0){c.hero.accuracy-=10; // Separate percentile penalty is not stacked until rules are clarified.
 c.hero.checkPenalty=2;c.hero.initiative-=2;
 }if(location){const n=h.nationalityBonuses??{},checks=(location==='surface'||location==='surfaceShops'||location==='pukGrassSearch')?n.surfaceChecks??0:n.undergroundChecks??0;c.hero.perceptionCheckBonus=(c.hero.perceptionCheckBonus??0)+checks;c.hero.stealthCheckBonus=(c.hero.stealthCheckBonus??0)+checks;}
 c.hero.armor=Math.max(0,c.hero.armor+specialEffect(h,'armor')+effect.armor);
 c.hero.thermalArmor+=specialEffect(h,'thermal')+effect.thermal;
 c.hero.radiationProtection+=specialEffect(h,'rad')+effect.rad;
 c.hero.halveRadiation=effect.halveRadiation>0;
 c.hero.evasion+=(ITEMS[h.body]?.evasionBonus??0)+specialEffect(h,'evasion');
 c.hero.ricochet=(c.hero.ricochet??0)+specialEffect(h,'ricochet');
 c.hero.meleeDamageBonus+=specialEffect(h,'melee');
 c.hero.pistolDamageBonus+=specialEffect(h,'pistol');
 c.hero.rangedAccuracyBonus+=specialEffect(h,'ranged');
 c.hero.detectionBonus=(c.hero.detectionBonus??0)+specialEffect(h,'detect')+(effect.detect??0);
 c.hero.trapBonus=(c.hero.trapBonus??0)+specialEffect(h,'detect');
 c.hero.lootBonus=(c.hero.lootBonus??0)+specialEffect(h,'loot');
 c.hero.criticalProtection=specialEffect(h,'crit');
 c.hero.monsterProtection=specialEffect(h,'monster');
 c.hero.negotiationBonus=specialEffect(h,'talk');
 c.hero.blindImmune=Boolean(ITEMS[h.special]?.effect?.blind);
 return c;
}
export function stimulantEffects(item,quality=0,hero={}){
 const rank=itemQuality({quality});
 const scale=hero.nationalityBonuses?.stimulantPercent?1.5:1;
 if(item==='grassGum')return {agility:1*scale,detect:1*scale,speed:25*scale};
 if(item==='znka')return {rad:3,decontamination:1};
 if(item==='hansaAntirad')return {halveRadiation:1};
 if(item==='strongPainkiller')return {armor:15,thermal:7,accuracy:-5};
 if(item==='piercerKebab')return {hp:0,hpPercent:0,accuracy:0,strength:1,evasion:scale,armor:10*scale};
 return item==='cardioStimulator'
  ? {hp:0,hpPercent:(15+2*rank)*scale,accuracy:0}
  : {hp:(40+5*rank)*scale,hpPercent:0,accuracy:5*scale};
}
export function heroMaximumHp(h){const strength=heroAttributes(h).strength;const base=Math.max(1,((120+30*strength+(h.nationalityBonuses?.hp??0))+(h.level-1)*(10+10*strength/3+(h.nationalityBonuses?.hpPerLevel??0)))*(1+rebirthStars(h)*.1) +specialEffect(h,'hp')*h.level+levelPerkHpBonus(h)+(h.medicNutrition??0)+(PERKS[h.startPerk??h.perk]?.maxHpBonus??0)-(h.permanentHpLoss??0));const effect=activeStimulantEffects(h);return Math.max(1,((base+effect.hp)*(h.hobby?.option==='endurance'?1.1:1)+strengthHpBonus(h))*(1+effect.hpPercent/100));}
function levelUp(h,xp){
 const cap=heroLevelCap(h);
 h.earnedPerkLevels??=perkSchedule(h,h.level);
 h.xp+=xp;
 while(h.level<cap&&h.xp>=100*h.level){
  h.xp-=100*h.level;
  h.level++;
  if(perkSchedule(h,h.level).includes(h.level))h.earnedPerkLevels.push(h.level);
  gainFamiliarity(h);
  grantNationalityMilestones(h);
  h.maxHp=heroMaximumHp(h);
 }
 if(h.level>=cap)h.xp=0;
}
export function locationOwner(state,kind){return getHeroes(state).find(hero=>hero.job&&(hero.job.trainingLocation??(hero.job.kind==='series'?hero.job.location:hero.job.kind))===kind)??null;}
function requireLocationLevel(hero,kind,special=false){requireThat(!hero.researchLeader,'Руководитель центра недоступен для обычных локаций.');requireThat(!needsAdventureRecovery(hero),hero.adventureCooldownUntil?'Герой ещё восстанавливается после вылазки.':'После приключения герою нужен отдых для восстановления параметров.');requireThat(!radiationBlocksMissions(hero),'Сильное облучение. Сначала сними радиацию.');requireThat(!(isCombatJob(kind)||special)||PROFESSIONS[hero.profession??'saboteur'].combatReady,'Боевые параметры этой профессии ещё не заданы.');requireThat(hero.level>=(LOCATION_LEVELS[kind]??1),`${locationName(kind)}: требуется ${LOCATION_LEVELS[kind]??1}-й уровень героя.`);}
function requireFreeLocation(state,kind){const owner=locationOwner(state,kind);requireThat(!owner,`Локация занята: ${owner?.name??''}. Сначала получи результат.`);}
export const locationName=kind=>({pukGrassSearch:'Поход за пук-травой',mission:'Мусорные кучи',patrol:'Патрулирование тоннелей',technopark:'Исследовать Технопарк',caravan:'С караваном на Павелецкую',surface:'Рыскать в окрестностях станции',zilTunnels:ZIL_TUNNELS.name,surfaceShops:SURFACE_SHOPS.name,help:'Помогать на станции',rest:REST_OPTIONS.station.name}[kind]??'Задание');
export const HERO_MARKS={regeneration:{name:'Регенерация',description:'В начале своего хода в бою восстанавливает 3 HP. После успешного прохождения локации — полное здоровье до доступного максимума. Каждая единица облучения блокирует 20 HP.'},darkGrasp:{name:'Тёмная хватка',description:'В первый ход героя каждого боя после стартовой гранаты наносит выбранному противнику (20–80) × Восприятие термического урона. Уворот против сложности 14 уменьшает урон вдвое. Гранаты не расходуются.'}};
export const SPECIAL_LOCATIONS={
 help:{name:'Тревога! Нападение крыс!',chance:7,description:'Четыре проверки сложности 10. Каждый успех приводит к бою с бешеной крысой (70 HP, укус 30–40). Награды удваиваются, за каждую победу ещё 5 A и 5 опыта.'},
 mission:{name:'Поймай Крысиного короля!',chance:8,seconds:30,description:'Проверка Ловкости против 12. Король имеет 350 HP и кусает дважды за ход, по 40–120 урона. Если он ускользнёт, придётся отбиться от четырёх обычных крыс.'},
 caravan:{name:'Караван потерялся',chance:LOST_CARAVAN.chance,seconds:LOST_CARAVAN.seconds,description:'Отыщи пропавший караван. В тоннелях бродят упыри, а у разбитого груза — большой упырь и вожак.'},
 patrol:{name:'Защита: стая упырей и вожак!',chance:6,seconds:40,description:'Сначала 1–3 упыря-разведчика, затем вожак с 450 HP. После первого попадания вожак ярится три своих хода, затем слабеет.'}
};
export const activeSpecialLocation=(state,kind)=>state.specialLocations?.[kind]?SPECIAL_LOCATIONS[kind]:null;
export const isCombatRun=run=>isCombatJob(run.kind)||Boolean(run.special);

const rolledSpecialLocation=(kind,run)=>Number.isInteger(run?.seed)
 && rng(run.seed^0x9e3779b9).int(1,100)<=SPECIAL_LOCATIONS[kind]?.chance;
function recordSpecialLocationRun(state,kind,run){
 if(!SPECIAL_LOCATIONS[kind]||!run?.result||run.result.alive===false||run.special)return false;
 const clears=state.specialLocationClears??={};
 const previous=clears[kind]??Number(Boolean(state.completedLocations?.[kind]));
 clears[kind]=Math.min(5,previous+1);
 return previous>=5&&rolledSpecialLocation(kind,run);
}

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
  }else{
   let unlocked=false;
   for(const run of runs)if(recordSpecialLocationRun(state,kind,run))unlocked=true;
   if(unlocked)(state.specialLocations??={})[kind]=true;
  }
 }
 return changed;
}

function specialExpedition(kind,config,random,options){
 if(kind==='caravan')return lostCaravanExpedition(config,random,options);
 if(kind==='patrol'){
  const finalEnemy=GHOUL_LEADER;
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
 const rat=success?{...config.rat,name:'Двухголовая крыса-мутант',boss:true,hp:350,evasion:45,accuracy:15,stealth:1,agility:1,damageMin:40,damageMax:120,attacksPerTurn:2}:config.rat;
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
 station: {name:'Отдохнуть в кафе «Столовая»', seconds:15, cost:100, healing:(hero,state)=>nationalityHealing(hero,.2*hero.maxHp+10*heroAttributes(hero).strength)*doctorRestMultiplier(state)},
 stationFull: {name:'В столовой до полного восстановления',seconds:15,cost:100,healing:(hero,state)=>REST_OPTIONS.station.healing(hero,state)}
};
export function fullRestQuote(hero,state){
 const healing=REST_OPTIONS.station.healing(hero,state);
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
function ordinaryLocationLoot(kind,result){
 const common={mission:CONFIG.loot,patrol:PATROL.loot,caravan:CARAVAN.loot,technopark:TECHNOPARK.loot};
 if(common[kind])return common[kind].map(entry=>entry.id);
 if(kind==='surfaceShops')return [...new Set([...SURFACE_SHOPS.caches.flatMap(cache=>Object.keys(cache.loot)),...SURFACE_SHOPS.bonusLoot.map(entry=>entry.item)])];
 if(kind==='surface')return [...new Set([...SURFACE.tiers.flatMap(tier=>tier.loot.map(entry=>entry.item??entry.id)),...(SURFACE.bonusLoot??[]).map(entry=>entry.item)].filter(Boolean))];
 if(kind==='zilTunnels')return Object.keys(result.loot);
 return [];
}
function makeRun(s,hero,kind,at,seed,allowSpecial=true){
 startStimulant(hero,kind);const config=heroConfig(s,hero,kind),run=createRun(s,hero,kind,at,seed,allowSpecial,config);
 if(heavyAmmoWeapon(hero)&&run.result){
  run.result.heavyAmmoRemaining=config.hero.heavyAmmo;
  run.result.heavyAmmoSpent=(hero.heavyAmmo??0)-config.hero.heavyAmmo;
 }if(run.result)run.result.doctorRadiationRemoved=config.hero.doctorRadiationRemoved??0;run.claimLevel=hero.level;run.startMaxHp=effectiveMaxHp(hero);if(run.result)run.result.minimumHp=Math.min(hero.hp,run.result.hp??hero.hp,run.result.minimumHp??Infinity,...(run.result.battles??[]).map(b=>b.minimumHp??b.hp));if(hero.activeStimulant||hero.activeSecondStimulant)run.stimulant=true;if(run.result?.alive!==false&&run.result){const n=hero.nationalityBonuses??{};if((run.result.money??0)>0){const combat=(run.result.battles?.length??0)>0;run.result.money=roundRatio(run.result.money,100+(n.questMoneyPercent<0?n.questMoneyPercent:0)+(combat?0:n.noncombatMoneyPercent??0));}}
 if(run.result&&run.result.alive!==false){
  if(run.result.radiation!=null)run.result.radiation=Math.max(0,run.result.radiation-scientistRadiationReduction([hero]));
  const chance=hero.nationalityBonuses?.extraLootChance??0;
  if(chance&&isCombatJob(kind)){
   const random=rng(seed^0x9e3779b9),pool=ordinaryLocationLoot(kind,run.result);
   if(pool.length&&random.int(1,100)<=chance){
    const item=pool[random.int(0,pool.length-1)];
    run.result.loot[item]=(run.result.loot[item]??0)+1;
    (run.result.events??=[]).push({type:'дополнительная добыча',item});
   }
  }
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
  spendResearchFilters(s,1);
  const config=baseConfig;
  const result=surfaceExpedition(config,rng(seed),{hp:hero.hp,bandages:hero.bandages,dressingKits:hero.dressingKits,doctorKits:hero.doctorKits??0,medicKits:hero.medicKits,grenades:hero.grenades,molotovs:hero.molotovs,tinGrenades:hero.tinGrenades,lu216Grenades:hero.lu216Grenades,dynamites:hero.dynamites});
  const seconds=missionDuration(hero,SURFACE.seconds*1000)/1000;
  return {kind,seed,startedAt:at,endsAt:at+Math.round(seconds*1000),result};
 }
 const duration=ms=>missionDuration(hero,ms);
 if(kind==='pukGrassSearch'){
  requireThat(s.filters>=2,'Для похода за пук-травой нужны 2 фильтра.');
  spendResearchFilters(s,2);
  const {hp,bandages,dressingKits,doctorKits=0,medicKits,grenades,molotovs,tinGrenades,lu216Grenades,dynamites}=hero;
  const result=pukGrassExpedition(baseConfig,rng(seed),{hp,bandages,dressingKits,doctorKits,medicKits,grenades,molotovs,tinGrenades,lu216Grenades,dynamites,trace:true});
  return {kind,seed,startedAt:at,endsAt:at+duration(120000),result};
 }
 if(kind==='surfaceShops'){
  requireThat(s.completedLocations[SURFACE_SHOPS.unlockedBy],'Сначала успешно осмотри окрестности станции.');
  requireThat(s.filters>=SURFACE_SHOPS.filtersPerHero,'Для выхода к магазинам нужны 2 фильтра.');
  spendResearchFilters(s,SURFACE_SHOPS.filtersPerHero);
  const result=surfaceExpedition(baseConfig,rng(seed),{
   hp:hero.hp,bandages:hero.bandages,dressingKits:hero.dressingKits,doctorKits:hero.doctorKits??0,medicKits:hero.medicKits,
   grenades:hero.grenades,molotovs:hero.molotovs,tinGrenades:hero.tinGrenades,lu216Grenades:hero.lu216Grenades,dynamites:hero.dynamites
  },SURFACE_SHOPS);
  return {kind,seed,startedAt:at,endsAt:at+duration(SURFACE_SHOPS.seconds*1000),result};
 }
 if(kind==='zilTunnels'){
  requireThat(s.completedLocations[ZIL_TUNNELS.unlockedBy],'Сначала заверши вылазку «Открыть путь на ЗИЛ».');
  requireThat(s.filters>=ZIL_TUNNELS.filtersPerHero,'Для выхода в тоннели ЗИЛ нужны 2 фильтра.');
  spendResearchFilters(s,ZIL_TUNNELS.filtersPerHero);
  const result=zilTunnelsExpedition(baseConfig,rng(seed),{
   hp:hero.hp,bandages:hero.bandages,dressingKits:hero.dressingKits,doctorKits:hero.doctorKits??0,medicKits:hero.medicKits,
   grenades:hero.grenades,molotovs:hero.molotovs,tinGrenades:hero.tinGrenades,lu216Grenades:hero.lu216Grenades,dynamites:hero.dynamites,trace:true
  });
  return {kind,seed,startedAt:at,endsAt:at+duration(ZIL_TUNNELS.seconds*1000),result};
 }
 if(allowSpecial&&activeSpecialLocation(s,kind)){
  const options={hp:hero.hp,bandages:hero.bandages,dressingKits:hero.dressingKits,doctorKits:hero.doctorKits??0,medicKits:hero.medicKits,grenades:hero.grenades,molotovs:hero.molotovs,tinGrenades:hero.tinGrenades,lu216Grenades:hero.lu216Grenades,dynamites:hero.dynamites,trace:true};
  const seconds=SPECIAL_LOCATIONS[kind].seconds??(kind==='patrol'?PATROL.mission.seconds:kind==='help'?10:7);
  const random=rng(seed),result=specialExpedition(kind,baseConfig,random,options);
  if(kind==='mission'&&result.alive&&result.events.some(event=>event.type==='крысиный король'&&event.success)&&!s.darkCrystalDropped&&random.int(1,100)<=50){
   result.loot.darkCrystal=1;s.darkCrystalDropped=true;
  }
  return {kind,special:true,seed,startedAt:at,endsAt:at+duration(seconds*1000),result};
 }
 if(kind==='caravan'){
  const clears=s.specialLocationClears?.caravan??Number(Boolean(s.completedLocations?.caravan));
  const series=s.heroes.find(member=>member.job?.worker===hero)?.job;
  const seriesClears=series?.reports?.filter(run=>!run.special&&run.result?.alive).length??0;
  const mission=clears+seriesClears>=5?{...CARAVAN.mission,attackChances:[25,40,45]}:CARAVAN.mission;
  const config={...baseConfig,rat:CARAVAN.enemy,mission,loot:CARAVAN.loot};
  const caravan={...CARAVAN.escort,maxHp:CARAVAN.escort.hp};
  const result=expedition(config,rng(seed),{hp:hero.hp,bandages:hero.bandages,dressingKits:hero.dressingKits,doctorKits:hero.doctorKits??0,medicKits:hero.medicKits,grenades:hero.grenades,molotovs:hero.molotovs,tinGrenades:hero.tinGrenades,lu216Grenades:hero.lu216Grenades,dynamites:hero.dynamites,trace:true,caravan});
  return {kind,seed,startedAt:at,endsAt:at+duration(CARAVAN.seconds*1000),result};
 }
 if(kind==='technopark'){
  const firstClear=!s.completedLocations?.technopark&&!s.heroes.some(member=>member.job?.kind==='series'&&member.job.location==='technopark'&&member.job.reports?.some(report=>report.result?.alive));
  const mission=firstClear?{...TECHNOPARK.mission,maxReinforcements:2}:TECHNOPARK.mission;
  const config={...baseConfig,rat:TECHNOPARK.enemy,mission,loot:TECHNOPARK.loot};
  const random=rng(seed),locationRadiation=s.completedLocations?.technoparkRoof?0:random.int(TECHNOPARK.radiation.min,TECHNOPARK.radiation.max);
  const result=expedition(config,random,{hp:hero.hp,bandages:hero.bandages,dressingKits:hero.dressingKits,doctorKits:hero.doctorKits??0,medicKits:hero.medicKits,grenades:hero.grenades,molotovs:hero.molotovs,tinGrenades:hero.tinGrenades,lu216Grenades:hero.lu216Grenades,dynamites:hero.dynamites,trace:true});
  result.locationRadiation=locationRadiation;
  result.radiation=result.alive?Math.max(0,(config.hero.halveRadiation?Math.floor(locationRadiation/2):locationRadiation)-config.hero.radiationProtection):0;
  result.events.unshift({type:'радиация локации',level:locationRadiation,protection:config.hero.radiationProtection,received:result.radiation});
  return {kind,seed,startedAt:at,endsAt:at+duration(TECHNOPARK.seconds*1000),result};
 }
 if(kind==='patrol'){requireThat(patrolReady(),'Характеристики упыря-разведчика ещё уточняются.');const config=baseConfig;config.rat=clone(PATROL.enemy);config.mission=clone(PATROL.mission);config.loot=clone(PATROL.loot);return {kind,seed,startedAt:at,endsAt:at+duration(PATROL.mission.seconds*1000),result:expedition(config,rng(seed),{hp:hero.hp,bandages:hero.bandages,dressingKits:hero.dressingKits,doctorKits:hero.doctorKits??0,medicKits:hero.medicKits,grenades:hero.grenades,molotovs:hero.molotovs,tinGrenades:hero.tinGrenades,lu216Grenades:hero.lu216Grenades,dynamites:hero.dynamites,trace:true})};}
 if(kind==='mission')return {kind,seed,startedAt:at,endsAt:at+duration(CONFIG.mission.seconds*1000),result:expedition(baseConfig,rng(seed),{hp:hero.hp,bandages:hero.bandages,dressingKits:hero.dressingKits,doctorKits:hero.doctorKits??0,medicKits:hero.medicKits,grenades:hero.grenades,molotovs:hero.molotovs,tinGrenades:hero.tinGrenades,lu216Grenades:hero.lu216Grenades,dynamites:hero.dynamites,trace:true})};
 if(kind==='help')return {kind,seed,startedAt:at,endsAt:at+duration(10000),result:stationHelp(heroConfig(s,hero,kind),rng(seed))};
 requireThat(kind==='rest','Нет такой локации.');requireThat(hero.hp<effectiveMaxHp(hero),'Здоровье уже полное.');pay(s,100);return {kind,startedAt:at,endsAt:at+30000,healing:.2*hero.maxHp+10*heroConfig(s,hero,kind).hero.strength};
}
function settleHeavyAmmo(state,hero,result,now){
 if(result?.heavyAmmoRemaining==null||hero.dead)return null;
 hero.heavyAmmo=result.heavyAmmoRemaining;
 const missing=Math.max(0,(hero.heavyAmmoTarget??0)-hero.heavyAmmo);
 const spent=result.heavyAmmoSpent??0,weapon=heavyAmmoWeapon(hero),cost=weapon?.ammoCost??10;
 if(!weapon?.usesHeavyAmmo||(!spent&&(!hero.autoHeavyReload||!missing)))return null;
 const report={weapon:weapon.name,spent,loaded:0,failed:false};
 if(hero.autoHeavyReload&&missing){
  if(state.money<missing*cost)report.failed=true;
  else{
   pay(state,missing*cost);
   hero.heavyAmmo+=missing;
   report.loaded=missing;
  }
 }
 if(report.loaded||report.failed)addHistory(state,weapon.name+' · перезаряжено '+report.loaded+(report.failed?' · не хватило А':''),now);
 return report;
}
function stopSeries(job,reason){job.phase='done';job.reason=reason;}
function finishReadyRests(state,now){let changed=false;for(const hero of getHeroes(state)){const job=hero.job;if(job?.kind!=='rest'||!ready(job,now))continue;const before=hero.hp,bonus=claimBonus(hero,job)+nationalityClaimBonus(hero,job),completed=job.restoresAdventureAttributes??(job.restType==='stationFull'?(job.completedCycles??0)>0:now>=job.endsAt),full=job.restType==='stationFull'&&hero.hp+job.healing>=effectiveMaxHp(hero)-1e-9;if(completed&&needsAdventureRecovery(hero))restoreAdventureAttributes(hero);hero.hp=full&&completed?effectiveMaxHp(hero):Math.min(effectiveMaxHp(hero),hero.hp+job.healing);state.money+=bonus;hero.lastRest={finishedAt:now,healed:Math.max(0,hero.hp-before),hp:hero.hp};hero.job=null;changed=true;}return changed;}
export const TRAINING_UPGRADES={
 speed:{name:'Ускорить походы',cost:3000,step:4,maxLevel:13},
 experience:{name:'Увеличить опыт',cost:3000,step:3,maxLevel:12},
 repeats:{name:'Добавить повторы',cost:2000,step:3,maxLevel:12}
};
export function trainingCenterStats(state){
 const levels=state.trainingCenter?.upgrades??{};
 return {
  durationPenalty:Math.max(-20,30-TRAINING_UPGRADES.speed.step*(levels.speed??0)),
  xpPenalty:Math.max(-15,20-TRAINING_UPGRADES.experience.step*(levels.experience??0)),
  maxRepeats:Math.min(50,15+TRAINING_UPGRADES.repeats.step*(levels.repeats??0))
 };
}
export function trainingUpgradeQuote(state,kind,now=Date.now()){
 if(!Object.hasOwn(TRAINING_UPGRADES,kind))return null;
 const level=state.trainingCenter?.upgrades?.[kind]??0;
 const cost=TRAINING_UPGRADES[kind].cost+2000*level;
 const seconds=120+60*level;
 const maxed=level>=TRAINING_UPGRADES[kind].maxLevel;
 const readyAt=state.trainingCenter?.upgradeReadyAt??0;
 return {cost,seconds,maxed,readyAt,available:!maxed&&readyAt<=now&&state.money>=cost};
}
export const TRAINING_SLOT_COSTS=[30000,50000,100000];
export function trainingCenterSlots(state){
 if(state.playerRole!=='tea'||!hasBuilding(state,'trainingCenter'))return [];
 return Array.from({length:state.trainingCenter?.slotCount??1},(_,index)=>getHeroes(state).find(hero=>hero.job?.trainingSlot===index)??null);
}
const trainingFilters=kind=>kind==='pukGrassSearch'?2:kind==='surfaceShops'?SURFACE_SHOPS.filtersPerHero:kind==='zilTunnels'?ZIL_TUNNELS.filtersPerHero:kind==='surface'?1:0;
export function trainingLocations(state,hero){
 if(!hero||hero.dead||hero.isTea||hero.job||state.teaTraining?.trainerId===hero.id)return [];
 return Object.keys(LOCATION_LEVELS).filter(kind=>!locationOwner(state,kind)&&!activeSpecialLocation(state,kind)&&!trainingBlock(state,hero,kind));
}
function trainingBlock(state,hero,kind){
 if(kind==='patrol'&&!patrolReady())return 'Патрулирование пока недоступно';
 if(kind==='surfaceShops'&&!state.completedLocations.surface)return 'Сначала осмотри окрестности станции';
 if(kind==='zilTunnels'&&!state.completedLocations.zilRoute)return 'Сначала открой путь на ЗИЛ';
 try{requireLocationLevel(hero,kind);}catch(error){return error.message;}
 return state.filters<trainingFilters(kind)?'Не хватает фильтров':'';
}
function queueTrainingRun(state,hero,slot,kind,at,random=Math.random,special=false){
 const assignment={trainingSlot:slot,trainingLocation:kind,trainingCompleted:hero.job?.trainingCompleted??0,trainingTotals:hero.job?.trainingTotals,trainingAutoSpecial:hero.job?.trainingAutoSpecial===true};
 const reason=trainingBlock(state,hero,kind);
 if(reason){hero.job={...assignment,kind:'trainingPause',reason};return false;}
 const run=makeRun(state,hero,kind,at,Math.floor(random()*4294967296),special);
 run.trainingFiltersSpent=trainingFilters(kind);
 const stats=trainingCenterStats(state);
 run.endsAt=at+Math.round((run.endsAt-at)*(1+stats.durationPenalty/100));
 if(run.result.alive!==false)run.result.xp=Math.max(1,roundRatio(run.result.xp,100-stats.xpPenalty));
 hero.job={...run,...assignment};
 return true;
}
function storeTrainingReport(state,hero,slot,kind,completed,totals,interrupted=false){
 (state.trainingCenter??={}).lastRuns??={};
 state.trainingCenter.lastRuns[slot]={
  name:hero.name,location:kind,completed,totals,interrupted,fallen:hero.dead,
  portrait:{gender:hero.gender,headwear:hero.headwear,nationality:hero.nationality,mark:hero.mark}
 };
}
function advanceTrainingCenter(state,now){
 let changed=false;
 const center=state.trainingCenter;
 if(center?.slotReadyAt!=null&&now>=center.slotReadyAt){
  center.slotCount++;
  delete center.slotReadyAt;
  changed=true;
 }
 for(const hero of trainingCenterSlots(state)){
  if(!hero)continue;
  for(let cycles=0;cycles<100;cycles++){
   const job=hero.job,{trainingSlot:slot,trainingLocation:kind}=job;
   if(job.kind==='trainingSpecial')break;
   const autoSpecial=job.trainingAutoSpecial===true;
   const waiting=job.kind==='trainingPause';
   let completed=job.trainingCompleted??0;
   const totals=job.trainingTotals??{loot:{},xp:0,damage:0,earned:0,spent:0,filters:0,radiation:0,partial:completed>0};
   if(!waiting&&job.endsAt>now)break;
   if(job.kind==='trainingStopping'){
    storeTrainingReport(state,hero,slot,kind,completed,totals,true);
    hero.job=null;
    changed=true;
    break;
   }
   const at=waiting||job.reason?now:job.endsAt;
   if(job.kind==='trainingRest'){
    hero.hp=Math.min(effectiveMaxHp(hero),hero.hp+job.healing);
   }else if(!waiting){
    const result=job.result;
    const loot=lootWithQuality(Object.entries(result.loot??{}).map(([item,qty])=>({item,qty})),job.seed);
    const gifts=firstLocationGifts(state,job);
    if(result.alive!==false&&!canReceive(state,[...loot,...gifts.flatMap(gift=>gift.items)])){
     if(!job.reason){job.reason='Освободи место в инвентаре';changed=true;}
     break;
    }
    const balance=state.money,filters=state.filters,radiation=hero.radiation??0;
    claimHeroResult(state,hero,at,Math.random);
    const reload=(hero.lastHeavyReload?.loaded??0)*10;
    totals.earned+=state.money-balance+reload;
    totals.spent+=reload;
    totals.filters+=state.filters-filters-(job.trainingFiltersSpent??trainingFilters(kind));
    totals.radiation+=(hero.radiation??0)-radiation;
    totals.damage+=(result.trapDamage??0)+(result.battles??[]).reduce((sum,battle)=>sum+(battle.damageTaken??0),0);
    if(!hero.dead){
     totals.xp+=result.xp??0;
     if(gifts.length)(totals.gifts??=[]).push(...gifts);
     for(const entry of loot){
      const name=itemName(entry);
      totals.loot[name]=(totals.loot[name]??0)+entry.qty;
     }
    }
    totals.partial||=Boolean(result.battles?.some(battle=>battle.damageTaken==null));
    changed=true;
    if(job.special){
     delete state.specialLocations?.[kind];
    }else if(!hero.dead){
     completed++;
     if(recordSpecialLocationRun(state,kind,job)){
      (state.specialLocations??={})[kind]=true;
      hero.job={kind:'trainingSpecial',trainingSlot:slot,trainingLocation:kind,trainingCompleted:completed,trainingTotals:totals,trainingAutoSpecial:autoSpecial};
      if(autoSpecial)queueTrainingRun(state,hero,slot,kind,at,Math.random,true);
      break;
     }
    }
    if(hero.dead||completed>=trainingCenterStats(state).maxRepeats){
     storeTrainingReport(state,hero,slot,kind,completed,totals);
     break;
    }
    hero.job={trainingCompleted:completed,trainingTotals:totals,trainingAutoSpecial:autoSpecial};
   }
   const rest=REST_OPTIONS.station;
   if(job.kind!=='trainingRest'&&hero.hp<.75*effectiveMaxHp(hero)){
    if(state.money<rest.cost){
     const reason='Не хватает 10 А на отдых';
     if(!waiting||job.reason!==reason){hero.job={kind:'trainingPause',trainingSlot:slot,trainingLocation:kind,trainingCompleted:completed,trainingTotals:totals,trainingAutoSpecial:autoSpecial,reason};changed=true;}
     break;
    }
    pay(state,rest.cost);
    totals.spent+=rest.cost;
    hero.job={kind:'trainingRest',trainingSlot:slot,trainingLocation:kind,trainingCompleted:completed,trainingTotals:totals,trainingAutoSpecial:autoSpecial,startedAt:at,endsAt:at+rest.seconds*1000,healing:rest.healing(hero,state)};
    changed=true;
    continue;
   }
   const started=queueTrainingRun(state,hero,slot,kind,at,Math.random,autoSpecial&&Boolean(activeSpecialLocation(state,kind)));
   changed=changed||started||!waiting||job.reason!==hero.job.reason;
   if(!started)break;
  }
 }
 return changed;
}
export function advanceSeries(state,now=Date.now()){
 let cooldownFinished=false;
 for(const hero of getHeroes(state)){
  if(hero.adventureCooldownUntil==null||adventureCooldownRemaining(hero,now)>0)continue;
  delete hero.adventureCooldownUntil;
  restoreAdventureAttributes(hero);
  cooldownFinished=true;
 }
 let changed=advanceFullRest(state,now)||cooldownFinished;changed=finishReadyRests(state,now)||changed;
 for(const hero of getHeroes(state)){
  const job=hero.job;if(job?.kind!=='series'||job.phase==='done')continue;
  // At most five runs and four pauses, including when returning after a long absence.
  while(job.phase!=='done'&&now>=job.endsAt){changed=true;const at=job.endsAt,worker=job.worker;
   if(job.phase==='break'){
    if(state.filters<trainingFilters(job.location)){stopSeries(job,'Не хватает фильтров для следующего выхода');break;}
    if(job.location==='rest'&&(worker.hp>=effectiveMaxHp(worker)||state.money<100)){stopSeries(job,worker.hp>=effectiveMaxHp(worker)?'Здоровье полное':'Не хватает A на отдых');break;}
    job.run=makeRun(state,worker,job.location,at,job.seeds[job.completed],false);job.phase='running';job.startedAt=at;job.endsAt=job.run.endsAt;continue;
   }
   const run=job.run,e=run.result;worker.radiation=Math.max(0,(worker.radiation??0)-(e?.doctorRadiationRemoved??0));job.completed++;const report=clone(run);job.reports.push(report);
   if(run.kind!=='rest')spendStrengthBonus(worker);
   if(isCombatRun(run)&&!e.alive){for(const key of ['level','xp','maxHp','extraPerkChoices','earnedPerkLevels','nationalityPerkMilestones','weaponFamiliarity','rangedWeaponFamiliarity'])worker[key]=clone(job.initial[key]??(key==='nationalityPerkMilestones'?{}:0));finishStimulant(worker,run);worker.maxHp=heroMaximumHp(worker);worker.stimulants=0;delete worker.secondStimulant;worker.dead=true;worker.hp=0;worker.bandages=0;worker.dressingKits=0;worker.doctorKits=0;worker.medicKits=0;worker.grenades=0;worker.molotovs=0;worker.tinGrenades=0;worker.lu216Grenades=0;worker.dynamites=0;job.loot={};job.money=0;job.filters=0;job.nationalityBonus=0;job.xp=0;stopSeries(job,'Герой погиб. Весь результат серии потерян');break;}
   if(run.kind==='rest')worker.hp=Math.min(effectiveMaxHp(worker),worker.hp+run.healing);
   else{
    for(const [item,qty]of Object.entries(e.loot))job.loot[item]=(job.loot[item]??0)+qty;
    job.money+=e.money??0;job.filters=(job.filters??0)+(e.filters??0);job.xp+=e.xp;levelUp(worker,e.xp);if(worker.wounds>0)worker.wounds--;
    if(isCombatRun(run)){worker.hp=e.hp;worker.bandages=e.bandagesRemaining;worker.dressingKits=e.dressingKitsRemaining??0;worker.doctorKits=e.doctorKitsRemaining??0;worker.medicKits=e.medicKitsRemaining??0;worker.grenades=e.grenadesRemaining??0;worker.molotovs=e.molotovsRemaining??0;worker.tinGrenades=e.tinGrenadesRemaining??0;worker.lu216Grenades=e.lu216GrenadesRemaining??0;worker.dynamites=e.dynamitesRemaining??0;}
   }
   const nationalBonus=nationalityClaimBonus(worker,run);job.nationalityBonus=(job.nationalityBonus??0)+nationalBonus;job.money+=nationalBonus;
   if(e?.heavyAmmoRemaining!=null)worker.heavyAmmo=e.heavyAmmoRemaining;
   finishStimulant(worker,run);if(worker.mark==='regeneration')worker.hp=effectiveMaxHp(worker);if(run.kind!=='rest'){
    if(doctorsWith(state,'rounds',worker).length){
     const dose=jobRadiation(job)-(job.appliedRadiation??0);
     job.appliedRadiation=(job.appliedRadiation??0)+dose;
     worker.radiation=(worker.radiation??0)+dose;
     worker.hp=Math.min(worker.hp,effectiveMaxHp(worker));
    }
    report.medicTentHealing=healAtMedicTent(state,worker,at);
    doctorRounds(state,worker,report,run.seed,at);
   }if(job.completed>=job.total)stopSeries(job,'Все прохождения завершены');
   else if(worker.hp/effectiveMaxHp(worker)<job.threshold/100&&job.location!=='rest')stopSeries(job,`Здоровье ниже ${job.threshold}%`);
   else if(job.location==='rest'&&worker.hp>=effectiveMaxHp(worker))stopSeries(job,'Здоровье полное');
   else {job.phase='break';job.startedAt=at;job.endsAt=at+3000;}
  }
 }
 changed=advanceTrainingCenter(state,now)||changed;
 const unlocked=rememberDoctorUnlock(state);
 return advanceSpecialLocations(state,now)||changed||unlocked;
}
export function grenadeSummary(job){
 const total={used:0,damage:0};
 const walk=events=>{for(const e of events??[]){if(e.type==='граната')total.used++;if(e.type==='граната'||e.type==='огонь Молотова')for(const target of e.targets??[])if(target.target!=='герой')total.damage+=target.damage??0;if(e.events)walk(e.events);}};
 for(const run of job?.kind==='series'?job.reports??[]:[job]){if(!run?.result)continue;const result=run.result;if(Array.isArray(result.battles))for(const b of result.battles)walk(b.events);else walk(result.events);}
 return total;
}
export function reportTurnCount(run){if(!isCombatRun(run))return 0;const battles=run.result?.battles;return Array.isArray(battles)&&battles.every(b=>Number.isInteger(b.turns))?battles.reduce((sum,b)=>sum+b.turns,0):null;}
export function seriesTurnCount(job){const counts=(job.reports??[]).map(reportTurnCount);return counts.some(n=>n===null)?null:counts.reduce((sum,n)=>sum+n,0);}
export function ready(job,now=Date.now()){return Boolean(job&&job.trainingSlot==null&&(job.kind==='series'?job.phase==='done':now>=job.endsAt));}
function startCraftRun(s,recipeId,qty,now,random,mode='manual'){
 const recipe=RECIPES[recipeId];
 requireThat(!recipe.research||s.researchCenter?.completed?.[recipe.research],'Сначала заверши исследование.');
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
 const job={recipe:recipeId,productionLevel:s.productions[recipe.production].level,qty,startedAt:now,endsAt:now+recipeSeconds(s,recipe,qty)*1000};
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
export const recipeSeconds=(state,recipe,qty=1)=>recipe.seconds*qty/(recipe.production==='medicine'&&doctorsWith(state,'pharmacist').length?1.1:1);
export const autoProductionSeconds=(recipe,qty,state)=>recipeSeconds(state,recipe,qty)+2*Math.max(0,qty-1);
export const autoProductionBusy=(s,id)=>Boolean(s.autoProduction&&!s.autoProduction.done&&s.autoProduction.recipe===id);
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
export const TRADING_POST_LEVELS=Object.freeze([0,500,1200,2700,5500,10000,18000,32000,57000,100000]);
export const tradingPostLevel=s=>TRADING_POST_LEVELS.findLastIndex(x=>x<=(s.shekelsInCirculation??0))+1;
export const SHEKEL_PROMOTION_DC=25;
export const shekelAutoDispatchTargets=state=>Object.keys(MERCHANTS).filter(id=>state[id]?.ours&&!state[id].banned&&!state[id].teaAway);
export function auctionDiscount(s){
 const count=s.tradingPostUpgrades?.auction??0;
 return count>0?Math.max(1,30-2*(count-1)):null;
}
export function tradingPostUpgradeQuote(state,kind){
 const count=state.tradingPostUpgrades?.[kind]??0;
 if(kind==='popularity')return {cost:30+20*count,currency:'shekel',seconds:30+15*count,maxed:shekelPopularity(state)===50};
 if(kind==='production')return {cost:Math.round((1500+500*count)*(1+count/9)),currency:'ammo',seconds:120+60*count,maxed:shekelUnitCost(state)===3};
 if(kind==='rate'&&tradingPostLevel(state)>=2){
  const cost=Math.round(500*1.15**count);
  return {cost,currency:'ammo',seconds:60+30*count,maxed:!Number.isSafeInteger(cost)};
 }
 if(kind==='auction')return {cost:50+10*count,currency:'shekel',seconds:60+30*count,maxed:auctionDiscount(state)===1};
 return null;
}
export const SHEKEL_QUEST_TARGET=200;
export const SHEKEL_REWARD_XP=2000;
export const DUREN_QUEST_RELATION=10;
export const DUREN_QUEST_FEE=300;
export const HANSA_MIN_MONEY=1000;
export const HANSA_SKIP_COST=2000;
export const HANSA_REFRESH_MS=30*60*1000;
export const hansaXpThreshold=level=>1000*(level+1);
export function unlockHansaShop(s,random=Math.random){
 s.completedLocations.hansaExpedition=true;
 s.hansaShop??={slots:hansaStock(s,random),refreshAt:null,level:0,xpTenths:0,assortmentVersion:2};
}
export const HANSA_ASSORTMENT={
 materials:{0:['cloth','metal','leather','pipe','fullLeather','metalParts','springMechanism'],3:['strongTape','armorPlates','rareMushrooms'],6:['acid','steel','hardChitinPlates']},
 stimulants:{3:['hansaAntirad']},
 armor:{0:['pilotJacket','shieldUni'],3:['heavyVest','plasticGuardArmor'],6:['beetleArmor','militaryVest']},
 weapons:{0:['browning','ak74','rpk'],3:['ak47'],6:['rox','brenTen','m60'],10:['zauerM','rox3']}
};
export const HANSA_QUALITY_CHANCES={0:[100],3:[75,25],6:[60,30,10],10:[55,30,12,3]};
const hansaFilterLot=level=>({id:uid(),item:'gasMaskFilter',qty:4+level});
function hansaStock(state,random){
 const level=state.hansaShop?.level??0;
 const tiers=category=>Object.entries(HANSA_ASSORTMENT[category]).filter(([min])=>level>=Number(min)).map(([,items])=>items);
 const pick=items=>items.splice(Math.floor(random()*items.length),1)[0];
 const lot=(item,qty=1,quality=0)=>({id:uid(),item,qty,...(quality?{quality}:{})});
 const supplies=[...tiers('materials').flat(),...tiers('stimulants').flat()];
 const materialLots=Array.from({length:2},()=>{
  const item=pick(supplies);
  if(ITEMS[item].type==='stimulant')return lot(item);
  const unitPrice=ITEMS[item].value*tradePercent(state,'buyPercent')*115/10000||ITEMS[item].value*1.15;
  const min=Math.max(2,Math.ceil(499.5/unitPrice));
  const max=Math.max(min,Math.ceil(2000.5/unitPrice)-1);
  return lot(item,min+Math.floor(random()*(max-min+1)));
 });
 const armor=tiers('armor').flat();
 const weaponTiers=tiers('weapons');
 const featured=pick([...weaponTiers.at(-1)]);
 const weapons=weaponTiers.flat().filter(item=>item!==featured);
 const chances=Object.entries(HANSA_QUALITY_CHANCES).filter(([min])=>level>=Number(min)).at(-1)[1];
 let roll=random()*100;
 const quality=chances.findIndex(chance=>(roll-=chance)<0)+1;
 return [hansaFilterLot(level),...materialLots,lot(pick(armor)),lot(pick(armor)),lot(pick(weapons)),lot(pick(weapons),1,1),lot(featured,1,quality)];
}
export const hansaPrice=(s,lot)=>roundRatio(itemValue(lot)*lot.qty,tradePercent(s,'buyPercent')*(s.hansaShop?.izyaInterest?125:115),10000);
export const hansaMissionPrice=(s,lot)=>hansaRoutePrice(s,s.interactiveMission,lot,{tradePercent});
export const hansaMissionDuty=s=>hansaDuty(s,s.interactiveMission,s.heroes.find(h=>h.id===s.interactiveMission.heroIds[0]),{itemValue,tradePercent});

export const hansaQuestAvailable=s=>Boolean(s.vasek&&(s.vasek.level??1)>=4);
export const hansaHeroAvailable=h=>Boolean(h&&!h.dead&&!h.job&&!needsAdventureRecovery(h));
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
export const shekelRate=s=>30/(1+((s.shekelsInCirculation??0)+(s.shekelDumpPressure??0))/3000)+(s.tradingPostUpgrades?.rate??0);
function purchaseMerchantShekels(s,npc,random,guaranteed=false){
 const relation=npc.relation??0;
 if(!tradingPostAvailable(s)||!npc.ours||!guaranteed&&relation<0)return;
 if(!guaranteed&&random()>=Math.min(1,(10+9*relation)/100))return;
 const wanted=Math.max(1,Math.round(5*(npc.level??1)*relation/10));
 const qty=Math.min(s.shekels??0,wanted);
 const amount=Math.round(qty*shekelRate(s));
 if(npc.visit)npc.visit.shekelPurchase={qty,amount};
 if(!qty)return;
 s.shekels-=qty;
 s.shekelsInCirculation=(s.shekelsInCirculation??0)+qty;
 s.shekelIncome=(s.shekelIncome??0)+amount;
}
export function visit(s,now=Date.now(),random=Math.random){let changed=advanceResearch(s,now);changed=advanceStationConstruction(s,now)||changed;
 const shop=s.hansaShop;
 if(shop&&(shop.refreshAt==null?!shop.assortmentVersion:now>=shop.refreshAt)){
  shop.slots=hansaStock(s,random);
  shop.refreshAt=null;
  shop.assortmentVersion=2;
  changed=true;
 }else if(shop&&shop.assortmentVersion===1){
  if(shop.slots[0])shop.slots[0]=hansaFilterLot(shop.level??0);
  shop.assortmentVersion=2;
  changed=true;
 }
 if(s.shekelDump&&ready(s.shekelDump,now)&&!s.shekelDump.result){
  const dump=s.shekelDump;
  const rateBefore=shekelRate(s);
  s.shekelsInCirculation=(s.shekelsInCirculation??0)+dump.qty;
  s.shekelDumpPressure=(s.shekelDumpPressure??0)+dump.qty**2/1000;
  const rateAfter=shekelRate(s);
  dump.result={qty:dump.qty,rateBefore,rateAfter,amount:Math.round(dump.qty*(rateBefore+rateAfter)/2)};
  changed=true;
 }
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
  if(!npc.teaAway&&!npc.visit&&now>=npc.nextAt){
   const settings=merchantSettings(s,merchant);
   const sellerChance=settings.sellerChance+((npc.level??1)-1)*(settings.sellerChanceStep??0)/100;
   npc.visit={id:uid(),role:random()<sellerChance?'seller':'buyer',offers:null};
   if(merchant!=='molchun')purchaseMerchantShekels(s,npc,random);
   changed=true;
  }
  if(npc.visit&&prepareMerchantOffers(s,merchant,random))changed=true;
 }
 return changed;}
export function openYuras(s,now=Date.now(),random=Math.random,merchant='yuras'){visit(s,now,random);const v=Object.hasOwn(MERCHANTS,merchant)?s[merchant]?.visit:null;requireThat(v&&!s[merchant].banned,'Торговец ещё в пути.');if(merchant==='yuras'&&s[merchant].level>=MAX_MERCHANT_LEVEL&&!v.giftClaimed){v.giftClaimed=true;v.giftAmount=(30+Math.floor(random()*71))*10;s.money+=v.giftAmount;addHistory(s,`Подарок Юрася: +${v.giftAmount/10} A. «Вот держи, друган, твоя доля за помощь».`,now);}if(merchant==='vasek'&&s[merchant].level>=MAX_MERCHANT_LEVEL&&!v.giftClaimed){receive(s,[{item:'rareMushrooms',qty:1}]);v.giftClaimed=true;v.giftItem='rareMushrooms';v.giftQty=1;addHistory(s,'Подарок Васька: редкий подземный гриб.',now);}prepareMerchantOffers(s,merchant,random);return v;}
function adventureRegeneration(state,active,key){active.regenerationSteps??=[];if(active.regenerationSteps.includes(key))return;active.regenerationSteps.push(key);for(const id of active.heroIds){const hero=state.heroes.find(h=>h.id===id);if(hero?.mark!=='regeneration'||hero.dead||hero.hp<=0)continue;const before=hero.hp;hero.hp=Math.min(effectiveMaxHp(hero),hero.hp+30);(active.history??=[]).push({type:'регенерация приключения',heroId:id,healed:hero.hp-before,hp:hero.hp});}}
function applyAdventureRadiation(state,active){if(active.radiationApplied)return;active.radiationApplied=true;active.locationRadiation??=2;active.radiationResults=[];for(const id of active.heroIds){const hero=state.heroes.find(h=>h.id===id);if(!hero)continue;const config=heroConfig(state,hero,'surface').hero;if(hero.activeStimulant||hero.activeSecondStimulant)finishStimulant(hero,{stimulant:true});if(hero.dead||hero.hp<=0)continue;const protection=config.radiationProtection,dose=Math.max(0,(config.halveRadiation?Math.floor(active.locationRadiation/2):active.locationRadiation)-protection-scientistRadiationReduction(active.heroIds.map(id=>state.heroes.find(h=>h.id===id))));hero.radiation=(hero.radiation??0)+dose;hero.hp=Math.min(hero.hp,effectiveMaxHp(hero));active.radiationResults.push({heroId:id,name:hero.name,level:active.locationRadiation,protection,received:dose,total:hero.radiation});}}
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
 if(active.id==='roofRoute'&&['depot','warehouse','roofSearch','roofFound'].includes(active.node))scenes.push(active.node==='depot'?'depot':'warehouse');
 if(active.id==='roofRoute'&&active.branch)scenes.push(active.branch,active.node);
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
export function teaMerchants(state){
 return Object.keys(MERCHANTS).filter(id=>{const npc=state[id];return npc?.visit&&!npc.banned&&!npc.teaScarred&&!npc.teaAway&&npc.relation>10;});
}
function teaCompanion(state,merchant){
 const {hero,config}=merchantFighter(state,merchant);
 return {...config.hero,id:'tea-merchant-'+merchant,merchant,name:MERCHANTS[merchant].name,hp:hero.hp};
}
function releaseTeaCompanion(state,active,now){
 const companion=active.teaCompanion;if(!companion||companion.released)return;
 const npc=state[companion.merchant];delete npc.teaAway;
 npc.nextAt=now+merchantCooldown(state,companion.merchant)*(companion.fled?3:1);companion.released=true;
}
function attachTeaCompanion(active,combat,random){
 const companion=active.teaCompanion;
 if(!companion||companion.fled||combat.initialized||combat.heroes.some(hero=>hero.id===companion.id))return;
 const fighters=active.merchantFront?[companion,...combat.heroes]:[...combat.heroes,companion];
 const setup=preparePartyCombat(fighters,combat.enemies.map(enemy=>({...enemy,name:enemy.name?.replace(/ №\d+$/,'')})),rng(Math.floor(random()*4294967296)));
 Object.assign(combat,setup,{events:[...combat.events,...setup.events]});
}
function awardTeaAdventureXp(state,active,xp){
 const hero=state.heroes.find(member=>member.isTea&&active.heroIds.includes(member.id));
 const companion=active.teaCompanion;
 const share=xp*(active.teaSolo?2:1)/(companion?2:1);
 const gained=adventureExperience(active,hero,share);
 levelUp(hero,gained);
 if(companion)gainMerchantXp(state[companion.merchant],share);
 return gained;
}
function prepareInteractiveRecovery(state){
 const active=state.interactiveMission,combat=active?.pendingCombat;if(combat?.status!=='victory')return;
 combat.sceneId??=adventureCombatScene(active);
 if(active.id==='roofRoute'){
  if(combat.nextNode==='roofShopSearch')(active.roofTestProgress??state.roofRouteProgress).bossDefeated=true;
  if(combat.nextNode==='roofGrass')(active.roofTestProgress??state.roofRouteProgress).ratsDefeated=true;
 }
 if(!combat.experienceAwarded){const xp=combat.experience??combat.enemies.filter(e=>e.hp<=0).reduce((sum,e)=>sum+(e.experience??TECHNOPARK.enemy.experience),0),share=xp/active.heroIds.length;for(const id of active.heroIds){const hero=state.heroes.find(h=>h.id===id);if(hero&&!active.teaSolo&&!active.teaCompanion){
   const mechanicalXp=hasScientistPerk(hero,'mechanism')?combat.enemies.filter(e=>e.hp<=0&&(e.mechanical||e.prototype||['mechanical','robot','prototype'].includes(e.kind))).reduce((sum,e)=>sum+(e.experience??TECHNOPARK.enemy.experience)*.2,0)/active.heroIds.length:0;
   const gained=adventureExperience(active,hero,share+mechanicalXp);
   levelUp(hero,gained);
   (combat.heroXp??={})[id]=gained;
  }}combat.experienceAwarded=true;combat.experience=xp;combat.experiencePerHero=share;}
 if(combat.enemies.some(e=>e.webAttack))combat.nextNode='spiderTunnel';beginPartyRecovery(combat);for(const fighter of combat.heroes)if(fighter.selfHealAfterBattle&&!(fighter.bandages||fighter.dressingKits||fighter.medicKits))fighter.hp=Math.min(fighter.maxHp,fighter.hp+nationalityHealing(fighter,fighter.selfHealAfterBattle));active.node='guardRecovery';
 for(const fighter of combat.heroes){const hero=state.heroes.find(hero=>hero.id===fighter.id);if(hero){hero.hp=fighter.hp;hero.dead=fighter.dead;if(fighter.scientistSafetyUsed)(active.scientistSafetyUsed??={})[hero.id]=true;}}
 adventureRegeneration(state,active,'battle:'+((active.battles??[]).length));for(const fighter of combat.heroes){const hero=state.heroes.find(h=>h.id===fighter.id);if(hero)fighter.hp=hero.hp;}
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
 const money=(banditVictory?rolls.int(20,70)*10:0)+defeated.reduce((total,enemy)=>total+(enemy.lootMoney??0),0);
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
 const entries=lootWithQuality([...Object.entries(active.loot??{}).map(([item,qty])=>({item,qty})),...(active.items??[])],active.startedAt);
 const money=roundRatio(active.money??0,100+(active.spartaPercent??0));
 receive(state,entries);
 state.money+=money;
 return {entries,money};
}
function settleUnfinishedAdventure(state,active,random){if(active.partialRewardsClaimed)return;const rolls=rng(Math.floor(random()*4294967296)),battles=[...(active.battles??[]),...(active.pendingCombat?[active.pendingCombat]:[])];active.loot??={};for(const combat of battles)collectAdventureCombatLoot(active,combat,rolls);const checks=(active.history??[]).flatMap(step=>step.check?[step.check]:(step.checks??[]).filter(c=>c.attribute)).filter(c=>c.success).length;const {entries,money}=receiveAdventureLoot(state,active);for(const id of active.heroIds){const hero=state.heroes.find(h=>h.id===id);if(hero&&!hero.dead&&hero.hp>0){const share=checks*10*(active.teaSolo?2:1)/(active.teaCompanion?2:active.heroIds.length);levelUp(hero,adventureExperience(active,hero,share));if(active.teaCompanion)gainMerchantXp(state[active.teaCompanion.merchant],share);}}active.partialRewardsClaimed=true;active.partialResult={checkXp:checks*10,entries,money};}
function finishLostInteractiveMission(state,active,outcome,now,random=Math.random){
 const combat=active.pendingCombat;
 for(const id of active.heroIds){const hero=state.heroes.find(hero=>hero.id===id),fighter=combat?.heroes.find(hero=>hero.id===id);if(!hero||!fighter)continue;
  hero.hp=Math.max(0,fighter.hp);hero.dead=Boolean(fighter.dead||fighter.hp<=0);
  if(hero.dead){hero.missingOnMission=true;hero.missingMission=active.id;hero.missingScene=fighter.fallenScene??adventureCombatScene(active);}
  if(hero.job?.kind==='interactive')hero.job=null;if(!hero.dead)hero.needsAdventureRest=true;
 }
 if(state.heroes.some(hero=>hero.isTea&&active.heroIds.includes(hero.id)&&hero.dead))state.teaGameOver=true;
 releaseTeaCompanion(state,active,now);
 if(outcome==='escaped'&&!state.teaGameOver){settleUnfinishedAdventure(state,active,random);returnAdventureFallen(state,active,now);}applyAdventureRadiation(state,active);startAdventureCooldown(state,active,now);state.lastInteractiveMission={...clone(active),outcome,finishedAt:now};state.interactiveMission=null;
 addHistory(state,outcome==='escaped'?'Сюжетная вылазка прервана: выживший вернулся, поверженный погиб и пропал на задании.':'Отряд погиб и пропал на задании. Восстановление пока невозможно.',now);
}
const FIRST_LOCATION_GIFTS={
 help:['yuras',[{item:'gasMaskFilter',qty:1},{item:'bandage',qty:2}]],
 mission:['keeper',[{item:'gasMaskFilter',qty:1},{item:'cloth',qty:3}]],
 patrol:['keeper',[{item:'gasMaskFilter',qty:1},{item:'pipeGrenade',qty:1}]],
 caravan:['vasek',[{item:'traderNotes',qty:1},{item:'dressingKit',qty:1}]],
 technopark:['keeper',[{item:'gasMaskFilter',qty:2}]],
 surface:['keeper',[{item:'protectiveSuit',qty:1}]],
 zilTunnels:['keeper',[{item:'gasMaskFilter',qty:1},{item:'medicKit',qty:1}]],
 surfaceShops:['alexey',[{item:'gasMaskFilter',qty:1},{item:'intactBook',qty:1}]],
 pukGrassSearch:['keeper',[{item:'gasMaskFilter',qty:1},{item:'cardioStimulator',qty:1,charges:10}]]
};
export function firstLocationGifts(state,job){
 const location=job?.location??job?.kind;
 const reward=Object.hasOwn(FIRST_LOCATION_GIFTS,location)?FIRST_LOCATION_GIFTS[location]:null;
 if(!reward||(job.kind==='series'?(job.worker.dead||!job.completed):job.result?.alive===false))return [];
 const gifts=[];
 if(!state.completedLocations[location]){
  const [npc,items]=reward;
  gifts.push({location,npc:npc==='alexey'&&!state.alexeyMet?'keeper':npc,items});
 }
 if(location==='technopark'&&!state.duren)gifts.push({location,npc:'duren',items:[{item:'sharpBlade',qty:1}]});
 if(location==='help'&&!state.specialFirstRewards?.help&&(job.special&&job.result?.alive||job.kind==='series'&&job.reports.some(run=>run.kind==='help'&&run.special&&run.result?.alive))){
  gifts.push({location,npc:'yuras',special:true,items:[{item:'combatStimulator',qty:1,charges:10}]});
 }
 return gifts;
}
function claimHeroResult(s,h,now,random){
 const gifts=firstLocationGifts(s,h.job);
 h.lastLocationGifts=gifts;
const firstNewLevel=h.level+1,job=h.job,bonus=claimBonus(h,job),nationalBonus=nationalityClaimBonus(h,job);if(job.kind!=='series'&&job.kind!=='rest')spendStrengthBonus(h);if(job.kind==='series'){receive(s,lootWithQuality(Object.entries(job.loot).map(([item,qty])=>({item,qty})),job.seeds?.[0]??job.startedAt??job.endsAt));s.money+=job.money;for(const key of ['hp','maxHp','level','xp','wounds','bandages','dressingKits','doctorKits','medicKits','grenades','molotovs','tinGrenades','lu216Grenades','dynamites','dead','leaderKebabRuns','stimulants','activeStimulant','secondStimulant','activeSecondStimulant','extraPerkChoices','earnedPerkLevels','nationalityPerkMilestones','weaponFamiliarity','rangedWeaponFamiliarity','heavyAmmo','radiation'])h[key]=job.worker[key];addHistory(s,`${locationName(job.location)}: серия завершена, +${job.xp} опыта, +${job.money/10} A. ${job.reason}.`,now);}else if(job.kind==='help'&&!job.special){const e=job.result;receive(s,Object.entries(e.loot).map(([item,qty])=>({item,qty})));s.money+=e.money;levelUp(h,e.xp);if(h.wounds>0)h.wounds--;addHistory(s,`Помощь на станции завершена: +${e.xp} опыта, +${e.money/10} A.`,now);}else if(job.kind==='rest'){const completed=job.restoresAdventureAttributes??(job.restType==='stationFull'?(job.completedCycles??0)>0:now>=job.endsAt),full=job.restType==='stationFull'&&h.hp+job.healing>=effectiveMaxHp(h)-1e-9;if(completed&&needsAdventureRecovery(h))restoreAdventureAttributes(h);h.hp=full&&completed?effectiveMaxHp(h):Math.min(effectiveMaxHp(h),h.hp+job.healing);addHistory(s,`Отдых завершён: восстановлено до ${Math.round(h.hp)} HP.`,now);}else {const e=job.result;if(!e.alive){h.dead=true;h.hp=0;h.stimulants=0;delete h.secondStimulant;h.bandages=0;h.dressingKits=0;h.doctorKits=0;h.medicKits=0;h.grenades=0;h.molotovs=0;h.tinGrenades=0;h.lu216Grenades=0;h.dynamites=0;addHistory(s,'Диверсант погиб. Добыча и опыт потеряны.',now);}else {receive(s,lootWithQuality(Object.entries(e.loot).map(([item,qty])=>({item,qty})),job.seed??job.startedAt));s.money+=e.money??0;h.hp=e.hp;h.bandages=e.bandagesRemaining;h.dressingKits=e.dressingKitsRemaining??0;h.doctorKits=e.doctorKitsRemaining??0;h.medicKits=e.medicKitsRemaining??0;h.grenades=e.grenadesRemaining??0;h.molotovs=e.molotovsRemaining??0;h.tinGrenades=e.tinGrenadesRemaining??0;h.lu216Grenades=e.lu216GrenadesRemaining??0;h.dynamites=e.dynamitesRemaining??0;levelUp(h,e.xp);if(h.wounds>0)h.wounds--;addHistory(s,`Локация пройдена: +${e.xp} опыта, побеждено противников: ${e.killed}.`,now);}}if(nationalBonus){s.money+=nationalBonus;addHistory(s,`${h.name}: национальный бонус +${nationalBonus/10} A.`,now);}if(bonus){s.money+=bonus;addHistory(s,`${h.name}: «Жадный», дополнительно +${bonus/10} A.`,now);}if(job.kind!=='series')h.radiation=Math.max(0,(h.radiation??0)-(job.result?.doctorRadiationRemoved??0));const dose=jobRadiation(job)-(job.appliedRadiation??0);
 if(dose){
  h.radiation=(h.radiation??0)+dose;
  h.hp=Math.min(h.hp,effectiveMaxHp(h));
  addHistory(s,`${h.name}: Облучён (${h.radiation}).`,now);
 }
 if(job.kind!=='series')finishStimulant(h,job);h.hp=Math.min(h.hp,effectiveMaxHp(h));if(!h.dead&&h.mark==='regeneration'&&job.kind!=='rest')h.hp=effectiveMaxHp(h);
 if(!h.dead){s.filters+=job.kind==='series'?job.filters??0:job.result?.filters??0;paySideJob(s,h,firstNewLevel,now);}if(job.kind!=='series'&&job.kind!=='rest'){const healed=healAtMedicTent(s,h,job.endsAt);doctorRounds(s,h,job,job.seed,now);if(healed)addHistory(s,'Палатка медика · '+h.name+': +'+Math.round(healed*10)/10+' HP.',now);}h.lastHeavyReload=job.kind==='rest'?null:settleHeavyAmmo(s,h,job.kind==='series'?{heavyAmmoRemaining:job.worker.heavyAmmo,heavyAmmoSpent:job.reports.reduce((total,run)=>total+(run.result?.heavyAmmoSpent??0),0)}:job.result,now);recordKeeperProgress(s,h,job);const completedLocation=job.kind==='series'?job.location:job.kind;if(['mission','help','patrol','technopark','caravan','surface','zilTunnels','surfaceShops','pukGrassSearch'].includes(completedLocation)&&!h.dead&&(job.kind!=='series'||job.completed>0)){
 h.lastCompletedLocation=completedLocation;
 if(!s.completedLocations[completedLocation]){
  s.completedLocations[completedLocation]=true;
  if(completedLocation==='caravan'&&!s.vasek){
   s.vasek={level:1,xp:0,relation:0,nextAt:now,visit:null};
   visit(s,now,random);
   addHistory(s,'Знакомство с Васьком, торговцем оружием союзной станции.',now);
  }
 }
 if(completedLocation==='technopark'&&!s.duren){
  s.duren={level:1,xp:0,nextAt:now,visit:null};
  visit(s,now,random);
  addHistory(s,'Знакомство с Дурнем.',now);
 }
 for(const gift of gifts){
  receive(s,gift.items);
  if(gift.special)(s.specialFirstRewards??={}).help=true;
  addHistory(s,`Первое прохождение: ${locationName(completedLocation)}. ${gift.items.map(item=>itemName(item)+' ×'+item.qty).join(', ')}.`,now);
 }
}h.job=null;
}
const roofBranches=['shop','depot','warehouse'];
const roofTraps=[
 {name:'Капкан',dc:11,min:40,max:90},
 {name:'Растяжка',dc:13,min:45,max:100},
 {name:'Нажимная мина',dc:15,min:70,max:140}
];
function adventureStealthCheck(active,hero,fighter,rolls,bonus,dc){
 const roll=rolls.int(1,20);
 if(roll+bonus>dc||!fighter.professionPerks.includes('saboteur-hide')||active.stealthRerolls?.[hero.id]){
  return {roll,bonus,success:roll+bonus>dc};
 }
 (active.stealthRerolls??={})[hero.id]=true;
 const reroll=rolls.int(1,20);
 return {roll:reroll,bonus:bonus+2,success:reroll+bonus+2>dc,firstRoll:roll,firstBonus:bonus};
}
function roofChoice(s,active,id,now,random){
 const progress=active.roofTestProgress??s.roofRouteProgress,rolls=rng(Math.floor(random()*4294967296));
 const heroes=active.heroIds.map(id=>s.heroes.find(hero=>hero.id===id)).filter(hero=>!hero.dead&&hero.hp>0);
 const fighters=()=>heroes.map(hero=>({...heroConfig(s,hero,'surface').hero,id:hero.id,name:hero.name,hp:hero.hp,
  grenades:hero.grenades??0,molotovs:hero.molotovs??0,tinGrenades:hero.tinGrenades??0,lu216Grenades:hero.lu216Grenades??0,dynamites:hero.dynamites??0}));
 const spend=cost=>{requireThat(s.filters>=cost,'Не хватает фильтров.');spendResearchFilters(s,cost);active.paidFilters+=cost;};
 const check=(hero,attribute,dc)=>{
  const h=heroConfig(s,hero,'surface').hero;
  const bonus=(attribute==='Скрытность'?(hero.stealth??h.agility)+(h.stealthCheckBonus??0):attribute==='Ловкость'?h.agility+(h.scientistEureka??0):h.perception+(h.scientistSearchBonus??0)+(h.perceptionCheckBonus??0)+(h.detectionBonus??0))-(h.checkPenalty??0);
  const roll=attribute==='Скрытность'?null:rolls.int(1,20);
  const test=attribute==='Скрытность'?adventureStealthCheck(active,hero,h,rolls,bonus,dc):{roll,bonus,success:roll+bonus>dc};
  const tested=scientistCheck(h,rolls,{...test,dc,total:test.roll+test.bonus},attribute==='Обнаружение ловушки'?'trap':attribute==='Скрытность'||attribute==='Ловкость'?'other':'search');
  const result={heroId:hero.id,name:hero.name,attribute,dc,...tested};
  if(active.roofTestProgress&&result.success)active.roofTestCheckXp=(active.roofTestCheckXp??0)+10;
  active.lastChecks.push(result);return result;
 };
 const reward=(item,qty=1)=>{(active.loot??={});active.loot[item]=(active.loot[item]??0)+qty;};
 const battle=(node,next,enemies)=>{
  active.node=node;
  return active.pendingCombat={...preparePartyCombat(fighters(),enemies,rolls),heroIds:heroes.map(h=>h.id),nextNode:next};
 };
 const recovery=(next,events=[])=>{
  active.pendingCombat={kind:'trap',sceneId:'depot',heroes:fighters(),enemies:[],order:[],status:'recovery',events,nextNode:next,lootClaimed:true};
 };
 const inspect=(branch,extra='')=>{
  progress.visited[branch]=true;
  if(progress.materialsAt===branch)progress.found=true;
  active.roofResult=(progress.materialsAt===branch?'Найдены материалы для крыши.':'Здесь нет нужных стройматериалов.')+(extra?' '+extra:'');
  active.node='roofFound';
 };
 active.lastChecks=[];
 if(roofBranches.includes(id)){
  requireThat(!progress.visited[id],'Это место уже осмотрено.');
  spend(heroes.length);active.branch=id;active.warehouseAttempts=0;active.node='roofApproach';return;
 }
 switch(id){
 case 'sneak':{
  const checks=heroes.map(hero=>check(hero,'Скрытность',12));
  const destination=active.branch==='depot'&&progress.depotTraps>=3?'roofSilent'
   :active.branch==='shop'&&progress.bossDefeated?'roofShopSearch'
   :active.branch==='warehouse'&&progress.ratsDefeated&&!progress.grass?'roofGrass':active.branch;
  if(checks.every(row=>row.success))active.node=destination;
  else battle('roofGuard',destination,[TECHNOPARK.enemy,TECHNOPARK.enemy,TECHNOPARK.enemy,rolls.int(1,100)<=60?TECHNOPARK.enemy:MATURE_GUARD]);
  break;
 }
 case 'boss':{
  const stealth=heroes.map(hero=>check(hero,'Скрытность',14));
  const detection=heroes.map(hero=>check(hero,'Обнаружение',14));
  const combat=battle('roofBoss','roofShopSearch',[{name:'Аберрация',boss:true,hp:550,maxHp:550,armor:70,thermalArmor:10,
   accuracy:20,damageMin:60,damageMax:200,stealth:3,initiative:1,evasion:55,doubleStrikeEvery:2,regeneration:10,loot:[]}]);
  combat.sceneId='roofBoss';
  if(!detection.some(row=>row.success))combat.ambushTarget=heroes[1]?.id??heroes[0].id;
  else if(stealth.every(row=>row.success)){
   combat.order.unshift(...combat.order.filter(row=>row.side==='hero'));
   combat.events.push({type:'событие отряда',text:'Отряд застал Аберрацию врасплох.'});
  }
  break;
 }
 case 'searchShop':{
  const best=Math.max(...heroes.map(hero=>{const row=check(hero,'Обнаружение',14);return row.roll+row.bonus;}));
  const count=best>=20?3:best>=15?2:1,gear=['ak74','mosin','shieldUni','ghoulJacket'];
  const entries=Array.from({length:count},()=>({item:gear[rolls.int(0,gear.length-1)],qty:1,quality:rolls.int(1,3),lootQualityResolved:true}));
  (active.items??=[]).push(...entries);
  const cash=rolls.int(100,300)*10;active.money=(active.money??0)+cash;
  const plan=rolls.int(0,1)?'armorUpgradePlan':'weaponUpgradePlan';
  reward(plan);reward('metalParts',2);
  inspect('shop','Добыча: '+entries.map(itemName).join(', ')+'; '+cash/10+' А; '+ITEMS[plan].name+'; металлические части ×2.');
  break;
 }
 case 'trap':{
  const index=progress.depotTraps??0,trap=roofTraps[index];
  requireThat(trap,'Все ловушки проверены.');
  const hero=heroes.find(h=>h.id===active.heroIds[index%2])??heroes[0],events=[];
  if(check(hero,'Обнаружение',trap.dc-(hasDoctorPerk(hero,'composure')?2:0)).success){
   const extraction=check(hero,'Ловкость',trap.dc+3);
   const item=extraction.success?(rolls.int(0,1)?'molotov':'tinGrenade'):null;
   if(item)reward(item);
   active.trapResult=trap.name+'. '+hero.name+' поднимает ловушку: '+extraction.roll+' + '+extraction.bonus+' против '+extraction.dc+'. '+(item?'Найдено: '+ITEMS[item].name+'.':'Извлечь заряд не удалось.');
  }else{
   const fighter=heroConfig(s,hero,'surface').hero;
   const damage=Math.max(1,rolls.int(trap.min,trap.max)-fighter.armor)*(fighter.damageTakenMultiplier??1);
   hero.hp=Math.max(0,hero.hp-damage);
   hero.dead=hero.hp<=0;
   active.trapResult=trap.name+' сработал. '+hero.name+' получает '+damage+' урона.';
  }
  events.push({type:'событие отряда',text:active.trapResult});
  progress.depotTraps=index+1;
  if(hero.dead){hero.missingOnMission=true;hero.missingMission=active.id;hero.missingScene='depot';}
  if(heroes.every(hero=>hero.dead)){active.node='roofLost';break;}
  active.history.push({node:'depot',checks:active.lastChecks});
  if(index===2)recovery('roofSilent',events);
  break;
 }
 case 'enterSilent':active.node='roofSilentMeeting';break;
 case 'meet':{
  (s.npcMeetings??={}).molchun=true;
  s.molchun??={nextAt:now+merchantCooldown(s,'molchun'),visit:null};
  let gift='';
  if(progress.materialsAt!=='depot'){
   const roll=rolls.int(1,3);
   if(roll===1){reward('medicKit');gift='Молчун дал аптечку.';}
   if(roll===2){reward('gasMaskFilter',2);gift='Молчун дал два фильтра.';}
   if(roll===3){active.money=(active.money??0)+1000;gift='Молчун дал 100 А.';}
  }
  inspect('depot',gift);break;
 }
 case 'rats':{
  requireThat(!progress.grass,'Трава уже собрана.');
  const loot=[{id:'tooth',chance:10},{id:'cloth',chance:30},{id:'leather',chance:30},{id:'metal',chance:30}];
  battle('roofRats','roofGrass',Array.from({length:6},()=>({...CONFIG.rat,name:'Бешеная крыса',hp:70,
   damageMin:30,damageMax:40,loot,lootMoney:50})));
  break;
 }
 case 'skip':active.node='roofSearch';break;
 case 'grass':requireThat(!progress.grass,'Трава уже собрана.');progress.grass=true;reward('pukGrass',2);active.node='roofSearch';break;
 case 'search':{
  if(active.warehouseAttempts)spend(heroes.length);
  active.warehouseAttempts=(active.warehouseAttempts??0)+1;
  if(heroes.map(hero=>check(hero,'Поиск',17)).some(row=>row.success))inspect('warehouse');
  else if(active.warehouseAttempts>=3)active.node='roofNight';
  break;
 }
 case 'sleep':
  spend(8);
  if(rolls.int(1,100)<=50)inspect('warehouse');
  else active.node='roofLost';
  break;
 case 'lost':{
  for(const hero of heroes){hero.hp=0;hero.dead=true;hero.missingOnMission=true;hero.missingMission=active.id;hero.missingScene='warehouse';}
  active.pendingCombat={heroes:active.heroIds.map(id=>({id,hp:0,dead:true,fallenScene:s.heroes.find(hero=>hero.id===id).missingScene??'warehouse'}))};
  finishLostInteractiveMission(s,active,'defeat',now);break;
 }
 case 'hub':active.node='roofHub';break;
 case 'report':requireThat(progress.found,'Сначала найди материалы.');applyAdventureRadiation(s,active);progress.reported=true;active.node='roofKeeper';break;
 case 'slow':
 case 'fast':{
  if(id==='slow')pay(s,3000);
  const duration=id==='slow'?300000:120000;
  const attack=rolls.int(1,100)<=(id==='slow'?35:65);
  active.repair={endsAt:now+duration,attackAt:attack?now+duration/2:null,remaining:duration/2};
  active.node='roofTimer';break;
 }
 case 'attack':{
  requireThat(active.repair.attackAt!=null&&now>=active.repair.attackAt,'Стражи ещё не появились.');
  active.repair.attackAt=null;active.repair.endsAt=null;
  const combat=battle('roofAttack','roofTimer',Array(4).fill(TECHNOPARK.enemy));
  combat.reinforcement={...clone(MATURE_GUARD),id:'roof-mature-guard',maxHp:MATURE_GUARD.hp};
  break;
 }
 case 'complete':
  requireThat(active.repair.attackAt==null&&active.repair.endsAt!=null&&now>=active.repair.endsAt,'Ремонт ещё идёт.');
  s.completedLocations.repairMaterials=true;s.completedLocations.technoparkRoof=true;
  s.keeperQuest={stage:7,status:'completed',progress:0};active.node='roofFinal';
  break;
 case 'finish':{
  const {entries,money}=receiveAdventureLoot(s,active);
  returnAdventureFallen(s,active,now);
  applyAdventureRadiation(s,active);
  const party=s.heroes.filter(hero=>active.heroIds.includes(hero.id));
  const battles=active.battles??[];
  const gains=party.map(hero=>({
   id:hero.id,
   xp:treatmentExperience(active,hero.id)+(active.teaSolo?0:battles.reduce((sum,battle)=>sum+(battle.heroXp?.[hero.id]??(battle.experiencePerHero??0)*adventureXpMultiplier(active,hero)),0))
  }));
  if(active.roofTestProgress){
   const checkXp=active.roofTestCheckXp??0;
   if(active.teaSolo)gains[0].xp+=awardTeaAdventureXp(s,active,checkXp+battles.reduce((xp,battle)=>xp+(battle.experience??0),0));
   else for(const hero of heroes){
    const xp=adventureExperience(active,hero,checkXp/active.heroIds.length);
    levelUp(hero,xp);
    gains.find(gain=>gain.id===hero.id).xp+=xp;
   }
  }
  for(const hero of party)hero.job=null;
  startAdventureCooldown(s,active,now);
  releaseTeaCompanion(s,active,now);
  active.result={entries,money,gains};
  s.lastInteractiveMission={...clone(active),outcome:'victory',finishedAt:now};
  s.interactiveMission=null;
  addHistory(s,active.testRun?'Тестовая вылазка к Технопарку завершена.':'Крыша Технопарка отремонтирована.',now);break;
 }
 }
}

function actInternal(state,action,now=Date.now(),random=Math.random){const s=normalizeGame(state);requireThat(!s.teaGameOver,'Чай погиб. Начни всё сначала.');visit(s,now,random);advanceSeries(s,now);if(action.heroId){for(const h of s.heroes){h.startPerk??=h.perk;h.rangedWeapon??=null;}s.completedLocations??=Object.fromEntries(s.heroes.filter(h=>h.lastCompletedLocation).map(h=>[h.lastCompletedLocation,true]));const selected=s.heroes.find(h=>h.id===action.heroId);requireThat(selected,'Сталкер не найден.');s.hero=selected;s.selectedHeroId=selected.id;}const h=s.hero,previousAmmoWeapon=heavyAmmoWeapon(h),previousWeapons=[h?.weapon,h?.rangedWeapon];
 if(['acceptKolom','startKolom','kolomChoice'].includes(action.type))return runKolom(s,action,now,random,{needsAdventureRecovery,radiationBlocksMissions,startStimulant,finishStimulant,heroConfig,heroAttributes,heroMaximumHp,effectiveMaxHp,adventureExperience,levelUp,receive,startAdventureCooldown,bandageHeal,healAtMedicTent,settleHeavyAmmo});
 if(action.type==='startHansaExpedition'||['hansaRouteChoice','hansaRouteBuy'].includes(action.type))return runHansa(s,action,now,random,{hansaHeroAvailable,radiationBlocksMissions,merchantFighter,teaSpartaPercent,startStimulant,finishStimulant,tradePercent,itemValue,itemName,receive,levelUp,adventureExperience,startAdventureCooldown,merchantCooldown,unlockHansaShop,hansaStock,merchantSellerOffers,heroConfig,heroAttributes,effectiveMaxHp,bandageHeal,addHistory,pay,heroEffectiveStrength,heroMaximumHp,nationalityHealing,hasMedicPerk});

 switch(action.type){
 case 'connectBeetleBattery':{const hero=idleHero(s);requireThat(!hero.beetleBatteryConnected,'Батарея уже подключена.');removeItem(s,'beetleBattery',1);hero.beetleBatteryConnected=true;addHistory(s,hero.name+': жучиная батарея подключена навсегда.',now);break;}
 case 'testAdventureReset':{
  requireThat(!s.interactiveMission,'Сначала заверши текущую вылазку.');
  s.testAdventureReplay={};
  for(const id of Object.keys(INTERACTIVE_MISSIONS))if(s.completedLocations?.[id])s.testAdventureReplay[id]=true;
  if(s.completedLocations?.technoparkRoof)s.testAdventureReplay.roofRoute=true;
  s.teaRepeats={};
  s.lastInteractiveMission=null;
  break;
 }
 case 'roofTimer':{const active=s.interactiveMission;requireThat(active?.id==='roofRoute'&&active.node==='roofTimer','Ремонт недоступен.');roofChoice(s,active,action.choice==='attack'?'attack':'complete',now,random);break;}
 case 'startInteractiveMission':{
  const id=action.mission??'zilRoute',mission=INTERACTIVE_MISSIONS[id];
  const resetReplay=Boolean(s.testAdventureReplay?.[id]);
  const localRoof=id==='roofRoute'&&localRoofTesting;
  const roofTest=!resetReplay&&localRoof&&(!repairMaterialsAvailable(s)||!s.completedLocations.surface||s.completedLocations.technoparkRoof);
  requireThat(mission&&(s.completedLocations.surface||localRoof),'Сначала вернись с первого выхода на поверхность.');
  requireThat(id!=='repairMaterials'||repairMaterialsAvailable(s)||s.completedLocations.repairMaterials,'Сначала прими квест о крыше Технопарка у Смотрителя.');
  requireThat(!s.interactiveMission&&!s.heroes.some(hero=>hero.job?.kind==='interactive'),'Другая сюжетная вылазка уже открыта.');
  const ids=action.heroIds,tea=s.heroes.find(hero=>hero.isTea&&ids?.includes(hero.id));
  const teaSolo=Boolean(tea&&ids.length===1),soloPerk=teaSolo,teaRepeat=Boolean(s.completedLocations[id]&&teaSolo&&hasLevelPerk(tea,'tea-repeat'));
  requireThat(!s.completedLocations[id]||resetReplay||teaRepeat,'Повтор этой вылазки доступен только Чаю с перком «Порыскать еще…».');
  requireThat(id!=='repairMaterials'||!s.completedLocations[id]||resetReplay||teaRepeat,'Поиск материалов уже завершён.');
  requireThat(!teaRepeat||!s.teaRepeats?.[id],'Повтор Чая уже использован.');
  const merchant=action.merchant;
  requireThat(!merchant||teaSolo&&hasLevelPerk(tea,'tea-team')&&teaMerchants(s).includes(merchant),'Этот торговец недоступен для вылазки.');
  const companion=merchant?teaCompanion(s,merchant):null;
  requireThat(Array.isArray(ids)&&ids.length>=(soloPerk||teaRepeat?1:mission.minHeroes)&&ids.length<=mission.maxHeroes&&new Set(ids).size===ids.length,'Выбери одного или двух разных героев.');
  const front=ids.length===1?ids[0]:action.frontHeroId,rear=ids.length===1?null:action.rearHeroId;
  requireThat(ids.includes(front)&&(ids.length===1||ids.includes(rear)&&front!==rear),'Выбери, кто идёт впереди и кто замыкающий.');
  const orderedIds=rear?[front,rear]:[front],heroes=orderedIds.map(id=>s.heroes.find(hero=>hero.id===id));
  requireThat(heroes.every(hero=>hero&&!hero.dead&&!hero.job&&!radiationBlocksMissions(hero)&&!needsAdventureRecovery(hero)),'В отряде могут быть только живые свободные герои без сильного облучения.');
  requireThat(mission.maxHeroes===1||ids.length>1||action.soloConfirmed===true,'Одиночный выход крайне опасен. Подтверди риск.');
  const filters=mission.filtersPerHero*ids.length;requireThat(s.filters>=filters,'Не хватает фильтров для отряда.');
  requireThat(interactiveMissionReady(id),'Первый этап задания ещё готовится.');
  spendResearchFilters(s,filters);s.interactiveMission={id,heroIds:orderedIds,formation:{front,rear},node:mission.entry,startedAt:now,paidFilters:filters,resetReplay,testRun:Boolean(roofTest),teaSolo:soloPerk,teaRepeat,teaCompanion:companion,merchantFront:Boolean(companion&&action.merchantFront),spartaPercent:teaSpartaPercent(s,tea),locationRadiation:mission.radiation??(2+Math.min(2,Math.floor(random()*3))),history:[]};

  if(resetReplay)delete s.testAdventureReplay[id];
  if(id==='roofRoute'){
   requireThat(resetReplay||localRoof||repairMaterialsAvailable(s),'Сначала прими задание Смотрителя.');
   if(roofTest||resetReplay)s.interactiveMission.roofTestProgress={materialsAt:roofBranches[Math.floor(random()*3)],visited:{}};
   else{
    s.roofRouteProgress??={materialsAt:roofBranches[Math.floor(random()*3)],visited:{}};
    if(s.roofRouteProgress.reported)s.interactiveMission.node='roofKeeper';
   }
  }
  if(companion){s[merchant].visit=null;s[merchant].teaAway=true;}
  for(const hero of heroes){startStimulant(hero,'interactive',random);hero.needsAdventureRest=true;hero.job={kind:'interactive',mission:id,startedAt:now};}
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
   const next=combat.nextNode??'bridge';requireThat(INTERACTIVE_MISSIONS[active.id].nodes[next],'Следующий этап ещё не описан.');(active.battles??=[]).push(clone(combat));active.pendingCombat=null;active.node=next;active.lastChecks=[];if(active.id==='roofRoute'){
    if(next==='roofTimer')active.repair.endsAt=now+active.repair.remaining;
    if(next==='roofShopSearch')roofChoice(s,active,'searchShop',now,random);
   }
   break;
  }else if(action.choice==='loot'){
   requireThat(!combat.lootClaimed,'Трупы уже обысканы.');
   collectAdventureCombatLoot(active,combat,rng(Math.floor(random()*4294967296)));
  }else if(action.choice==='medic'){
   
   const target=party.find(hero=>hero.id===action.targetHeroId),medic=party.find(hero=>hero.id===action.medicHeroId&&['medic','doctor'].includes(hero.profession)&&!hero.dead&&hero.hp>0);
   requireThat(target&&!target.dead&&medic,'Выбери живого специалиста и получателя лечения.');
   const doctor=medic.profession==='doctor',usedKey=doctor?'doctorTreatmentUsed':'medicTreatmentUsed';
   requireThat(!combat[usedKey],'Лечение уже применено после этого боя.');requireThat(target.hp<effectiveMaxHp(target),'Здоровье уже полное.');
   const reserve=hasMedicPerk(medic,'reserve')&&!active.medicReserveUsed?.[medic.id];
   const strengthCost=reserve?0:MEDIC_TREATMENT.strengthCost;
   requireThat(heroEffectiveStrength(target)>=strengthCost,doctor?'При Силе 0 лечение Доктором невозможно.':'При Силе 0 лечение Медиком невозможно.');
   const rolls=rng(Math.floor(random()*4294967296)),perception=heroConfig(s,medic,'surface').hero.perception,raw=medic.level*rolls.int(1,10)+MEDIC_TREATMENT.perceptionMultiplier*perception+(reserve?30:0)+(party.some(hero=>!hero.dead&&hasMedicPerk(hero,'knowledge'))?20:0),before=target.hp;
   if(strengthCost){target.temporaryAttributeLoss={...target.temporaryAttributeLoss,strength:(target.temporaryAttributeLoss?.strength??0)+strengthCost};target.needsAdventureRest=true;}
   target.maxHp=heroMaximumHp(target);target.hp=Math.min(target.hp,effectiveMaxHp(target));target.hp=Math.min(effectiveMaxHp(target),target.hp+nationalityHealing(target,raw));
   if(reserve)(active.medicReserveUsed??={})[medic.id]=true;
   target.medicTreatmentsReceived=(target.medicTreatmentsReceived??0)+1;combat[usedKey]=true;
   const xp=doctor?0:5;
   if(xp)levelUp(medic,xp);
   const fighter=combat.heroes.find(hero=>hero.id===target.id);Object.assign(fighter,heroConfig(s,target,'surface').hero,{hp:target.hp});
   active.history.push({type:doctor?'лечение Доктором':'лечение Медиком',medicHeroId:medic.id,heroId:target.id,raw,healed:target.hp-before,strengthCost,xp});
  }else if(action.choice==='heal'){
   const target=party.find(hero=>hero.id===action.targetHeroId),keys={doctorKit:'doctorKits',medicKit:'medicKits',dressingKit:'dressingKits',bandage:'bandages'},key=keys[action.item];
   requireThat(target&&!target.dead&&key,'Выбери героя и лечебный расходник.');requireThat(target.hp<effectiveMaxHp(target)||(action.item==='doctorKit'&&((target.radiation??0)>0||target.poisoned||target.poisonTurns||target.poisonAccuracy||target.entangled||target.skipNextTurn)),'Здоровье уже полное.');
   const source=party.find(hero=>(hero[key]??0)>0);requireThat(source,'В отряде нет этого лечебного расходника.');
   const treatment=heroConfig(s,target,'surface');
   treatment.hero.medicineBonus=(target.nationalityBonuses?.medicineBonus??0)+(hasMedicPerk(source,'field')?20:0)+doctorMedicineBonus(s);
   treatment.hero.postBattleMedicineBonus=party.some(hero=>!hero.dead&&hasMedicPerk(hero,'knowledge'))?20:0;
   const healed=bandageHeal(treatment,rng(Math.floor(random()*4294967296)),target.hp,action.item);source[key]--;if(action.item==='doctorKit'){doctorKitCure(target);target.maxHp=heroMaximumHp(target);}target.hp=healed.hp;
   const fighter=combat.heroes.find(hero=>hero.id===target.id);fighter.hp=target.hp;fighter.radiation=target.radiation??0;active.history.push({type:'лечение отряда',heroId:target.id,sourceHeroId:source.id,item:action.item,healed:healed.healed});
  }else throw Error('Выбери лечение или обыск трупов.');
  break;
 }
 case 'leaveInteractivePreview':{
 const active=s.interactiveMission;requireThat(active,'Нет активной вылазки.');
 if(active.id==='roofRoute'){
  requireThat(!(active.roofTestProgress??s.roofRouteProgress).reported&&active.node!=='roofLost','Возвращение сейчас недоступно.');
  if(!active.paidFilters){
   for(const hero of s.heroes.filter(hero=>active.heroIds.includes(hero.id))){
    if(hero.activeStimulant||hero.activeSecondStimulant)finishStimulant(hero,{stimulant:true});
    hero.job=null;
   }
   releaseTeaCompanion(s,active,now);startAdventureCooldown(s,active,now);s.interactiveMission=null;break;
  }
 }requireThat(!active.pendingCombat||['recovery','pending','limit'].includes(active.pendingCombat.status),'Сначала закончи бой или выбери отступление.');
 for(const id of active.heroIds){const hero=s.heroes.find(h=>h.id===id);if(hero?.job?.kind==='interactive'){hero.job=null;hero.needsAdventureRest=true;}}
 releaseTeaCompanion(s,active,now);settleUnfinishedAdventure(s,active,random);returnAdventureFallen(s,active,now);applyAdventureRadiation(s,active);startAdventureCooldown(s,active,now);s.lastInteractiveMission={...clone(active),outcome:'unfinished',finishedAt:now};s.interactiveMission=null;addHistory(s,INTERACTIVE_MISSIONS[active.id].name+': возвращение с незавершённого маршрута. Фильтры не возвращаются.',now);break;
 }
 case 'interactiveCombatReport':{const combat=s.interactiveMission?.pendingCombat;requireThat(combat?.status==='recovery','Бой ещё не завершён.');combat.reportSeen=true;break;}
 case 'interactiveCombat':{
  const active=s.interactiveMission,combat=active?.pendingCombat;requireThat(combat,'Нет группового боя.');attachTeaCompanion(active,combat,random);for(const fighter of combat.heroes){if(active.focusUsed?.[fighter.id])fighter.focusBattleUsed=true;fighter.perceptionRerollUsed=Boolean(active.perceptionRerolls?.[fighter.id]);const hero=s.heroes.find(h=>h.id===fighter.id);if(!hero)continue;fighter.favoriteShots=active.favoriteShots?.[fighter.id]??fighter.favoriteShots??0;for(const key of ['bandages','dressingKits','doctorKits','medicKits'])fighter[key]=hero[key]??0;fighter.autoStimulatorUsed=Boolean(active.autoStimulatorUsed?.[fighter.id]);}
  advancePartyCombat(combat,rng(Math.floor(random()*4294967296)));
  const companion=active.teaCompanion,follower=combat.heroes.find(fighter=>fighter.id===companion?.id);
  if(follower){companion.hp=follower.hp;if(follower.hp<=0&&!companion.fled){companion.fled=true;s[companion.merchant].teaScarred=true;releaseTeaCompanion(s,active,now);combat.events.push({type:'событие отряда',text:follower.name+' убегает из боя.'});if(combat.status==='casualty'&&combat.casualtyDecision.fallenIds.every(id=>id===follower.id)){combat.heroes=combat.heroes.filter(fighter=>fighter.id!==follower.id);decidePartyCasualty(combat,'fight');}}}

  for(const fighter of combat.heroes){const hero=s.heroes.find(h=>h.id===fighter.id);if(!hero)continue;if(fighter.favoriteShots)(active.favoriteShots??={})[fighter.id]=fighter.favoriteShots;hero.hp=fighter.hp;hero.dead=fighter.hp<=0;hero.radiation=Math.max(0,(hero.radiation??0)-(fighter.doctorRadiationRemoved??0));fighter.doctorRadiationRemoved=0;hero.heavyAmmo=fighter.heavyAmmo??hero.heavyAmmo;for(const key of ['grenades','molotovs','tinGrenades','lu216Grenades','dynamites','bandages','dressingKits','doctorKits','medicKits'])hero[key]=fighter[key]??hero[key];if(fighter.autoStimulatorUsed)(active.autoStimulatorUsed??={})[fighter.id]=true;}
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
  if(choice.resolve==='roofRoute'){roofChoice(s,active,choice.id,now,random);break;}
  if(choice.resolve==='repairMaterials'){
   if(active.teaSolo){active.teaFind=merchantSellerOffers(s,'duren',random)[0];receive(s,[active.teaFind]);}
   if(active.teaRepeat)(s.teaRepeats??={})[active.id]=true;
   releaseTeaCompanion(s,active,now);
   requireThat(active.teaRepeat||repairMaterialsAvailable(s),'Поиск материалов уже завершён.');
   for(const id of active.heroIds){const hero=s.heroes.find(hero=>hero.id===id);hero.job=null;}
   adventureRegeneration(s,active,'finish');
   applyAdventureRadiation(s,active);
   healAdventurePartyAtTent(s,active,now);startAdventureCooldown(s,active,now);
   s.completedLocations.repairMaterials=true;awardTeaReputation(s,active);
   if(s.keeperQuest?.stage===6)s.keeperQuest.progress=1;
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
    for(const hero of party){const h=heroConfig(s,hero,'surface').hero;for(let attempt=1;attempt<=2;attempt++){const roll=rolls.int(1,20),bonus=h.agility+(h.scientistEureka??0)-(h.checkPenalty??0),success=roll+bonus>10;checks.push({heroId:hero.id,name:hero.name,attribute:'Ловкость',roll,bonus,dc:10,success});if(!success){fell=true;const raw=rolls.int(30,120),damage=Math.max(1,raw-h.armor-(h.firstHitArmor??0));hero.hp=Math.max(0,hero.hp-damage);checks.push({type:'событие отряда',text:hero.name+' падает: '+damage+' физического урона, '+hero.hp+' HP.'});break;}}}
    active.node=fell?'matureGuardBattle':'stationEntrance';
    if(fell){const fighters=party.map(hero=>({...heroConfig(s,hero,'surface').hero,id:hero.id,name:hero.name,hp:hero.hp,dead:hero.hp<=0,fallenScene:hero.hp<=0?'bridge':null,bandages:hero.bandages??0,dressingKits:hero.dressingKits??0,doctorKits:hero.doctorKits??0,medicKits:hero.medicKits??0,grenades:hero.grenades??0,molotovs:hero.molotovs??0,tinGrenades:hero.tinGrenades??0,lu216Grenades:hero.lu216Grenades??0,dynamites:hero.dynamites??0}));const combat={...preparePartyCombat(fighters,[clone(MATURE_GUARD)],rolls),heroIds:[...active.heroIds],nextNode:'stationEntrance'};combat.events.push(...checks.filter(c=>c.text));active.pendingCombat=combat;combat.status='running';updatePartyCasualties(combat);if(combat.status==='running')combat.status='pending';if(combat.status==='defeat')finishLostInteractiveMission(s,active,'defeat',now);}
   }else if(choice.resolve==='gateChecks'){
    requireThat(!active.gateChecked,'Ворота уже проверены.');active.gateChecked=true;
    for(const hero of party){const h=heroConfig(s,hero,'surface').hero;for(const [attribute,label,dc]of [['intelligence','Интеллект',12],['strength','Сила',14]]){const roll=rolls.int(1,20),bonus=h[attribute]+(attribute==='intelligence'?h.intelligenceCheckBonus??0:h.scientistEureka??0)-(h.checkPenalty??0);const tested=scientistCheck(h,rolls,{roll,bonus,dc,total:roll+bonus,success:roll+bonus>dc},attribute==='intelligence'?'hack':'other');checks.push({heroId:hero.id,name:hero.name,attribute:label,...tested});}}
    active.node=checks.filter(c=>c.success).length>=2?'stationBandits':'gateBlocked';
   }else{
    requireThat(active.node==='gateBlocked','Сначала попробуй открыть ворота.');requireThat(party.reduce((sum,h)=>sum+(h.grenades??0)+(h.tinGrenades??0)+(h.lu216Grenades??0)+(h.dynamites??0),0)>=2,'Нужно две взрывные гранаты у героев. Молотов не подходит.');let left=2;for(const slot of ['grenades','tinGrenades','lu216Grenades','dynamites'])for(const hero of party){const count=Math.min(left,hero[slot]??0);if(count)hero[slot]-=count;left-=count;}active.node='stationBandits';
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
     const bonus=fighter.perception+(fighter.perceptionCheckBonus??0)-(fighter.checkPenalty??0)+levelBonus+(fighter.negotiationBonus??0);
     const result=perceptionCheck(fighter,rolls,bonus,14,{trace:false,scientistEligible:false});
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
   if(peaceful&&!s.npcMeetings?.piki){
    (s.npcMeetings??={}).piki=true;
    s.factionReputation.piki=0;
    addHistory(s,'Знакомство с Пиками. Открыт найм Бандита.',now);
   }
   active.lastChecks=checks;
   active.history.push({node:from,choice:choice.id,checks,next:active.node});
   if(!peaceful){
    const fighters=party.map(hero=>{
     const config=heroConfig(s,hero,'surface').hero;
     return {...config,id:hero.id,name:hero.name,hp:hero.hp,initiative:config.initiative+(choice.id==='attack'?4:0),
      bandages:hero.bandages??0,dressingKits:hero.dressingKits??0,doctorKits:hero.doctorKits??0,medicKits:hero.medicKits??0,
      grenades:hero.grenades??0,molotovs:hero.molotovs??0,tinGrenades:hero.tinGrenades??0,lu216Grenades:hero.lu216Grenades??0,dynamites:hero.dynamites??0};
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
   if(active.teaSolo&&!active.teaFind){active.teaFind=merchantSellerOffers(s,'duren',random)[0];(active.items??=[]).push(active.teaFind);}
   const {entries,money}=receiveAdventureLoot(s,active);
   if(active.testRun&&active.teaFind){receive(s,[active.teaFind]);entries.push(active.teaFind);}
   const teaXp=active.teaSolo||active.teaCompanion?awardTeaAdventureXp(s,active,combatXp+extraXp):null;
   if(active.teaRepeat)(s.teaRepeats??={})[active.id]=true;
   releaseTeaCompanion(s,active,now);
   const gains=[];for(const id of active.heroIds){const hero=s.heroes.find(h=>h.id===id);const completionXp=teaXp===null?adventureExperience(active,hero,extraXp/active.heroIds.length):0;if(teaXp===null)levelUp(hero,completionXp);hero.job=null;hero.needsAdventureRest=true;const wonBattleXp=battles.reduce((sum,battle)=>sum+(battle.heroXp?.[id]??(battle.experiencePerHero??0)*adventureXpMultiplier(active,hero)),0);gains.push({id,name:hero.name,xp:treatmentExperience(active,id)+(teaXp??wonBattleXp+completionXp)});}
   returnAdventureFallen(s,active,now);adventureRegeneration(s,active,'finish');applyAdventureRadiation(s,active);healAdventurePartyAtTent(s,active,now);startAdventureCooldown(s,active,now);s.completedLocations.zilRoute=true;awardTeaReputation(s,active);s.unlockedLocations=[...new Set([...(s.unlockedLocations??[]),'zilTunnels'])];s.lastInteractiveMission={...clone(active),outcome:'victory',finishedAt:now,result:{checks,checkXp:checks*10,combatXp,baseXp:150,totalXp:gains.reduce((sum,gain)=>sum+gain.xp,0),gains,entries,money}};s.interactiveMission=null;addHistory(s,'Путь на ЗИЛ открыт. Открыта вылазка «Осмотреть тоннели ЗИЛ».',now);break;
  }
  if(choice.resolve==='leftStash'){
   requireThat(!active.leftStashClaimed,'Схрон уже обыскан.');
   const seed=Math.floor(random()*4294967296);
   const foundMoney=rng(seed).int(20,100)*10;
   const [item]=lootWithQuality([{item:'shieldUni',qty:1,quality:1}],seed);
   active.money=(active.money??0)+foundMoney;
   (active.items??=[]).push({...item,lootQualityResolved:true});
   active.leftStashClaimed=true;
   active.leftStashResult={item,money:foundMoney};
   active.history.push({node:active.node,type:'схрон',money:foundMoney,item:item.item,quality:item.quality});
   break;
  }
  if(choice.resolve==='leftTrap'){
   if(active.leftTrapResolved){active.history.push({node:active.node,next:'leftStash'});active.node='leftStash';break;}
   const target=s.heroes.find(h=>h.id===(active.formation?.front??active.heroIds[0]));requireThat(target&&!target.dead,'Передний герой недоступен.');const h=heroConfig(s,target,'surface').hero,rolls=rng(Math.floor(random()*4294967296)),events=[];
   h.perceptionRerollUsed=Boolean(active.perceptionRerolls?.[target.id]);const check=perceptionCheck(h,rolls,h.perception+(h.perceptionCheckBonus??0)+(h.detectionBonus??0)+(h.nationality?.detectionBonus??0)+(h.nationality?.trapBonus??0)-(h.checkPenalty??0),13,{events});if(h.perceptionRerollUsed)(active.perceptionRerolls??={})[target.id]=true;
   active.leftTrapResolved=true;active.lastChecks=[{heroId:target.id,name:target.name,attribute:'Обнаружение ловушки',...check,dc:13}];
   if(check.success){active.loot??={};active.loot.molotov=(active.loot.molotov??0)+1;events.push({type:'событие отряда',text:'О, ловушка найдена! Молотов добавлен к добыче.'});}
   else for(let tick=1;tick<=2&&target.hp>0;tick++){const roll=rolls.int(1,20),agility=h.agility+(h.nationality?.grenadeDodge??0)-(h.checkPenalty??0),dodged=roll+agility>ITEMS.molotov.dodgeDc,raw=rolls.int(ITEMS.molotov.min,ITEMS.molotov.max),armor=h.thermalArmor+(tick===1?(h.firstHitArmor??0):0),damage=Math.max(1,raw*(dodged?.5:1)-armor);target.hp=Math.max(0,target.hp-damage);events.push({type:'событие отряда',text:target.name+': огонь Молотова '+tick+' — уворот '+roll+' + '+agility+' против 13; '+damage+' термического урона, '+target.hp+' HP.'});}
   const combat={kind:'trap',heroes:active.heroIds.map(id=>{const hero=s.heroes.find(h=>h.id===id);return {...heroConfig(s,hero,'surface').hero,id,name:hero.name,hp:hero.hp,dead:hero.hp<=0};}),enemies:[],events,status:'victory',order:[],nextNode:'leftStash',experience:0,lootClaimed:true,heroIds:[...active.heroIds]};active.pendingCombat=combat;active.history.push({node:active.node,next:'leftStash',check});
   if(target.hp<=0){target.dead=true;combat.status='running';updatePartyCasualties(combat);if(combat.status==='defeat')finishLostInteractiveMission(s,active,'defeat',now);}else prepareInteractiveRecovery(s);break;
  }
  if(choice.resolve==='goto'){requireThat(mission.nodes[choice.next],'Следующий этап ещё не описан.');active.history.push({node:active.node,choice:choice.id,next:choice.next});active.node=choice.next;active.lastChecks=[];const spec=mission.nodes[choice.next].combat;if(spec){const enemy=spec.enemy==='acidSpider'?ACID_SPIDER:spec.enemy==='matureGuard'?MATURE_GUARD:TECHNOPARK.enemy;active.pendingCombat={...preparePartyCombat(active.heroIds.map(id=>{const hero=s.heroes.find(h=>h.id===id);return {...heroConfig(s,hero,'surface').hero,id,name:hero.name,hp:hero.hp,grenades:hero.grenades??0,molotovs:hero.molotovs??0,tinGrenades:hero.tinGrenades??0,lu216Grenades:hero.lu216Grenades??0,dynamites:hero.dynamites??0};}),Array.from({length:spec.count},()=>clone(enemy)),rng(Math.floor(random()*4294967296))),nextNode:spec.afterRecovery,heroIds:[...active.heroIds]};}break;}
  const heroes=active.heroIds.map(id=>s.heroes.find(hero=>hero.id===id));requireThat(heroes.length&&heroes.every(hero=>hero&&!hero.dead&&hero.job?.kind==='interactive'),'Отряд недоступен.');
  const seed=Math.floor(random()*4294967296),rolls=rng(seed),checks=[];
  for(const hero of heroes){
   const h=heroConfig(s,hero,'surface').hero;h.perceptionRerollUsed=Boolean(active.perceptionRerolls?.[hero.id]);
   if(choice.resolve==='stealth'){
    const bonus=(Number.isFinite(hero.stealth)?hero.stealth:h.agility)+(h.stealthCheckBonus??0)-(h.checkPenalty??0);
    checks.push({heroId:hero.id,name:hero.name,attribute:'Скрытность',dc:12,...adventureStealthCheck(active,hero,h,rolls,bonus,12)});
   }else if(choice.resolve==='detour'){
    const roll=rolls.int(1,20),bonus=h.intelligence+(h.intelligenceCheckBonus??0)-(h.checkPenalty??0);const tested=scientistCheck(h,rolls,{roll,bonus,dc:11,total:roll+bonus,success:roll+bonus>11},'search');checks.push({heroId:hero.id,name:hero.name,attribute:'Интеллект',...tested});
    const result=perceptionCheck(h,rolls,h.perception+(h.perceptionCheckBonus??0)-(h.checkPenalty??0),11,{events:checks});checks.push({heroId:hero.id,name:hero.name,attribute:'Восприятие',...result,dc:11});
    if(h.perceptionRerollUsed)(active.perceptionRerolls??={})[hero.id]=true;
   }else throw Error('Правила этого выбора ещё не заданы.');
  }
  const tests=checks.filter(check=>check.attribute),success=choice.resolve==='stealth'?tests.every(check=>check.success):tests.some(check=>check.success);
  const from=active.node;active.node=choice.resolve==='stealth'?(success?'bridge':'guardBattle'):(success?'sewerHatch':'alleyDeadEnd');
  active.lastChecks=checks;(active.history??=[]).push({node:from,choice:choice.id,seed,checks,next:active.node});
  if(active.node==='guardBattle'){const fighters=heroes.map(hero=>({...heroConfig(s,hero,'surface').hero,id:hero.id,name:hero.name,hp:hero.hp,dead:hero.dead,grenades:hero.grenades??0,molotovs:hero.molotovs??0,tinGrenades:hero.tinGrenades??0,lu216Grenades:hero.lu216Grenades??0,dynamites:hero.dynamites??0}));active.pendingCombat={...preparePartyCombat(fighters,Array.from({length:5},()=>clone(TECHNOPARK.enemy)),rolls),heroIds:[...active.heroIds],nextNode:'bridge'};}
  break;
 }
 case 'rerollHireNationalities':{
  requireThat(canRerollHireNationalities(s),'Других национальностей для переброса нет.');
  const cost=hireNationalityRerollCost(s);if(cost)pay(s,cost);
  prepareNationalityOffers(s,random,'hire',true);
  s.hireNationalityRerolls=(s.hireNationalityRerolls??0)+1;
  break;
 }
 case 'prepareNationalities':{prepareNationalityOffers(s,random,action.target??'hire');break;}
 case 'updateNationality':{const hero=idleHero(s);requireThat(!hero.nationalityVersion,'Национальность уже обновлена.');applyNationality(s,hero,action,'update:'+hero.id);addHistory(s,hero.name+': национальность обновлена.',now);break;}
 case 'packStimulant':{const hero=idleHero(s,true);const item=action.item??'combatStimulator';requireThat(ITEMS[item]?.type==='stimulant','Это не стимулятор.');const row=s.inventory.find(x=>x.item===item&&(!action.uid||x.uid===action.uid));requireThat(row,'Нет стимулятора.');const bonusApplied=Boolean(row.stimulantBonusApplied),extra=hero.profession==='medic'&&hasMedicPerk(hero,'charges')&&!bonusApplied;const charges=extra?Math.floor((row.charges??10)*1.5):(row.charges??10);const stimulantBonusApplied=bonusApplied||extra;
  requireThat(!(hero.stimulants>0&&(hero.stimulantItem??'combatStimulator')===item)&&!(hero.secondStimulant?.charges>0&&hero.secondStimulant.item===item),'Такой стимулятор уже снаряжён.');
  if(hero.stimulants>0){requireThat(hero.profession==='medic'&&hasMedicPerk(hero,'sanitary')&&!(hero.secondStimulant?.charges>0),'Все слоты стимуляторов заняты.');hero.secondStimulant={item,quality:itemQuality(row),charges,stimulantBonusApplied};}
  else{hero.stimulantItem=item;hero.stimulantQuality=itemQuality(row);hero.stimulants=charges;hero.stimulantBonusApplied=stimulantBonusApplied;}removeRow(s,row.uid);break;}
 case 'unpackStimulant':{const hero=idleHero(s,true);if(action.slot==='second'){requireThat(hero.secondStimulant?.charges>0,'Слот пуст.');receive(s,[{...hero.secondStimulant,qty:1}]);delete hero.secondStimulant;break;}requireThat(hero.stimulants>0,'Слот пуст.');receive(s,[{item:hero.stimulantItem??'combatStimulator',qty:1,charges:hero.stimulants,stimulantBonusApplied:hero.stimulantBonusApplied??true,...(hero.stimulantQuality?{quality:hero.stimulantQuality}:{})}]);hero.stimulants=0;delete hero.stimulantItem;delete hero.stimulantQuality;break;}
 case 'acceptHansaQuest':{
  requireThat(hansaQuestAvailable(s)&&!s.hansaQuestAccepted,'Квест Васька недоступен.');
  s.hansaQuestAccepted=true;
  addHistory(s,'Васёк поручил договориться о поставках с Ганзой.',now);
  break;
 }
 case 'skipHansaExpedition':throw Error('Платный пропуск заменён поездкой с Васьком.');
 case 'buyHansaLot':{
  const shop=s.hansaShop,lot=shop?.slots[action.slot];
  requireThat(lot&&lot.id===action.lotId,'Лот уже недоступен.');
  const price=hansaPrice(s,lot);
  pay(s,price);
  receive(s,[{item:lot.item,qty:lot.qty,quality:lot.quality,origin:'bought'}]);
  shop.slots[action.slot]=null;
  shop.refreshAt??=now+HANSA_REFRESH_MS;
  shop.level??=0;
  shop.xpTenths=(shop.xpTenths??0)+price;
  while(shop.xpTenths>=hansaXpThreshold(shop.level)){
   shop.xpTenths-=hansaXpThreshold(shop.level);
   shop.level++;
  }
  break;
 }
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
  hero.level=1;hero.xp=0;hero.levelPerks=[];delete hero.scientistCrossOffers;hero.earnedPerkLevels=[];hero.extraPerkChoices=0;
  hero.perk=action.perk;hero.startPerk=action.perk;
  for(const slot of ['weapon','rangedWeapon','body','accessory','special','pet']){hero[slot]=null;hero[slot+'Details']=null;}hero.weaponFamiliarity=0;hero.rangedWeaponFamiliarity=0;
  for(const key of ['bandages','dressingKits','doctorKits','medicKits','grenades','molotovs','tinGrenades','lu216Grenades','dynamites','radiation','permanentHpLoss','mushroomTeasDrunk','stimulants','activeStimulant','secondStimulant','activeSecondStimulant'])hero[key]=0;
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
 case 'teaNotes':{
  const hero=idleHero(s,true);requireThat(!hero.isTea,'Чай не может использовать свои записки.');
  removeItem(s,'teaNotes',1);hero.extraPerkChoices=(hero.extraPerkChoices??0)+1;break;
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
 case 'chooseLevelPerk':{const hero=idleHero(s,true),slots=availablePerkLevels(hero),perk=LEVEL_PERKS[action.perk];requireThat(slots.length,'Нет доступного выбора перка.');requireThat(levelPerkOptions(hero).some(p=>p.id===action.perk),'Этот перк недоступен.');if(action.perk==='scientist-cross'){
 if(!hero.scientistCrossOffers){
 const known=new Set([hero.startPerk??hero.perk,...(hero.levelPerks??[]).map(p=>p.perk)]);
 const pool=[...new Set(Object.entries(PROFESSIONS).filter(([id])=>id!=='scientist').flatMap(([,p])=>p.perks??[]))].filter(id=>!known.has(id));
 requireThat(pool.length,'Все доступные стартовые перки уже известны.');
 for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 hero.scientistCrossOffers=pool.slice(0,5);
 }
 if(!action.starterPerk)break;
 requireThat(hero.scientistCrossOffers.includes(action.starterPerk),'Выбери предложенный перк.');
 requireThat(action.starterPerk!==hero.perk&&!(hero.levelPerks??[]).some(p=>p.perk===action.starterPerk),'Перк уже известен.');
 hero.levelPerks=[...(hero.levelPerks??[]),{level:null,perk:action.starterPerk,pickedAtLevel:hero.level,grantedBy:'scientist-cross'}];
 delete hero.scientistCrossOffers;
 }if(action.perk==='doctor-operation'){
  const target=s.heroes.find(member=>member.id===action.targetHeroId),attribute=action.attribute;
  requireThat(target&&target.id!==hero.id&&!target.dead&&!target.job&&['strength','agility','intelligence','perception'].includes(attribute),'Выбери другого свободного живого героя и параметр.');
  requireThat(heroAttributes(target)[attribute]<11,'Параметр уже достиг 11.');
  const before=effectiveMaxHp(target);
  target.doctorOperationAttributes={...target.doctorOperationAttributes,[attribute]:(target.doctorOperationAttributes?.[attribute]??0)+1};
  target.maxHp=heroMaximumHp(target);
  target.hp=Math.min(effectiveMaxHp(target),target.hp+Math.max(0,effectiveMaxHp(target)-before));
 }if(hero.isTea&&(action.perk==='tea-journal'||hasLevelPerk(hero,'tea-journal')))receive(s,[{item:'teaNotes',qty:1}]);if(slots[0]===null)hero.extraPerkChoices--;hero.levelPerks=[...(hero.levelPerks??[]),{level:slots[0],perk:action.perk,pickedAtLevel:hero.level}];if(['heavy-health','doctor-health'].includes(action.perk)){const before=hero.maxHp;hero.maxHp=heroMaximumHp(hero);hero.hp=Math.min(effectiveMaxHp(hero),hero.hp+hero.maxHp-before);}if(perk.attributeBonus){hero.maxHp=heroMaximumHp(hero);hero.hp=Math.min(hero.hp,effectiveMaxHp(hero));}if(action.perk==='hunter-familiarity')gainFamiliarity(hero);if(perk.maxHpBonus)hero.maxHp+=perk.maxHpBonus;if(perk.clearsRadiation)hero.radiation=0;if(action.perk==='enduring')hero.maxHp+=30;if(perk.hpBonus){hero.maxHp+=perk.hpBonus;hero.hp=Math.min(effectiveMaxHp(hero),hero.hp+perk.hpBonus);}if(action.perk==='engineer-side-job')paySideJob(s,hero,hero.level,now);addHistory(s,`${hero.name}: выбран перк «${perk.name}».`,now);break;}
 case 'hire':{const training=s.teaTraining;const trainer=s.heroes.find(hero=>hero.id===training?.trainerId);if(training)requireThat(trainer&&!trainer.dead&&!trainer.job&&action.nationalityId,'Тренер или национальность недоступны.');const profession=action.profession??'saboteur',p=PROFESSIONS[profession];requireThat(professionUnlocked(s,profession),profession==='hunter'?'Охотник открывается после знакомства с Дурнем.':profession==='bandit'?'Бандит открывается после знакомства с Пиками или Червями.':'Эта профессия пока недоступна для найма.');requireThat(p.startReady!==false,'Стартовое снаряжение и точность инженера ещё не заданы.');requireThat(p.perks.includes(action.perk),'Выбери стартовый перк этой профессии.');const offer=action.nationalityId?nationalityOffer(s,action,'hire'):null;const identity=offer?{...NATIONALITIES[offer.id],name:NATIONALITIES[offer.id][offer.gender],gender:offer.gender}:action.identity?IDENTITIES[action.identity]:null;requireThat(!action.identity||identity,'Выбери имя и национальность.');const cost=hireCost(s,action.nationalityId);if(cost)pay(s,cost);const inheritance=training??(s.shekelFreeHire?nextHireRebirth(s):s.inheritedRebirths?.shift()),number=s.heroes.length+1,maxHp=120+30*p.strength+(identity?.bonuses?.hp??0);const hero={id:uid(),profession,identityId:action.identity??null,gender:identity?.gender??'male',headwear:identity?.headwear??null,nationality:identity?.nationality??null,nationalityBonuses:clone(identity?.bonuses??{}),name:identity?.name??(number===1?p.name:`${p.name} №${number}`),level:1,xp:0,maxHp,hp:maxHp,perk:action.perk,startPerk:action.perk,weapon:p.weapon,rangedWeapon:p.rangedWeapon??null,body:p.body??null,bandages:0,dressingKits:p.startDressingKits??(profession==='medic'?2:0),dead:false,wounds:0,job:null};if(offer)applyNationality(s,hero,action,'hire');if(profession==='medic')s.unlockedProfessions=[...new Set([...(s.unlockedProfessions??[]),profession])];if(p.accessory){hero.accessory=p.accessory;hero.accessoryDetails={origin:'start',quality:p.accessoryQuality??0,equipmentCategoryOverride:0};}hero.weaponDetails={origin:'start',...(p.weaponQuality?{quality:p.weaponQuality}:{})};if(s.playerRole==='sova'&&profession==='saboteur')hero.rewardPerkUnlocks=['dual-wield'];if(inheritance){hero.rebirths=inheritance.stars;const choices=action.inheritanceAttributes??[];requireThat(Array.isArray(choices)&&choices.length===inheritance.stars,'Выбери параметр за каждую унаследованную звезду.');hero.rebirthAttributes={};for(const key of choices){requireThat(['strength','agility','intelligence','perception'].includes(key),'Выбери параметр наследования.');requireThat(heroAttributes(hero)[key]<10,'Параметр уже достиг максимума 10.');hero.rebirthAttributes[key]=(hero.rebirthAttributes[key]??0)+1;}hero.maxHp=heroMaximumHp(hero);hero.hp=hero.maxHp;}hero.maxHp=heroMaximumHp(hero);hero.hp=effectiveMaxHp(hero);if(training){const supplies=[['bandages','bandage'],['dressingKits','dressingKit'],['doctorKits','doctorKit'],['medicKits','medicKit'],['grenades','pipeGrenade'],['molotovs','molotov'],['tinGrenades','tinGrenade'],['lu216Grenades','lu216'],['dynamites','dynamite']].filter(([key])=>trainer[key]>0).map(([key,item])=>({item,qty:trainer[key]}));
if(trainer.secondStimulant?.charges>0)supplies.push({...trainer.secondStimulant,qty:1});
if(trainer.stimulants>0)supplies.push({item:trainer.stimulantItem??'combatStimulator',qty:1,charges:trainer.stimulants,quality:trainer.stimulantQuality});
for(const item of [...rebirthQuote(s,trainer).equipment,...supplies])addToInventory(s.inventory,item.item,item.qty,item);
s.money+=(trainer.heavyAmmo??0)*(heavyAmmoWeapon(trainer)?.ammoCost??10)+(trainer.reserveHeavyAmmo??0)*(heavyAmmoWeapon(trainer)?.ammoCost?10:200);
if(trainer.mark)hero.mark=trainer.mark;
hero.isTea=true;hero.name+=' — Чай';levelUp(hero,training.xp);hero.hp=effectiveMaxHp(hero);s.heroes=s.heroes.filter(member=>member.id!==training.trainerId);s.heroes.unshift(hero);s.teaId=hero.id;delete s.teaTraining;}else s.heroes.push(hero);s.hireNationalityRerolls=0;s.shekelFreeHire=false;s.hero=hero;s.selectedHeroId=hero.id;addHistory(s,`${hero.name} (${p.name}) принят на станцию.`,now);break;}
 case 'setRepeatPreferences':{requireThat(h,'Сначала выбери героя.');const {location,total,threshold}=action;requireThat(['mission','help','rest','patrol','technopark','caravan','surface','zilTunnels','surfaceShops','pukGrassSearch'].includes(location),'Нет такой локации.');requireThat(Number.isInteger(total)&&total>=2&&total<=5,'Выбери от 2 до 5 прохождений.');requireThat([60,40,20].includes(threshold),'Выбери порог здоровья.');h.repeatPreferences={...h.repeatPreferences,[location]:{total,threshold}};break;}
 case 'startSeries':{const hero=idleHero(s),kind=action.location,total=action.total,threshold=action.threshold;requireThat(['mission','patrol','help','technopark','caravan','surface','zilTunnels','surfaceShops','pukGrassSearch'].includes(kind),'Нет такой локации.');requireFreeLocation(s,kind);requireThat(!activeSpecialLocation(s,kind),'Особую локацию можно пройти только один раз за появление.');requireLocationLevel(hero,kind);requireThat(Number.isInteger(total)&&total>=2&&total<=5,'Выбери от 2 до 5 прохождений.');requireThat([60,40,20].includes(threshold),'Выбери порог здоровья.');requireThat(hero.hp/effectiveMaxHp(hero)>=threshold/100,'Здоровье уже ниже выбранного порога.');const seeds=Array.from({length:total},()=>Math.floor(random()*4294967296)),worker=clone(hero);worker.job=null;const run=makeRun(s,worker,kind,now,seeds[0]);hero.repeatPreferences={...hero.repeatPreferences,[kind]:{total,threshold}};hero.job={kind:'series',location:kind,total,threshold,seeds,worker,initial:clone(worker),run,phase:'running',completed:0,loot:{},money:0,nationalityBonus:0,xp:0,reports:[],startedAt:now,endsAt:run.endsAt};addHistory(s,`Серия: ${locationName(kind)}, ${total} прохождений.`,now);break;}
 case 'stopSeries':{requireThat(h?.job?.kind==='series'&&h.job.phase==='break','Прервать можно только во время передышки.');stopSeries(h.job,'Остановлено игроком');break;}
 case 'repeatHero':{requireThat(h&&ready(h.job,now),'Результат ещё не готов.');const kind=h.job.kind==='series'?h.job.location:h.job.kind;requireThat(kind!=='rest','Отдых запускается отдельно, без повторов.');requireThat(!h.job.special&&!h.job.reports?.some(run=>run.special),'Особую локацию нельзя повторить.');const special=Boolean(activeSpecialLocation(s,kind));requireThat(special===Boolean(action.special),'Сценарий изменился. Проверь кнопку в отчёте.');requireThat(!(isCombatRun(h.job)&&!h.job.result.alive)&&!h.job.worker?.dead,'Сначала восстанови героя.');const job=h.job;
 const claimed=act(s,{type:'claimHero',heroId:h.id},now,random);
 const next=job.kind==='series'&&!special
  ?{type:'startSeries',location:kind,total:job.total,threshold:job.threshold,heroId:h.id}
  :{type:kind,heroId:h.id};
 return act(claimed,next,now,random);}
 case 'molchunTask':{
  requireThat(s.npcMeetings?.molchun&&!s.molchunStashesDone,'Задание Молчуна недоступно.');
  removeItem(s,'metalParts',10);s.money+=5000;s.molchunStashesDone=true;
  addHistory(s,'Молчун принял детали для ловушек. Награда: 500 А.',now);break;
 }
 case 'pukGrassSearch':{
  const hero=idleHero(s);
  requireFreeLocation(s,'pukGrassSearch');
  requireLocationLevel(hero,'pukGrassSearch');
  hero.job=makeRun(s,hero,'pukGrassSearch',now,Math.floor(random()*4294967296));
  break;
 }
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
 case 'cancelTeaTraining':{
  requireThat(s.teaTraining,'Нет незавершённой переподготовки.');delete s.teaTraining;delete s.nationalityOffers?.hire;s.hireNationalityRerolls=0;break;
 }
 case 'trainTea':{
  requireThat(s.playerRole==='tea'&&!s.teaId&&!s.teaTraining&&!s.interactiveMission,'Переподготовка недоступна.');
  const trainer=s.heroes.find(hero=>hero.id===action.trainerId);
  requireThat(trainer&&!trainer.dead&&!trainer.job,'Выбери живого свободного тренера.');
  s.teaTraining={trainerId:trainer.id,stars:rebirthStars(trainer)+1,xp:Math.floor((50*trainer.level*(trainer.level-1)+(trainer.xp??0))/2)};
  s.hireNationalityRerolls=0;prepareNationalityOffers(s,random,'hire',true);break;
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
  requireThat(adventureCooldownRemaining(hero,now)<=0,'Герой ещё отдыхает после вылазки.');
  const restType=action.restType??'station';
  requireThat(Object.hasOwn(REST_OPTIONS,restType),'Нет такого варианта отдыха.');
  const option=REST_OPTIONS[restType];
  requireThat(hero.hp<effectiveMaxHp(hero)||needsAdventureRecovery(hero),'Здоровье уже полное.');
  pay(s,option.cost);
  hero.job={kind:'rest',restType,startedAt:now,endsAt:now+option.seconds*1000,healing:option.healing(hero,s)};
  if(restType==='stationFull'){
   const quote=fullRestQuote(hero,s);
   Object.assign(hero.job,{endsAt:now+quote.seconds*1000,healing:0,cycleHealing:option.healing(hero,s),cycleStartedAt:now,cycleEndsAt:now+option.seconds*1000,completedCycles:0,paid:option.cost,fullRestDone:false});
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
 case 'claimHero':{if(h&&!h.job&&h.lastRest)break;requireThat(h&&ready(h.job,now),'Результат ещё не готов.');claimHeroResult(s,h,now,random);break;}
 case 'buryHero':{
  requireThat(h?.awaitingBurial&&h.dead&&!h.missingOnMission&&!h.job,'Сначала доставь погибшего героя на станцию.');
  const {stars,level,equipment}=rebirthQuote(s,h);
  const supplies=[['bandages','bandage'],['dressingKits','dressingKit'],['doctorKits','doctorKit'],['medicKits','medicKit'],['grenades','pipeGrenade'],['molotovs','molotov'],['tinGrenades','tinGrenade'],['lu216Grenades','lu216'],['dynamites','dynamite']]
   .filter(([field])=>h[field]>0).map(([field,item])=>({item,qty:h[field]}));
  if(h.secondStimulant?.charges>0)supplies.push({...h.secondStimulant,qty:1});
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
 case 'doctorResuscitate':{
  requireThat(canDoctorResuscitate(s,h),'Чудо реанимация недоступна.');
  delete h.awaitingBurial;
  h.resuscitated=true;
  h.dead=false;
  h.wounds=0;
  h.maxHp=heroMaximumHp(h);
  h.hp=effectiveMaxHp(h);
  addHistory(s,h.name+': Доктор вернул героя к жизни.',now);
  break;
 }
 case 'revive':{requireThat(!h?.awaitingBurial,'Погибшего героя можно похоронить.');requireThat(!h?.missingOnMission,'Герой погиб и пропал на задании. Восстановление пока невозможно.');requireThat(h&&h.dead&&!h.job,'Герой не нуждается в восстановлении.');const rehab=doctorRehabilitation(s,h);if(action.paid){pay(s,heroReviveCost(h,s));h.hp=effectiveMaxHp(h);h.wounds=0;}else{h.hp=rehab?effectiveMaxHp(h)/2:1;h.wounds=rehab?2:4;}h.dead=false;h.bandages=0;h.dressingKits=0;h.doctorKits=0;h.medicKits=0;h.grenades=0;h.molotovs=0;h.tinGrenades=0;h.lu216Grenades=0;h.dynamites=0;addHistory(s,action.paid?'Герой восстановлен с полным здоровьем.':`Герой восстановлен. Раны: ${h.wounds} прохождения локаций.`,now);break;}
 case 'leaderKebab':{
  const hero=idleHero(s,true);
  removeItem(s,'leaderKebab',1);
  const healing=60+Math.floor(random()*181);
  hero.hp=Math.min(effectiveMaxHp(hero),hero.hp+nationalityHealing(hero,healing)*doctorRestMultiplier(s));
  hero.leaderKebabRuns=4;
  hero.maxHp=heroMaximumHp(hero);
  break;
 }
 case 'ghoulKebab':{
  const hero=idleHero(s,true);requireThat(hero.hp<effectiveMaxHp(hero),'Здоровье уже полное.');
  removeItem(s,'ghoulKebab',1);
  hero.hp=Math.min(effectiveMaxHp(hero),hero.hp+nationalityHealing(hero,.15*hero.maxHp+7*heroAttributes(hero).strength)*doctorRestMultiplier(s));
  addHistory(s,'Сталкер съел шашлык из упыря.',now);break;
 }
 case 'pukGrassDecoction':{const hero=idleHero(s,true);requireThat((hero.radiation??0)>0,'Облучения нет.');removeItem(s,'pukGrassDecoction',1);const removed=Math.min(hero.radiation,rng(Math.floor(random()*4294967296)).int(2,5)+heroAttributes(hero).strength);hero.radiation-=removed;addHistory(s,'Отвар из пук-травы: снято '+removed+' РАД. Без потери здоровья и опыта за применение.',now);break;}
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
 case 'broth':{const hero=idleHero(s,true);requireThat(hero.hp<effectiveMaxHp(hero),'Здоровье уже полное.');removeItem(s,'broth',1);hero.hp=Math.min(effectiveMaxHp(hero),hero.hp+nationalityHealing(hero,.1*hero.maxHp+5*heroConfig(s).hero.strength)*doctorRestMultiplier(s));addHistory(s,'Сталкер выпил отвар из крысы.',now);break;}
 case 'doctorKit':
 case 'medicKit':
 case 'dressingKit':
 case 'bandage':{const hero=idleHero(s,true);requireThat(hero.hp<effectiveMaxHp(hero)||(action.type==='doctorKit'&&((hero.radiation??0)>0||hero.poisoned||hero.poisonTurns||hero.poisonAccuracy||hero.entangled||hero.skipNextTurn)),'Здоровье уже полное.');const item=action.type,key=item==='bandage'?'bandages':item==='doctorKit'?'doctorKits':item==='medicKit'?'medicKits':'dressingKits';if(hero[key]>0)hero[key]--;else removeItem(s,item,1);if(item==='doctorKit'){doctorKitCure(hero);if(heroAttributes(hero).strength>0)hero.unconscious=false;hero.maxHp=heroMaximumHp(hero);}const heal=bandageHeal(heroConfig(s,hero),rng(Math.floor(random()*4294967296)),hero.hp,item);hero.hp=heal.hp;addHistory(s,`${ITEMS[item].name}: +${Math.round(heal.healed)} HP.`,now);break;}
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
  requireThat(['bandage','dressingKit','medicKit','doctorKit'].includes(item)||ITEMS[item]?.type==='grenade','Этот предмет нельзя взять с собой.');
  const grenade=ITEMS[item].type==='grenade';
  const key={pipeGrenade:'grenades',molotov:'molotovs',tinGrenade:'tinGrenades',lu216:'lu216Grenades',dynamite:'dynamites',bandage:'bandages',dressingKit:'dressingKits',doctorKit:'doctorKits',medicKit:'medicKits'}[item];
  const carried=grenade?(hero.grenades??0)+(hero.molotovs??0)+(hero.tinGrenades??0)+(hero.lu216Grenades??0)+(hero.dynamites??0):hero.bandages+(hero.dressingKits??0)+(hero.medicKits??0)+(hero.doctorKits??0);
  const freeSlots=Math.max(0,(grenade?consumableLimit(hero):medicalSupplyLimit(hero))-carried);
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
  requireThat(heavyAmmoWeapon(hero),'Сначала экипируй тяжёлое оружие.');
  if(action.type==='toggleHeavyReload'){
   hero.autoHeavyReload=!hero.autoHeavyReload;
   hero.heavyAmmoTarget=Math.max(hero.heavyAmmoTarget??0,hero.heavyAmmo??0);
  }else{
   const cost=heavyAmmoWeapon(hero).ammoCost??10;
   requireThat(Number.isSafeInteger(action.qty)&&action.qty>0&&action.qty<=Math.floor(s.money/cost),'Выбери доступное количество патронов.');
   pay(s,action.qty*cost);
   hero.heavyAmmo=(hero.heavyAmmo??0)+action.qty;
   hero.heavyAmmoTarget=hero.heavyAmmo;
  }
  break;
 }
 case 'equip':{const hero=idleHero(s,true);const row=s.inventory.find(x=>x.uid===action.uid);requireThat(row,'Предмета уже нет.');const item=ITEMS[row.item];requireThat(canUseEquipment(hero,row),`Требуется ${equipmentRequiredLevel(row)}-й уровень героя.`);requireThat(['body','weapon','accessory','special','pet'].includes(item.type),'Этот предмет нельзя надеть.');requireThat(!action.slot||['main','ranged'].includes(action.slot),'Неверный слот.');const key=['accessory','special','pet'].includes(item.type)?item.type:item.type==='body'?'body':action.slot==='main'?'weapon':action.slot==='ranged'?'rangedWeapon':item.combat==='ranged'?'rangedWeapon':'weapon';requireThat(key!=='rangedWeapon'||item.combat==='ranged'||heroHasDualWield(hero)&&item.combat==='melee','В дополнительный слот можно только дистанционное оружие.');requireThat(key==='rangedWeapon'||canEquipMainWeapon(hero,item),'Это оружие можно надеть только в дополнительный слот.');const target=item.twoSlots?'weapon':key;
 const displaced=item.twoSlots?['weapon','rangedWeapon']:key==='rangedWeapon'&&ITEMS[hero.weapon]?.twoSlots?['weapon',key]:[key];
 removeRow(s,row.uid,1);
 receive(s,displaced.filter(slot=>hero[slot]).map(slot=>({...hero[slot+'Details'],item:hero[slot],qty:1})));
 for(const slot of displaced){hero[slot]=null;hero[slot+'Details']=null;if(['weapon','rangedWeapon'].includes(slot))hero[slot+'Familiarity']=0;}
 hero[target]=row.item;hero[target+'Details']={...clone(row),qty:1};if(target==='special'||target==='pet'){hero.maxHp=heroMaximumHp(hero);hero.hp=Math.min(hero.hp,effectiveMaxHp(hero));}break;}
 case 'moveWeapon':{const hero=idleHero(s,true);requireThat(['main','ranged'].includes(action.slot),'Неверный слот.');const from=action.slot==='main'?'weapon':'rangedWeapon',to=from==='weapon'?'rangedWeapon':'weapon',moving=hero[from],familiarity=hero[from+'Familiarity']??0,previousFamiliarity=hero[to+'Familiarity']??0,details=clone(hero[from+'Details']??null);requireThat(moving,'Слот пуст.');requireThat(to!=='weapon'||canEquipMainWeapon(hero,ITEMS[moving]),'Это оружие можно надеть только в дополнительный слот.');requireThat(!ITEMS[hero.weapon]?.twoSlots,'Это оружие занимает оба слота.');requireThat(to!=='rangedWeapon'||ITEMS[moving].combat==='ranged'||heroHasDualWield(hero)&&ITEMS[moving].combat==='melee','В дополнительный слот можно только дистанционное оружие.');const previous=hero[to],previousDetails=clone(hero[to+'Details']??null),swap=previous&&(from==='weapon'?canEquipMainWeapon(hero,ITEMS[previous]):ITEMS[previous].combat==='ranged'||heroHasDualWield(hero));if(previous&&!swap)receive(s,[{...previousDetails,item:previous,qty:1}]);hero[to]=moving;hero[to+'Details']=details;hero[from]=swap?previous:null;hero[from+'Details']=swap?previousDetails:null;hero[to+'Familiarity']=familiarity;hero[from+'Familiarity']=swap?previousFamiliarity:0;break;}
 case 'unequipWeapon':{const hero=idleHero(s,true),key=action.slot==='ranged'?'rangedWeapon':'weapon';requireThat(hero[key],'Слот оружия пуст.');receive(s,[{...hero[key+'Details'],item:hero[key],qty:1}]);hero[key]=null;hero[key+'Details']=null;hero[key+'Familiarity']=0;break;}
 case 'unequipSpecial':{const hero=idleHero(s,true),slot=action.slot;requireThat(['special','pet'].includes(slot)&&hero[slot],'Слот пуст.');receive(s,[{...hero[slot+'Details'],item:hero[slot],qty:1}]);hero[slot]=null;hero[slot+'Details']=null;hero.maxHp=heroMaximumHp(hero);hero.hp=Math.min(hero.hp,effectiveMaxHp(hero));break;}
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
 case 'startShekelDump':{
  requireThat(tradingPostAvailable(s)&&tradingPostLevel(s)>=4,'Вброс доступен с 4-го уровня Торгового поста.');
  requireThat(!s.shekelDump,'Сначала дождись и получи результат предыдущего вброса.');
  requireThat(now>=(s.shekelDumpReadyAt??0),'Вброс ещё на кулдауне.');
  const qty=action.qty;
  requireThat(Number.isSafeInteger(qty)&&qty>0&&qty<=(s.shekels??0),'Укажи доступное количество шекелей.');
  const count=s.shekelDumpCount??0;
  s.shekels-=qty;
  s.shekelDump={qty,endsAt:now+15000};
  s.shekelDumpReadyAt=now+(240+30*count)*1000;
  s.shekelDumpCount=count+1;
  break;
 }
 case 'claimShekelDump':{
  const result=s.shekelDump?.result;
  requireThat(result,'Результат вброса ещё не готов.');
  s.money+=result.amount;
  s.lastShekelDump=result;
  delete s.shekelDump;
  break;
 }
 case 'autoDispatchMerchants':{
  requireThat(tradingPostAvailable(s)&&tradingPostLevel(s)>=3,'Автоотправка открывается на 3-м уровне Торгового поста.');
  requireThat(now>=(s.autoDispatchReadyAt??0),'Автоотправка ещё на кулдауне.');
  const merchants=shekelAutoDispatchTargets(s);
  requireThat(merchants.length,'Нет доступных наших торговцев.');
  s.money+=s.shekelIncome??0;
  s.shekelIncome=0;
  for(const id of merchants){
   const merchant=s[id];
   purchaseMerchantShekels(s,merchant,random,true);
   merchant.relation=Math.max(-10,(merchant.relation??0)-1);
   merchant.visit=null;
   merchant.nextAt=now+Math.round(merchantCooldown(s,id)/2);
  }
  s.money+=s.shekelIncome??0;
  s.shekelIncome=0;
  s.autoDispatchReadyAt=now+300000;
  addHistory(s,'Автоотправка торговцев: '+merchants.map(id=>MERCHANTS[id].name).join(', ')+'.',now);
  break;
 }
 case 'researchLeader': case 'researchRemoveLeader': case 'researchUpgrade': case 'researchStart': case 'researchClaim': case 'researchClaimFilters': researchAction(s,action,now);break;
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
 case 'upgradeTrainingCenter':{
  const kind=action.upgrade,quote=trainingUpgradeQuote(s,kind,now);
  requireThat(trainingCenterSlots(s).length&&quote?.available,'Улучшение Центра подготовки недоступно.');
  pay(s,quote.cost);
  const center=s.trainingCenter??={};
  const levels=center.upgrades??={};
  levels[kind]=(levels[kind]??0)+1;
  center.upgradeReadyAt=now+quote.seconds*1000;
  break;
 }
 case 'buyTrainingSlot':{
  const slots=trainingCenterSlots(s),cost=TRAINING_SLOT_COSTS[slots.length-1];
  requireThat(cost&&s.trainingCenter?.slotReadyAt==null,'Расширение Центра подготовки недоступно.');
  pay(s,cost);
  Object.assign(s.trainingCenter??={},{slotCount:slots.length,slotReadyAt:now+STATION_BUILD_SECONDS*1000});
  break;
 }
 case 'reviewTrainingRun':{
  requireThat(s.trainingCenter?.lastRuns?.[action.slot],'Сводка недоступна.');
  delete s.trainingCenter.lastRuns[action.slot];
  break;
 }
 case 'startTrainingRun':{
  const slots=trainingCenterSlots(s),slot=action.slot,kind=action.location;
  requireThat(Number.isInteger(slot)&&slot>=0&&slot<slots.length&&!slots[slot]&&!s.trainingCenter?.lastRuns?.[slot],'Слот недоступен.');
  requireThat(trainingLocations(s,h).includes(kind),'Герой или локация недоступны.');
  if(s.trainingCenter?.lastRuns)delete s.trainingCenter.lastRuns[slot];
  h.job={trainingAutoSpecial:action.autoSpecial===true};
  queueTrainingRun(s,h,slot,kind,now,random);
  break;
 }
 case 'startTrainingSpecial':{
  const job=h?.job;
  requireThat(job?.kind==='trainingSpecial'&&activeSpecialLocation(s,job.trainingLocation),'Особая локация недоступна.');
  requireThat(!trainingBlock(s,h,job.trainingLocation),'Герой пока не может отправиться на особую локацию.');
  queueTrainingRun(s,h,job.trainingSlot,job.trainingLocation,now,random,true);
  break;
 }
 case 'stopTrainingRun':{
  const job=h?.job;
  requireThat(job?.trainingSlot!=null&&job.kind!=='trainingStopping','Походы уже остановлены.');
  requireThat((job.trainingCompleted??0)>0,'Сначала герой должен завершить первый поход.');
  finishStimulant(h,job);
  h.job={kind:'trainingStopping',trainingSlot:job.trainingSlot,trainingLocation:job.trainingLocation,
   trainingCompleted:job.trainingCompleted??0,trainingTotals:job.trainingTotals,endsAt:now+5000};
  break;
 }
 case 'demolishStationBuilding':{
  const id=action.building,job=s.stationConstruction?.[id];
  requireThat(stationBuildingAvailable(s,id)&&(hasBuilding(s,id)||job&&!job.demolition),'Эту постройку нельзя снести.');
  if(id==='trainingCenter'){
   for(const hero of trainingCenterSlots(s))if(hero){finishStimulant(hero,hero.job);hero.job=null;}
   delete s.trainingCenter;
  }
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
  (s.stationConstruction??={})[id]={startedAt:now,endsAt:now+(building.seconds??STATION_BUILD_SECONDS)*1000};
  addHistory(s,'Начато строительство: '+building.name+'.',now);
  break;
 }
 case 'startAutoProduction':{
  const {recipe:id,qty,keep}=action;
  requireThat(s.alexeyMet&&!s.autoProduction&&autoRecipeAvailable(s,id),'Автопроизводство недоступно.');
  const recipe=RECIPES[id];
  requireThat(s.productions[recipe.production].job?.recipe!==id,'Этот рецепт уже запущен вручную.');
  requireThat(Number.isSafeInteger(qty)&&qty>0&&qty<=maxAutoQuantity(s,id),'Выбери доступное количество повторов.');
  requireThat(Array.isArray(keep)&&keep.every(q=>Number.isInteger(q)&&q>=1&&q<=4),'Выбери качество от +1 до +4.');
  s.autoProduction={recipe:id,total:qty,keep:[...new Set(keep)],startedAt:now,endsAt:now+autoProductionSeconds(recipe,qty,s)*1000,completed:0,money:0,xp:0,items:[],run:startCraftRun(s,id,1,now,random,'auto')};
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
 case 'craft':{const recipe=RECIPES[action.recipe];requireThat(recipe&&!recipe.upgrade&&!recipe.legacy,'Рецепт ещё не описан.');const production=s.productions[recipe.production];requireThat(!production.job,'Это производство занято.');requireThat(!autoProductionBusy(s,action.recipe),'Рецепт запущен в автопроизводстве.');requireThat(production.level>=recipe.level,'Недостаточный уровень производства.');requireThat(!action.max||recipe.batch,'В этом рецепте нельзя выбрать количество.');const qty=recipe.batch?(action.max?maxCraftQuantity(s,action.recipe):(action.qty??1)):1;requireThat(!action.max||qty>0,'Не хватает ресурсов для производства.');requireThat(Number.isSafeInteger(qty)&&qty>0&&qty<=1000,'Выбери количество от 1 до 1000.');for(const [item,count]of Object.entries(recipe.ingredients))requireThat(countItem(s,item)>=count*qty,'Не хватает материалов.');production.job=startCraftRun(s,action.recipe,qty,now,random);
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
  requireThat(now>=(s.auctionReadyAt??0),'Аукцион ещё на кулдауне.');
  const slots=s.shelves.flatMap((sale,index)=>sale&&!sale.auctioned&&!ready(sale,now)?[index]:[]);
  requireThat(slots.length,'Нет товаров для аукциона.');
  let proceeds=0;
  for(const slot of slots){
   proceeds+=roundRatio(s.shelves[slot].price,100-discount);
   s.shelves[slot]=null;
  }
  s.money+=proceeds;
  s.auctionReadyAt=now+60000;
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
  s.auctionReadyAt=now+60000;
  addHistory(s,`Получено за продажу: ${proceeds/10} A.`,now);
  break;
 }
 case 'cancelSale':{const sale=s.shelves[action.slot];requireThat(sale,'Полка пуста.');requireThat(!sale.auctioned&&!ready(sale,now),'Товар уже продан или выставлен на аукцион.');receive(s,[{...sale,item:sale.item,qty:sale.qty}]);s.shelves[action.slot]=null;break;}
 case 'acceptBobrovBunker':{
  requireThat(s.bobrovMet&&s.completedLocations.zilRoute&&!s.bobrovBunkerAccepted,'Задание Боброва пока недоступно.');
  s.bobrovBunkerAccepted=true;
  addHistory(s,'Бобров поручил добыть чертежи «Прототипа». Открыта вылазка «Бункер Серова».',now);
  break;
 }
 case 'setupPikiTrade':{
  requireThat(s.npcMeetings?.piki&&!s.pikiSix&&Object.hasOwn(PIKI_TRADE_PROFILES,action.profile),'Договор с Пиками недоступен.');
  pay(s,PIKI_TRADE_FEE);
  s.pikiSix={profile:action.profile,level:1,xp:0,relation:1,visit:null};
  s.pikiSix.nextAt=now+merchantCooldown(s,'pikiSix');
  addHistory(s,'Шестёрка пик · договор на торговлю. '+PIKI_TRADE_PROFILES[action.profile].name+'.',now);
  break;
 }
 case 'openYuras':openYuras(s,now,random,action.merchant);break;
 case 'trade':{const merchant=action.merchant??'yuras',npc=Object.hasOwn(MERCHANTS,merchant)?s[merchant]:null,v=npc?.visit;requireThat(v&&v.id===action.visitId,'Этот визит уже завершён.');requireThat(!npc.banned&&(npc.relation??0)>-10,'Торговец отказывается торговать.');requireThat((merchant!=='molchun'||action.modifier===0)&&TRADE_EFFECTS[action.modifier],'Неверный вариант торга.');const offer=v.offers?.[action.offer];requireThat(offer,'Предложение недоступно.');const quote=tradeQuote(offer,offer.qty,action.modifier,v.role,merchant,s);if(v.role==='seller'){requireThat(canReceive(s,[offer]),'В инвентаре не хватает места.');if(quote.shekelPrice!==null){requireThat((s.shekels??0)>=quote.shekelPrice,'Не хватает шекелей.');s.shekels-=quote.shekelPrice;}else pay(s,quote.price);const {currency,...goods}=offer;receive(s,[{...goods,origin:'bought'}]);}else{requireThat(tradeQuote(offer,offer.qty,0,'buyer',merchant,s).price<=(v.buyBudget??merchantBuyBudget(s,merchant)),'Торговец не готов заплатить столько за один предмет.');const row=s.inventory.find(x=>x.uid===offer.inventoryUid);requireThat(row&&row.item===offer.item&&row.qty>=offer.qty,'Этого предмета уже нет в инвентаре.');removeRow(s,row.uid,offer.qty);s.money+=quote.price;}if(merchant!=='molchun'){npc.relation=quote.relation;const previousLevel=npc.level;gainMerchantXp(npc,quote.xp);if(npc.level>previousLevel)addHistory(s,`${MERCHANTS[merchant].name}: уровень ${npc.level}.`,now);}npc.nextAt=now+quote.cooldown;npc.visit=null;addHistory(s,`Сделка · ${MERCHANTS[merchant].name}: ${ITEMS[offer.item].name}, ${quote.shekelPrice===null?quote.price/10+' A':quote.shekelPrice+' ₪'}.`,now);break;}
 case 'bribeMerchant':{const id=action.merchant,npc=Object.hasOwn(MERCHANTS,id)?s[id]:null;requireThat(id!=='molchun'&&npc?.visit&&!npc.banned&&npc.relation===-10,'Задобрить торговца сейчас нельзя.');pay(s,merchantBribeCost(s,id));npc.relation=-8;addHistory(s,MERCHANTS[id].name+': торговец задобрен, отношение −8.',now);break;}
 case 'robMerchant':{const id=action.merchant,npc=Object.hasOwn(MERCHANTS,id)?s[id]:null;requireThat(id!=='molchun'&&npc?.visit&&!npc.banned&&npc.relation===-10,'Ограбление сейчас недоступно.');const bandit=s.heroes.find(x=>x.id===action.banditId);requireThat(bandit?.profession==='bandit'&&!bandit.dead&&!bandit.job,'Нужен живой свободный бандит.');const loot=merchantRobberyLoot(s,id);requireThat(canReceive(s,loot),'Освободи место в инвентаре для всей добычи торговца.');const foe=merchantFighter(s,id),f=foe.config.hero,w=ITEMS[foe.hero.weapon];const enemy={name:MERCHANTS[id].name,hp:foe.hero.hp,initiative:f.initiative,stealth:f.perception,agility:f.agility,accuracy:f.accuracy,evasion:f.evasion,armor:f.armor,thermalArmor:f.thermalArmor??0,damageMin:(id==='pikiSix'?f.weapons.main.min:w.min)+f.strength*10,damageMax:(id==='pikiSix'?f.weapons.main.max:w.max)+f.strength*10,attackName:w.name};const config=heroConfig(s,bandit);config.rat=enemy;const result=battle(config,rng(Math.floor(random()*4294967296)),bandit.hp,{trace:true});bandit.hp=result.hp;bandit.dead=result.hp<=0;if(bandit.dead)for(const key of ['bandages','dressingKits','doctorKits','medicKits','grenades','molotovs','tinGrenades','lu216Grenades','dynamites','stimulants'])bandit[key]=0;npc.visit=null;npc.nextAt=now+merchantCooldown(s,id);let stolen=null;if(result.won){receive(s,loot);npc.banned=true;}else{const slots=['weapon','body'].filter(key=>bandit[key]);if(slots.length){const key=slots[Math.min(slots.length-1,Math.floor(random()*slots.length))];stolen={...clone(bandit[key+'Details']??{}),item:bandit[key],qty:1};bandit[key]=null;bandit[key+'Details']=null;addHistory(s,MERCHANTS[id].name+' забрал у бандита: '+itemName(stolen)+'.',now);}}npc.lastRobbery={...result,stolen,banditName:bandit.name,loot:result.won?loot:[],merchant:id};addHistory(s,result.won?bandit.name+' ограбил '+MERCHANTS[id].name+'. Торговец больше не вернётся.':'Так тебе и надо. '+MERCHANTS[id].name+' ушёл до следующего визита, отношение −10.',now);break;}
 case 'banMerchant':{const merchant=action.merchant,npc=Object.hasOwn(MERCHANTS,merchant)?s[merchant]:null;requireThat(merchant!=='molchun'&&npc?.visit&&!npc.banned&&npc.relation===-10,'Нельзя прогнать торговца.');npc.banned=true;npc.visit=null;addHistory(s,MERCHANTS[merchant].name+' прогнан со станции навсегда.',now);break;}
 case 'promoteShekels':{const merchant=action.merchant,npc=Object.hasOwn(MERCHANTS,merchant)?s[merchant]:null;requireThat(merchant!=='molchun'&&s.playerRole==='shekel'&&npc?.visit&&!npc.banned&&!npc.ours,'Продвижение недоступно.');requireThat(!npc.visit.promotionAttempted,'В этот визит проверка уже была.');const roll=Math.floor(random()*20)+1,relation=npc.relation??0,total=roll+relation;npc.visit.promotionAttempted=true;npc.lastPromotion={roll,relation,total};if(total>=SHEKEL_PROMOTION_DC)npc.ours=true;addHistory(s,'Продвигать шекели · '+MERCHANTS[merchant].name+': '+roll+' + ('+relation+') = '+total+(' / '+SHEKEL_PROMOTION_DC)+(npc.ours?' · Наш.':' · Неудача.'),now);break;}
 case 'dismissYuras':{
  const merchant=action.merchant??'yuras',npc=Object.hasOwn(MERCHANTS,merchant)?s[merchant]:null;
  requireThat(npc?.visit,'Торговец уже ушёл.');
  npc.visit=null;npc.nextAt=now+merchantCooldown(s,merchant);
  addHistory(s,`${MERCHANTS[merchant].name} ушёл без сделки.`,now);break;
 }
 default:throw new Error('Неизвестное действие.');
 }
 if(h&&['equip','moveWeapon'].includes(action.type)){
  const main=ITEMS[h.weapon],extra=ITEMS[h.rangedWeapon];
  requireThat(!main?.usesHeavyAmmo||!extra?.usesHeavyAmmo||Boolean(main.ammoCost)===Boolean(extra.ammoCost),'Сними тяжёлое оружие с другим типом боеприпасов.');
 }
 if(h&&['equip','moveWeapon','unequipWeapon'].includes(action.type)){
  const remainingWeapons=[h.weapon,h.rangedWeapon];
  const removedHeavyWeapon=previousWeapons.some(item=>{
   const index=remainingWeapons.indexOf(item);
   if(index>=0){remainingWeapons.splice(index,1);return false;}
   return ITEMS[item]?.usesHeavyAmmo;
  });
  if(removedHeavyWeapon){
   const ammoCost=previousAmmoWeapon.ammoCost??10;
   const refund=(h.heavyAmmo??0)*ammoCost+(h.reserveHeavyAmmo??0)*(ammoCost===10?200:10);
   s.money+=refund;
   h.heavyAmmo=0;h.heavyAmmoTarget=0;
   delete h.reserveHeavyAmmo;delete h.reserveHeavyAmmoTarget;
  }
 }
 if(action.type==='interactiveChoice'&&s.interactiveMission&&!s.interactiveMission.pendingCombat){adventureRegeneration(s,s.interactiveMission,'step:'+action.node+':'+action.choice);}advanceSpecialLocations(s,now);refreshMedicTeam(s);rememberDoctorUnlock(s);for(const hero of getHeroes(s))hero.researchLeader=hero.id===s.researchCenter?.leaderId;if(s.researchCenter)s.researchCenter.power=researchPower(s);s.updatedAt=now;return s;
}


// Nationalities are versioned independently from saved game version 1.
export function nationalityOffer(state,action,target='hire'){
 const offer=state.nationalityOffers?.[target]?.find(o=>o.id===action.nationalityId);
 requireThat(offer&&NATIONALITIES[offer.id]&&!(state.usedNationalities??[]).includes(offer.id),'Этот вариант национальности недоступен. Открой выбор заново.');return offer;
}
export function prepareNationalityOffers(state,random=Math.random,target='hire',reroll=false){
 state.nationalityOffers??={};const used=new Set(state.usedNationalities??[]);
 const previous=state.nationalityOffers[target];if(!reroll&&previous?.length&&previous.every(o=>NATIONALITIES[o.id]&&!used.has(o.id)))return previous;
 const pool=Object.keys(NATIONALITIES).filter(id=>!used.has(id));
 for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 if(reroll){
  const previousIds=new Set((previous??[]).map(offer=>offer.id));
  pool.sort((a,b)=>Number(previousIds.has(a))-Number(previousIds.has(b)));
 }
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
export function tradePercent(state,key){return Math.max(0,100+(key==='salePercent'&&hasBuilding(state,'tradingPost')?5:0)+(state?.playerRole==='shekel'?(key==='buyPercent'?-10:10):0)+(state?getHeroes(state).filter(h=>!h.dead).reduce((sum,h)=>sum+(h.nationalityBonuses?.[key]??0),0):0));}
export function npcQuestReward(state,base){return roundRatio(base,100+getHeroes(state).filter(h=>!h.dead).reduce((sum,h)=>sum+(h.nationalityBonuses?.npcQuestPercent??0),0));}
export function nationalProductionModifier(state,recipe,kind){
 const mods=getHeroes(state).filter(h=>!h.dead&&!h.job).map(h=>{const n=h.nationalityBonuses??{};return (n[kind]?.[recipe.production]??0)+(kind==='quality'&&ITEMS[recipe.output]?.type==='food'?(n.foodQuality??0):0);});
 return Math.max(0,...mods)+Math.min(0,...mods);
}
export function recipeQualityChance(state,id){const r=RECIPES[id];return !r||r.upgrade||r.noQuality?0:Math.max(0,Math.min(100,qualityChance(state.productions[r.production].level,r.level)+nationalProductionModifier(state,r,'quality')+productionPerkQualityBonus(state,r.production)+(r.production==='science'?scientistScienceBonus(state):0)+(r.production==='science'&&hasBuilding(state,'laboratory')?5:0)));}
function scientistScienceBonus(state){return getHeroes(state).some(h=>!h.dead&&hasScientistPerk(h,'experiment'))?5:0;}
function refreshMedicTeam(state){
 const heroes=getHeroes(state),living=heroes.filter(hero=>!hero.dead);
 for(const hero of heroes){
  const strength=living.filter(other=>other!==hero&&hasMedicPerk(other,'strength')).length;
  const nutrition=living.filter(other=>hasMedicPerk(other,'nutrition')).reduce((sum,other)=>sum+7*heroAttributes(other).perception,0);
  if(strength===(hero.medicStrength??0)&&nutrition===(hero.medicNutrition??0))continue;
  const before=effectiveMaxHp(hero);hero.medicStrength=strength;hero.medicNutrition=nutrition;
  hero.maxHp=heroMaximumHp(hero);if(!hero.dead)hero.hp=Math.max(1,Math.min(effectiveMaxHp(hero),hero.hp+effectiveMaxHp(hero)-before));
 }
}
function activeStimulantEffects(hero){
 const a=hero.activeStimulant?stimulantEffects(hero.activeStimulant,hero.stimulantQuality,hero):{};
 const b=hero.activeSecondStimulant?stimulantEffects(hero.activeSecondStimulant.item,hero.activeSecondStimulant.quality,hero):{};
 return Object.fromEntries(['hp','hpPercent','accuracy','strength','evasion','armor','thermal','rad','decontamination','halveRadiation','agility','detect','speed'].map(key=>[key,(a[key]??0)+(b[key]??0)]));
}
function startStimulant(hero,kind,random=Math.random){if(kind==='rest')return;
 const picks=(hero.levelPerks??[]).filter(choice=>choice.perk==='medic-preserve').length;
 const chance=picks===0?0:picks===1?30:Math.min(85,50+10*(picks-2));
 const spend=()=>kind!=='interactive'||!chance||random()*100>=chance;
 if(hero.stimulants>0){hero.activeStimulant=hero.stimulantItem??'combatStimulator';if(spend())hero.stimulants--;}
 if(hero.secondStimulant?.charges>0){hero.activeSecondStimulant={...hero.secondStimulant};if(spend())hero.secondStimulant.charges--;}
 if(!hero.activeStimulant&&!hero.activeSecondStimulant)return;
 const effect=activeStimulantEffects(hero);if(effect.decontamination)hero.radiation=Math.max(0,(hero.radiation??0)-effect.decontamination);hero.maxHp=heroMaximumHp(hero);hero.hp=Math.min(effectiveMaxHp(hero),hero.hp*(1+effect.hpPercent/100)+effect.hp);}
function finishStimulant(hero,run){if(!run.stimulant)return;hero.activeStimulant=false;delete hero.activeSecondStimulant;hero.maxHp=heroMaximumHp(hero);hero.hp=Math.min(hero.hp,effectiveMaxHp(hero));}

export function productionPerkQualityBonus(state,production){return (production==='medicine'&&doctorsWith(state,'pharmacist').length?5:0)+((PERKS.gunsmith.qualityProductions??[]).includes(production)?5*getHeroes(state).filter(h=>(h.perk==='gunsmith'||hasLevelPerk(h,'gunsmith'))).length:0);}

function grantNationalityMilestones(hero){
 const milestones=hero.nationalityBonuses?.perkMilestones;if(!milestones)return;
 hero.nationalityPerkMilestones??={};
 for(const [level,count]of Object.entries(milestones)){const key=hero.nationalityId+':'+level;if(hero.level>=Number(level)&&!hero.nationalityPerkMilestones[key]){hero.extraPerkChoices=(hero.extraPerkChoices??0)+count;hero.nationalityPerkMilestones[key]=true;}}
}

function qualifiesForDoctor(state){
 return Boolean(state.npcMeetings?.dymka||getHeroes(state).some(hero=>
  hero.profession==='medic'&&Math.max(hero.level,hero.job?.worker?.level??0)>=5));
}
function rememberDoctorUnlock(state){
 if(state.doctorUnlocked||!qualifiesForDoctor(state))return false;
 state.doctorUnlocked=true;
 return true;
}
export function professionUnlocked(state,id){
 if(id==='scientist')return Boolean(hasBuilding(state,'researchCenter')||state.npcMeetings?.serov||state.serovMet||(state.unlockedProfessions??[]).includes(id));
 if(id==='doctor')return Boolean(state.doctorUnlocked||qualifiesForDoctor(state));
 return Boolean(PROFESSIONS[id]?.available&&((state.unlockedProfessions??[]).includes(id)||(id!=='heavy'&&(id!=='hunter'||state.duren)&&(id!=='bandit'||state.npcMeetings?.piki||state.npcMeetings?.chervi)&&(id!=='sniper'||state.npcMeetings?.molchun)&&(id!=='medic'||hasBuilding(state,'medicTent')))));
}

function gainFamiliarity(hero){
 if(!hasLevelPerk(hero,'hunter-familiarity'))return;
 for(const slot of ['weapon','rangedWeapon'])if(hero[slot])hero[slot+'Familiarity']=Math.min(25,(hero[slot+'Familiarity']??0)+5);
}

export function act(state,action,now=Date.now(),random=Math.random){
 const pending=state.pendingScientistCheck;
 if(pending&&action.type!=='scientistCheckDecision')throw new Error('Сначала реши, использовать ли Контрольную пробу.');
 if(!pending&&!['interactiveChoice','kolomChoice'].includes(action.type))return actInternal(state,action,now,random);
 const original=clone(state);delete original.pendingScientistCheck;
 const replay=pending?{...pending,decisions:[...pending.decisions,action.decision]}:{action:clone(action),now,randomValues:[],decisions:[]};
 if(pending)requireThat(['reroll','skip'].includes(action.decision),'Выбери перебросить или пропустить.');
 let cursor=0;
 const recordedRandom=()=>{if(cursor>=replay.randomValues.length)replay.randomValues.push(random());return replay.randomValues[cursor++];};
 const context={index:0,decisions:replay.decisions,used:new Set(original.interactiveMission?.scientistProbeUsed??[])};
 try{
  const next=withScientistChecks(context,()=>actInternal(original,replay.action,replay.now,recordedRandom));
  if(next.interactiveMission)next.interactiveMission.scientistProbeUsed=[...context.used];
  return next;
 }catch(error){
  if(!error.scientistCheck)throw error;
  original.pendingScientistCheck={...replay,check:error.scientistCheck};
  return original;
 }
}
