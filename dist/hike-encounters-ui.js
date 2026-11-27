import {beginGuard,guardChoice,battleAction,continueBattle,healEncounter,startGuardBattle} from './hike-encounters.js';
import {manualBattleBody,manualFieldPrefs,healingSupplies} from './kolom-jrpg.js';
import {playKolomFrames} from './kolom-jrpg-animation.js';
import {ITEMS} from './data.js';
import {settleBattleTime} from './hike-battle-time.js';
export function renderGuard({state:s,panel,save,render,retreat}){
 const e=s.pending[0];if(e?.type!=='guard')return false;
 beginGuard(s);save();
 const text=t=>{const p=document.createElement('p');p.textContent=t;panel.append(p);};
 const button=(t,fn)=>{const b=document.createElement('button');b.textContent=t;b.onclick=()=>{try{fn();save();render();}catch(err){text(err.message);}};panel.append(b);};
 const finish=()=>{settleBattleTime(s);s.pending.shift();s.encounterLog=[];if(!s.heroes.some(h=>h.hp>0&&!h.dead&&!h.unconscious)){s.failed=s.ended=true;s.deathCell=`${s.q},${s.r}`;}};
 text(e.night?'Оборона укрытия':'Одинокий Страж');
 if(e.phase==='nightAlarm'){
  text('На вас напали! Ночной отдых прерван.');
  button('Начать оборону · JRPG',()=>startGuardBattle(s));
 }else if(e.phase==='choice'){
  button('Прокрасться мимо · скрытность 12',()=>guardChoice(s,'sneak'));
  for(const h of s.heroes.filter(h=>h.hp>0&&!h.dead&&!h.unconscious))button(h.name+' · снять одним выстрелом',()=>guardChoice(s,'shoot',h.id));
  button('Отступить на предыдущую клетку',retreat);
 }else if(e.phase==='combat'||e.phase==='recovery'&&!e.reportSeen){
  const b=e.combat;panel.insertAdjacentHTML('beforeend',manualBattleBody({id:e.night?'hikeNight':'hike',battleTitle:e.night?'Оборона укрытия':'Встреча со Стражами',combat:b,combatXp:b.enemies.reduce((a,e)=>a+(e.experience??0),0)},s.heroes));
  const stage=panel.querySelector('.kj-battle');
  stage.onchange=event=>{const h=b.heroes.find(h=>h.id===b.waitingHeroId),field=event.target.dataset.jrpgField;if(h&&field){h.manualPrefs={...h.manualPrefs,...manualFieldPrefs(h,field,event.target.value)};save();render();}};
  stage.onclick=event=>{const button=event.target.closest('button[data-action]');if(!button)return;try{
   if(button.dataset.action==='kolomChoice'){continueBattle(s);save();render();return;}
   const h=b.heroes.find(h=>h.id===b.waitingHeroId);if(!h)return;const prefs=h.manualPrefs??={},kind=button.dataset.kind??prefs.kind??'attack';
   if(button.dataset.action==='jrpgTarget'){h.manualPrefs={...prefs,targetId:button.dataset.id};save();render();return;}
   if(button.dataset.action==='jrpgSelect'&&!(prefs.armed&&kind===(prefs.kind??'attack'))){h.manualPrefs={...prefs,kind,armed:true};save();render();return;}
   const value=f=>stage.querySelector('[data-jrpg-field="'+f+'"]')?.value,previous=structuredClone(b);
   battleAction(s,{revision:b.manualRevision??0,kind,slot:value('slot'),mode:value('mode'),aim:value('aim'),item:value('item'),targetId:kind==='heal'?value('patient'):(b.enemies.find(t=>t.id===prefs.targetId&&t.hp>0)??b.enemies.find(t=>t.hp>0))?.id});save();render();playKolomFrames(panel,previous,s.pending[0]?.combat);
  }catch(err){text(err.message);}};
  if(e.phase==='recovery')button('К итогам и лечению',()=>{e.reportSeen=true;});
  if(!e.initialPlayed){e.initialPlayed=true;requestAnimationFrame(()=>playKolomFrames(panel,null,b));}
  if(e.night){const details=document.createElement('details'),title=document.createElement('summary');title.textContent='Срабатывание ловушек';details.append(title);for(const row of b.events.filter(row=>['ловушка укрытия','взрыв ловушки'].includes(row.type))){const p=document.createElement('p');p.textContent=row.text;details.append(p);}if(details.childNodes.length>1)panel.append(details);}
 }else{
  text(e.phase==='done'?'Прошли незамеченными.':'Бой завершён. Можно лечиться и продолжить путь.');
  if(e.combat?.status==='victory')button('Обыскать трупы',()=>{e.searched=true;});
  if(e.searched)text('Трофеи этой встречи — Скоро.');
  for(const h of s.heroes.filter(h=>h.hp>0&&!h.dead))for(const [item,field]of Object.entries(healingSupplies))if(h[field]>0)button(`${h.name} · ${ITEMS[item].name} ×${h[field]}`,()=>healEncounter(s,h.id,item));
  button(e.night?'Продолжить ночлег':'Продолжить путь',finish);
 }
 for(const line of s.encounterLog??[])text(line);
 return true;
}
