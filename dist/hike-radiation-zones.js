import {cells,key} from './hike-map-model.js';
import {cleanSafeCells,isSafeCell} from './hike-safe-cells.js';
// Temporary prototype settings, not the future full generation rules.
export const ZONE_CHANCE=.1;
export const ZONE_BASE_RADIATION=6;
export function prepareRadiationZones(state,random=Math.random){
  if(state.radiationZonesVersion===1)return cleanSafeCells(state);
  const radiation={...state.cellRadiation};
  for(const cell of cells){const id=key(cell.q,cell.r);if(!isSafeCell(cell)&&radiation[id]===undefined&&random()<ZONE_CHANCE)radiation[id]=ZONE_BASE_RADIATION;}
  return cleanSafeCells({...state,cellRadiation:radiation,radiationZonesVersion:1});
}
