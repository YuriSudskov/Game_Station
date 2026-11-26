import {buildingInfo,migrateBuildings} from './hike-buildings.js';
import {TEST_DEPARTURE_MINUTES,searchBuilding} from './hike-map-model.js';
import {renderGuard} from './hike-encounters-ui.js';
import {WEATHER,initializeWeather,cellRadiation,weatherRadiationText} from './hike-weather.js';
import {cells,center,key,distance,initialState,prepareTravel,stepMinutes,routeMinutes,travelClock,isNight,logAction,prepareFindings,checkFindings,resolveFinding,finishHike,startHike,reveal,move,clock,ORIGIN,METRO,MAP_UNITS_PER_METRE} from './hike-map-model.js';
import {terrainAt} from './hike-terrain.js';
import {findRoute} from './hike-route.js';
import {heroConfig,itemName,effectiveMaxHp} from './game.js';
import {MAIN_SAVE_KEY,copySource,mountPreparation} from './hike-preparation.js';
import {FACTIONS} from './hike-factions.js';
import {prepareRadiationZones} from './hike-radiation-zones.js';
import {isSafeCell} from './hike-safe-cells.js';
const $=id=>document.getElementById(id), ns='http://www.w3.org/2000/svg', storage='station-hike-map-prototype-v2';
let state=initialState();
try{const saved=JSON.parse(localStorage.getItem(storage));if(saved&&cells.some(c=>c.q===saved.q&&c.r===saved.r)&&Number.isInteger(saved.steps)&&saved.steps>=0&&Array.isArray(saved.explored))state={...saved,explored:saved.explored.filter(k=>cells.some(c=>key(c.q,c.r)===k))};}catch{}
if(!state.seen&&state.steps===0)state=initialState();
state=prepareRadiationZones(migrateBuildings(initializeWeather(prepareTravel(prepareFindings(reveal(state))))));
if(state.encountersMapVersion!==1){state={...state,...initialState(),heroes:state.heroes,filters:state.filters,prepared:state.prepared,preparing:state.preparing,buildings:{},shops:[],pending:[],journal:[],cellRadiation:state.cellRadiation,encountersMapVersion:1};state=prepareRadiationZones(initializeWeather(state));}
if(state.steps===0&&state.elapsedMinutes===0){state=initializeWeather({...state,elapsedMinutes:TEST_DEPARTURE_MINUTES,weatherIndex:null,weatherCheckedMinute:null,journal:[]});}
save();
let scale=1,offset={x:0,y:0},width=0,height=0,drag=null;
let planned=[],walking=false;
let popup=null,selectedHero=0,searching=false;
function returnFilterReserve(){
  if(!state.reserveFilters)return 0;
  const path=findRoute(state,{q:0,r:0},c=>terrainAt(c).blocked,c=>stepMinutes(state,c));
  if(distance(state,{q:0,r:0})>0&&!path.length)return null;
  return (Math.floor(routeMinutes(state,path)/20)-Math.floor(state.elapsedMinutes/20))*state.heroes.filter(h=>!h.unconscious&&!h.dead).length;
}
function showPreparation(fresh){
  state.preparing=true;save();
  planned=[];popup=null;showRoute();document.body.classList.add('preparing');const root=$('preparation');root.hidden=false;
  let source;
  try{const raw=fresh??JSON.parse(localStorage.getItem('station-hike-source-v1')??'null');source=raw?.copiedAt?raw:copySource(raw??JSON.parse(localStorage.getItem(MAIN_SAVE_KEY)??'null'));localStorage.setItem('station-hike-source-v1',JSON.stringify(source));}
  catch(e){root.replaceChildren();const p=document.createElement('p');p.textContent=e.message;root.append(p);const file=document.createElement('input');file.type='file';file.accept='.json';file.setAttribute('aria-label','Импортировать JSON-сохранение');file.onchange=async()=>{try{showPreparation(JSON.parse(await file.files[0].text()));}catch(error){p.textContent=error.message;}};root.append(file);return;}
  let draft;try{draft=JSON.parse(localStorage.getItem('station-hike-preparation-draft-v1'));}catch{}
  mountPreparation(root,{source,previousDraft:draft,
    onRefresh:raw=>{try{const next=copySource(raw?.heroes?raw:JSON.parse(localStorage.getItem(MAIN_SAVE_KEY)??'null'));localStorage.removeItem('station-hike-preparation-draft-v1');showPreparation(next);}catch(e){root.append(Object.assign(document.createElement('p'),{textContent:e.message}));}},
    onAmmoChange:qty=>{source.ammo=qty;localStorage.setItem('station-hike-source-v1',JSON.stringify(source));showPreparation(source);},
    onStart:loadout=>{state=logAction(prepareTravel(prepareFindings(reveal({...state,...loadout,q:0,r:0,steps:0,elapsedMinutes:TEST_DEPARTURE_MINUTES,pending:[],ended:false,failed:false,prepared:true,preparing:false,weatherIndex:null,weatherCheckedMinute:null,journal:[]}))),'Вышли из Автозаводской. Начали поход.');state=initializeWeather(state);root.hidden=true;document.body.classList.remove('preparing');save();render();recenter();}
  });
}
const nodes=new Map(),tiles=new Map();
function element(tag,attrs){const e=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;}
function renderFindings(){
  const panel=$('map-dialog'),actions=$('hike-actions'),event=state.pending[0];panel.replaceChildren();actions.replaceChildren();
  const blocked=Boolean(event||popup||searching);
  $('map-overlay').hidden=!blocked;$('canvas').inert=blocked;$('reset').disabled=walking||searching||Boolean(event);
  function text(message,parent=panel){const p=document.createElement('p');p.textContent=message;parent.append(p);}
  function button(label,handler,parent=panel){const b=document.createElement('button');b.textContent=label;b.disabled=walking||searching;b.onclick=handler;parent.append(b);}
  function open(kind){popup={kind};renderFindings();}
  button('Инвентарь',()=>open('inventory'),actions);
  if(!event&&!state.ended){
    const minute=(420+state.elapsedMinutes)%1440;
    if(isNight(state)||minute>=1080)button('Искать укрытие',()=>open('shelter'),actions);
    if(!isNight(state)){
      const building=state.buildings?.[key(state.q,state.r)];if(building)button(`${buildingInfo(building.id).name} · ${building.remaining}/${building.total}`,()=>open('building'),actions);
      if(METRO.some(s=>distance(state,s)===0))button('Спуститься в метро',()=>{state=logAction(finishHike(state),'Спустились в метро. Поход завершён.');planned=[];showRoute();save();popup={kind:'ended'};render();},actions);
    }
  }
  if(state.ended)button('Новый поход',()=>showPreparation(),actions);
  if(event?.type==='guard'){
    renderGuard({state,panel,save,render,retreat:()=>{const target=state.previousCell;if(!target)return;const next=move({...state,pending:[]},target);state=logAction(next,'Отступили от Стража на предыдущую клетку.');popup=null;planned=[];}});
  }else if(event?.type==='building'){
    const b=state.buildings[event.cell],info=buildingInfo(b.id);text('Нашли: '+info.name);buildingImage(info);text('Доступно поисков: '+b.remaining+' · по 40 минут.');
    button('Войти в здание',()=>{state=resolveFinding(state,'leave');popup={kind:'building'};save();render();});
    button('Оставить и вернуться позже',()=>{state=logAction(resolveFinding(state,'leave'),'Оставили здание для осмотра позже.');save();render();});
  }else if(event){
    const title=document.createElement('h2');title.textContent=event.type==='shop'?'Мы нашли разрушенный магазин':'Останки сталкера';panel.append(title);
    const illustration=element('svg',{viewBox:'0 0 400 130',class:'finding-art','aria-label':event.type==='shop'?'Схема разрушенного магазина':'Схема останков сталкера',role:'img'});
    illustration.innerHTML=event.type==='shop'?'<path d="M45 115V48L170 22L200 43L228 16L350 50V115M40 48H170L190 67L210 48H357M70 115V70H130V115M150 78H195V110H150M245 70H320V108H245M25 118H370M100 30L125 18L143 29M208 115L225 90L238 113"/>':'<path d="M25 110L80 92L135 112L185 98L235 113L290 93L370 111M105 83L143 66L191 75L220 91L265 88M155 68L144 45L177 38L196 63M220 90L247 109M117 80L87 100M201 76L213 59L240 62"/>';
    panel.append(illustration);text(event.type==='shop'?'Магазин останется отмечен на карте. Можно вернуться к нему позже.':'Свежие останки растерзанного сталкера. Обыскать или не трогать?');
    const choose=choice=>{state=resolveFinding(state,choice);let message=event.type==='shop'?'Нашли разрушенный магазин. Оставили, чтобы вернуться позже.':'Не стали трогать останки сталкера.';
      if(choice==='search'){const result=state.lastSearch;message=`Обыскали останки: поиск ${result.roll} + ${result.bonus} против ${result.dc}. ${result.reward?'Найдено: '+result.reward.name+'.':'Ничего не нашли.'}`;popup={kind:'result',text:message};}
      state=logAction(state,message);save();render();};
    if(event.type==='remains')button('Обыскать · поиск 10',()=>choose('search'));
    button(event.type==='shop'?'Оставить и вернуться позже':'Не трогать',()=>choose('leave'));
  }else if(popup){
    if(popup.kind==='inventory'){
      const h=state.heroes[selectedHero]??state.heroes[0];text('Инвентарь группы');text(`Фильтры: ${state.filters}. Занимают ${Math.ceil(state.filters/20)} яч. (20 на ячейку).`);
      for(let i=0;i<state.heroes.length;i++)button(state.heroes[i].name,()=>{selectedHero=i;renderFindings();});
      text(`${h.name} · уровень ${h.level} · ${h.hp}/${effectiveMaxHp(h)} HP · Облучение ${h.radiation??0}${h.unconscious?' · без сознания':''}`);
      text([h.weapon?itemName({item:h.weapon,...h.weaponDetails}):null,h.rangedWeapon?itemName({item:h.rangedWeapon,...h.rangedWeaponDetails}):null,h.body?itemName({item:h.body,...h.bodyDetails}):null].filter(Boolean).join(' · '));
      text(`Бинты: ${h.bandages??0}, аптечки: ${h.medicKits??0}, врачебные наборы: ${h.doctorKits??0}. Гранаты: ${h.grenades??0}, Молотовы: ${h.molotovs??0}.`);
      text('Найдено: '+(state.rewards?.map(r=>r.name).join(', ')||'пока ничего'));
      text('Припасы в сумке: '+((state.cargo??[]).filter(r=>!r.item.startsWith('$')).map(r=>`${itemName(r)} ×${r.qty}`).join(', ')||'нет'));
      text(`Общие патроны: ${state.ammo??0}`);
      text('Применение припасов и смена снаряжения — Скоро.');
     }else if(popup.kind==='building'){
      const b=state.buildings?.[key(state.q,state.r)],info=buildingInfo(b.id);text(info.name);buildingImage(info);
      text('Осталось поисков: '+b.remaining+' из '+b.total);
      if(searching){text('Идёт поиск…');const progress=document.createElement('div');progress.className='building-search-progress';progress.innerHTML='<span></span>';panel.append(progress);}
      else {if(state.failed)text('Группа погибла без фильтров.');else if(popup.searched)text('Ничего не нашли.');if(b.remaining>0&&!isNight(state)&&!state.ended)button(popup.searched?'Продолжать поиск · 40 минут':'Искать · 40 минут',async()=>{
        const next=searchBuilding(state);if(next===state)return;state=next;searching=true;save();render();await new Promise(r=>setTimeout(r,4000));searching=false;popup={kind:'building',searched:true};render();
      });else text(isNight(state)?'Ночью поиск недоступен.':'Все доступные места осмотрены.');}
    }
    else if(popup.kind==='shelter')text('Поиск укрытия — Скоро. Условия ночлега ещё не настроены.');
    else if(popup.kind==='ended')text('Поход завершён. Группа спустилась в метро.');
    else text(popup.text);
    button(popup.kind==='building'?'Покинуть здание':'Закрыть',()=>{popup=null;renderFindings();});
  }
  renderJournal();
  function buildingImage(info){const img=document.createElement('img');img.src='hike-building-icons/'+info.id+'.svg';img.alt=info.name;img.width=112;img.height=112;panel.append(img);}
}
function renderJournal(){
  const journal=$('journal'),atBottom=journal.scrollHeight-journal.scrollTop-journal.clientHeight<30;journal.replaceChildren();
  for(const entry of state.journal??[]){const line=document.createElement('p');line.textContent=`День ${entry.day} · ${entry.time} — ${entry.text}`;journal.append(line);}
  if(!state.journal?.length){const line=document.createElement('p');line.textContent='Здесь появятся записи о движении и находках.';journal.append(line);}
  if(atBottom)journal.scrollTop=journal.scrollHeight;
}
for(const cell of cells){const p=center(cell);const points=Array.from({length:6},(_,i)=>{const a=(60*i-30)*Math.PI/180;return `${p.x+415*Math.cos(a)},${p.y+415*Math.sin(a)}`;}).join(' ');const node=element('polygon',{points,tabindex:'-1','data-q':cell.q,'data-r':cell.r});nodes.set(key(cell.q,cell.r),node);$('hexes').append(node);}
const metroLabels=new Map();
for(const station of METRO){const id=key(station.q,station.r),previous=metroLabels.get(id);if(previous){previous.names.add(station.name);previous.grey=previous.grey&&station.grey;if(station.faction)previous.factions.add(station.faction);}else metroLabels.set(id,{...station,names:new Set([station.name]),factions:new Set(station.faction?[station.faction]:[])});}
for(const station of metroLabels.values()){
  const p=center(station),group=element('g',{transform:`translate(${p.x},${p.y})`,'pointer-events':'none','aria-hidden':'true'});
  const icon=element('path',{d:'M-220 80H-80V25H-110L-72 -90L0 60L72 -90L110 25H80V80H220V25H188L108 -210L0 -15L-108 -210L-188 25H-220Z',fill:!station.grey?'#58df82':station.factions.has('hansa')?FACTIONS.hansa.marker:'#a2aaa4',stroke:'#132a1e','stroke-width':14,'stroke-linejoin':'round'});
  const label=element('text',{x:0,y:230,'text-anchor':'middle','font-size':86,fill:'#e5efd6',stroke:'#17241e','stroke-width':18,'paint-order':'stroke'});label.textContent=[...station.names].join(' / ');
  group.append(icon,label);$('hexes').append(group);
  if(station.factions.size){const factionLabel=element('text',{x:0,y:325,'text-anchor':'middle','font-size':75,fill:'#d2c4a9',stroke:'#17241e','stroke-width':16,'paint-order':'stroke'});factionLabel.textContent=[...station.factions].map(id=>FACTIONS[id].name).join(' / ');group.append(factionLabel);}
}
function render(){
  const t=travelClock(state);$('clock').innerHTML=`<b>${t.time}</b>День ${t.day} · ${t.period} · ход ${state.steps}`;document.body.dataset.period=t.period;
  $('party').replaceChildren();
  for(const hero of state.heroes){
    const card=document.createElement('div'),title=document.createElement('div'),bar=document.createElement('div'),fill=document.createElement('div'),details=document.createElement('div');
    const protection=heroConfig({heroes:state.heroes},hero,'surface').hero.radiationProtection??0;
    title.textContent=`${hero.name} · ур. ${hero.level} · РАД ${protection} · Облучение ${hero.radiation??0}`;
    bar.className='hike-health';bar.setAttribute('role','progressbar');bar.setAttribute('aria-label',`${hero.name}: здоровье, максимум с учётом облучения ${effectiveMaxHp(hero)}`);bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax',String(effectiveMaxHp(hero)));bar.setAttribute('aria-valuenow',String(Math.max(0,hero.hp)));bar.title=`Здоровье ${Math.round(hero.hp)} / ${Math.round(effectiveMaxHp(hero))}, облучение ${hero.radiation??0}`;
    fill.style.width=`${Math.max(0,Math.min(100,hero.hp/(hero.maxHp||1)*100))}%`;bar.append(fill);
    const blocked=document.createElement('span');blocked.className='hike-radiation-loss';blocked.style.width=`${Math.max(0,(1-effectiveMaxHp(hero)/(hero.maxHp||1))*100)}%`;bar.append(blocked);
    details.textContent=[hero.weapon?itemName({item:hero.weapon,...hero.weaponDetails}):null,hero.rangedWeapon?itemName({item:hero.rangedWeapon,...hero.rangedWeaponDetails}):null].filter(Boolean).join(' / ');
    if(hero.unconscious)details.textContent+=' · Без сознания';card.append(title,bar,details);$('party').append(card);
  }
  const reserve=returnFilterReserve();
  const minute=(420+state.elapsedMinutes)%1440,evening=minute>=1080&&minute<1200;
  $('map').classList.toggle('evening',evening);$('evening-warning').hidden=!evening;
  $('weather').textContent=isSafeCell(state)?`${WEATHER[state.weatherIndex].name} · защищённая клетка · РАД 0`:`${WEATHER[state.weatherIndex].name} · ${weatherRadiationText(state.weatherIndex)} · база ${state.cellRadiation?.[key(state.q,state.r)]??state.baseRadiation??3} РАД`;
  $('supplies').textContent=`Фильтры: ${state.filters} · патроны: ${state.ammo??0} · скорость: ${state.speed} мин${state.reserveFilters?` · резерв: ${reserve??'путь не найден'} · доступно: ${reserve===null?'—':Math.max(0,state.filters-reserve)}`:''}${reserve!==null&&reserve>0&&state.filters<=reserve?' · Пора возвращаться!':''}`;
  const radiation=cellRadiation(state);
  const lowFilters=reserve!==null&&state.filters<10+reserve;
  const irradiated=state.heroes.filter(h=>!h.dead&&h.hp>0&&!h.unconscious).filter(h=>{const config=heroConfig({heroes:state.heroes},h,'surface').hero;return Math.max(0,(config.halveRadiation?Math.floor(radiation/2):radiation)-(config.radiationProtection??0))>0;});
  $('map').classList.toggle('low-filters',lowFilters);$('map').classList.toggle('radiation-warning',irradiated.length>0);
  $('return-warning').hidden=!lowFilters;
  $('radiation-warning').hidden=!irradiated.length;$('radiation-warning').textContent=irradiated.length?`Радиация превышает защиту: ${irradiated.map(h=>h.name).join(', ')}`:'';
  $('position').textContent=`${state.q===0&&state.r===0?'Автозаводская':`Клетка ${state.q}, ${state.r}`} · РАД ${radiation}`;
  const explored=new Set(state.explored),seen=new Set(state.seen);$('terrain-labels').replaceChildren();
  for(const c of cells){
    const id=key(c.q,c.r),node=nodes.get(id),near=distance(state,c)===1,terrain=terrainAt(c),visible=seen.has(id)||explored.has(id);
    node.setAttribute('class',`hex${explored.has(id)?' open':seen.has(id)?' mist':''}${near&&!terrain.blocked?' reachable':''}${distance(state,c)===0?' current':''}${visible&&terrain.water?' water':''}${visible&&terrain.coast?' coast':''}${visible&&terrain.bridge?' bridge':''}`);
    node.setAttribute('tabindex','0');node.setAttribute('role','button');
    node.setAttribute('aria-label',`${METRO.find(s=>s.q===c.q&&s.r===c.r)?.name??`Клетка ${c.q}, ${c.r}`} · ${explored.has(id)?'разведана':seen.has(id)?'видна в дымке':'неизвестна'}${visible&&terrain.label?' · '+terrain.label:''}`);
    if(visible&&terrain.label){const p=center(c),label=element('text',{x:p.x,y:p.y+130,'text-anchor':'middle','font-size':90,fill:terrain.bridge?'#f5dca0':'#b6d1d9',stroke:'#17241e','stroke-width':18,'paint-order':'stroke'});label.textContent=terrain.bridge?'Мост':terrain.water?'Вода':'Берег';$('terrain-labels').append(label);}
    if(visible&&(state.cellRadiation?.[id]??3)>3){node.classList.add('hot-zone');const p=center(c),label=element('text',{x:p.x,y:p.y-280,'text-anchor':'middle','font-size':85,fill:'#e3ec91',stroke:'#17241e','stroke-width':20,'paint-order':'stroke'});label.textContent=`РАД ${cellRadiation({...state,q:c.q,r:c.r})}`;$('terrain-labels').append(label);}
  }
  for(const [id,b] of Object.entries(state.buildings??{})){const [q,r]=id.split(',').map(Number),p=center({q,r}),info=buildingInfo(b.id);if(!info)continue;
    const img=element('image',{href:'hike-building-icons/'+info.id+'.svg',x:p.x-180,y:p.y-220,width:360,height:360,'pointer-events':'none'});$('terrain-labels').append(img);
    const label=element('text',{x:p.x,y:p.y+210,'text-anchor':'middle','font-size':72,fill:'#f0d194',stroke:'#17241e','stroke-width':16,'paint-order':'stroke'});label.textContent=info.name+' · '+b.remaining+'/'+b.total;$('terrain-labels').append(label);
  }
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
  let previous=center(state);
  for(const c of planned){const p=center(c),dx=p.x-previous.x,dy=p.y-previous.y,length=Math.hypot(dx,dy);
    for(let i=1;i<=8;i++){const t=i/8,bend=Math.sin(t*Math.PI)*45;$('route').append(element('circle',{cx:previous.x+dx*t-dy/length*bend,cy:previous.y+dy*t+dx/length*bend,r:16,fill:'#f3df92',stroke:'#1c3024','stroke-width':7}));}previous=p;
  }
  if(planned.length){const target=center(planned.at(-1)),arrival=clock(routeMinutes(state,planned)/20),text=`${arrival.day>travelClock(state).day?'Д'+arrival.day+' ':''}${arrival.time}`,width=text.length*72+65;
    const frame=element('rect',{x:target.x-width/2,y:target.y-265,width,height:170,rx:24,fill:'#1b2824','fill-opacity':'.96',stroke:'#819071','stroke-width':10});
    const label=element('text',{x:target.x,y:target.y-143,'text-anchor':'middle','font-size':118,'font-weight':'bold',fill:'#fff0ae'});label.textContent=text;$('route').append(frame,label);
  }
}
async function travel(){
  if(walking||state.ended||state.pending.length||popup||!planned.length)return;walking=true;$('reset').disabled=true;
  try{
    while(planned.length){const target=planned[0];if(terrainAt(target).blocked)break;
      const from=center(state),to=center(target),started=performance.now();
      $('hint').textContent=`В пути · осталось клеток: ${planned.length}`;
      await new Promise(resolve=>{function frame(now){const t=Math.min(1,(now-started)/700);$('marker').setAttribute('transform',markerTransform({x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t}));if(t<1)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});
      const next=move(state,target);if(next===state)break;state=next.ended?next:checkFindings(next);planned.shift();const finding=state.pending[0],terrain=terrainAt(state);state=logAction(state,state.failed?'Группа погибла без фильтров.':finding?.type==='building'?'Обнаружили здание.':finding?.type==='remains'?'Мы нашли свежие останки растерзанного сталкера.':terrain.bridge?'Вышли на полуразрушенный мост.':isNight(state)?'Продолжили путь в темноте. Разведка невозможна.':'Вокруг одни развалины. Ничего не нашли.');save();render();showRoute();if(state.pending.length||state.ended)break;
    }
    $('hint').textContent=state.pending.length?'Найдена находка. Выберите действие, чтобы продолжить.':`Прибыли · ${travelClock(state).time}. Выберите следующую цель.`;
  }finally{walking=false;planned=[];$('reset').disabled=false;showRoute();renderFindings();}
}
function step(node){
  if(walking||state.ended||state.pending.length||popup||!node?.dataset.q)return;
  const target={q:Number(node.dataset.q),r:Number(node.dataset.r)};
  if(terrainAt(target).blocked){planned=[];showRoute();$('hint').textContent='Вода занимает 90% или больше клетки. Прохода без моста нет.';return;}
  if(distance(state,target)===1){planned=[target];void travel();return;}
  if(planned.length&&distance(planned.at(-1),target)===0){void travel();return;}
  planned=findRoute(state,target,c=>terrainAt(c).blocked,c=>stepMinutes(state,c));showRoute();
  if(!planned.length){$('hint').textContent=distance(state,target)===0?'Группа уже здесь.':'Сначала разведайте первую неизвестную клетку. Маршрут через неизвестные клетки недоступен.';return;}
  $('hint').textContent=`Маршрут: ${planned.length} кл. · прибытие ${clock(routeMinutes(state,planned)/20).time}. Нажмите цель ещё раз, чтобы идти.`;
}
$('canvas').addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,base:{...offset},node:e.target,moved:false};$('canvas').setPointerCapture(e.pointerId);});
$('canvas').addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>6)drag.moved=true;if(drag.moved){offset={x:Math.max(-24000,Math.min(24000,drag.base.x-dx/scale)),y:Math.max(-24000,Math.min(24000,drag.base.y-dy/scale))};draw();}});
$('canvas').addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;const d=drag;drag=null;if(!d.moved)step(d.node);});$('canvas').addEventListener('pointercancel',()=>{drag=null;});
$('canvas').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();step(e.target);}});
$('center').onclick=recenter;$('reset').onclick=()=>{if(walking||state.pending.length)return;showPreparation();};
new ResizeObserver(()=>{width=$('map').clientWidth;height=$('map').clientHeight;scale=width/(7*Math.sqrt(3)*415+80);draw();}).observe($('map'));
render();offset=center(state);
if(!state.prepared||state.preparing)showPreparation();

















