import {terrainAt} from './hike-terrain.js';
import {LEVEL5_REWARDS} from './hike-rewards.js';
import {TEST_HEROES} from './hike-party.js';
export const RADIUS = 15;
export const HEX_RADIUS = 415; // drawing units; keep the visible hex size unchanged
export const MAP_UNITS_PER_METRE = 3;
export const HEX_DIAMETER_METRES = 2*HEX_RADIUS/MAP_UNITS_PER_METRE;
export const ORIGIN = {lat:55.7074,lon:37.6576};
export const key = (q,r) => `${q},${r}`;
export const distance = (a,b={q:0,r:0}) => Math.max(Math.abs(a.q-b.q),Math.abs(a.r-b.r),Math.abs(a.q+a.r-b.q-b.r));
export const cells = Array.from({length:31},(_,i)=>i-15).flatMap(q=>Array.from({length:31},(_,i)=>({q,r:i-15}))).filter(c=>distance(c)<=RADIUS);
export const center = ({q,r}) => ({x:HEX_RADIUS*Math.sqrt(3)*(q+r/2),y:HEX_RADIUS*1.5*r});
// Use the same local Web Mercator ground scale as the raster underlay.
export function geographicCell(lat,lon){
  const scale=6378137*Math.cos(ORIGIN.lat*Math.PI/180)*MAP_UNITS_PER_METRE;
  const x=scale*(lon-ORIGIN.lon)*Math.PI/180;
  const y=scale*(Math.asinh(Math.tan(ORIGIN.lat*Math.PI/180))-Math.asinh(Math.tan(lat*Math.PI/180)));
  const r=y/(HEX_RADIUS*1.5),q=x/(HEX_RADIUS*Math.sqrt(3))-r/2;
  return cells.reduce((best,c)=>{const p=center(c),b=center(best);return (p.x-x)**2+(p.y-y)**2<(b.x-x)**2+(b.y-y)**2?c:best;},cells[0]);
}
export const METRO = [
  {name:'Автозаводская',lat:ORIGIN.lat,lon:ORIGIN.lon},
  {name:'Технопарк',lat:55.693624,lon:37.664439},
  {name:'Коломенская',lat:55.678483,lon:37.663924},
].map(station=>({...station,...geographicCell(station.lat,station.lon)}));
export const START_AREA=cells.filter(c=>distance(c)<=2).map(c=>key(c.q,c.r));
export function initialState(){return {q:0,r:0,steps:0,elapsedMinutes:0,speed:10,filters:100,heroes:structuredClone(TEST_HEROES),checked:[...START_AREA],shops:[],pending:[],ended:false,explored:[...new Set([...START_AREA,...METRO.map(c=>key(c.q,c.r))])],seen:[...new Set([...START_AREA,...METRO.map(c=>key(c.q,c.r))])]};}
export function prepareTravel(state){return {...state,elapsedMinutes:state.elapsedMinutes??state.steps*20,speed:state.speed??10,filters:state.filters??100,heroes:state.heroes??structuredClone(TEST_HEROES),explored:[...new Set([...state.explored,...START_AREA])],checked:[...new Set([...(state.checked??state.explored),...START_AREA])],shops:(state.shops??[]).filter(id=>!START_AREA.includes(id)),pending:(state.pending??[]).filter(e=>!START_AREA.includes(e.cell))};}
export function stepMinutes(state,target){return Math.max(1,Math.round((state.speed??10)*(state.explored.includes(key(target.q,target.r))?1:2)));}
export function routeMinutes(state,path){let minutes=state.elapsedMinutes??state.steps*20;const explored=new Set(state.explored);for(const cell of path){minutes+=stepMinutes({...state,explored:[...explored]},cell);if(!isNight({elapsedMinutes:minutes}))explored.add(key(cell.q,cell.r));}return minutes;}
export function travelClock(state){return clock((state.elapsedMinutes??state.steps*20)/20);}
export function isNight(state){return travelClock(state).period==='Ночь';}
export function prepareFindings(state){return {...state,checked:state.checked??[...state.explored],shops:state.shops??[],pending:state.pending??[],rewards:state.rewards??[],ended:state.ended??false};}
export function checkFindings(state,random=Math.random){
  if(isNight(state))return state;
  state=prepareFindings(state);const id=key(state.q,state.r);
  if(state.checked.includes(id))return state;
  const roll=random(),shop=roll<.15,remains=roll>=.15&&roll<.25;
  return {...state,checked:[...state.checked,id],shops:shop?[...new Set([...state.shops,id])]:state.shops,pending:[...(shop?[{type:'shop',cell:id}]:[]),...(remains?[{type:'remains',cell:id}]:[])]};
}
export function resolveFinding(state,choice,random=Math.random){
  const event=state.pending?.[0];if(!event||isNight(state))return state;
  if(event.type==='shop'&&choice!=='leave'||event.type==='remains'&&!['search','leave'].includes(choice))return state;
  if(event.type==='remains'&&choice==='search'){
    const roll=1+Math.floor(random()*20),bonus=state.searchBonus??0,success=roll+bonus>=10;
    const reward=success?{...LEVEL5_REWARDS[Math.floor(random()*LEVEL5_REWARDS.length)]}:null;
    return {...state,pending:state.pending.slice(1),lastSearch:{roll,bonus,dc:10,success,reward},rewards:[...(state.rewards??[]),...(reward?[reward]:[])]};
  }
  return {...state,pending:state.pending.slice(1)};
}
export function finishHike(state){if(state.ended||isNight(state)||state.pending?.length||!METRO.some(s=>distance(state,s)===0))return state;return {...state,ended:true};}
export function startHike(state){if(!state.ended)return state;return reveal({...state,q:0,r:0,steps:0,elapsedMinutes:0,filters:100,heroes:structuredClone(TEST_HEROES),ended:false,failed:false,pending:[]});}
export function reveal(state){
  const defaults=initialState();
  return {...state,explored:[...new Set([...state.explored,...defaults.explored])],seen:[...new Set([...defaults.seen,...(state.seen??[]),...state.explored,...cells.filter(c=>distance(c,state)<=1).map(c=>key(c.q,c.r))])]};
}
export function move(state,target){
  if(state.ended||state.pending?.length||distance(state,target)!==1||distance(target)>RADIUS||terrainAt(target).blocked)return state;
  const before=state.elapsedMinutes??state.steps*20,elapsedMinutes=before+stepMinutes(state,target);
  let filters=state.filters??100,heroes=structuredClone(state.heroes??TEST_HEROES);
  for(let tick=Math.floor(before/20);tick<Math.floor(elapsedMinutes/20);tick++)for(const hero of heroes){if(hero.unconscious)continue;if(filters>0)filters--;else hero.unconscious=true;}
  const failed=heroes.every(h=>h.unconscious);
  const night=isNight({elapsedMinutes});
  return reveal({...state,...target,steps:state.steps+1,elapsedMinutes,filters,heroes,failed,ended:failed,deathCell:failed?key(target.q,target.r):state.deathCell,explored:night?state.explored:[...new Set([...state.explored,key(target.q,target.r)])]});
}
export function clock(steps){const minutes=420+Math.round(steps*20);return {day:Math.floor(minutes/1440)+1,time:`${String(Math.floor(minutes/60)%24).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`,period:minutes%1440<420?'Ночь':minutes%1440<480?'Рассвет':minutes%1440<1140?'День':minutes%1440<1200?'Закат':'Ночь'};}



