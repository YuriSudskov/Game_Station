import {validateManualAction} from './kolom-jrpg.js';
import {ITEMS,CARAVAN} from './data.js';
import {rng} from './combat.js';
import {preparePartyCombat,advancePartyCombat,decidePartyCasualty,beginPartyRecovery} from './party-combat.js';
const clone=x=>structuredClone(x);
const need=(x,t)=>{if(!x)throw Error(t);};
const grenadeKeys=['grenades','molotovs','tinGrenades','lu216Grenades','radioactiveGrenades','dynamites'];
const supplies=['bandages','dressingKits','medicKits','doctorKits',...grenadeKeys,'stimulants','heavyAmmo'];
export const HANSA_SCENES={
 departure:['На дрезине с Васьком','«На Кольце у меня знакомый — Изя Кацман. Договоримся — наладим поставки на Автозаводскую. Патрончиков бы побольше: ганзейцы любят поторговаться».'],
 tunnel1:['Первый участок тоннеля','Фонари выхватывают мокрые стены. Дрезина уходит в темноту.'],
 tunnel2:['Второй участок тоннеля','Васёк прислушивается, не сбавляя хода. До Павелецкой уже недалеко.'],
 ghoulBattle:['Упыри на дрезине','Два больших упыря прыгают на дрезину! Защитите Васька или бросьте две гранаты и оторвитесь.'],
 paveletskaya:['Павелецкая','Подземная станция Союза шумит торговлей. Кордон Ганзы дальше — можно сначала осмотреть рынок.'],
 localMarket:['Рынок Павелецкой','На платформе — молодая гадалка и торговец, привёзший редкие вещи с ВДНХ.'],
 fortune:['Узнать судьбу','Гадалка обещает открыть вашу судьбу. Но не слишком ли настойчиво она отвлекает ваше внимание?'],
 rareTrader:['Редкие товары','«Такого больше нигде не найдёшь!» Торговец показывает амулет с зелёным камнем и два дорогих предмета.'],
 customs:['Кордон Ганзы','За столом перед гермодверью сидит чиновник. «Без паспорта — пошлина 42% со всех ввозимых вещей». Васёк проходит, вас задерживают.'],
 hansa:['Павелецкая Кольцевой линии','Яркий электрический свет, одновагонные составы, хорошо одетые люди без брони. Совсем другая подземная жизнь.'],
 hansaMarket:['Торговые ряды и кафе','Шесть товаров на прилавке. Здесь не торгуются. В кафе можно присмотреться к посетителям.'],
 specialTrader:['Особый торговец','Торговец предлагает взглянуть на необычную покупку. Цена явно завышена.'],
 izya:['Изя Кацман','Мужчина в очках едва помещается среди коробок. «От Васька? Проходи. Поставки устроим — осталось решить, на каких условиях».'],
 return:['Возвращение','Пора обратно на Автозаводскую. Найденные и купленные вещи остаются у вас.']
};
export function hansaRoutePrice(s,a,lot,c){return Math.round(lot.price*(lot.local?1-(a.discount??0)/100:1)*c.tradePercent(s,'buyPercent')/100);}
export function hansaDuty(s,a,h,c){
 let total=0;for(const slot of ['weapon','rangedWeapon','body','accessory','special','pet'])if(h[slot])total+=c.itemValue({item:h[slot],...h[slot+'Details']});
 for(const [key,item] of Object.entries({bandages:'bandage',dressingKits:'dressingKit',medicKits:'medicKit',doctorKits:'doctorKit',grenades:'pipeGrenade',molotovs:'molotov',tinGrenades:'tinGrenade',lu216Grenades:'lu216',radioactiveGrenades:'radioactiveGrenade',dynamites:'dynamite'}))total+=(h[key]??0)*(ITEMS[item]?.value??0);
 if(h.stimulants>0)total+=c.itemValue({item:h.stimulantItem??'combatStimulator',quality:h.stimulantQuality??0})*h.stimulants/10;
 if(h.secondStimulant?.charges>0)total+=c.itemValue(h.secondStimulant)*h.secondStimulant.charges/10;
 total+=(a.purchases??[]).reduce((n,x)=>n+c.itemValue(x)*(x.qty??1),0);
 return Math.round(total*.42*c.tradePercent(s,'buyPercent')/100);
}
function runHansaAction(s,action,now,random,c){
 let a=s.interactiveMission;const h=s.heroes.find(h=>h.id===(a?.id==='hansaRoute'?a.heroIds[0]:action.heroId));
 if(action.type==='startHansaExpedition'){
  need(s.hansaQuestAccepted&&(!s.hansaShop||s.hansaReplayEnabled)&&!s.hansaFullCompleted&&s.vasek?.level>=4,'Задание пока недоступно.');need(!a,'Сначала заверши текущую вылазку.');need(c.hansaHeroAvailable(h)&&!c.radiationBlocksMissions(h),'Нужен свободный живой герой.');need(!s.vasek.teaAway&&now>=(s.vasek.hansaRecoveryAt??0),'Васёк восстанавливается.');
  const fighter=c.merchantFighter(s,'vasek');a=s.interactiveMission={id:'hansaRoute',heroIds:[h.id],node:'departure',startedAt:now,history:[],xp:0,loot:[],purchases:[],failed:{},vasek:{...fighter.config.hero,id:'hansa-vasek',name:'Васёк',hp:fighter.hero.hp},teaSolo:Boolean(h.isTea),spartaPercent:c.teaSpartaPercent(s,h)};
  s.vasek.teaAway=true;s.vasek.visit=null;h.job={kind:'interactive',mission:'hansaRoute',startedAt:now};c.startStimulant(h,'interactive',random);return s;
 }
 need(a?.id==='hansaRoute','Нет активной поездки с Васьком.');const roll=rng(Math.floor(random()*4294967296));
 if(a.feedbackNode!==a.node){a.feedback=[];a.feedbackNode=a.node;}a.feedback=[];
 const say=text=>{a.history.push({text,node:a.node});a.feedback.push(text);};
 const check=(dc,penalty=0)=>{const die=roll.int(1,20),bonus=c.heroAttributes(h).perception-penalty,ok=die+bonus>=dc;say(`Восприятие: ${die} + ${bonus} против ${dc} — ${ok?'успех':'провал'}.`);if(ok)a.xp+=10;return ok;};
 const pay=value=>{need(s.money>=value,'Не хватает патронов. Можно закрыть окно и заработать ещё.');c.pay(s,value);a.spent=(a.spent??0)+value;};
 const finish=(success=false)=>{
  need(!a.finished,'Результат уже получен.');
  const loot=clone(a.loot);if(success&&h.isTea){const found=c.merchantSellerOffers(s,'duren',random)[0];if(found){loot.push(found);a.teaFind=found;}}
  c.receive(s,loot);const xp=h.dead?0:c.adventureExperience(a,h,a.xp*(h.isTea?2:1));if(xp)c.levelUp(h,xp);h.job=null;c.finishStimulant(h,{stimulant:true});
  if(success){c.unlockHansaShop(s,random);s.hansaShop.izyaInterest=Boolean(a.credit);s.hansaFullCompleted=true;delete s.hansaReplayEnabled;}
  delete s.vasek.teaAway;const cd=c.merchantCooldown(s,'vasek')*(a.vasek.hp<=0?2:1);s.vasek.nextAt=now+cd;if(a.vasek.hp<=0)s.vasek.hansaRecoveryAt=now+cd;
  if(h.dead||h.hp<=0){h.dead=true;h.hp=0;h.missingOnMission=true;h.missingMission=a.id;h.missingScene='drezina';}else c.returnAdventureFallen(s,a,now);
  if(h.isTea&&h.dead)s.teaGameOver=true;c.startAdventureCooldown(s,a,now);a.finished=true;a.result={xp:xp+(a.treatmentXp??0),rewardXp:xp,treatmentXp:a.treatmentXp??0,baseXp:a.xp,loot,purchases:a.purchases,success,hero:{id:h.id,name:h.name,hp:h.hp,maxHp:c.effectiveMaxHp(h),dead:Boolean(h.dead),level:h.level},cooldownUntil:h.adventureCooldownUntil??null,finishedAt:now,spent:a.spent??0,turns:a.turns??0,killed:a.killed??0,vasekHp:Math.max(0,a.vasek.hp),credit:Boolean(a.credit)};s.lastHansaMission=clone(a);s.interactiveMission=null;c.addHistory(s,success?'Васёк: поставки из Ганзы согласованы.':'Поездка с Васьком завершена без договора; можно попробовать снова.',now);
 };
 const buy=(list,index)=>{const lot=list?.[index];need(lot&&!lot.sold,'Товар уже куплен.');const price=hansaRoutePrice(s,a,lot,c);pay(price);c.receive(s,[lot]);lot.sold=true;lot.paidPrice=price;a.purchases.push(clone(lot));say('Куплено: '+c.itemName(lot)+'.');};
 const rareStock=()=>{if(a.rareStock)return;const pool=Object.entries(ITEMS).filter(([,x])=>['weapon','body','accessory'].includes(x.type)&&x.equipmentCategory>=5);const lots=[];for(let i=0;i<2&&pool.length;i++){const [item]=pool.splice(roll.int(0,pool.length-1),1)[0];const lot={item,qty:1,quality:1,local:true};lot.price=Math.round(c.itemValue(lot)*1.5);lots.push(lot);}a.rareStock=[{item:'greenStone',qty:1,price:2000,local:true},...lots];};
 if(action.type==='hansaRouteBuy'){need(Number.isInteger(Number(action.index)),'Выбери товар.');need(['rareTrader','hansaMarket','specialTrader'].includes(a.node),'Сейчас нет торговли.');const lots=a.node==='rareTrader'?a.rareStock:a.node==='hansaMarket'?a.market:[a.special];if(Number(action.index)===-1){need(lots.some(l=>!l.sold),'Все товары уже куплены.');for(const [i,lot] of lots.entries())if(!lot.sold)buy(lots,i);}else buy(lots,Number(action.index));return s;}
 const choice=action.choice;need(action.node===a.node,'Этот выбор уже обработан.');
 if(choice==='abandon'){need(!a.combat||a.combat.status==='recovery','Сначала закончи бой.');finish();return s;}
 if(a.node==='departure'){need(choice==='go','Выбор недоступен.');a.node='tunnel1';}
 else if(['tunnel1','tunnel2'].includes(a.node)){need(choice==='go','Выбор недоступен.');a.afterBattle=a.node==='tunnel1'?'tunnel2':'paveletskaya';if(roll.int(1,100)<=35)a.node='ghoulBattle';else{say('Удалось проехать без нападения.');a.node=a.afterBattle;}}
 else if(a.node==='ghoulBattle'){
  if(!a.combat){if(choice==='grenades'){need(grenadeKeys.reduce((n,k)=>n+(h[k]??0),0)>=2,'Нужно две гранаты у героя.');let n=2;for(const k of grenadeKeys){const used=Math.min(n,h[k]??0);h[k]=(h[k]??0)-used;n-=used;}say('Две гранаты позволили оторваться от упырей.');a.node=a.afterBattle;}
   else{need(choice==='fight','Выбор недоступен.');a.combat=preparePartyCombat([{...c.heroConfig(s,h,'surface').hero,id:h.id,name:h.name,hp:h.hp,maxHp:c.effectiveMaxHp(h),...Object.fromEntries(supplies.map(k=>[k,h[k]??0]))},a.vasek],[clone(CARAVAN.enemy),clone(CARAVAN.enemy)],roll,{ambush:true});a.combat.manual=!a.jrpgBattleUsed;a.jrpgBattleUsed=true;}}
  else if(choice==='turn'){
   const b=a.combat;if(action.prefs){const f=b.heroes.find(h=>h.id===b.waitingHeroId);need(f,'Нет хода героя.');f.manualPrefs={...f.manualPrefs,...action.prefs};return s;}if(b.manual){for(const unit of [...b.heroes,...b.enemies])unit.maxHp??=unit.hp;if(b.waitingHeroId){validateManualAction(b,action.command);b.manualAction=clone(action.command);b.manualRevision=(b.manualRevision??0)+1;}b.manualStarted=true;b.frames=[];}if(b.status==='casualty')decidePartyCasualty(b,'fight');advancePartyCombat(b,roll,b.manual?{maxActors:100}:{});a.turns=(a.turns??0)+1;const hero=b.heroes.find(x=>x.id===h.id),v=b.heroes.find(x=>x.id==='hansa-vasek');h.hp=Math.max(0,hero.hp);h.dead=h.hp<=0;for(const k of supplies)if(hero[k]!=null)h[k]=hero[k];a.vasek.hp=v.hp;
   for(const e of b.enemies)if(e.hp<=0&&!e.hansaLoot){e.hansaLoot=true;a.killed=(a.killed??0)+1;a.xp+=CARAVAN.mission.killXp;for(const x of CARAVAN.loot)if(roll.int(1,100)<=x.chance)a.loot.push({item:x.id,qty:1});}
   if(b.status==='escaped'){say('Отряд отступил с дрезины.');a.node='return';}else if(v.hp<=0||b.status==='defeat'){say('Васёк повержен. Поездка сорвалась; он восстановится через двойной кулдаун.');a.node='return';a.failedTrip=true;}
   else if(b.status==='victory'){beginPartyRecovery(b);h.dead=Boolean(b.heroes.find(x=>x.id===h.id).dead);h.hp=b.heroes.find(x=>x.id===h.id).hp;}
  }else if(choice==='continue'){need(a.combat.status==='recovery','Бой ещё идёт.');a.combat=null;a.node=a.afterBattle;}
  else if(choice==='treatment'){
   need(a.combat.status==='recovery'&&['medic','doctor'].includes(h.profession)&&!a.combat.treatmentUsed,'Профессиональное лечение недоступно.');need(h.hp<c.effectiveMaxHp(h),'Здоровье уже полное.');const reserve=h.profession==='medic'&&c.hasMedicPerk(h,'reserve')&&!a.medicReserveUsed;need(reserve||c.heroEffectiveStrength(h)>=1,'Недостаточно Силы.');const raw=(h.level*roll.int(1,10))+10*c.heroAttributes(h).perception+(reserve?30:0)+(c.hasMedicPerk(h,'knowledge')?20:0);if(reserve)a.medicReserveUsed=true;else h.temporaryAttributeLoss={...h.temporaryAttributeLoss,strength:(h.temporaryAttributeLoss?.strength??0)+1};h.maxHp=c.heroMaximumHp(h);h.hp=Math.min(c.effectiveMaxHp(h),h.hp+c.nationalityHealing(h,raw));a.combat.treatmentUsed=true;if(h.profession==='medic'){const xp=c.adventureExperience(a,h,5*(h.isTea?2:1));c.levelUp(h,xp);a.treatmentXp=(a.treatmentXp??0)+xp;}say('Профессиональное лечение применено.');
  }
  else if(choice.startsWith('heal:')){need(a.combat.status==='recovery','Лечение доступно после боя.');const item=choice.slice(5),key={bandage:'bandages',dressingKit:'dressingKits',medicKit:'medicKits',doctorKit:'doctorKits'}[item];need(key&&h[key]>0&&h.hp<c.effectiveMaxHp(h),'Нужен расходник и раненый герой.');h[key]--;h.hp=c.bandageHeal(c.heroConfig(s,h,'surface'),roll,h.hp,item).hp;}
  else throw Error('Выбор недоступен.');
 }
 else if(a.node==='paveletskaya'){need(['market','customs'].includes(choice),'Выбор недоступен.');a.node=choice==='market'?'localMarket':'customs';}
 else if(a.node==='localMarket'){if(choice==='fortune'){need(!a.fortuneVisited,'Гадалка уже ушла.');pay(100);a.fortuneStep=0;a.fortunePenalty=0;a.node='fortune';}else if(choice==='trader'){rareStock();a.node='rareTrader';}else{need(choice==='customs','Выбор недоступен.');a.node='customs';}}
 else if(a.node==='fortune'){
  if(choice==='check'){need(a.fortuneStep<3,'Разговор окончен.');const step=a.fortuneStep++,ok=check([16,15,13][step],a.fortunePenalty);
   const steal=slots=>{const occupied=slots.filter(k=>h[k]);if(!occupied.length){const amount=Math.round(s.money*.1);s.money-=amount;return `${amount/10} А`;}const slot=occupied[roll.int(0,occupied.length-1)],name=c.itemName({item:h[slot],...h[slot+'Details']});if(ITEMS[h[slot]]?.usesHeavyAmmo&&h.heavyAmmo){s.money+=h.heavyAmmo*(ITEMS[h[slot]].ammoCost??10);h.heavyAmmo=0;}h[slot]=null;h[slot+'Details']=null;return name;};
   if(step===2)a.fortuneVisited=true;
   if(step===0)say(ok?'Вы: «Не нужно меня заговаривать. Говори по делу».':'Её слова сбивают с толку. Внимательность в этом разговоре снижена на 2.');
   if(step===1&&ok)say('Вы: «Только десять А, как договаривались. И хватит сказок».');
   if(!ok&&step===0)a.fortunePenalty=2;if(!ok&&step===1){if(s.money>=1000){s.money-=1000;say('Увлёкшись обещаниями, вы отдали ещё 100 А.');}else say('Не найдя патронов, вы отдали: '+steal(['weapon'])+'.');}if(!ok&&step===2)say('Гадалка растворяется в толпе. Через некоторое время вы обнаруживаете пропажу: «'+steal(['weapon','rangedWeapon','body','accessory','special','pet'])+'».');if(ok&&step===2)say('Вы ловите воровку за руку: «Эй, ты что решила схватить?»');
  }else{need(a.fortuneStep===3&&['back','customs'].includes(choice),'Сначала закончи разговор.');a.node=choice==='back'?'localMarket':'customs';}}
 else if(a.node==='rareTrader'){if(choice==='bargain'){need(!a.bargainClosed&&(a.discount??0)<30,'Торг завершён.');if(check(13+(a.discount??0)/5))a.discount=(a.discount??0)+10;else a.bargainClosed=true;say(a.bargainClosed?'Торговец: «Всё, хватит. Дальше цену не двигаю».':'Торговец: «Ладно, уступлю. Скидка уже '+a.discount+' процентов».');}else{need(['back','customs'].includes(choice),'Выбор недоступен.');a.node=choice==='back'?'localMarket':'customs';}}
 else if(a.node==='customs'){
  if(choice==='duty'){pay(hansaDuty(s,a,h,c));a.node='hansa';}else if(choice==='talk'||choice==='bribe'){need(!a.failed[choice],'Этот вариант уже провален.');if(check(choice==='talk'?19:13)){if(choice==='bribe')pay(Math.round(300*c.tradePercent(s,'buyPercent')/100));a.node='hansa';}else{a.failed[choice]=true;say('Чиновник: «Этот довод меня не убедил. Платите пошлину или предложите что-нибудь другое».');}}else throw Error('Выбор недоступен.');
 }
 else if(a.node==='hansa'){need(['market','izya'].includes(choice),'Выбор недоступен.');a.node=choice==='market'?'hansaMarket':'izya';if(!a.market)a.market=c.hansaStock(s,random).slice(0,6).map(x=>({...x,price:Math.round(c.itemValue(x)*x.qty*1.3)}));}
 else if(a.node==='hansaMarket'){if(choice==='cafe'){const first=check(16),second=check(16);if(first||second){a.special??={item:random()<.5?'hockeyMask':'shepherdPet',qty:1};a.special.price=ITEMS[a.special.item].value?ITEMS[a.special.item].value*2:3000;a.node='specialTrader';}else say('Ничего особенного не заметили.');}else{need(choice==='izya','Выбор недоступен.');a.node='izya';}}
 else if(a.node==='specialTrader'){need(['back','izya'].includes(choice),'Выбор недоступен.');a.node=choice==='back'?'hansaMarket':'izya';}
 else if(a.node==='izya'){
  need(['free','half','full','credit'].includes(choice)&&!a.failed[choice],'Этот способ недоступен.');if(choice==='free'||choice==='half'){if(!check(choice==='free'?18:14)){a.failed[choice]=true;say('Изя: «На такие условия я не согласен. Другие предложения есть?»');return s;}}
  if(choice==='half'||choice==='full')pay(Math.round((choice==='half'?5000:10000)*c.tradePercent(s,'buyPercent')/100));a.credit=choice==='credit';a.xp+=100;a.deal=true;a.node='return';say(a.credit?'Договорились: «Ганза и процент Изи», постоянные +10% к ценам.':'Договорились: «Магазин из Ганзы».');
 }
 else if(a.node==='return'){need(choice==='finish','Выбор недоступен.');finish(Boolean(a.deal&&!a.failedTrip));}
 if(a.node!==a.feedbackNode){a.feedback=[];a.feedbackNode=a.node;}
 return s;
}

export function runHansa(s,action,now,random,c){
 const before=s.interactiveMission;
 if(before?.id==='hansaRoute'&&before.transition){
  need(action.type==='hansaRouteChoice'&&action.choice==='nextScene'&&action.node===before.node,'Сначала прочитай результат и нажми «Продолжить».');
  before.node=before.transition.to;delete before.transition;before.feedback=[];before.feedbackNode=before.node;return s;
 }
 const from=before?.id==='hansaRoute'?before.node:null,historyLength=before?.history?.length??0;
 const result=runHansaAction(s,action,now,random,c),a=result.interactiveMission;
 if(from&&a?.id==='hansaRoute'&&action.type==='hansaRouteChoice'){
  const to=a.node,checked=['check','bargain','talk','bribe','free','half','cafe'].includes(action.choice);
  if(to!==from||checked){
   const lines=a.history.slice(historyLength).map(e=>e.text).filter(Boolean);
   const bridges={tunnel1:'Васёк берётся за рукоять: «Ну, поехали». Дрезина уходит с платформы в тоннель.',tunnel2:'Васёк: «Этот участок позади. Держи фонарь — впереди ещё один перегон».',ghoulBattle:'Из темноты слышится топот. Два упыря бросаются к дрезине. Васёк: «Смотри, слева!»',paveletskaya:'Впереди появляются огни платформы. Васёк тормозит: «Павелецкая. Приехали».',localMarket:'Вы возвращаетесь к прилавкам. Вокруг гудит подземный рынок.',fortune:'Вы отдаёте десять А. Гадалка подзывает ближе: «Садись, сейчас всё расскажу».',rareTrader:'Торговец разворачивает товар: «Посмотри, выбирай. Для тебя кое-что найдётся».',customs:'Васёк ведёт вас к гермодвери. Чиновник поднимает взгляд: «Следующий! Что везёте?»',hansa:action.choice==='duty'?'Чиновник пересчитывает патроны и машет охране: «Оплачено. Пропускайте».':action.choice==='bribe'?'Чиновник прячет патроны под бумаги: «Проходи. И без лишнего шума».':'Чиновник вздыхает: «Ладно, убедил. Пропускайте, не задерживайте очередь».',hansaMarket:'Вы сворачиваете к торговым рядам. За стойкой кафе звякает посуда.',specialTrader:'За соседним столиком вы замечаете торговца. Он ловит ваш взгляд: «Ищешь что-то особенное?»',izya:'Васёк останавливается у тесной лавки: «Изя, это со мной. Есть дело о поставках».',return:a.failedTrip?'Поездка сорвалась. Нужно возвращаться на Автозаводскую.':'Васёк: «Вот и договорились. Собирай покупки — поедем домой».'};
   if(to!==from)lines.push(bridges[to]??'Вы продолжаете путь.');
   a.transition={to,lines,label:to===from?'Выбрать следующий ответ':({hansa:'Пройти за кордон',ghoulBattle:'Решить, как отбиваться',izya:'Войти в лавку Изи',return:'Подготовиться к возвращению'}[to]??'Продолжить путь')};a.node=from;a.feedback=[];a.feedbackNode=from;
  }
 }
 return result;
}
