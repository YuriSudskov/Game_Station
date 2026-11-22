import {KOLOM_ENEMIES} from './kolomenskaya.js';
import {heroConfig,heroMaximumHp} from './game.js';
import {bandageHeal,damageAfterArmor,evasionAtDistance,hits,rng} from './combat.js';
import {ITEMS,MATURE_GUARD,TECHNOPARK} from './data.js';
import {partyBattleExperience} from './party-combat.js';

const root = document.querySelector('#battle');
const announcement = document.querySelector('#announcement');
const zones = [
 ['body','Корпус',1,0], ['head','Голова',2,-30],
 ['arm','Рука',1,-20], ['leg','Нога',1,-20]
];
const actions = [['attack','Атака'],['grenade','Граната'],['heal','Лечение'],['retreat','Отступить']];
const alive = unit => unit.hp > 0;
const roll = chance => Math.random() * 100 < chance;
const int = (min,max) => min+Math.floor(Math.random()*(max-min+1));
function testHero(id,name,weapon,rangedWeapon,quality,rangedQuality){
 const hero={id,name,profession:'assault',level:7,perk:'none',body:'metalMediumArmor',weapon,rangedWeapon,weaponDetails:{quality},rangedWeaponDetails:{quality:rangedQuality}};
 hero.hp=hero.maxHp=heroMaximumHp(hero);
 const stats=heroConfig({},hero,'surface').hero;
 return {...stats,...hero,max:hero.maxHp,ammo:{main:100,side:100},grenades:{tinGrenade:1},meds:{medicKit:1,bandage:1}};
}
function enemy(id,stats,distance){
 return {...stats,id,max:stats.hp,distance};
}
const select = (id, label, options, current) => `<label>${label}<select id="${id}">${options.map(([value,name])=>`<option value="${value}" ${value===current?'selected':''}>${name}</option>`).join('')}</select></label>`;

const medicineIds=['medicKit','dressingKit','bandage'];
const grenadeDamage={pipeGrenade:[55,25],tinGrenade:[35,15]};
const stocked=(stock,ids=Object.keys(stock))=>ids.filter(id=>stock[id]>0);
const supplyOptions=(stock,ids)=>stocked(stock,ids).map(id=>[id,ITEMS[id].name+' ×'+stock[id]]);
const weaponFor=(hero,slot)=>{
 const weapon=hero.weapons[slot==='main'?'main':'ranged'];
 return {...weapon,range:weapon.maxDistance??4,burstPenalty:weapon.shotPenalty??0,
 modes:weapon.flame?[['single','Струя огня',1]]:weapon.shots?[['single','Одиночный',1],['burst','Очередь',weapon.shots]]:weapon.damageRolls?[['single','Одиночный',1],['double','Дуплет',weapon.damageRolls]]:[['single','Одиночный',1]]};
};
let enemyCursor, shooting;
let heroes, enemies, round, actorIndex, phase, choice, log, impact, totals;
function start(){
 heroes = [
  testHero('h3','Штурмовик · АК47','ak47','rox',2,0),
  testHero('h4','Штурмовик · Обрез','sawedOff','ppsh',2,1)
 ];
 enemies = [enemy('g1',KOLOM_ENEMIES.queen,3),enemy('g2',KOLOM_ENEMIES.spider,1),enemy('g3',KOLOM_ENEMIES.spider,2)];
 shooting=false;
 round = 1;
 actorIndex = 0;
 phase = 'hero';
 log = ['Паучья матка и два скорпионо-паука преграждают путь.'];
 totals = {damage:0,healing:0,shots:0,grenades:0,meds:0};
 impact = {};
 resetChoice();
 render();
}
function resetChoice(){
 const hero=heroes[actorIndex];
 choice = {armed:false, grenade:stocked(hero.grenades)[0], medicine:stocked(hero.meds,medicineIds)[0], action:'attack', slot:'main', mode:'single', zone:'body', ...hero.aim,
  target:enemies.find(alive)?.id, patient:heroes[actorIndex].id};
}
function add(text){
 log.push(text);
 announcement.textContent = text;
}
function damage(unit, amount){
 const actual = Math.min(unit.hp,amount);
 unit.hp -= actual;
 const previous = impact[unit.id]?.amount ?? 0;
 impact[unit.id] = {amount:previous-actual, fallen:!alive(unit)};
 return actual;
}
function unitCard(unit, enemy){
 const hp = `${Math.round(unit.hp)} / ${Math.round(unit.max)} HP`;
 const effect = impact[unit.id];
 const selected = enemy && phase==='hero' && ['attack','grenade'].includes(choice.action) && unit.id===choice.target;
 const active = phase==='hero' && unit===heroes[actorIndex];
 const ranged = enemy && alive(unit) && ['hero','enemy'].includes(phase);
 const distance = ranged ? distanceText(unit.distance) : null;
 const content = `<span class="miniature" aria-hidden="true"></span><span><strong>${unit.name}</strong><small>${alive(unit)?hp+(unit.retreating?' · Отступает':''):'Повержен'}</small>${alive(unit)&&unit.armWound?`<small>Ранена рука</small>`:''}${alive(unit)&&unit.prone?`<small>Лежит</small>`:''}<progress value="${unit.hp}" max="${unit.max}" aria-label="Здоровье, ${unit.name}"></progress></span>${ranged?`<span class="range-badge" aria-label="Дистанция: ${distance}">${distance}</span>`: ''}${effect?.miss?'<span class="float">Промах</span>':''}${effect?.amount?`<span aria-hidden="true" class="float ${effect.amount>0?'heal':''}">${effect.amount>0?'+':''}${effect.amount}</span>`:''}`;
 const position = enemy ? ` style="--distance:${unit.distance};--previous-distance:${effect?.fromDistance ?? unit.distance}"` : '';
 const classes = `unit spot-${unit.id} ${effect?.fromDistance!==undefined?'approaching':''} ${ranged?'has-range':''} ${selected||active?'active':''} ${unit.prone?'prone':''} ${alive(unit)?'':'fallen'} ${effect?.firing?'firing':''} ${effect?.lunge?'lunging':''} ${effect?.fallen?'fall-animation':effect?.amount<0?'hit':''}`;
 if(enemy && alive(unit) && !shooting && phase==='hero' && ['attack','grenade'].includes(choice.action)){
  return `<button type="button" class="${classes}"${position} data-target="${unit.id}" aria-pressed="${selected}">${content}</button>`;
 }
 return `<div class="${classes}"${position}>${content}</div>`;
}
const distanceText = value => value===4?'4+':String(value);
function attackIssue(hero, target){
 const weapon = weaponFor(hero,choice.slot), mode = weapon.modes.find(([id])=>id===choice.mode);
 if(!target) return 'Выбери цель.';
 if(choice.mode==='bayonet') return target.distance===0?'':'Штыком можно ударить только вплотную.';
 if(target.distance>weapon.range) return 'Цель вне дальности оружия.';
 if(hero.ammo[choice.slot]<mode[2]) return 'Недостаточно выстрелов для этого режима.';
 return '';
}
function issue(){
 const hero = heroes[actorIndex], target = enemies.find(unit=>unit.id===choice.target && alive(unit));
 const patient = heroes.find(unit=>unit.id===choice.patient && alive(unit));
 if(choice.action==='attack') return attackIssue(hero,target);
 if(choice.action==='grenade') return !hero.grenades[choice.grenade]?'Гранаты закончились.':!target||target.distance>3?'Граната доступна на дистанции 0–3.':'';
 if(choice.action==='heal') return !hero.meds[choice.medicine]?'Аптечки закончились.':!patient||patient.hp===patient.max?'Выбери раненого героя.':'';
 return '';
}
function initiative(){
 const current=phase==='hero'?heroes[actorIndex]:enemies[enemyCursor];
 const ready=unit=>alive(unit)&&!unit.retreating;
 const remaining=phase==='hero'?heroes.slice(actorIndex+1).filter(ready):[];
 const foes=enemies.slice(phase==='enemy'?(enemyCursor??-1)+1:0).filter(alive);
 const nextRound=heroes.filter(ready);
 const upcoming=[...foes,...nextRound,...enemies.filter(alive)];
 return '<ol class="initiative" aria-label="Очередь ходов">'+[current,...remaining,...upcoming].filter(Boolean).slice(0,4).map((unit,index)=>'<li'+(current&&index===0?' aria-current="step"':'')+' title="'+unit.name+'">'+unit.name+'</li>').join('')+'</ol>';
}
function treat(source,patient,item){
 const result=bandageHeal({hero:{maxHp:patient.max,perception:patient.perception}},rng(Math.floor(Math.random()*4294967296)),patient.hp,item);
 source.meds[item]--;
 patient.hp=result.hp;
 totals.meds++;
 totals.healing+=result.healed;
 impact[patient.id]={amount:result.healed};
 add(source.name+' применяет «'+ITEMS[item].name+'»: '+patient.name+' +'+result.healed+' HP.');
}
function render(focus){
 const hero = heroes[actorIndex];
 let panel;
 if(phase==='hero'){
  const weapon = weaponFor(hero,choice.slot);
  const problem = issue();
  const fields = [];
  if(choice.action==='attack'){
   fields.push(select('slot','Оружие',(weaponFor(hero,'main').twoSlots?['main']:['main','side']).map(id=>[id,`${id==='main'?'Основное':'Дополнительное'} · ${weaponFor(hero,id).name} (${hero.ammo[id]})`]),choice.slot),
    select('mode','Режим',weapon.modes.map(([id,name,cost])=>[id,`${name}${id==='bayonet'?'':' · '+cost}`]),choice.mode),
    select('zone','Куда целиться',zones.map(([id,name])=>[id,name]),choice.zone));
  }
  if(choice.action==='heal') fields.push(select('patient','Кого лечить',heroes.filter(alive).map(unit=>[unit.id,`${unit.name} · ${unit.hp}/${unit.max} HP`]),choice.patient));
  if(choice.action==='grenade') fields.push(select('grenade','Граната',supplyOptions(hero.grenades),choice.grenade));
  if(choice.action==='heal') fields.push(select('medicine','Расходник',supplyOptions(hero.meds,medicineIds),choice.medicine));
  const targetName = ['attack','grenade'].includes(choice.action) ? enemies.find(unit=>unit.id===choice.target)?.name : '';
  const hint=problem||(choice.action==='attack'?(choice.armed?'Нажми «Атака» ещё раз, чтобы выстрелить.':''):(choice.action==='retreat'?'Нажми «Отступить» ещё раз, чтобы пропустить ход.':''));
  const execute={grenade:'Бросить',heal:'Применить лечение'}[choice.action];
  panel = `<section class="panel turn-panel" ${shooting?'inert':''}><h2>Ход · ${hero.name}</h2><div class="moves">${actions.map(([id,label])=>`<button data-move="${id}" aria-pressed="${id===choice.action}">${label}</button>`).join('')}</div>${fields.length?`<div class="field ${choice.action==='attack'?'attack-fields':''}">${fields.join('')}</div>`:''}<div class="turn-submit"><p>${targetName?`Цель · <strong>${targetName}</strong>`:''}${hint?`<small class="muted">${hint}</small>`:''}</p>${execute?`<button id="execute" class="confirm" ${problem?'disabled':''}>${execute}</button>`:''}</div></section>`;
 } else if(phase==='enemy'){
  panel = '<section class="panel"><h2>Ход пауков</h2><p>Противники действуют по очереди.</p></section>';
 }else if(phase==='escaped'){
  const xp=partyBattleExperience({enemies});
  const names=heroes.filter(alive).map(unit=>unit.name+' · '+xp+' опыта').join(' / ');
  panel='<section class="panel"><h2 id="result" tabindex="-1">Отряд отступил</h2><p>'+(xp?names:'Опыт не получен.')+'</p><button id="recovery" class="confirm">Перейти к лечению</button></section>';
 }else if(phase==='recovery'){
  const options=heroes.filter(alive).flatMap(unit=>supplyOptions(unit.meds,medicineIds).map(([id,name])=>[unit.id+':'+id,name+' · '+unit.name]));
  const patients=heroes.filter(unit=>alive(unit)&&unit.hp<unit.max);
  const health=heroes.filter(alive).map(unit=>unit.name+' · '+unit.hp+'/'+unit.max+' HP').join(' / ');
  const fields=options.length&&patients.length ? '<div class="field">'+select('recovery-patient','Кого лечить',patients.map(unit=>[unit.id,unit.name]),patients[0].id)+select('recovery-item','Расходник',options,options[0][0])+'</div><button id="recover">Применить лечение</button> ' : '';
  panel='<section class="panel"><h2 id="result" tabindex="-1">Лечение после боя</h2><p>'+health+'</p>'+fields+'<button id="restart">Сыграть заново</button></section>';
 }else{
  const result = {victory:'Победа',defeat:'Поражение',escaped:'Отряд отступил'}[phase];
  panel = `<section class="panel"><h2 id="result" tabindex="-1">${result}</h2><p>Раундов: ${round} · Повержено Стражей: ${enemies.filter(unit=>!alive(unit)).length} из ${enemies.length}</p><p>${heroes.map(unit=>unit.name+' · '+(alive(unit)?unit.hp+'/'+unit.max+' HP':'повержен')).join(' / ')}</p><p>Нанесено урона: ${totals.damage} · Восстановлено HP: ${totals.healing}</p><p>Потрачено: выстрелов ${totals.shots}, гранат ${totals.grenades}, аптечек ${totals.meds}.</p><button id="restart" class="confirm">Сыграть заново</button></section>`;
 }
 root.innerHTML = `<section class="arena" aria-label="Поле боя"><div class="round"><strong>Раунд ${round}</strong><span>Матка Коломенской</span></div>${['hero','enemy'].includes(phase)?initiative():''}<div class="battlefield">${heroes.map(unit=>unitCard(unit,false)).join('')}${enemies.map(unit=>unitCard(unit,true)).join('')}</div></section>${panel}<section class="panel"><h2>Журнал боя</h2><ol class="events">${log.slice(-6).reverse().map(text=>`<li>${text}</li>`).join('')}</ol></section>`;
 if(focus) root.querySelector(focus)?.focus({preventScroll:true});
}
function confirmAction(){
 if(phase!=='hero'||shooting||issue()) return;
 const hero = heroes[actorIndex];
 const target = enemies.find(unit=>unit.id===choice.target);
 impact = {};
 switch(choice.action){
 case 'attack':
  fireShots(hero,target);
  return;
 case 'grenade': {
  const [direct,spread]=grenadeDamage[choice.grenade];
  hero.grenades[choice.grenade]--;
  totals.grenades++;
  const nearby = enemies.filter(unit=>unit!==target && alive(unit) && Math.abs(unit.distance-target.distance)<=1);
  const dealt = damage(target,direct);
  const splash = nearby[0] ? damage(nearby[0],spread) : 0;
  totals.damage += dealt+splash;
  add(`${hero.name} бросает «${ITEMS[choice.grenade].name}»: ${target.name} −${dealt} HP${splash?', '+nearby[0].name+' −'+splash+' HP':''}.`);
  break;
 }
 case 'heal': {
  const patient = heroes.find(unit=>unit.id===choice.patient);
  treat(hero,patient,choice.medicine);
  break;
 }
 case 'retreat':
  hero.retreating=true;
  add(hero.name+' готовится отступить и пропускает ход.');
  break;
 }
 endHeroTurn();
}
function fireShots(hero,target){
 const weapon=weaponFor(hero,choice.slot);
 const [mode,,count]=weapon.modes.find(([id])=>id===choice.mode);
 const [zone,,multiplier,penalty]=zones.find(([id])=>id===choice.zone);
 const bayonet=mode==='bayonet';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const delay=count>1?(reduced?90:210):(reduced?180:420);
 const accuracy=hero.accuracy+(weapon.accuracyBonus??0)-target.distance*(weapon.distancePenalty??7)+penalty-(mode==='burst'?weapon.burstPenalty:mode==='double'?6:0);
 shooting=true;
 function fire(index){
  impact={[hero.id]:bayonet?{lunge:true}:{firing:true}};
  if(!bayonet){hero.ammo[choice.slot]--;totals.shots++;}
  if(weapon.flame||hits(int(1,100),accuracy,target.evasion)){
   const min=bayonet?weapon.bayonet.min:weapon.min??weapon.damage;
   const max=bayonet?weapon.bayonet.max:weapon.max??weapon.damage+8;
   const raw=min+Math.floor(Math.random()*(max-min+1));
   const armor=weapon.flame?target.thermalArmor:weapon.piercing&&!bayonet?0:target.armor;
   const dealt=damage(target,damageAfterArmor(raw,armor)*multiplier*(weapon.flame?(target.thermalMultiplier??1):1));
   if(weapon.flame&&target.kolomQueen)target.armor=60;
   totals.damage+=dealt;
   if(alive(target)&&zone==='arm'&&roll(50))target.armWound=true;
   if(alive(target)&&zone==='leg'&&roll(50))target.prone=true;
   add(hero.name+' → '+target.name+' · '+(bayonet?'удар штыком':index+'/'+count)+': '+dealt+' урона.');
  }else{
   impact[target.id]={miss:true};
   add(hero.name+' → '+target.name+' · '+(bayonet?'удар штыком':index+'/'+count)+': промах.');
  }
  render();
  window.setTimeout(()=>{
   if(index<count&&alive(target)){fire(index+1);return;}
   impact={};
   shooting=false;
   endHeroTurn();
  },delay);
 }
 fire(1);
}
function endHeroTurn(){
 if(!enemies.some(alive)){
  finish('victory'); return;
  enemyCursor=null;
  phase = 'enemy';
  render();
  window.setTimeout(()=>enemyTurn(0),420);
  return;
 }
 const next = heroes.findIndex((unit,i)=>i>actorIndex && alive(unit) && !unit.retreating);
 if(next>=0){
  actorIndex = next;
  resetChoice();
  render('[data-move="attack"]');
 }else{
  enemyCursor=null;
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
  if(heroes.filter(alive).every(unit=>unit.retreating)){finish('escaped');return;}
  round++;

  actorIndex = heroes.findIndex(unit=>alive(unit)&&!unit.retreating);
  phase = 'hero';
  resetChoice();
  render('[data-move="attack"]');
  return;
 }
 enemyCursor=enemyIndex;
 const enemy = enemies[enemyIndex];
 const target = heroes[enemyIndex%heroes.length];
 const hero = alive(target)?target:heroes.find(alive);
 const distance = enemy.distance;
 const penalty=enemy.armWound?10:0;
 delete enemy.armWound;
 if(enemy.prone){
  delete enemy.prone;
  add(enemy.name+' тратит ход на вставание.');
 }else if(distance>0){
  impact[enemy.id]={fromDistance:distance};
  enemy.distance--;
  add(enemy.name+' приближается к отряду · дистанция '+distanceText(enemy.distance)+'.');
 }else{
  impact[enemy.id]={lunge:true};
  const dealt=hits(int(1,100),enemy.accuracy-penalty,evasionAtDistance(hero,distance,hero.hp))
   ?damage(hero,damageAfterArmor(int(enemy.damageMin,enemy.damageMax),hero.armor)):0;
  if(!dealt)impact[hero.id]={miss:true};
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
 if(button.id==='recovery'&&phase==='escaped'){finish('recovery');return;}
 if(button.id==='recover'&&phase==='recovery'){
  const [id,item]=root.querySelector('#recovery-item').value.split(':');
  const patient=heroes.find(unit=>unit.id===root.querySelector('#recovery-patient').value);
  treat(heroes.find(unit=>unit.id===id),patient,item);
  render('#recover');
  return;
 }
 if(phase!=='hero'||shooting) return;
 if(button.id==='execute'){confirmAction();return;}
 if(button.dataset.move){
  const move=button.dataset.move;
  if(choice.armed&&choice.action===move){confirmAction();return;}
  choice.action=move;
  choice.armed=true;
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
 if(phase!=='hero'||shooting||!Object.hasOwn(choice,id)) return;
 choice[id] = value;
 if(id==='slot'&&choice.slot!==heroes[actorIndex].aim?.slot) choice.mode = 'single';
 if(['slot','mode','zone'].includes(id)){
  const {slot,mode,zone}=choice;
  heroes[actorIndex].aim={slot,mode,zone};
 }
 impact = {};
 render('#'+id);
});
start();
