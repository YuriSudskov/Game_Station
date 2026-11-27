export const BUNKER42_CELL='7,-18';
export function prepareUniqueSites(state){
 const previous=state.shelters?.[BUNKER42_CELL];
 const bunker={...previous,unique:true,name:'Бункер42',description:'Уникальное укрытие. Тайный вход в метро — Скоро.',defenseTier:4,airTier:4,defense:{roll:21,bonus:0,total:21},air:{roll:21,bonus:0,total:21}};
 const buildings={...state.buildings};delete buildings[BUNKER42_CELL];
 return {...state,buildings,shelters:{...state.shelters,[BUNKER42_CELL]:bunker},pending:(state.pending??[]).filter(e=>!(e.cell===BUNKER42_CELL&&['building','shop'].includes(e.type)))};
}
