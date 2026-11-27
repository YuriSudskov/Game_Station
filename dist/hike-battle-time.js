import {applyTimedRadiation} from './hike-radiation.js';
import {advanceWeather} from './hike-weather.js';
export function settleBattleTime(s){
 const e=s.pending?.[0];if(!e?.combat||e.aftermathCharged||!(e.searched||e.healed))return false;
 e.aftermathCharged=true;Object.assign(s,applyTimedRadiation(s,20));
 const end=s.elapsedMinutes+20;let spent=0;for(const h of s.heroes){if(h.dead||h.hp<=0||h.unconscious)continue;if(s.filters>0){s.filters--;spent++;}else h.unconscious=true;}
 s.spentFilters=(s.spentFilters??0)+spent;Object.assign(s,advanceWeather(s,end),{elapsedMinutes:end});
 if(s.rest&&end>=s.rest.end)s.rest.done=true;
 return true;
}
