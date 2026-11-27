import {advanceWeather} from './hike-weather.js';
import {heroConfig,levelUp} from './game.js';
import {startGuardBattle} from './hike-encounters.js';
import {TECHNOPARK} from './data.js';
import {effectiveMaxHp} from './game.js';
import {findRoute} from './hike-route.js';
import {terrainAt} from './hike-terrain.js';
import {resolveRestTasks} from './hike-rest-tasks.js';
import {applyTimedRadiation} from './hike-radiation.js';
export const SHELTER_DCS=[12,14,16,18,21],AIR=[.5,.4,.3,.2,0],ATTACK=[.1,.08,.06,.05,0];
const active=s=>s.heroes.filter(h=>!h.dead&&!h.unconscious&&h.hp>0);
const minute=s=>(420+s.elapsedMinutes)%1440;
const tier=n=>n<12?-1:n<14?0:n<16?1:n<18?2:n<21?3:4;
const note=(s,text)=>{const m=420+s.elapsedMinutes;(s.journal??=[]).push({day:Math.floor(m/1440)+1,time:`${String(Math.floor(m/60)%24).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`,text});};
function advance(s,minutes){const next=advanceWeather(s,s.elapsedMinutes+minutes);Object.assign(s,next,{elapsedMinutes:s.elapsedMinutes+minutes});}
function check(s,h,attribute,random){const c=heroConfig({heroes:s.heroes},h,'surface').hero;const roll=1+Math.floor(random()*20),bonus=(c[attribute]??0)+(attribute==='perception'?(c.perceptionCheckBonus??0)+(c.detectionBonus??0):0)-(c.checkPenalty??0);return {roll,bonus,total:roll+bonus};}
export function searchShelter(s,random=Math.random){
 if(s.ended||s.pending?.length||s.rest||minute(s)>=420&&minute(s)<1080)return false;
 Object.assign(s,applyTimedRadiation(s,20));
 const n=active(s).length,beforeFilters=s.filters,spent=active(s);for(const h of spent){if(s.filters>0)s.filters--;else h.unconscious=true;}
 advance(s,20);s.shelterSearch=spent.map(h=>{const defense=check(s,h,'perception',random),air=check(s,h,'perception',random);return {heroId:h.id,name:h.name,defense,air,defenseTier:tier(defense.total),airTier:tier(air.total)};});
 s.spentFilters=(s.spentFilters??0)+beforeFilters-s.filters;
 note(s,'Искали укрытие 20 минут. Фильтры: −'+(beforeFilters-s.filters)+'.');
 if(!active(s).length){s.failed=s.ended=true;s.deathCell=`${s.q},${s.r}`;}
 return true;
}
export function chooseShelter(s,index){const found=s.shelterSearch?.[index];if(!found||found.defenseTier<0||found.airTier<0)return; s.selectedShelter=structuredClone(found);s.shelterAssignments={};}
export function saveShelter(s){const f=s.selectedShelter;if(!f||f.defense.total<16||f.air.total<16||s.shelters?.[`${s.q},${s.r}`]?.unique)return; (s.shelters??={})[`${s.q},${s.r}`]=structuredClone(f);note(s,'Сохранили укрытие на карте.');}
export function sleepMinutes(s){const m=minute(s);return m<420?420-m:1440-m+420;}
export function sleepCost(s){return Math.floor(sleepMinutes(s)/20*active(s).length*AIR[s.selectedShelter?.airTier??0]);}
export function startRest(s){if(s.ended||minute(s)>=420&&minute(s)<1080||!s.selectedShelter||s.rest||s.pending?.length||s.filters<sleepCost(s)||!active(s).length)return false;const end=s.elapsedMinutes+sleepMinutes(s);s.rest={end,prepared:false,spentExact:0,charged:0,shelter:structuredClone(s.selectedShelter),assignments:{...s.shelterAssignments}};note(s,'Начали ночлег. Первый час — подготовка.');return true;}
export function restHour(s,random=Math.random){
 const rest=s.rest;if(!rest||s.pending?.length||rest.done)return false;
 const duration=Math.min(60,rest.end-s.elapsedMinutes),before=s.elapsedMinutes;
 const exact=rest.spentExact+duration/20*active(s).length*AIR[rest.shelter.airTier],charge=Math.floor(exact)-rest.charged;
 if(s.filters<charge){rest.shortage=true;return false;}
 s.filters-=charge;rest.spentExact=exact;rest.charged+=charge;advance(s,duration);
 s.spentFilters=(s.spentFilters??0)+charge;
 if(!rest.prepared&&duration===60){
  resolveRestTasks(s,random);
  rest.prepared=true;
 }
 note(s,`Ночлег: прошло ${duration} мин., фильтры −${charge}.`);
 const at=minute(s),night=at>=1200||at<=420;
 if(night&&duration===60&&random()<ATTACK[rest.shelter.defenseTier]){s.pending=[{type:'guard',cell:`${s.q},${s.r}`,night:true,phase:'nightAlarm',guard:structuredClone(TECHNOPARK.enemy)}];note(s,'На укрытие напали Стражи.');}
 if(s.elapsedMinutes>=rest.end){rest.done=true;note(s,'Наступило утро. Ночлег завершён.');}
 return s.elapsedMinutes>before;
}
export function barricade(s){if(!s.selectedShelter||s.pending?.length)return;const cell=`${s.q},${s.r}`;(s.strandedGroups??=[]).push({cell,heroes:structuredClone(s.heroes),cargo:structuredClone(s.cargo??[]),ammo:s.ammo??0});s.ended=true;s.barricaded=true;s.rest=null;note(s,'Отряд забаррикадировался и ожидает помощи.');}
export function rescueCost(s){const group=s.strandedGroups?.find(g=>g.cell===`${s.q},${s.r}`);if(!group)return null;const path=findRoute(s,{q:0,r:0},c=>terrainAt(c).blocked,()=>s.speed??20);if((s.q||s.r)&&!path.length)return null;return (Math.floor((s.elapsedMinutes+path.length*(s.speed??20))/20)-Math.floor(s.elapsedMinutes/20))*(active(s).length+group.heroes.length);}
export function rescue(s){const cost=rescueCost(s),group=s.strandedGroups?.find(g=>g.cell===`${s.q},${s.r}`);if(!group||cost===null||s.filters<cost||s.pending?.length)return false;const now=Date.now();for(const h of group.heroes){const max=effectiveMaxHp(h),minutes=Math.min(10,1+Math.floor(10*Math.max(0,max-h.hp)/max+1e-9))+Math.max(0,h.poisonDoses??0);h.adventureCooldownUntil=now+minutes*60000*4;}
 const returnPath=findRoute(s,{q:0,r:0},c=>terrainAt(c).blocked,()=>s.speed??20);advance(s,returnPath.length*(s.speed??20));s.rescuedHeroes=[...(s.rescuedHeroes??[]),...group.heroes];s.heroes.push(...group.heroes);(s.cargo??=[]).push(...group.cargo);s.ammo=(s.ammo??0)+group.ammo;s.filters-=cost;s.strandedGroups=s.strandedGroups.filter(g=>g!==group);s.q=s.r=0;s.ended=true;s.barricaded=false;s.rest=null;note(s,'Спасли отряд. Все вернулись на Автозаводскую с вещами. Спасённым назначен отдых ×4.');return true;}

