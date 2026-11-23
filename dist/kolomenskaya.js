import {validateManualAction} from './kolom-jrpg.js';
import {ITEMS} from './data.js';
import {rng,perceptionCheck,damageAfterArmor} from './combat.js';
import {preparePartyCombat,advancePartyCombat,decidePartyCasualty,scenarioEnemyAttack} from './party-combat.js';
import {doctorKitCure} from './doctor-kit.js';
export const KOLOM_ENEMIES={
 spider:{name:'Хитиновый скорпион-паук',hp:130,armor:80,thermalArmor:0,evasion:70,accuracy:15,stealth:3,initiative:3,damageMin:60,damageMax:100,experience:20,kolomPoison:true,armorFactor:.5,thermalVulnerable:true,kolomWeb:true},
 worm:{name:'Стоковый червь',hp:520,armor:35,thermalArmor:10,evasion:30,accuracy:20,stealth:2,initiative:2,damageMin:70,damageMax:130,experience:120,kolomSlime:true},
 queen:{name:'Матка Коломенской',boss:true,hp:700,armor:100,thermalArmor:0,evasion:30,accuracy:20,stealth:1,initiative:2,damageMin:80,damageMax:140,experience:200,thermalVulnerable:true,thermalMultiplier:1.25,kolomQueen:true}
};
export const KOLOM_SCENES={
 fork:['03','Два тоннеля','Лось провожает вас к выходу с Технопарка. Один путь сухой, другой уходит под мокрые кабели.'],
 dry1:['04С','Сухой тоннель','Хитиновые силуэты затаились среди густой паутины.'],
 corpse:['05С','Кокон охранника','Под паутиной видна форма охраны Технопарка. Можно обыскать останки или пройти дальше.'],
 anomaly:['06С','Шаровая молния','По рельсам приближается шаровой разряд. За вагонеткой можно укрыться.'],
 dry2:['07С','Последние коконы','Впереди станция, но в проходе видны свежие нити.'],
 wet:['04М','Затопленный тоннель','Через десять минут пути вода покрывает рельсы. Светящиеся грибы и мох окружают вас. Фон — 4 РАД.'],
 worm:['05М','Пролом с поверхности','Из талого снега под проломом поднимается огромный змееподобный червь.'],
 lair:['06М','Логово червя','Среди обломков лежат вещи пропавших охранников.'],
 clear:['07М','Сухие рельсы','Вода отступает, радиационный участок остался позади. Впереди Коломенская.'],
 station:['10','Коломенская в паутине','Пауки заполнили стены, потолок и платформу. Их слишком много для обычного боя.'],
 pressure:['11','Пробиваться и искать решение','Пока вы ищете выход, пауки подбираются всё ближе. Каждое действие даёт им возможность атаковать.'],
 fire:['12','Огонь помогает','Охваченные пламенем пауки отступают. Теперь ясно: станцию можно очистить огнём.'],
 blaze:['13','Выжечь гнёзда','Паутина полыхает. Из дальнего прохода выходит огромная матка. На лечение времени нет.'],
 boss:['14','Матка Коломенской','Массивные клешни скребут перрон. Грубая хитиновая броня защищает матку от пуль, но не от огня.'],
 cleanup:['15','Осмотр и дочистка','У стены сгребены тушки пауков и обглоданные насекомые. Среди коконов видны останки сталкеров.'],
 final:['16','Коломенская освобождена','Пустой бесколонный перрон освещают редкие лампы. В углу шевелятся маленькие радиоактивные жуки. Станции нужны жители.'],
 casualty:['П','Герой повержен','Отряд может отступить с выжившим или продолжить бой до последнего.'],
 combat:['Б','Бой','Действия происходят по инициативе каждого участника.'],
 recovery:['Л','Передышка','Можно лечиться, снять отравление или продолжить путь.']
};
export const kolomLocal=()=>['localhost','127.0.0.1','[::1]'].includes(globalThis.location?.hostname);
export const kolomAvailable=s=>kolomLocal()||Boolean(s.completedLocations?.technoparkRoof&&(s.keeperQuest?.stage>6||s.keeperQuest?.stage===6&&s.keeperQuest?.status==='completed'));
const need=(x,t)=>{if(!x)throw Error(t);};
const copy=x=>structuredClone(x);
const keys=['bandages','dressingKits','medicKits','doctorKits','grenades','molotovs','tinGrenades','lu216Grenades','radioactiveGrenades','dynamites','heavyAmmo'];
export function runKolom(s,action,now,random,c){
 const rolls=rng(Math.floor(random()*4294967296));
 if(action.type==='acceptKolom'){need(kolomAvailable(s),'Сначала восстанови Технопарк и заверши квесты Смотрителя.');s.kolomQuestAccepted=true;return s;}
 if(action.type==='startKolom'){
  need(s.kolomQuestAccepted,'Сначала поговори с Димой Лосем.');need(!s.interactiveMission,'Другая вылазка уже открыта.');
  let ids=action.heroIds??[action.heroId];if(action.frontHeroId&&ids.includes(action.frontHeroId))ids=[action.frontHeroId,...ids.filter(id=>id!==action.frontHeroId)];need(Array.isArray(ids)&&ids.length>=1&&ids.length<=2&&new Set(ids).size===ids.length,'Выбери одного или двух разных героев.');
  const party=ids.map(id=>s.heroes.find(h=>h.id===id));need(party.every(h=>h&&!h.dead&&!h.job&&!c.needsAdventureRecovery(h)&&!c.radiationBlocksMissions(h)),'Нужны свободные герои.');
  need(party.every(h=>h.level>=7)||action.riskConfirmed,'Подтверди риск для героя ниже 7-го уровня.');
  for(const h of party){c.startStimulant(h,'interactive',random);h.job={kind:'interactive',mission:'kolomenskaya'};}
  s.interactiveMission={id:'kolomenskaya',heroIds:ids,node:'fork',drySide:rolls.int(0,1)?'left':'right',xp:0,loot:{},money:0,locationRadiation:0,teaSolo:party.length===1&&Boolean(party[0].isTea),initialHeavyAmmo:party[0].heavyAmmo??0,initialAmmo:Object.fromEntries(party.map(h=>[h.id,h.heavyAmmo??0])),startedAt:now,events:[],repeat:Boolean(s.completedLocations?.kolomenskaya)};return s;
 }
 const a=s.interactiveMission;need(a?.id==='kolomenskaya'&&action.node===a.node,'Эта сцена уже изменилась.');
 const party=a.heroIds.map(id=>s.heroes.find(h=>h.id===id));const living=()=>party.filter(h=>h&&!h.dead&&h.hp>0&&!h.unconscious);let h=party.find(h=>h.id===(action.targetHeroId??a.selectedHealHeroId))??living()[0]??party[0];need(h,'Герой недоступен.');
 const config=()=>c.heroConfig(s,h,'surface');
 const actionLogStart=a.events.length;const note=t=>a.events.push(t);
 const regen=()=>{for(const h of living())if(h.mark==='regeneration')h.hp=Math.min(c.effectiveMaxHp(h),h.hp+30);};
 const go=node=>{const previous=a.node;a.node=node;if(previous!==node){a.sceneLogStart=actionLogStart;note('Переход: '+KOLOM_SCENES[node][1]+'. '+KOLOM_SCENES[node][2]);regen();}};
 const search=(key,level,final=false)=>{const result=c.searchRewards(a,key,level,final,rolls);(a.rewardItems??=[]).push(...result.items);a.money+=result.money;for(const check of result.checks)note(check.name+': обнаружение '+check.roll+' + '+check.bonus+' против '+result.dc+' — '+(check.success?'успех':'провал'));note('Найдено наград: '+result.count+'. '+result.items.map(x=>ITEMS[x.item].name+(x.quality?' +'+x.quality:'')).join(', ')+'; '+result.money/10+' А.');};
 const loot=(id,qty=1)=>{a.loot[id]=(a.loot[id]??0)+qty;note('Найдено: '+ITEMS[id].name+' ×'+qty+'.');};
 const checkOne=(member,attribute,dc)=>{const cfg=c.heroConfig(s,member,'surface').hero,bonus=attribute==='intelligence'?cfg.intelligence+(cfg.intelligenceCheckBonus??0):attribute==='agility'?cfg.agility:cfg.perception+(cfg.perceptionCheckBonus??0),roll=rolls.int(1,20),ok=roll+bonus>dc;note(member.name+': '+({intelligence:'Интеллект',agility:'Ловкость',perception:'Восприятие'}[attribute]??attribute)+' '+roll+' + '+bonus+' против '+dc+' — '+(ok?'успех':'провал'));if(ok)a.xp+=10;return ok;};
 const check=(attribute,dc)=>living().map(member=>checkOne(member,attribute,dc)).some(Boolean);
 const finish=success=>{
  const entries=[];let anyAlive=false;
  for(const member of party){h=member;h.job=null;const dead=h.hp<=0||h.unconscious&&!living().length;
   if(dead){h.dead=true;h.missingOnMission=true;h.missingMission='kolomenskaya';h.fallenScene=a.resumeNode??a.node;entries.push({id:h.id,name:h.name,dead:true,xp:0});continue;}
   anyAlive=true;const cfg=config().hero,dose=Math.max(0,(cfg.halveRadiation?Math.ceil(a.locationRadiation/2):a.locationRadiation)-(cfg.radiationProtection??0));h.radiation=(h.radiation??0)+dose;
   c.finishStimulant(h,{stimulant:true});const xp=c.adventureExperience(a,h,(a.xp+(success?150:0))/party.length);c.levelUp(h,xp);
   c.healAtMedicTent(s,h,now);h.lastHeavyReload=c.settleHeavyAmmo(s,h,{heavyAmmoRemaining:h.heavyAmmo,heavyAmmoSpent:Math.max(0,(a.initialAmmo?.[h.id]??a.initialHeavyAmmo)-(h.heavyAmmo??0))},now);h.needsAdventureRest=true;entries.push({id:h.id,name:h.name,xp,dead:false,radiation:dose});
  }
  if(anyAlive){if(!a.repeat){const rewards=[...Object.entries(a.loot).map(([item,qty])=>({item,qty})),...(a.rewardItems??[])];if(success&&!s.kolomQuestRewardClaimed){const pool=Object.entries(ITEMS).filter(([,item])=>['weapon','body'].includes(item.type)&&item.equipmentCategory===5&&!item.rewardOnly).map(([id])=>id);need(pool.length,'Нет снаряжения для награды.');a.questReward={item:pool[rolls.int(0,pool.length-1)],qty:1,quality:1};rewards.push(a.questReward);a.money+=5000;s.kolomQuestRewardClaimed=true;}c.receive(s,rewards);s.money+=a.money;}c.startAdventureCooldown(s,a,now);}
  if(success){s.completedLocations.kolomenskaya=true;s.kolomQuestCompleted=true;if(a.teaSolo)s.teaReputation=(s.teaReputation??0)+1;}
  s.lastKolomMission={...copy(a),entries,awardedXp:entries[0].xp,radiationReceived:entries[0].radiation??0,success,dead:!anyAlive,hero:copy(party[0]),heroes:copy(party)};s.interactiveMission=null;
 };
 const casualty=()=>{const fresh=party.filter(h=>h.hp<=0&&!(a.acceptedLosses??[]).includes(h.id));if(!living().length){finish(false);return true;}if(fresh.length&&party.length>1){a.resumeNode=a.node;a.sceneLogStart=actionLogStart;a.node='casualty';return true;}return false;};
 const pressure=()=>{const n=Math.min(3,1+Math.floor((a.attempts??0)/2));a.attempts=(a.attempts??0)+1;const previous=h;for(h of living()){const f=(a.pressureFighters??={})[h.id]??{};Object.assign(f,config().hero,{hp:h.hp,poisonDoses:h.poisonDoses??0});a.pressureFighters[h.id]=f;for(const key of keys)f[key]=h[key]??0;for(let i=0;i<n&&f.hp>0;i++){const before=f.hp;scenarioEnemyAttack(f,{...copy(KOLOM_ENEMIES.spider),id:'pressure-'+i},rolls);note(h.name+': атака паука — потеря '+Math.round((before-f.hp)*10)/10+' HP.');}h.hp=f.hp;for(const key of keys)h[key]=f[key]??h[key];h.radiation=Math.max(0,(h.radiation??0)-(f.doctorRadiationRemoved??0));f.doctorRadiationRemoved=0;h.poisonDoses=f.poisonDoses??0;h.maxHp=c.heroMaximumHp(h);h.hp=Math.min(h.hp,c.effectiveMaxHp(h));}h=living()[0]??previous;};
 const combat=(enemies,next)=>{const fighters=living().map(member=>{const f={...c.heroConfig(s,member,'surface').hero,id:member.id,name:member.name,hp:member.hp,maxHp:c.effectiveMaxHp(member),poisonDoses:member.poisonDoses??0,favoriteShots:a.favoriteShots?.[member.id]??0};for(const key of keys)f[key]=member[key]??0;return f;});delete a.treatmentUsed;a.combat=preparePartyCombat(fighters,enemies,rolls);a.combat.events[0].text=enemies.some(e=>e.kolomQueen)?'Из горящей паутины выходит матка Коломенской. Отряд готовится к решающему бою.':enemies.some(e=>e.kolomSlime)?'Из пролома выползает Стоковый червь и преграждает путь.':'Скорпионы-пауки выползают из паутины и нападают на отряд.';a.combatNext=next;a.combatXp=enemies.reduce((n,e)=>n+(e.experience??0),0);go('combat');};
 const spiders=(min,max,next)=>{const count=rolls.int(min,max);note('Из паутины выходят скорпионы-пауки: '+count+'.');const checks=living().map(member=>{const cfg=c.heroConfig(s,member,'surface').hero,result=perceptionCheck(cfg,rolls,cfg.perception+(cfg.detectionBonus??0)+(cfg.perceptionCheckBonus??0),12);note(member.name+': обнаружение засады '+result.roll+' + '+result.bonus+' против 12 — '+(result.success?'успех':'провал')+'.');if(result.success)a.xp+=10;return result.success;}),detected=checks.some(Boolean);combat(Array.from({length:count},()=>copy(KOLOM_ENEMIES.spider)),next);if(!detected){for(const foe of a.combat.enemies){foe.targetPolicy='chaotic';foe.targetHeroId=a.combat.heroes[rolls.int(0,a.combat.heroes.length-1)].id;}const enemy=a.combat.enemies[0];a.combat.order.sort((x,y)=>Number(y.id===enemy.id)-Number(x.id===enemy.id));note('Пауки атакуют из засады.');}};
 if(action.choice==='manualPrefs'){
  need(a.node==='combat'&&a.combat?.manual,'Ручной бой недоступен.');
  const fighter=a.combat.heroes.find(h=>h.id===a.combat.waitingHeroId);
  need(fighter,'Нет хода героя.');
  const allowed=['slot','mode','aim','targetId','kind','item','patient','armed','modesBySlot'];
  fighter.manualPrefs={...fighter.manualPrefs,...Object.fromEntries(Object.entries(action.prefs??{}).filter(([key])=>allowed.includes(key)))};
  return s;
 }
 const choice=action.choice;if(choice==='report'){need(a.node==='recovery'&&a.combat,'Нет отчёта боя.');a.combat.reportSeen=true;a.sceneLogStart=a.events.length;return s;}if(choice==='pick'){need(party.some(member=>member.id===action.targetHeroId),'Нет героя.');a.selectedHealHeroId=action.targetHeroId;return s;}
 if(a.node==='casualty'){if(choice==='escape'){finish(false);return s;}need(choice==='fight','Выбери отступление или продолжение.');a.acceptedLosses=party.filter(h=>h.hp<=0).map(h=>h.id);a.sceneLogStart=actionLogStart;a.node=a.resumeNode;if(a.combat?.status==='casualty')decidePartyCasualty(a.combat,'fight');return s;}
 if(choice==='retreat'){need(!a.combat?.manual||a.node!=='combat','Отступление выбирается в бою каждым героем.');finish(false);return s;}
 if(a.node==='combat'){
  if(a.combat.manual){
   for(const enemy of a.combat.enemies)enemy.maxHp??=enemy.kolomQueen?KOLOM_ENEMIES.queen.hp:KOLOM_ENEMIES.spider.hp;
   need(choice==='manual','Используй команды ручного боя.');
   if(a.combat.waitingHeroId){validateManualAction(a.combat,action.command);a.combat.manualAction=copy(action.command);a.combat.manualRevision=(a.combat.manualRevision??0)+1;}
   a.combat.manualStarted=true;
   a.combat.frames=[];
   advancePartyCombat(a.combat,rolls,{maxActors:100});
  }else{
   need(['turn','auto'].includes(choice),'Сначала заверши бой.');advancePartyCombat(a.combat,rolls,{maxActors:choice==='auto'?10000:1});
  }
  for(const f of a.combat.heroes){const member=party.find(h=>h.id===f.id);(a.favoriteShots??={})[f.id]=f.favoriteShots??0;member.hp=f.hp;member.poisonDoses=f.poisonDoses??member.poisonDoses;member.maxHp=c.heroMaximumHp(member);member.hp=Math.min(member.hp,c.effectiveMaxHp(member));for(const key of keys)member[key]=f[key]??member[key];member.radiation=Math.max(0,(member.radiation??0)-(f.doctorRadiationRemoved??0));f.doctorRadiationRemoved=0;}
  if(a.combat.status==='escaped'){a.xp+=a.combat.enemies.filter(e=>e.hp<=0).reduce((sum,e)=>sum+(e.experience??0),0);a.afterRecovery='escape';go('recovery');return s;}
  if(casualty())return s;
  if(a.combat.status==='victory'){note('Бой окончен: '+a.combat.enemies.map(e=>e.name).join(', ')+'. Противники повержены. Опыт за бой: '+a.combatXp+' на отряд.');for(const member of party)if(member.hp<=0){member.hp=1;member.unconscious=(member.poisonDoses??0)>0&&c.heroAttributes(member).strength<=0;}a.acceptedLosses=[];a.xp+=a.combatXp;a.afterRecovery=a.combatNext;go('recovery');}
  else if(a.combat.status==='limit')note('Бой затянулся. Можно отступить.');
  return s;
 }
 if(a.node==='recovery'){
  if(choice==='continue'){if(a.afterRecovery==='escape'){finish(false);return s;}need(living().length,'Нужен действующий герой.');go(a.afterRecovery);delete a.combat;return s;}
  if(choice==='treatment'||choice==='antidote'){
   const medic=living().find(member=>['medic','doctor'].includes(member.profession));need(medic&&!a.treatmentUsed,'Специалист уже помог после этого боя.');need(choice==='antidote'||c.heroAttributes(h).strength>0,'Недостаточно Силы.');
   if(choice==='antidote'){need(h.poisonDoses>0,'Отравления нет.');const total=rolls.int(1,20)+c.heroConfig(s,medic,'surface').hero.perception,removed=Math.min(h.poisonDoses,total>=22?3:total>=15?2:1);h.poisonDoses-=removed;note('Снято доз яда: '+removed);}
   else {const before=h.hp;h.hp=Math.min(c.effectiveMaxHp(h),h.hp+(medic.level*rolls.int(1,10))+10*c.heroConfig(s,medic,'surface').hero.perception);note(medic.name+' лечит '+h.name+': +'+Math.round((h.hp-before)*10)/10+' HP, −1 Силы цели до отдыха.');}
   h.temporaryAttributeLoss={...h.temporaryAttributeLoss,strength:(h.temporaryAttributeLoss?.strength??0)+1};a.treatmentUsed=true;
  }else if(choice.startsWith('heal:')){const item=choice.slice(5),key={doctorKit:'doctorKits',medicKit:'medicKits',dressingKit:'dressingKits',bandage:'bandages'}[item];const source=party.find(member=>member[key]>0);need(key&&source,'Нет лекарства.');need(h.hp<c.effectiveMaxHp(h)||item==='doctorKit'&&(h.poisonDoses>0||h.radiation>0),'Лечение не требуется.');
   if(item==='doctorKit')doctorKitCure(h);source[key]--;const before=h.hp;h.hp=c.bandageHeal(config(),rolls,h.hp,item).hp;note(h.name+': '+ITEMS[item].name+' — восстановлено '+Math.round((h.hp-before)*10)/10+' HP.');
  }else throw Error('Выбери лечение или продолжение.');
  h.maxHp=c.heroMaximumHp(h);h.hp=Math.min(h.hp,c.effectiveMaxHp(h));if(c.heroAttributes(h).strength>0)h.unconscious=false;else if(h.poisonDoses>0){if(party.length===1){h.hp=0;finish(false);}else h.unconscious=true;}return s;
 }
 switch(a.node){
 case 'fork':if(choice==='sense'){need(!a.senseUsed,'Чутьё уже проверено.');a.senseUsed=true;if(check('perception',15)){a.revealed=true;note('Сухой путь: '+(a.drySide==='left'?'левый':'правый')+'. Мокрый тоннель радиоактивен.');}}
  else{need(['left','right'].includes(choice),'Выбери тоннель.');a.branch=choice===a.drySide?'dry':'wet';if(a.branch==='wet')a.locationRadiation=4;go(a.branch==='dry'?'dry1':'wet');}break;
 case 'dry1':need(choice==='forward','Выбери продолжить.');{const roll=rolls.int(1,100);note('Встреча в сухом тоннеле: d100 = '+roll+'; бой при 1–70.');if(roll<=70)spiders(2,3,'corpse');else {note('Отряд проходит дальше без боя.');go('corpse');}}break;
 case 'corpse':if(choice==='search'){search('guardCocoon',7);if(!check('perception',12))spiders(2,2,'anomaly');else go('anomaly');}else{need(choice==='skip','Неверный выбор.');go('anomaly');}break;
 case 'anomaly':need(choice==='avoid','Неверный выбор.');for(const member of living()){if(['medium','heavy'].includes(ITEMS[member.body]?.armorClass)&&!checkOne(member,'intelligence',18)){const half=checkOne(member,'agility',13),raw=Array.from({length:6},()=>rolls.int(1,6)).reduce((a,b)=>a+b,0),damage=damageAfterArmor(raw*(half?.5:1),c.heroConfig(s,member,'surface').hero.thermalArmor);member.hp=Math.max(0,member.hp-damage);note(member.name+': аномалия '+damage+' термического урона.');}else note(member.name+': удалось уйти от разряда.');}go('dry2');break;
 case 'dry2':need(choice==='forward','Неверный выбор.');{const roll=rolls.int(1,100);note('Последние коконы: d100 = '+roll+'; бой при 1–80.');if(roll<=80)spiders(2,4,'station');else{note('Коконы пусты.');search('emptyCocoons',7);go('station');}}break;
 case 'wet':if(choice==='back')go('fork');else{need(choice==='forward','Неверный выбор.');a.locationRadiation=4;go('worm');}break;
 case 'worm':need(choice==='fight','Неверный выбор.');combat([copy(KOLOM_ENEMIES.worm)],'lair');break;
 case 'lair':need(['search','skip'].includes(choice),'Неверный выбор.');if(choice==='search'){search('wormLair',7);}go('clear');break;
 case 'clear':need(choice==='forward','Неверный выбор.');go('station');break;
 case 'station':need(choice==='enter','Неверный выбор.');go('pressure');break;
 case 'pressure':{
  pressure();if(casualty())return s;h=living()[0];
  if(choice==='think'){if(check('intelligence',14)){a.ideas=Math.min(2,(a.ideas??0)+1);note(a.ideas===1?'Гранаты могут отогнать пауков. Попробуйте огонь.':'Можно применить заряженное тяжёлое оружие.');}else note('Решение пока не найдено. Можно попробовать ещё раз или отступить.');}
  else if(choice==='molotov'){need(a.ideas>=1&&living().some(member=>member.molotovs>0),'Нет доступного Молотова.');living().find(member=>member.molotovs>0).molotovs--;a.fireDemonstration='molotov';go('fire');}
  else if(choice==='grenade'){need(a.ideas>=1,'Сначала найди решение.');h=living().find(member=>['dynamites','lu216Grenades','tinGrenades','grenades'].some(k=>member[k]>0))??h;const key=['radioactiveGrenades','dynamites','lu216Grenades','tinGrenades','grenades'].find(k=>h[k]>0);need(key,'Нет гранаты.');h[key]--;note('Взрыв разбрасывает пауков, но новые занимают их место.');}
  else if(choice==='heavy'){h=living().find(member=>ITEMS[member.rangedWeapon]?.usesHeavyAmmo&&member.heavyAmmo>0)??h;const w=ITEMS[h.rangedWeapon];need(a.ideas>=2&&w?.usesHeavyAmmo&&h.heavyAmmo>0,'Нет заряженного тяжёлого оружия.');const qty=Math.min(h.heavyAmmo,w.flame?1:w.shots??1);h.heavyAmmo-=qty;if(w.flame){a.fireDemonstration='flame';go('fire');}else note('Очередь расчищает пространство, но пауки возвращаются.');}
  else throw Error('Неверный выбор.');break;}
 case 'fire':{
  need(choice==='burn','Неверный выбор.');const flameCost=a.fireDemonstration==='flame'?9:10,molotovCost=a.fireDemonstration==='molotov'?9:10,flamers=living().filter(member=>ITEMS[member.rangedWeapon]?.flame&&member.heavyAmmo>0),flame=flamers.reduce((n,member)=>n+member.heavyAmmo,0)>=flameCost;
  need(flame||living().reduce((n,member)=>n+(member.molotovs??0),0)>=molotovCost,'Нужно 10 оставшихся Молотовых либо огнемёт с 10 зарядами.');let remaining=flame?flameCost:molotovCost;for(const member of flame?flamers:living()){const key=flame?'heavyAmmo':'molotovs',spent=Math.min(remaining,member[key]??0);member[key]-=spent;remaining-=spent;}go('blaze');break;}
 case 'blaze':need(choice==='forward','Неверный выбор.');go('boss');break;
 case 'boss':need(choice==='fight','Неверный выбор.');combat([copy(KOLOM_ENEMIES.queen),copy(KOLOM_ENEMIES.spider),copy(KOLOM_ENEMIES.spider)],'cleanup');a.combat.manual=true;a.combat.frames=[];return runKolom(s,{type:'kolomChoice',node:'combat',choice:'manual'},now,random,c);
 case 'cleanup':need(choice==='search','Неверный выбор.');search('queenCache',8,true);loot('kolomenskayaBeetles');go('final');break;
 case 'final':need(choice==='finish','Неверный выбор.');finish(true);return s;
 default:throw Error('Неизвестная сцена.');
 }
 casualty();return s;
}
