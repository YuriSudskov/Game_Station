import {AIR,ATTACK,SHELTER_DCS,searchShelter,chooseShelter,saveShelter,sleepCost,startRest,restHour,barricade} from './hike-shelter.js';
import {grenadeStock} from './hike-rest-tasks.js';
let nightTimer;
export function queueRest(state,save,render){
 clearTimeout(nightTimer);
 if(!state.rest||state.rest.done||state.rest.shortage||state.pending?.length||state.ended)return;
 nightTimer=setTimeout(()=>{restHour(state);save();render();},1000);
}
export function shelterPanel({state:s,panel,save,render}){
 panel.classList.add('shelter-dialog');
 const text=t=>{const p=document.createElement('p');p.textContent=t;panel.append(p);};
 const button=(t,fn)=>{const b=document.createElement('button');b.textContent=t;b.onclick=()=>{fn();save();render();};panel.append(b);};
 const summary=f=>`Нападение ${Math.round(ATTACK[f.defenseTier]*100)}%/час · фильтры ${Math.round(AIR[f.airTier]*100)}%`;
 text('Укрытие и ночлег');
 if(s.barricaded){text('Отряд забаррикадировался. Герои недоступны до прибытия спасателей с фильтрами.');return;}
 if(s.rest){const rest=s.rest;text(summary(rest.shelter));
  const checks=document.createElement('section');checks.className='shelter-checks';
  for(const c of rest.checks??[]){const p=document.createElement('p');p.textContent=`${c.name} · ${{air:'фильтрация',defense:'оборона',repair:'ремонт фильтров',rest:'восстановление',heal:'лечение',search:'обыск',traps:'ловушки'}[c.task]}: ${c.roll} + ${c.bonus} = ${c.total} / ${c.dc??'ловушки'} · ${c.success?'успех, +5 опыта':'без успеха'}. ${c.result??''}`;checks.append(p);}if(checks.childNodes.length)panel.append(checks);
  const progress=document.createElement('progress');progress.className='night-progress';progress.max=rest.end-(rest.startedAt??rest.end-780);progress.value=s.elapsedMinutes-(rest.startedAt??rest.end-780);progress.setAttribute('aria-label','Прогресс ночного отдыха');panel.append(progress);
  const minute=(420+s.elapsedMinutes)%1440;text(`${String(Math.floor(minute/60)).padStart(2,'0')}:${String(minute%60).padStart(2,'0')} → 07:00 · фильтры −${rest.charged}`);
  if(rest.done){text('Сон окончен. Наступило утро.');for(const h of s.heroes){const xp=(rest.checks??[]).filter(c=>c.heroId===h.id).reduce((n,c)=>n+c.xp,0);text(`${h.name}: опыт за успешные броски +${xp}`);}
   text('Найденные вещи: '+((s.rewards??[]).slice(rest.rewardStart??s.rewards?.length??0).map(r=>r.name??r.item).join(', ')||'нет'));
   text('Найдено денег: '+((rest.foundMoney??0)/10)+' А. Добыча с трупов — Скоро.');
   button('Закончить отдых',()=>{s.rest=null;s.selectedShelter=null;s.shelterSearch=[];});}
  else {if(rest.shortage)text('Не хватает фильтров для продолжения отдыха.');else text('Герои отдыхают · 1 секунда = 1 час');button('Забаррикадироваться и ждать помощи',()=>barricade(s));}
  return;
 }
 const saved=s.shelters?.[`${s.q},${s.r}`];if(saved){if(saved.unique)text(saved.name+' · '+saved.description);button('Использовать '+(saved.name??'сохранённое укрытие')+' · '+summary(saved),()=>{s.selectedShelter=structuredClone(saved);s.shelterAssignments={};});}
 if(!s.selectedShelter){
  for(const [i,f] of (s.shelterSearch??[]).entries()){
   text(`${f.name}: оборона ${f.defense.roll} + ${f.defense.bonus} = ${f.defense.total}; воздух ${f.air.roll} + ${f.air.bonus} = ${f.air.total}.`);
   if(f.defenseTier>=0&&f.airTier>=0)button(summary(f),()=>chooseShelter(s,i));else text('Укрытие не найдено: оба результата должны быть 12+.');
  }
  button('Искать укрытие · 20 минут',()=>searchShelter(s));return;
 }
 const f=s.selectedShelter; text(summary(f));const cost=sleepCost(s);text(`До 07:00 потребуется ${cost} фильтров. В наличии: ${s.filters}. Округление вниз.`);
 if(!saved?.unique&&f.defense.total>=16&&f.air.total>=16)button(saved?'Сохранить и заменить укрытие':'Сохранить укрытие на карте',()=>saveShelter(s));
 for(const h of s.heroes.filter(h=>h.hp>0&&!h.dead&&!h.unconscious)){
  const label=document.createElement('label');label.textContent=h.name+' · подготовка за первый час';const select=document.createElement('select');
  const options=[['none','Без занятия'],['air',f.airTier<4?`Улучшить фильтрацию · сила ${SHELTER_DCS[f.airTier+1]}`:'Воздух уже лучший'],['defense',f.defenseTier<4?`Укрепить оборону · сила ${SHELTER_DCS[f.defenseTier+1]}`:'Оборона уже лучшая'],['repair','Чинить фильтры · ИНТ 12+'],['rest','Отдыхать и восстанавливаться · сила 12'],['heal','Лечить других · восприятие 12+'],['search','Обыскать · ИНТ 15+'],['traps','Расставить ловушки · 2 гранаты']];
  for(const [id,name] of options){const o=document.createElement('option');o.value=id;o.textContent=name;o.disabled=id==='traps'&&grenadeStock(s).reduce((n,r)=>n+r.qty,0)<2||id==='air'&&f.airTier===4||id==='defense'&&f.defenseTier===4;select.append(o);}
  select.value=s.shelterAssignments?.[h.id]??'none';select.onchange=()=>{(s.shelterAssignments??={})[h.id]=select.value;save();};label.append(select);panel.append(label);
 }
 if(s.filters>=cost)button('Начать отдых',()=>{if(startRest(s)){s.rest.startedAt=s.elapsedMinutes;s.rest.rewardStart=s.rewards?.length??0;restHour(s);}});else {text('При таком месте отдыха фильтров на ночлег не хватит. Продолжите путь или ищите другое укрытие.');const b=document.createElement('button');b.textContent='Начать отдых';b.disabled=true;panel.append(b);}
 button('Продолжить поиск · 20 минут',()=>{s.selectedShelter=null;searchShelter(s);});
 button('Забаррикадироваться и ждать помощи',()=>barricade(s));
}
