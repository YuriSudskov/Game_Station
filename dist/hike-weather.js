import {isSafeCell} from './hike-safe-cells.js';
export const WEATHER = [
  {name:'Ясно, солнечно',radiation:-1},
  {name:'Ясно, редкие облака',radiation:0},
  {name:'Пасмурно, вот-вот пойдёт дождь',radiation:1},
  {name:'Мокрый снег, трудно дышать',radiation:2},
];
export function changeWeather(index,random=Math.random){
  if(random()<.4)return index;
  const step=random()<.5?1:2,direction=random()<.5?-1:1;
  const target=index+step*direction;
  return target>=0&&target<WEATHER.length?target:index-step*direction;
}
function entry(state,at,text){const minute=420+at;return {...state,journal:[...(state.journal??[]),{day:Math.floor(minute/1440)+1,time:`${String(Math.floor(minute/60)%24).padStart(2,'0')}:${String(minute%60).padStart(2,'0')}`,text}]};}
export function initializeWeather(state,random=Math.random){
  if(Number.isInteger(state.weatherIndex)&&WEATHER[state.weatherIndex]&&Number.isFinite(state.weatherCheckedMinute))return state;
  const index=Math.floor(random()*WEATHER.length),at=state.elapsedMinutes??0;
  return entry({...state,weatherIndex:index,weatherCheckedMinute:at,baseRadiation:3},at,`Погода: ${WEATHER[index].name}. ${weatherRadiationText(index)}.`);
}
export function advanceWeather(state,until,random=Math.random){
  state=initializeWeather(state,random);const from=state.weatherCheckedMinute;
  if(until<=from)return state;
  for(let day=Math.floor((420+from)/1440);day<=Math.floor((420+until)/1440);day++)for(const minute of [420,780,1080]){
    const at=day*1440+minute-420;if(at<=from||at>until)continue;
    const previous=state.weatherIndex;
    // Each new morning starts with an independent uniform choice.
    const next=minute===420?Math.floor(random()*WEATHER.length):changeWeather(previous,random);
    state=entry({...state,weatherIndex:next},at,next===previous?`Погода сохранилась: ${WEATHER[next].name}. ${weatherRadiationText(next)}.`:`Погода изменилась: ${WEATHER[previous].name} → ${WEATHER[next].name}. ${weatherRadiationText(next)}.`);
  }
  return {...state,weatherCheckedMinute:until};
}
export function weatherRadiationText(index){const delta=WEATHER[index].radiation;return `РАД ${delta>0?'+':''}${delta}`;}
export function cellRadiation(state){if(isSafeCell(state))return 0;const base=state.cellRadiation?.[`${state.q},${state.r}`]??state.baseRadiation??3;return base+(WEATHER[state.weatherIndex]?.radiation??0);}
