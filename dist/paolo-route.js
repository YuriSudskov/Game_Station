import {heroConfig,heroAttributes,itemArmor,itemThermalArmor,act,preparePaoloGather,grantPaoloRewards} from './game.js';
import {ITEMS} from './data.js';
import {preparePartyCombat,advancePartyCombat,decidePartyCasualty} from './party-combat.js';
import {validateManualAction} from './kolom-jrpg.js';
import {rng} from './combat.js';
const copy=x=>structuredClone(x),need=(v,t)=>{if(!v)throw Error(t);};
export const paoloCandidates=s=>s.heroes.filter(h=>!h.dead&&h.hp>0&&!h.missingOnMission);
export const defaultPaoloHeroes=s=>paoloCandidates(s).filter(h=>h.mark).sort((a,b)=>b.level-a.level).slice(0,1).map(h=>h.id);
export function runPaolo(state,action,now,random){
 let s=copy(state),trial=s.paoloTrial;
 if(action.type==='startPaoloTrial'){
  need(!s.interactiveMission,'Сначала завершите сюжетную вылазку.');
  s.paoloTrial={phase:'prepare',selected:defaultPaoloHeroes(s),events:[],checks:[]};return s;
 }
 need(trial,'Встреча с Паоло не открыта.');
 if(action.type==='finishPaoloTrial'){
  need(trial.phase==='result','Сначала завершите встречу.');const restored=copy(trial.baseline);restored.paoloEvent={dueAt:now+300000};return restored;
 }
 if(action.type==='gatherPaoloTrial'){
  need(trial.phase==='prepare','Отряд уже собран.');const ids=action.heroIds??[];need(ids.length>=1&&ids.length<=3&&new Set(ids).size===ids.length,'Выберите от одного до трёх разных героев.');
  need(ids.every(id=>paoloCandidates(s).some(h=>h.id===id)),'Один из героев недоступен.');const marked=ids.map(id=>s.heroes.find(h=>h.id===id)).filter(h=>h.mark).sort((a,b)=>b.level-a.level);need(marked.length,'Выберите хотя бы одного героя с меткой.');
  const baseline=copy(s);delete baseline.paoloTrial;s=preparePaoloGather(s,now,random);trial=s.paoloTrial={...trial,phase:'talk',baseline,heroIds:ids,captiveId:marked[0].id};s.interactiveMission={id:'paolo',node:'talk',heroIds:ids,startedAt:now,history:[],battleTitle:'Паоло · Синие'};return s;
 }
 const mission=s.interactiveMission;
 const result=(outcome,summary)=>{trial.phase='result';trial.outcome=outcome;trial.summary=summary;mission.node='result';};
 if(action.type==='paoloCombat'){
  need(trial.phase==='combat','Бой не идёт.');const b=mission.combat;
  if(action.prefs){const h=b.heroes.find(h=>h.id===b.waitingHeroId);need(h,'Нет хода героя.');h.manualPrefs={...h.manualPrefs,...action.prefs};return s;}
  if(b.status==='casualty')decidePartyCasualty(b,'fight');
  if(b.waitingHeroId){validateManualAction(b,action.command);b.manualAction=copy(action.command);b.manualRevision=(b.manualRevision??0)+1;}
  b.manualStarted=true;b.frames=[];advancePartyCombat(b,rng(Math.floor(random()*4294967296)),{maxActors:100});
  if(b.status==='victory'){
   if(!trial.victoryRewardClaimed){const items=b.enemies.flatMap(e=>[{item:e.firearm.item,qty:1,quality:e.id==='paolo'?1:0,origin:'loot'},{item:e.armorItem,qty:1,quality:e.quality??0,origin:'loot'},...(e.grenades>0?[{item:'pipeGrenade',qty:e.grenades}]:[]),...(e.stimulantItem?[{item:e.stimulantItem,qty:1,charges:9}]:[])]);items.push({item:'paoloPassport',qty:1});const money=(100+Math.min(300,Math.floor(random()*301)))*10;grantPaoloRewards(s,trial,440,items,money);trial.victoryRewardClaimed=true;}
   trial.phase='victory';mission.node='victory';trial.step=0;trial.victoryReady=false;trial.events.push('Паоло обезоружен. Он отказывается отвечать.');}
  if(['defeat','escaped','poisonRetreat','limit'].includes(b.status))result('defeat',['Паоло забирает отмеченного героя: '+s.heroes.find(h=>h.id===trial.captiveId).name+'. Его снаряжение недоступно.','Остальные участники доступны для обычного восстановления.','Квест Смотрителя: «Спасти пленного героя».']);
  return s;
 }
 need(action.type==='paoloChoice','Недоступное действие.');const choice=action.choice;
 if(trial.phase==='talk'){
  if(choice==='agree'){trial.phase='confirm';return s;}
  need(choice==='refuse','Выберите ответ.');trial.phase='shooting';return s;
 }
 if(trial.phase==='victory'){need(choice==='interrogate'&&trial.victoryReady,'Дождитесь завершения анимации боя.');trial.phase='interrogate';mission.node='interrogate';return s;}
 if(trial.phase==='confirm'){
  if(choice==='back'){trial.phase='talk';return s;}
  need(choice==='submit','Подтвердите решение.');result('submit',['Паоло забирает '+s.heroes.find(h=>h.id===trial.captiveId).name+' вместе со снаряжением.','Договор с Синими: станция переходит под их контроль.','Квест Смотрителя: «Пойдём узнаем, что у Синих». Продолжение — скоро.']);return s;
 }
 if(trial.phase==='shooting'){
  need(choice==='fight','Начните бой.');
  const enemies=[{id:'paolo',name:'Паоло',hp:650,armorItem:'blueSpecialArmor',quality:1,accuracy:35,evasion:30,initiative:5,regeneration:35},...Array.from({length:3},(_,i)=>({id:'blue-'+i,name:'Спецназовец '+(i+1),hp:i?360:400,armorItem:['militaryVest','blueSpecialArmor','beetleArmor'][i],quality:0,accuracy:i===2?25:30,evasion:i===1?30:25,initiative:4,stimulantItem:i===1?'combatStimulator':i===2?'strongPainkiller':null,bonusArmor:i===2?15:0,bonusThermal:i===2?7:0,grenades:i===1?0:1}))].map(e=>({...e,kind:'bandit',maxHp:e.hp,armor:itemArmor({item:e.armorItem,quality:e.quality})+(e.bonusArmor??0),thermalArmor:itemThermalArmor({item:e.armorItem,quality:e.quality})+(e.bonusThermal??0),accuracy:e.accuracy-(ITEMS[e.armorItem].accuracyPenalty??0),firearm:{...ITEMS.improvedM16,item:'improvedM16',type:'ranged',min:ITEMS.improvedM16.min+10*(e.id==='paolo'?1:0),max:ITEMS.improvedM16.max+10*(e.id==='paolo'?1:0),maxDistance:5,distancePenalty:15},priorityHeroIds:[trial.captiveId],regenerateEveryTurn:e.id==='paolo'?35:0}));
  const heroes=trial.heroIds.map(id=>{const h=s.heroes.find(h=>h.id===id);return {...heroConfig(s,h,'surface').hero,id:h.id,name:h.name,hp:h.hp};});
  mission.combatXp=440;mission.combat=preparePartyCombat(heroes,enemies,rng(Math.floor(random()*4294967296)),{ambush:false,crowd:false});const b=mission.combat;b.manual=true;b.manualStarted=true;b.frames=[];for(const h of b.heroes)h.distances=Object.fromEntries(b.enemies.map(e=>[e.id,1]));b.initialized=true;b.status='running';trial.phase='combat';advancePartyCombat(b,rng(Math.floor(random()*4294967296)),{maxActors:100});if(['defeat','escaped','limit'].includes(b.status))return runPaolo(s,{type:'paoloCombat'},now,random);return s;
 }
 need(trial.phase==='interrogate','Дождитесь завершения этапа.');
 if(choice==='jail'){result('prison',['Паоло помещён в камеру на Автозаводской.','NPC за решёткой: квест «Переговоры с Синими».']);return s;}
 if(choice==='continuePressure'){result('passport',['Имплант убивает Паоло, прерывая допрос.','Окровавленный паспорт Синих становится источником квеста «Переговоры с Синими».']);return s;}
 const h=s.heroes.find(h=>h.id===action.heroId&&trial.heroIds.includes(h.id)&&mission.combat.heroes.some(f=>f.id===h.id&&f.hp>0));need(h,'Выберите живого участника допроса.');
 const step=trial.step??0;const unlocked=step>=2||(trial.implantAlarm??0)>=3;need(choice==='question'&&!unlocked||unlocked&&['deal','pressure'].includes(choice),'Сначала завершите расспросы.');
 const dc=choice==='deal'?18:choice==='pressure'?22:[12,15,18][Math.min(2,trial.implantAlarm??0)];need(Number.isFinite(dc),'Допрос завершён: выберите сделку или давление.');const roll=1+Math.floor(random()*20),bonus=heroAttributes(h).perception,success=roll+bonus>dc;
 trial.checks.push({heroId:h.id,name:h.name,roll,bonus,dc,success,choice});trial.events.push(h.name+': Восприятие '+roll+' + '+bonus+' против '+dc+' — '+(success?'успех':'провал')+'.');
 if(choice==='question'){trial.questions=(trial.questions??0)+1;if(!success){trial.implantAlarm=(trial.implantAlarm??0)+1;trial.events.push('Паоло замыкается. Тревога импланта: '+trial.implantAlarm+'/3. Осталось попыток: '+Math.max(0,3-trial.implantAlarm)+'.');}if(success)trial.step=step+1;trial.events.push(['«Мне приказали вас доставить. Больше ничего».','«Я не хочу об этом говорить».','«Вы не понимаете, с кем связываетесь».','Паоло колеблется. Теперь можно предложить сделку или надавить.'][trial.step??0]);}
 if(choice==='deal'){if(success){if(!trial.dealRewardClaimed){grantPaoloRewards(s,trial,100);trial.dealRewardClaimed=true;}result('deal',['Паоло дал контакт Синих и остаётся пленником.','Квест «Переговоры с Синими».']);}else result('prison',['Паоло отверг сделку. Допрос завершён, он остаётся под стражей.','Квест «Переговоры с Синими».']);}
 if(choice==='pressure'){if(success){trial.implantWarning=true;trial.events.push('Вы замечаете активацию импланта. Продолжение давления убьёт Паоло.');}else result('passport',['Имплант прерывает допрос: Паоло погиб.','Окровавленный паспорт Синих: квест «Переговоры с Синими».']);}
 return s;
}
