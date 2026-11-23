import {cells,center,key,distance,initialState,prepareTravel,stepMinutes,routeMinutes,travelClock,isNight,prepareFindings,checkFindings,resolveFinding,finishHike,startHike,reveal,move,clock,ORIGIN,METRO,MAP_UNITS_PER_METRE} from './hike-map-model.js';
import {terrainAt} from './hike-terrain.js';
import {findRoute} from './hike-route.js';
const $=id=>document.getElementById(id), ns='http://www.w3.org/2000/svg', storage='station-hike-map-prototype-v2';
let state=initialState();
try{const saved=JSON.parse(localStorage.getItem(storage));if(saved&&cells.some(c=>c.q===saved.q&&c.r===saved.r)&&Number.isInteger(saved.steps)&&saved.steps>=0&&Array.isArray(saved.explored))state={...saved,explored:saved.explored.filter(k=>cells.some(c=>key(c.q,c.r)===k))};}catch{}
if(!state.seen&&state.steps===0)state=initialState();
state=prepareTravel(prepareFindings(reveal(state)));
let scale=1,offset={x:0,y:0},width=0,height=0,drag=null;
let planned=[],walking=false;
const nodes=new Map(),tiles=new Map();
function element(tag,attrs){const e=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;}
function renderFindings(){
  const panel=$('findings'),actions=$('hike-actions');panel.replaceChildren();actions.replaceChildren();
  function button(label,handler,parent=panel){const b=document.createElement('button');b.textContent=label;b.disabled=walking;b.onclick=handler;parent.append(b);}
  function text(message){const p=document.createElement('p');p.textContent=message;panel.append(p);}
  if(state.ended){text(state.failed?`Группа погибла без фильтров · клетка ${state.deathCell}.`:`Поход завершён · ${METRO.find(s=>distance(state,s)===0)?.name??'метро'} · ${travelClock(state).time}.`);button('Начать новый поход',()=>{state=startHike(state);save();render();recenter();$('hint').textContent='Новый поход · 07:00. Находки и разведанная карта сохранены.';});return;}
  const event=state.pending[0];
  if(isNight(state)){
    text('Ночь. Разведка и поиск находок недоступны. Можно двигаться или искать укрытие.');
    text('Нападения стражей · Скоро: шанс и состав ещё не настроены.');
    button('Искать укрытие для ночлега · Скоро',()=>{$('hint').textContent='Поиск укрытия — Скоро. Условия ночлега ещё не настроены.';});return;
  }
  if(event){
    text(event.type==='shop'?'Вы нашли разрушенный магазин.':'Вы нашли свежие останки растерзанного сталкера.');
    const choose=choice=>{state=resolveFinding(state,choice);save();render();$('hint').textContent='Выбор сохранён. Можно продолжать поход.';};
    if(event.type==='remains')button('Обыскать · поиск 10',()=>choose('search'));
    button(event.type==='shop'?'Оставить и вернуться позже':'Не трогать',()=>choose('leave'));return;
  }
  if(state.lastSearch){const result=state.lastSearch;text(`Поиск: ${result.roll} + ${result.bonus} против ${result.dc} · ${result.success?'успех':'неудача'}. ${result.reward?'Найдено: '+result.reward.name+' (5-й уровень).':'Ничего не найдено.'}`);}
  if(state.rewards?.length)text('Находки группы: '+state.rewards.map(r=>r.name).join(', '));
  if(state.shops.includes(key(state.q,state.r))){text('Разрушенный магазин · находка сохранена в этой клетке.');button('Осмотреть магазин · Скоро',()=>{$('hint').textContent='Осмотр разрушенного магазина — Скоро.';});}
  if(METRO.some(s=>distance(state,s)===0))button('Спуститься в метро · закончить поход',()=>{state=finishHike(state);planned=[];showRoute();save();render();$('hint').textContent='Группа спустилась в метро. Поход завершён.';},actions);
}
for(const cell of cells){const p=center(cell);const points=Array.from({length:6},(_,i)=>{const a=(60*i-30)*Math.PI/180;return `${p.x+415*Math.cos(a)},${p.y+415*Math.sin(a)}`;}).join(' ');const node=element('polygon',{points,tabindex:'-1','data-q':cell.q,'data-r':cell.r});nodes.set(key(cell.q,cell.r),node);$('hexes').append(node);}
for(const station of METRO){
  const p=center(station),group=element('g',{transform:`translate(${p.x},${p.y})`,'pointer-events':'none','aria-hidden':'true'});
  const icon=element('path',{d:'M-220 80H-80V25H-110L-72 -90L0 60L72 -90L110 25H80V80H220V25H188L108 -210L0 -15L-108 -210L-188 25H-220Z',fill:'#58df82',stroke:'#132a1e','stroke-width':14,'stroke-linejoin':'round'});
  const label=element('text',{x:0,y:230,'text-anchor':'middle','font-size':86,fill:'#e5efd6',stroke:'#17241e','stroke-width':18,'paint-order':'stroke'});label.textContent=station.name;
  group.append(icon,label);$('hexes').append(group);
}
function render(){
  const t=travelClock(state);$('clock').innerHTML=`<b>${t.time}</b>День ${t.day} · ${t.period} · ход ${state.steps}`;document.body.dataset.period=t.period;
  $('party').replaceChildren();
  for(const hero of state.heroes){const card=document.createElement('div');card.textContent=`${hero.name} · ур. ${hero.level} · ${hero.unconscious?'Без сознания':hero.hp+' HP'} · ${hero.weapon==='ak47'?'АК47+2 / РОКС2':'Обрез+2 / ППШ+1'}`;$('party').append(card);}
  $('supplies').textContent=`Фильтры: ${state.filters} · скорость: ${state.speed} мин · до расхода: ${20-state.elapsedMinutes%20} мин`;
  $('position').textContent=state.q===0&&state.r===0?'Автозаводская · группа на базе':`Группа · клетка ${state.q}, ${state.r}`;
  const explored=new Set(state.explored),seen=new Set(state.seen);$('terrain-labels').replaceChildren();
  for(const c of cells){
    const id=key(c.q,c.r),node=nodes.get(id),near=distance(state,c)===1,terrain=terrainAt(c),visible=seen.has(id)||explored.has(id);
    node.setAttribute('class',`hex${explored.has(id)?' open':seen.has(id)?' mist':''}${near&&!terrain.blocked?' reachable':''}${distance(state,c)===0?' current':''}${visible&&terrain.water?' water':''}${visible&&terrain.coast?' coast':''}${visible&&terrain.bridge?' bridge':''}`);
    node.setAttribute('tabindex','0');node.setAttribute('role','button');
    node.setAttribute('aria-label',`${METRO.find(s=>s.q===c.q&&s.r===c.r)?.name??`Клетка ${c.q}, ${c.r}`} · ${explored.has(id)?'разведана':seen.has(id)?'видна в дымке':'неизвестна'}${visible&&terrain.label?' · '+terrain.label:''}`);
    if(visible&&terrain.label){const p=center(c),label=element('text',{x:p.x,y:p.y+130,'text-anchor':'middle','font-size':90,fill:terrain.bridge?'#f5dca0':'#b6d1d9',stroke:'#17241e','stroke-width':18,'paint-order':'stroke'});label.textContent=terrain.bridge?'Мост':terrain.water?'Вода':'Берег';$('terrain-labels').append(label);}
  }
  for(const id of state.shops){const [q,r]=id.split(',').map(Number),p=center({q,r}),label=element('text',{x:p.x,y:p.y-100,'text-anchor':'middle','font-size':83,fill:'#f0d194',stroke:'#17241e','stroke-width':18,'paint-order':'stroke'});label.textContent='Магазин';$('terrain-labels').append(label);}
  $('marker').setAttribute('transform',markerTransform(center(state)));renderFindings();
}
// Web Mercator raster tiles, locally scaled to real ground metres at the station.
const zoom=15,n=2**zoom,lat=ORIGIN.lat*Math.PI/180;
const originX=(ORIGIN.lon+180)/360*n*256,originY=(1-Math.asinh(Math.tan(lat))/Math.PI)/2*n*256;
const metresPerPixel=Math.cos(lat)*2*Math.PI*6378137/(n*256)*MAP_UNITS_PER_METRE;
function draw(){ $('world').setAttribute('transform',`translate(${width/2-offset.x*scale},${height/2-offset.y*scale}) scale(${scale})`);const left=(offset.x-width/2/scale)/metresPerPixel+originX,right=(offset.x+width/2/scale)/metresPerPixel+originX,top=(offset.y-height/2/scale)/metresPerPixel+originY,bottom=(offset.y+height/2/scale)/metresPerPixel+originY;const visible=new Set();for(let x=Math.floor(left/256);x<=Math.floor(right/256);x++)for(let y=Math.floor(top/256);y<=Math.floor(bottom/256);y++){const k=`${x},${y}`;visible.add(k);if(tiles.has(k))continue;const img=element('image',{x:(x*256-originX)*metresPerPixel,y:(y*256-originY)*metresPerPixel,width:256*metresPerPixel+.1,height:256*metresPerPixel+.1,href:`https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`});img.addEventListener('error',()=>{$('tile-error').hidden=false;});tiles.set(k,img);$('tiles').append(img);}for(const[k,img]of tiles)if(!visible.has(k)){img.remove();tiles.delete(k);}}
function recenter(){offset=center(state);draw();}
function save(){try{localStorage.setItem(storage,JSON.stringify(state));}catch{}}
const markerTransform=p=>`translate(${p.x+245},${p.y+90}) scale(.6)`;
function showRoute(){
  $('route').replaceChildren();
  for(const c of planned){const p=center(c);$('route').append(element('circle',{cx:p.x,cy:p.y,r:35,fill:'#f3df92',stroke:'#1c3024','stroke-width':12}));}
  if(planned.length){const target=center(planned.at(-1)),arrival=clock(routeMinutes(state,planned)/20),label=element('text',{x:target.x,y:target.y-140,'text-anchor':'middle','font-size':125,'font-weight':'bold',fill:'#fff0ae',stroke:'#17241e','stroke-width':28,'paint-order':'stroke'});label.textContent=`${arrival.day>travelClock(state).day?'Д'+arrival.day+' ':''}${arrival.time}`;$('route').append(label);}
}
async function travel(){
  if(walking||state.ended||state.pending.length||!planned.length)return;walking=true;$('reset').disabled=true;
  try{
    while(planned.length){const target=planned[0];if(terrainAt(target).blocked)break;
      const from=center(state),to=center(target),started=performance.now();
      $('hint').textContent=`В пути · осталось клеток: ${planned.length}`;
      await new Promise(resolve=>{function frame(now){const t=Math.min(1,(now-started)/700);$('marker').setAttribute('transform',markerTransform({x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t}));if(t<1)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});
      const next=move(state,target);if(next===state)break;state=next.ended?next:checkFindings(next);planned.shift();save();render();showRoute();if(state.pending.length||state.ended)break;
    }
    $('hint').textContent=state.pending.length?'Найдена находка. Выберите действие, чтобы продолжить.':`Прибыли · ${travelClock(state).time}. Выберите следующую цель.`;
  }finally{walking=false;planned=[];$('reset').disabled=false;showRoute();renderFindings();}
}
function step(node){
  if(walking||state.ended||state.pending.length||!node?.dataset.q)return;
  const target={q:Number(node.dataset.q),r:Number(node.dataset.r)};
  if(terrainAt(target).blocked){planned=[];showRoute();$('hint').textContent='Вода занимает 90% или больше клетки. Прохода без моста нет.';return;}
  if(planned.length&&distance(planned.at(-1),target)===0){void travel();return;}
  planned=findRoute(state,target,c=>terrainAt(c).blocked,c=>stepMinutes(state,c));showRoute();
  if(!planned.length){$('hint').textContent=distance(state,target)===0?'Группа уже здесь.':'Путь к этой клетке не найден.';return;}
  $('hint').textContent=`Маршрут: ${planned.length} кл. · прибытие ${clock(routeMinutes(state,planned)/20).time}. Нажмите цель ещё раз, чтобы идти.`;
}
$('canvas').addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,base:{...offset},node:e.target,moved:false};$('canvas').setPointerCapture(e.pointerId);});
$('canvas').addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>6)drag.moved=true;if(drag.moved){offset={x:Math.max(-14000,Math.min(14000,drag.base.x-dx/scale)),y:Math.max(-14000,Math.min(14000,drag.base.y-dy/scale))};draw();}});
$('canvas').addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;const d=drag;drag=null;if(!d.moved)step(d.node);});$('canvas').addEventListener('pointercancel',()=>{drag=null;});
$('canvas').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();step(e.target);}});
$('center').onclick=recenter;$('reset').onclick=()=>{if(walking)return;planned=[];showRoute();state=initialState();try{localStorage.removeItem(storage);}catch{}render();recenter();$('hint').textContent='Новый поход · 07:00. Выберите клетку назначения.';};
new ResizeObserver(()=>{width=$('map').clientWidth;height=$('map').clientHeight;scale=width/(7*Math.sqrt(3)*415+80);draw();}).observe($('map'));
render();offset=center(state);







