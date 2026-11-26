// Station hexes for the current 830/3 m grid centered on Avtozavodskaya.
export const SAFE_CELL_KEYS=['0,0','-2,7'];
export const isSafeCell=cell=>SAFE_CELL_KEYS.includes(`${cell.q},${cell.r}`);
export function cleanSafeCells(state){
  state={...state,buildings:Object.fromEntries(Object.entries(state.buildings??{}).filter(([id])=>!SAFE_CELL_KEYS.includes(id)))};
  return {...state,cellRadiation:{...state.cellRadiation,...Object.fromEntries(SAFE_CELL_KEYS.map(id=>[id,0]))},checked:[...new Set([...(state.checked??[]),...SAFE_CELL_KEYS])],shops:(state.shops??[]).filter(id=>!SAFE_CELL_KEYS.includes(id)),pending:(state.pending??[]).filter(e=>!SAFE_CELL_KEYS.includes(e.cell))};
}
