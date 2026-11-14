import {heroPortraitSvg} from './portraits.js';

const root = document.querySelector('#battle');
const announcement = document.querySelector('#announcement');
const weapons = {
 main: {name:'Автомат Калашникова', modes:[['single','Одиночный',1],['burst','Очередь',3]], damage:31, range:4},
 side: {name:'Двустволка', modes:[['single','Одиночный',1],['double','Дуплет',2]], damage:40, range:2}
};
const zones = [
 ['body','Корпус',1,0], ['head','Голова',1.6,-25],
 ['arm','Рука',.8,-15], ['leg','Нога',.85,-12]
];
const actions = [['attack','Атака'],['grenade','Граната'],['heal','Лечение'],['retreat','Отступить']];
const alive = unit => unit.hp > 0;
const roll = chance => Math.random() * 100 < chance;
const guard = (i, hp = 60) => ({id:'g'+i, name:i === 5 ? 'Матёрый Страж' : 'Страж '+i, hp, max:hp});
const select = (id, label, options, current) => `<label>${label}<select id="${id}">${options.map(([value,name])=>`<option value="${value}" ${value===current?'selected':''}>${name}</option>`).join('')}</select></label>`;

let heroes, enemies, round, actorIndex, phase, choice, log, impact, totals, distances;
function start(){
 heroes = [
  {id:'h1',name:'Чай',hp:130,max:130,headwear:'ushanka',ammo:{main:18,side:6},grenades:2,meds:2},
  {id:'h2',name:'Напарник',hp:120,max:120,headwear:'beanie',ammo:{main:18,side:6},grenades:2,meds:2}
 ];
 enemies = [1,2,3,4].map(i=>guard(i));
 distances = heroes.map((_, i)=>[2+i,2+i,3,4,4]);
 round = 1;
 actorIndex = 0;
 phase = 'hero';
 log = ['Четыре Стража атакуют ремонтную бригаду.'];
 totals = {damage:0,healing:0,shots:0,grenades:0,meds:0};
 impact = {};
 resetChoice();
 render();
}
function resetChoice(){
 choice = {action:'attack', slot:'main', mode:'single', zone:'body',
  target:enemies.find(alive)?.id, patient:heroes[actorIndex].id};
}
function add(text){
 log.push(text);
 announcement.textContent = text;
}
function range(hero, enemy){
 return distances[heroes.indexOf(hero)][enemies.indexOf(enemy)];
}
function changeRange(hero, enemy, step){
 distances[heroes.indexOf(hero)][enemies.indexOf(enemy)] = Math.max(0,Math.min(4,range(hero,enemy)+step));
}
function damage(unit, amount){
 const actual = Math.min(unit.hp,amount);
 unit.hp -= actual;
 const previous = impact[unit.id]?.amount ?? 0;
 impact[unit.id] = {amount:previous-actual, fallen:!alive(unit)};
 return actual;
}
function unitCard(unit, enemy){
 const hp = `${unit.hp} / ${unit.max} HP`;
 const effect = impact[unit.id];
 const selected = enemy && phase==='hero' && ['attack','grenade'].includes(choice.action) && unit.id===choice.target;
 const active = phase==='hero' && unit===heroes[actorIndex];
 const ranged = enemy && alive(unit) && ['hero','enemy'].includes(phase);
 const distance = ranged ? distanceText(range(heroes[actorIndex],unit)) : null;
 const content = `<span class="portrait" aria-hidden="true">${enemy?(unit.id==='g5'?'М':'С'):heroPortraitSvg(unit)}</span><span><strong>${unit.name}</strong><small>${alive(unit)?hp:'Повержен'}</small><progress value="${unit.hp}" max="${unit.max}" aria-label="Здоровье, ${unit.name}"></progress></span>${ranged?`<span class="range-badge" aria-label="Дистанция: ${distance}">${distance}</span>`: ''}${effect?`<span aria-hidden="true" class="float ${effect.amount>0?'heal':''}">${effect.amount>0?'+':''}${effect.amount}</span>`:''}`;
 const classes = `unit ${ranged?'has-range':''} ${selected||active?'active':''} ${alive(unit)?'':'fallen'} ${effect?.fallen?'fall-animation':effect?.amount<0?'hit':''}`;
 if(enemy && alive(unit) && phase==='hero' && ['attack','grenade'].includes(choice.action)){
  return `<button type="button" class="${classes}" data-target="${unit.id}" aria-pressed="${selected}">${content}</button>`;
 }
 return `<div class="${classes}">${content}</div>`;
}
const distanceText = value => value===4?'4+':String(value);
function attackIssue(hero, target){
 const weapon = weapons[choice.slot], mode = weapon.modes.find(([id])=>id===choice.mode);
 if(!target) return 'Выбери цель.';
 if(range(hero,target)>weapon.range) return 'Цель вне дальности оружия.';
 if(hero.ammo[choice.slot]<mode[2]) return 'Недостаточно выстрелов для этого режима.';
 return '';
}
function issue(){
 const hero = heroes[actorIndex], target = enemies.find(unit=>unit.id===choice.target && alive(unit));
 const patient = heroes.find(unit=>unit.id===choice.patient && alive(unit));
 if(choice.action==='attack') return attackIssue(hero,target);
 if(choice.action==='grenade') return !hero.grenades?'Гранаты закончились.':!target||range(hero,target)>3?'Граната доступна на дистанции 0–3.':'';
 if(choice.action==='heal') return !hero.meds?'Аптечки закончились.':!patient||patient.hp===patient.max?'Выбери раненого героя.':'';
 return '';
}
function render(focus){
 const hero = heroes[actorIndex];
 let panel;
 if(phase==='hero'){
  const weapon = weapons[choice.slot];
  const problem = issue();
  const fields = [];
  if(choice.action==='attack'){
   fields.push(select('slot','Оружие',Object.entries(weapons).map(([id,item])=>[id,`${id==='main'?'Основное':'Дополнительное'} · ${item.name} (${hero.ammo[id]})`]),choice.slot),
    select('mode','Режим',weapon.modes.map(([id,name,cost])=>[id,`${name} · ${cost}`]),choice.mode),
    select('zone','Куда целиться',zones.map(([id,name])=>[id,name]),choice.zone));
  }
  if(choice.action==='heal') fields.push(select('patient','Кого лечить',heroes.filter(alive).map(unit=>[unit.id,`${unit.name} · ${unit.hp}/${unit.max} HP`]),choice.patient));
  const targetName = ['attack','grenade'].includes(choice.action) ? enemies.find(unit=>unit.id===choice.target)?.name : '';
  const hint = problem || ({heal:'Аптечка восстанавливает до 44 HP.',grenade:'Граната наносит урон выбранной цели и задевает ближайшего Стража.',retreat:'Отряд покинет бой.'}[choice.action] ?? '');
  panel = `<section class="panel turn-panel"><h2>Ход · ${hero.name}</h2><div class="moves">${actions.map(([id,label])=>`<button data-move="${id}" aria-pressed="${id===choice.action}">${label}${id==='grenade'?' · '+hero.grenades:id==='heal'?' · '+hero.meds:''}</button>`).join('')}</div>${fields.length?`<div class="field ${choice.action==='attack'?'attack-fields':''}">${fields.join('')}</div>`: ''}<div class="turn-submit"><p>${targetName?`Цель · <strong>${targetName}</strong>`: ''}${hint?`<small class="muted">${hint}</small>`: ''}</p><button id="confirm" class="confirm" ${problem?'disabled':''}>${choice.action==='retreat'?'Подтвердить отход':'Подтвердить'}</button></div></section>`;
 } else if(phase==='enemy'){
  panel = '<section class="panel"><h2>Ход Стражей</h2><p>Противники действуют по очереди.</p></section>';
 }else{
  const result = {victory:'Победа',defeat:'Поражение',escaped:'Отряд отступил'}[phase];
  panel = `<section class="panel"><h2 id="result" tabindex="-1">${result}</h2><p>Раундов: ${round} · Повержено Стражей: ${enemies.filter(unit=>!alive(unit)).length} из ${enemies.length}</p><p>${heroes.map(unit=>unit.name+' · '+(alive(unit)?unit.hp+'/'+unit.max+' HP':'повержен')).join(' / ')}</p><p>Нанесено урона: ${totals.damage} · Восстановлено HP: ${totals.healing}</p><p>Потрачено: выстрелов ${totals.shots}, гранат ${totals.grenades}, аптечек ${totals.meds}.</p><button id="restart" class="confirm">Сыграть заново</button></section>`;
 }
 root.innerHTML = `<section class="arena" aria-label="Поле боя"><div class="round"><strong>Раунд ${round}</strong><span>${enemies.filter(alive).length} противников в бою</span></div><div class="teams"><section class="team"><h2>Отряд</h2>${heroes.map(unit=>unitCard(unit,false)).join('')}</section><section class="team foes"><h2>Стражи ${['hero','enemy'].includes(phase)?`<small class="range-caption">Дистанция · ${hero.name}</small>`: ''}</h2>${enemies.map(unit=>unitCard(unit,true)).join('')}</section></div>${round===1&&['hero','enemy'].includes(phase)?'<p class="reinforcement">Подкрепление · Матёрый Страж вступит в раунде 2</p>':''}</section>${panel}<section class="panel"><h2>Журнал боя</h2><ol class="events">${log.slice(-6).reverse().map(text=>`<li>${text}</li>`).join('')}</ol></section>`;
 if(focus) root.querySelector(focus)?.focus({preventScroll:true});
}
function confirmAction(){
 if(phase!=='hero'||issue()) return;
 const hero = heroes[actorIndex];
 const target = enemies.find(unit=>unit.id===choice.target);
 impact = {};
 switch(choice.action){
 case 'attack': {
  const weapon = weapons[choice.slot];
  const [,mode,count] = weapon.modes.find(([id])=>id===choice.mode);
  const [,zone,multiplier,penalty] = zones.find(([id])=>id===choice.zone);
  let hits = 0, dealt = 0;
  hero.ammo[choice.slot] -= count;
  totals.shots += count;
  for(let i=0;i<count && alive(target);i++){
   if(!roll(96-range(hero,target)*7+penalty-(count>1?6:0))) continue;
   hits++;
   dealt += damage(target,Math.round((weapon.damage+Math.floor(Math.random()*9))*multiplier));
  }
  totals.damage += dealt;
  if(hits && choice.zone==='arm') target.disarmed = true;
  if(hits && choice.zone==='leg') target.slowed = true;
  add(`${hero.name} → ${target.name}: ${mode.toLowerCase()}, ${zone.toLowerCase()} · ${hits?dealt+' урона':'промах'}.`);
  break;
 }
 case 'grenade': {
  hero.grenades--;
  totals.grenades++;
  const nearby = enemies.filter(unit=>unit!==target && alive(unit) && Math.abs(range(hero,unit)-range(hero,target))<=1);
  const dealt = damage(target,55);
  const splash = nearby[0] ? damage(nearby[0],25) : 0;
  totals.damage += dealt+splash;
  add(`${hero.name} бросает гранату: ${target.name} −${dealt} HP${splash?', '+nearby[0].name+' −'+splash+' HP':''}.`);
  break;
 }
 case 'heal': {
  const patient = heroes.find(unit=>unit.id===choice.patient);
  const healed = Math.min(44,patient.max-patient.hp);
  hero.meds--;
  totals.meds++;
  totals.healing += healed;
  patient.hp += healed;
  impact[patient.id] = {amount:healed};
  add(`${hero.name} применяет аптечку: ${patient.name} +${healed} HP.`);
  break;
 }
 case 'retreat':
  add(`${hero.name} уводит отряд с поля боя.`);
  finish('escaped');
  return;
 }
 if(!enemies.some(alive)){
  if(round>1){ finish('victory'); return; }
  phase = 'enemy';
  render();
  window.setTimeout(()=>enemyTurn(0),420);
  return;
 }
 const next = heroes.findIndex((unit,i)=>i>actorIndex && alive(unit));
 if(next>=0){
  actorIndex = next;
  resetChoice();
  render('[data-move="attack"]');
 }else{
  phase = 'enemy';
  render();
  window.setTimeout(()=>enemyTurn(0),420);
 }
}
function finish(result){
 phase = result;
 render('#result');
}
function enemyTurn(index){
 const enemyIndex = enemies.findIndex((unit,i)=>i>=index && alive(unit));
 impact = {};
 if(enemyIndex<0){
  round++;
  if(round===2){
   enemies.push(guard(5,155));
   add('Матёрый Страж вступает в бой на дистанции 4+.');
  }
  actorIndex = heroes.findIndex(alive);
  phase = 'hero';
  resetChoice();
  render('[data-move="attack"]');
  return;
 }
 const enemy = enemies[enemyIndex];
 const target = heroes[enemyIndex%heroes.length];
 const hero = alive(target)?target:heroes.find(alive);
 const distance = range(hero,enemy);
 if(distance>0){
  if(enemy.slowed){
   delete enemy.slowed;
   add(`${enemy.name} теряет ход сближения из-за ранения ноги.`);
  }else{
   changeRange(hero,enemy,-1);
   add(`${enemy.name} приближается к герою ${hero.name} · дистанция ${distanceText(range(hero,enemy))}.`);
  }
 }else{
  const dealt = roll(82) ? damage(hero,(enemy.id==='g5'?35:24)-(enemy.disarmed?12:0)) : 0;
  delete enemy.disarmed;
  add(`${enemy.name} → ${hero.name}: ${dealt?dealt+' урона':'промах'}.`);
 }
 if(!heroes.some(alive)){ finish('defeat'); return; }
 render();
 const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
 window.setTimeout(()=>enemyTurn(enemyIndex+1),reduced?100:480);
}
root.addEventListener('click',event=>{
 const button = event.target.closest('button');
 if(!button) return;
 if(button.id==='restart'){ start(); root.querySelector('[data-move="attack"]')?.focus(); return; }
 if(phase!=='hero') return;
 if(button.id==='confirm'){ confirmAction(); return; }
 if(button.dataset.move){
  choice.action = button.dataset.move;
  if(choice.action==='heal') choice.patient = heroes.find(unit=>alive(unit)&&unit.hp<unit.max)?.id ?? heroes[actorIndex].id;
  impact = {};
  render(`[data-move="${choice.action}"]`);
 }
 if(button.dataset.target){
  choice.target = button.dataset.target;
  impact = {};
  render(`[data-target="${choice.target}"]`);
 }
});
root.addEventListener('change',event=>{
 const {id,value} = event.target;
 if(phase!=='hero'||!Object.hasOwn(choice,id)) return;
 choice[id] = value;
 if(id==='slot') choice.mode = 'single';
 impact = {};
 render('#'+id);
});
start();
