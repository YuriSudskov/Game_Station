import {ITEMS} from './data.js';
import {weaponMaxDistance,canThrowGrenade} from './combat.js';
export const healingSupplies={doctorKit:'doctorKits',medicKit:'medicKits',dressingKit:'dressingKits',bandage:'bandages'};
export const grenadeSupplies={dynamite:'dynamites',lu216:'lu216Grenades',molotov:'molotovs',pipeGrenade:'grenades',tinGrenade:'tinGrenades'};
export function validateManualAction(combat,action){
 if(!action||action.revision!==(combat.manualRevision??0))throw Error('Этот ход уже изменился.');
 const hero=combat.heroes.find(h=>h.id===combat.waitingHeroId);
 if(!hero||hero.hp<=0||hero.dead||!['running','pending'].includes(combat.status))throw Error('Сейчас нет хода героя.');
 if(!['attack','grenade','heal','retreat','wait'].includes(action.kind))throw Error('Выбери действие.');
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
  if(!weapon||!['body','head','arm','leg'].includes(action.aim))throw Error('Выбери оружие и прицел.');
  if(!['single','burst','double','bayonet'].includes(action.mode)||action.mode==='burst'&&!weapon.shots||action.mode==='double'&&!weapon.damageRolls||action.mode==='bayonet'&&!weapon.bayonet)throw Error('Этот режим недоступен.');
  if(action.mode==='bayonet'&&distance!==0)throw Error('Штык доступен только вплотную.');
  if(weapon.usesHeavyAmmo&&!(hero.heavyAmmo>0))throw Error('Нет зарядов тяжёлого оружия.');
 }
}
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const picker=(name,label,options,value)=>'<label>'+label+'<select data-jrpg-field="'+name+'">'+options.map(([id,text])=>'<option value="'+esc(id)+'" '+(id===value?'selected':'')+'>'+esc(text)+'</option>').join('')+'</select></label>';
export function manualBattleBody(mission,party){
 const combat=mission.combat,hero=['pending','running'].includes(combat.status)?combat.heroes.find(h=>h.id===combat.waitingHeroId):null,view=hero??combat.heroes.find(h=>h.hp>0)??combat.heroes[0];
 const prefs=hero?.manualPrefs??{};
 const slot=prefs.slot&&hero?.weapons?.[prefs.slot]?prefs.slot:hero?.weapons?.main?'main':'ranged';
 const weapon=hero?.weapons?.[slot];
 const modes=[['single','Одиночный'],...(weapon?.shots?[['burst','Очередь']]:[]),...(weapon?.damageRolls?[['double','Дуплет']]:[]),...(weapon?.bayonet?[['bayonet','Штык']]:[])];
 const mode=modes.some(([id])=>id===prefs.mode)?prefs.mode:'single';
 const target=combat.enemies.find(e=>e.id===prefs.targetId&&e.hp>0)??combat.enemies.find(e=>e.hp>0);
 const active=combat.order.findIndex(e=>e.id===(hero?.id??combat.order[combat.actorIndex]?.id));
 const queue=[...combat.order.slice(Math.max(0,active)),...combat.order.slice(0,Math.max(0,active))].filter(e=>[...combat.heroes,...combat.enemies].some(h=>h.id===e.id&&h.hp>0)).slice(0,4);
 const card=(unit,index,enemy)=>{
  const member=party.find(h=>h.id===unit.id);
  const female=['female','f','woman','женский','женщина'].includes(String(member?.gender??member?.sex??'').toLowerCase());
  const cell=enemy?(unit.kolomQueen?1:0):(female?2:0)+index%2;
  const distance=enemy?Math.min(4,view.distances?.[unit.id]??0):0;
  const placementDistance=enemy?Math.min(...combat.heroes.filter(h=>h.hp>0).map(h=>Math.min(4,h.distances?.[unit.id]??0))):0;
  const x=enemy?48+placementDistance*8:17+index*11,y=enemy?(unit.kolomQueen?32:index===1?63:87):54+index*29;
  const state=(unit.manualProne?' Лежит':'')+(unit.manualArm?' Ранена рука':'')+(unit.poisonDoses?' Яд '+unit.poisonDoses:'')+(unit.retreating?' Отступает':'');
  return '<button class="kj-unit '+(enemy?'foe':'hero')+(unit.hp<=0?' fallen':'')+(unit.manualProne?' prone':'')+'" style="--x:'+x+'%;--y:'+y+'%;--sprite-x:'+(cell%2*100)+'%;--sprite-y:'+Math.floor(cell/2)*100+'%;--cell:'+cell+'" data-action="jrpgTarget" data-id="'+esc(unit.id)+'" '+(!enemy?'disabled':'')+' aria-pressed="'+(enemy&&target?.id===unit.id)+'"><span class="kj-sprite '+(enemy?'enemy-sprite':'hero-sprite')+'"></span><span class="kj-label">'+esc(enemy?(unit.kolomQueen?'Матка':'Скорпион-паук '+index):unit.name)+'<small><span data-jrpg-hp>'+Math.round(unit.hp)+'</span>'+' / '+Math.round(unit.maxHp??unit.hp)+' HP'+esc(state)+'</small><progress max="'+(unit.maxHp??unit.hp)+'" value="'+unit.hp+'"></progress></span>'+(enemy?'<b class="kj-distance">'+(distance===4?'4+':distance)+'</b>':'')+'</button>';
 };
 const selected=prefs.kind??'attack';
 let fields='';
 if(hero){
  if(selected==='attack')fields=picker('slot','Оружие',Object.entries(hero.weapons??{}).filter(([,w])=>w).map(([id,w])=>[id,(id==='main'?'Основное':'Дополнительное')+' · '+(w.name??ITEMS[w.item]?.name)]),slot)+picker('mode','Режим',modes,mode)+picker('aim','Прицел',[['body','Корпус'],['head','Голова'],['arm','Рука'],['leg','Нога']],prefs.aim??'body');
  if(selected==='grenade')fields=picker('item','Граната',Object.entries(grenadeSupplies).filter(([,key])=>hero[key]>0).map(([id,key])=>[id,ITEMS[id].name+' ×'+hero[key]]),prefs.item);
  if(selected==='heal')fields=picker('item','Лечение',Object.entries(healingSupplies).filter(([,key])=>hero[key]>0).map(([id,key])=>[id,ITEMS[id].name+' ×'+hero[key]]),prefs.item)+picker('patient','Кого лечить',combat.heroes.filter(h=>h.hp>0).map(h=>[h.id,h.name]),prefs.patient??hero.id);
 }
 return '<section class="kj-battle" data-round="'+combat.round+'"><div class="kj-heading"><strong>Матка Коломенской</strong><span>Раунд '+combat.round+'</span></div><ol class="kj-initiative">'+queue.map((e,i)=>'<li '+(!i?'aria-current="step"':'')+'>'+esc(e.name)+'</li>').join('')+'</ol><div class="kj-arena">'+combat.heroes.map((h,i)=>card(h,i,false)).join('')+combat.enemies.map((h,i)=>card(h,i,true)).join('')+'</div><div class="kj-controls">'+(hero?'<h3>Ход · '+esc(hero.name)+'</h3><div class="kj-actions">'+[['attack','Атака'],['grenade','Граната'],['heal','Лечение'],['retreat','Отступить'],['wait',hero?.reloading?'Перезарядить':'Пропустить ход']].map(([id,name])=>'<button data-action="jrpgSelect" data-kind="'+id+'" aria-pressed="'+(selected===id)+'">'+name+'</button>').join('')+'</div><div class="kj-fields">'+fields+'</div><p class="note">'+(target?'Цель · '+esc(target.name):'')+'</p>'+(['heal','grenade'].includes(selected)?'<button data-action="jrpgExecute">'+(selected==='heal'?'Применить лечение':'Бросить')+'</button>':'<p class="note">Повторное нажатие команды выполняет действие.</p>'):(combat.status==='victory'?'<h3>Победа</h3><p>Опыт за бой · '+mission.combatXp+' на отряд</p>':combat.status==='escaped'?'<h3>Отряд отступил</h3><p>Опыт за поверженных · '+combat.enemies.filter(e=>e.hp<=0).reduce((n,e)=>n+(e.experience??0),0)+' на отряд</p>':'<button data-action="kolomChoice" data-node="combat" data-choice="manual">Продолжить бой</button>'))+'</div></section>';
}
