import {heroConfig,effectiveMaxHp} from './game.js';
import {scientistRadiationReduction} from './scientist.js';
import {cellRadiation} from './hike-weather.js';
export function applyDepartureRadiation(state,random=Math.random){
  const heroes=structuredClone(state.heroes),active=heroes.filter(h=>!h.dead&&h.hp>0&&!h.unconscious);
  const reduction=scientistRadiationReduction(active,random),level=cellRadiation(state),results=[];
  for(const hero of active){const config=heroConfig({heroes},hero,'surface').hero;
    const received=Math.max(0,(config.halveRadiation?Math.floor(level/2):level)-(config.radiationProtection??0)-reduction);
    hero.radiation=(hero.radiation??0)+received;hero.hp=Math.min(hero.hp,effectiveMaxHp(hero));
    results.push({heroId:hero.id,name:hero.name,received,total:hero.radiation,maxHp:effectiveMaxHp(hero)});
  }
  const exposed=results.filter(r=>r.received>0),minute=420+(state.elapsedMinutes??0);
  const journal=exposed.length?[...(state.journal??[]),{day:Math.floor(minute/1440)+1,time:`${String(Math.floor(minute/60)%24).padStart(2,'0')}:${String(minute%60).padStart(2,'0')}`,text:`Покидаем клетку ${state.q}, ${state.r}: фон ${level} РАД. ${exposed.map(r=>`${r.name}: +${r.received} облучения, максимум здоровья ${Math.round(r.maxHp)}`).join('; ')}.`}]:state.journal;
  return {...state,heroes,journal,lastRadiation:{cell:`${state.q},${state.r}`,level,results}};
}
