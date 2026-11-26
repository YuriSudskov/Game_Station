import {BUILDINGS,BUILDING_CHANCE} from './hike-buildings-data.js';
export const buildingInfo=id=>BUILDINGS.find(b=>b.id===id);
export function migrateBuildings(state){
 const buildings={...state.buildings};
 for(const cell of state.shops??[])if(!buildings[cell])buildings[cell]={id:'OBJ004',total:2,remaining:2};
 return {...state,buildings,shops:[],pending:(state.pending??[]).map(e=>e.type==='shop'?{...e,type:'building'}:e)};
}
export function rollBuilding(random=Math.random){
 if(random()>=BUILDING_CHANCE)return null;
 let roll=random(),info=BUILDINGS.at(-1);
 for(const b of BUILDINGS){roll-=b.chance;if(roll<0){info=b;break;}}
 const [min,max=min]=String(info.searches).split(/[-–]/).map(Number);
 const total=min+Math.floor(random()*(max-min+1));
 return {id:info.id,total,remaining:total};
}
