import {TERRAIN} from './hike-terrain-data.js';
export function classifyTerrain({waterFraction=0,bridge=false}={}){
  const water=waterFraction>=.9,coast=!water&&waterFraction>=.2;
  return {waterFraction,bridge,water,coast,blocked:water&&!bridge,label:bridge?'Мост':water?'Вода · проход закрыт':coast?'Берег':''};
}
export function terrainAt(cell){return classifyTerrain(TERRAIN[`${cell.q},${cell.r}`]);}
