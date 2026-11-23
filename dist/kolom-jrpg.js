import {magazineState,roundsForMode} from './jrpg-magazines.js';
import {ITEMS,PERKS,LEVEL_PERKS} from './data.js';
import {weaponMaxDistance,canThrowGrenade,dualPistolsActive,heroAttackStats} from './combat.js';
export const healingSupplies={doctorKit:'doctorKits',medicKit:'medicKits',dressingKit:'dressingKits',bandage:'bandages'};
export const grenadeSupplies={radioactiveGrenade:'radioactiveGrenades',dynamite:'dynamites',lu216:'lu216Grenades',molotov:'molotovs',pipeGrenade:'grenades',tinGrenade:'tinGrenades'};
export function manualAttackModes(hero,weapon){
 if(!weapon)return [];
 const slot=Object.keys(hero.weapons??{}).find(key=>hero.weapons[key]===weapon);
 const available=slot?magazineState(hero,slot)?.rounds??Infinity:Infinity;
 if(weapon.flame)return [['single','Сосредоточить огонь · −0%'],['flameSweep','Зацепить двух · −15%']];
 return [['single',weapon.type==='melee'?'Один удар · −0%':weapon.flame?'Струя огня':'Одиночный · 1 пуля · −0%'],
 ...(weapon.shots?[['burst','Очередь · '+Math.min(available,(weapon.shots??1)+(hero.burstBonus??0))+' пуль · −'+Math.max(0,Math.round(heroAttackStats({...hero,dualPistols:false,pistolAccuracyPenalty:0},{...weapon,shots:undefined,damageRolls:undefined,shotPenalty:0},0).accuracy-heroAttackStats(hero,weapon,0).accuracy))+'%']]:[]),
 ...(weapon.damageRolls?[['double','Дуплет · '+weapon.damageRolls+' пули · −'+(weapon.shotPenalty??0)+'%']]:[]),
 ...(weapon.weaponClass==='pistol'&&hero.pistolAttacks>1?[['pistolDouble','Двойной выстрел · 2 пули · −15%']]:[]),
 ...(weapon.type==='melee'&&hero.attacksPerTurn>1?[['meleeDouble','Двойной удар · 2 удара · −'+(hero.attackAccuracyPenalty??0)+'%']]:[]),
 ...(weapon.weaponClass==='pistol'&&dualPistolsActive(hero)?[['paired','Два пистолета · 2 пули · −10%']]:[]),
 ...(weapon.bayonet?[['bayonet','Штык']]:[])];
}
export function manualWeaponLabel(hero,weapon,member,slot,distance=0){
 const details=member?.[slot==='main'?'weaponDetails':'rangedWeaponDetails'];
 const quality=details?.quality??Number(weapon.name?.match(/\+([1-5])(?:\s|$)/)?.[1]??0);
 const name=(ITEMS[weapon.item]?.name??weapon.name??'Оружие')+(quality?' +'+quality:'');
 const maximum=weaponMaxDistance(hero,weapon);
 const stats=heroAttackStats(hero,weapon,distance,{hp:hero.hp});
 const format=value=>Number(value.toFixed(1)).toLocaleString('ru-RU');
 return name+' · dist. '+(weapon.minDistance??0)+'–'+(Number.isFinite(maximum)?maximum:'∞')+' · '+format(stats.min)+'–'+format(stats.max)+(magazineState(hero,slot)?' · '+magazineState(hero,slot).rounds+'/'+magazineState(hero,slot).capacity:'');
}
export function manualAimOptions(weapon){
 if(weapon?.flame)return [];
 return [['body','Корпус'],...(!weapon?.blocksAimedShots?[['head','Голова · −30%']]:[]),['arm','Рука · −20%'],['leg','Нога · −20%']];
}
export function defaultManualMode(modes){return modes.some(([id])=>id==='burst')?'burst':modes.some(([id])=>id==='double')?'double':'single';}
export function manualFieldPrefs(fighter,field,value){const p=fighter?.manualPrefs??{},slot=p.slot??(fighter?.weapons?.main?'main':'ranged');if(field==='slot')return {slot:value,mode:p.modesBySlot?.[value]??null};if(field==='mode')return {mode:value,modesBySlot:{...p.modesBySlot,[slot]:value}};return {[field]:value};}
export function validateManualAction(combat,action){
 if(!action||action.revision!==(combat.manualRevision??0))throw Error('Этот ход уже изменился.');
 const hero=combat.heroes.find(h=>h.id===combat.waitingHeroId);
 if(!hero||hero.hp<=0||hero.dead||!['running','pending'].includes(combat.status))throw Error('Сейчас нет хода героя.');
 if(hero.entangled){if(action.kind!=='escapeWeb')throw Error('Герой опутан: сначала выпутайся.');return;}
 if(!['attack','grenade','heal','retreat','wait','reload'].includes(action.kind))throw Error('Выбери действие.');
 if(action.kind==='reload'){
  const magazine=magazineState(hero,action.slot),weapon=hero.weapons?.[action.slot];
  if(!magazine||magazine.rounds>=magazine.capacity)throw Error('Перезарядка не требуется.');
  if(weapon.usesHeavyAmmo&&(hero.heavyAmmo??0)<=magazine.rounds)throw Error('Нет запасных зарядов.');
  return;
 }
 if(['retreat','wait'].includes(action.kind))return;
 const target=(action.kind==='heal'?combat.heroes:combat.enemies).find(h=>h.id===action.targetId&&h.hp>0&&!h.dead);
 if(!target)throw Error('Выбери действующую цель.');
 const distance=hero.distances?.[target.id]??0;
 if(action.kind==='heal'){
  if(!healingSupplies[action.item]||!(hero[healingSupplies[action.item]]>0)||target.hp>=target.maxHp&&!(action.item==='doctorKit'&&(target.poisonDoses||target.entangled||target.radiation)))throw Error('Лечение недоступно.');
 }else if(action.kind==='grenade'){
  if(!grenadeSupplies[action.item]||!(hero[grenadeSupplies[action.item]]>0)||!canThrowGrenade(distance,hero.strength))throw Error('Граната недоступна на этой дистанции.');
 }else{
  const weapon=hero.weapons?.[action.slot];
  if(!weapon||(weapon.flame?(action.aim!=null&&action.aim!=='body'):!manualAimOptions(weapon).some(([id])=>id===action.aim)))throw Error('Выбери оружие и прицел.');
  if(!manualAttackModes(hero,weapon).some(([id])=>id===action.mode))throw Error('Этот режим недоступен.');
  if(action.mode==='bayonet'&&distance!==0)throw Error('Штык доступен только вплотную.');
  const slots=action.mode==='paired'?['main','ranged']:[action.slot];
  for(const slot of slots){
   const selectedWeapon=hero.weapons[slot],magazine=magazineState(hero,slot);
   if(magazine&&magazine.rounds<roundsForMode(hero,selectedWeapon,action.mode))throw Error('Недостаточно патронов в магазине. Выбери другой режим, второе оружие или перезарядку.');
  }
  if(weapon.usesHeavyAmmo&&!(hero.heavyAmmo>0))throw Error('Нет зарядов тяжёлого оружия.');
 }
}
const displayName=unit=>unit.id?.startsWith('sm-guard-')?'Боец '+(Number(unit.id.split('-').at(-1))+1):unit.name;
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const picker=(name,label,options,value)=>'<label>'+label+'<select data-jrpg-field="'+name+'">'+options.map(([id,text])=>'<option value="'+esc(id)+'" '+(id===value?'selected':'')+'>'+esc(text)+'</option>').join('')+'</select></label>';
export function manualBattleBody(mission,party){
 const combat=mission.combat,hero=['pending','running'].includes(combat.status)?combat.heroes.find(h=>h.id===combat.waitingHeroId):null,view=hero??combat.heroes.find(h=>h.hp>0)??combat.heroes[0];
 const prefs=hero?.manualPrefs??{};
 const slot=prefs.slot&&hero?.weapons?.[prefs.slot]?prefs.slot:hero?.weapons?.main?'main':'ranged';
 const weapon=hero?.weapons?.[slot];
 const modes=manualAttackModes(hero,weapon);
 const remembered=prefs.modesBySlot?.[slot]??prefs.mode;const mode=modes.some(([id])=>id===remembered)?remembered:defaultManualMode(modes);
 const target=combat.enemies.find(e=>e.id===prefs.targetId&&e.hp>0)??combat.enemies.find(e=>e.hp>0);
 const active=combat.order.findIndex(e=>e.id===(hero?.id??combat.order[combat.actorIndex]?.id));
 const queue=[...combat.order.slice(Math.max(0,active)),...combat.order.slice(0,Math.max(0,active))].filter(e=>[...combat.heroes,...combat.enemies].some(h=>h.id===e.id&&h.hp>0)).slice(0,4);
 const card=(unit,index,enemy)=>{
  const member=party.find(h=>h.id===unit.id);
  const female=['female','f','woman','женский','женщина'].includes(String(member?.gender??member?.sex??'').toLowerCase());
  const cell=enemy?(unit.kolomQueen?1:0):(female?2:0)+index%2;
  const planned=enemy?(combat.heroes.find(h=>h.id===unit.targetHeroId&&h.hp>0)??combat.heroes.find(h=>h.hp>0)??view):view;
  const distance=enemy?Math.min(4,planned.distances?.[unit.id]??0):0;
  const placementDistance=enemy?Math.min(...combat.heroes.filter(h=>h.hp>0).map(h=>Math.min(4,h.distances?.[unit.id]??0))):0;
  const n=enemy?combat.enemies.length:combat.heroes.length;const x=enemy?48+placementDistance*8+(index%2?-4:0):15+index%2*13,y=enemy?(n>3?14+index*(74/Math.max(1,n-1)):unit.kolomQueen?32:index===1?63:87):(n>2?24+index*(62/Math.max(1,n-1)):54+index*29);
  const art=enemy&&mission.battleTitle?(mission.id==='hansaRoute'?(index%2?'ghoul2':'ghoul'):mission.id==='zilRoute'?(unit.frontline?'bandit-crowbar':unit.firearm?.item==='browning'?'bandit-shotgun':'bandit-smg'):(unit.id==='roof-mature-guard'||unit.name?.includes('Матёр')?'mature-guard':'guard')):unit.id==='hansa-vasek'?'vasek':null;
  const muzzle=enemy?[.2,.43]:cell===0?[.82,.23]:cell===1?[.81,.25]:cell===2?[.82,.24]:[.81,.24];
  const mouth=unit.kolomQueen?[.32,.61]:[.40,.62];
  const state=(unit.entangled?' Опутан':unit.webMovement||unit.movementLocked?' Паутина: движение сковано':'')+(unit.manualProne?' Лежит':'')+(unit.manualArm?' Ранена рука':'')+(unit.poisonDoses?' Яд '+unit.poisonDoses:'')+(unit.retreating?' Отступает':'');
  return '<button class="kj-unit '+(n>3?'compact-unit ':'')+(enemy?'foe':'hero')+(!enemy&&hero?.id===unit.id?' active-hero':'')+(unit.hp<=0?' fallen':'')+(unit.manualProne?' prone':'')+(unit.poisonDoses?' poisoned':'')+'" style="--x:'+x+'%;--y:'+y+'%;--sprite-x:'+(cell%2*100)+'%;--sprite-y:'+Math.floor(cell/2)*100+'%;--cell:'+cell+'" data-planned-target="'+esc(enemy?planned.id:'')+'" data-distance="'+distance+'" data-muzzle-x="'+muzzle[0]+'" data-muzzle-y="'+muzzle[1]+'" data-mouth-x="'+mouth[0]+'" data-mouth-y="'+mouth[1]+'" data-action="jrpgTarget" data-id="'+esc(unit.id)+'" '+(!enemy?'disabled':'')+' aria-pressed="'+(enemy&&target?.id===unit.id)+'"><span class="kj-sprite '+(art?'custom-sprite':enemy?'enemy-sprite':'hero-sprite')+'">'+(art?'<img class="kj-figure" src="./expedition-jrpg-art/'+art+'.png" alt="" draggable="false">':'')+'</span><span class="kj-label">'+esc(enemy?(unit.kolomQueen?'Матка':displayName(unit)):displayName(unit))+'<small><span data-jrpg-hp>'+Math.round(unit.hp)+'</span>'+' / '+Math.round(unit.maxHp??unit.hp)+' HP'+esc(state)+'</small><progress max="'+(unit.maxHp??unit.hp)+'" value="'+unit.hp+'"></progress></span>'+(enemy?'<b class="kj-distance">'+(distance===4?'3+':distance)+'</b>':'')+'</button>';
 };
 const abilities=(hero?.professionPerks??[]).map(id=>[id,PERKS[id]??LEVEL_PERKS[id]]).filter(([id,p])=>p&&id!=='none');
 const abilityText=abilities.length?'<details class="kj-abilities"><summary>Перки и способности</summary>'+abilities.map(([id,p])=>'<p><strong>'+esc(p.name)+'</strong> · '+esc(p.description)+'</p>').join('')+'<p>Любимые патроны: '+(hero.favoriteShots??0)+' / 5 использовано. Первый выстрел: '+(hero.sniperShots?.fired?'сделан':'впереди')+'. Первое попадание: '+(hero.sniperShots?.firstHit?'состоялось':'впереди')+'.</p></details>':'';
 const selected=hero?.entangled?'escapeWeb':prefs.kind==='escapeWeb'?'attack':prefs.kind??'attack';
 let fields='';
 if(hero){
  if(hero.entangled)fields='<p class="note">Герой опутан. Попытка выпутаться тратит ход, даже при успехе.</p>';
  if(selected==='reload')fields=picker('slot','Перезарядить оружие',Object.entries(hero.weapons??{}).filter(([id])=>magazineState(hero,id)).map(([id,w])=>[id,manualWeaponLabel(hero,w,party.find(member=>member.id===hero.id),id)]),slot);
  if(selected==='attack')fields=picker('slot','Оружие',Object.entries(hero.weapons??{}).filter(([,w])=>w).map(([id,w])=>[id,manualWeaponLabel(hero,w,party.find(member=>member.id===hero.id),id,hero.distances?.[target?.id]??0)]),slot)+picker('mode','Режим',modes,mode)+(weapon?.flame?'':picker('aim','Прицел',manualAimOptions(weapon),manualAimOptions(weapon).some(([id])=>id===prefs.aim)?prefs.aim:'body'));
  if(selected==='grenade')fields=picker('item','Граната',Object.entries(grenadeSupplies).filter(([,key])=>hero[key]>0).map(([id,key])=>[id,ITEMS[id].name+' ×'+hero[key]]),prefs.item);
  if(selected==='heal')fields=picker('item','Лечение',Object.entries(healingSupplies).filter(([,key])=>hero[key]>0).map(([id,key])=>[id,ITEMS[id].name+' ×'+hero[key]]),prefs.item)+picker('patient','Кого лечить',combat.heroes.filter(h=>h.hp>0).map(h=>[h.id,h.name]),prefs.patient??hero.id);
 }
 return '<section class="kj-battle" data-round="'+combat.round+'"><div class="kj-heading"><strong>'+esc(mission.battleTitle??'Матка Коломенской')+'</strong><span>Раунд '+combat.round+'</span></div><ol class="kj-initiative">'+queue.map((e,i)=>'<li '+(!i?'aria-current="step"':'')+'>'+esc(displayName(e))+'</li>').join('')+'</ol><div class="kj-arena '+(mission.battleTitle?'kj-expedition-arena':'')+'" data-scene="'+esc(mission.id??'kolomenskaya')+'" style="'+(mission.battleTitle?'background-image:url('+({hansaRoute:'./expedition-jrpg-art/drezina-arena.jpg',zilRoute:'./expedition-jrpg-art/zil-arena.jpg',roofRoute:'./expedition-jrpg-art/roof-arena.jpg'}[mission.id]??'./kolom-jrpg-arena.png')+')':'')+'">'+combat.heroes.map((h,i)=>card(h,i,false)).join('')+combat.enemies.map((h,i)=>card(h,i,true)).join('')+'</div><div class="kj-controls">'+(hero?'<h3>Ход · '+esc(displayName(hero))+'</h3>'+abilityText+'<div class="kj-actions">'+[[hero.entangled?'escapeWeb':'attack',hero.entangled?'Выпутаться':'Атака'],['grenade','Граната'],['heal','Лечение'],['retreat','Отступить'],['reload','Перезарядить'],['wait','Пропустить ход']].map(([id,name])=>'<button class="btn secondary" data-action="jrpgSelect" data-kind="'+id+'" '+(hero.entangled&&id!=='escapeWeb'?'disabled':'')+' aria-pressed="'+(selected===id)+'">'+name+'</button>').join('')+'</div><div class="kj-fields">'+fields+'</div><p class="note">'+(target?'Цель · '+esc(target.name):'')+'</p>'+(['heal','grenade'].includes(selected)?'<button class="btn" data-action="jrpgExecute">'+(selected==='heal'?'Применить лечение':'Бросить')+'</button>':'<p class="note">Повторное нажатие команды выполняет действие.</p>'):(combat.status==='victory'?'<h3>Победа</h3><p>Опыт за бой · '+mission.combatXp+' на отряд</p>':combat.status==='escaped'?'<h3>Отряд отступил</h3><p>Опыт за поверженных · '+combat.enemies.filter(e=>e.hp<=0).reduce((n,e)=>n+(e.experience??0),0)+' на отряд</p>':'<button class="btn secondary" data-action="kolomChoice" data-node="combat" data-choice="manual">Продолжить бой</button>'))+'</div></section>';
}
