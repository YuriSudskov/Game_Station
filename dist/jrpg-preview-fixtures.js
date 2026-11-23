import {createGame,act,heroMaximumHp} from './game.js';
export const PREVIEW_BATTLES={kolom:'Матка Коломенской',zil:'Бандиты ЗИЛа',roof:'Оборона Технопарка',hansa:'Васёк на дрезине'};
export function previewCombat(state){return state.interactiveMission?.combat??state.interactiveMission?.pendingCombat;}
export function previewRoute(state,prefs=false){const a=state.interactiveMission;return a.id==='kolomenskaya'?{type:'kolomChoice',node:a.node,choice:prefs?'manualPrefs':'manual'}:a.id==='hansaRoute'?{type:'hansaRouteChoice',node:a.node,choice:'turn'}:{type:'interactiveCombat'};}
export function createBattlePreview(kind,{guarded=true}={}){
 let s=createGame();s.money=100000;s.filters=100;
 for(let i=0;i<(kind==='hansa'?1:2);i++){s=act(s,{type:'hire',profession:'assault',perk:'assault-sharp'});Object.assign(s.hero,{profession:'assault',level:7,body:'metalMediumArmor',weapon:i?'sawedOff':'ak47',weaponDetails:{quality:2},rangedWeapon:i?'ppsh':'rox',rangedWeaponDetails:{quality:i?1:0},heavyAmmo:100,bandages:2,medicKits:2,doctorKits:2,grenades:2,molotovs:2});s.hero.hp=s.hero.maxHp=heroMaximumHp(s.hero);}
 if(kind==='hansa'){s.vasek={level:4,relation:10,nextAt:0};s=act(s,{type:'acceptHansaQuest'});s=act(s,{type:'startHansaExpedition',heroId:s.hero.id});s.interactiveMission.node='ghoulBattle';s.interactiveMission.afterBattle='paveletskaya';s=act(s,{type:'hansaRouteChoice',node:'ghoulBattle',choice:'fight'});return act(s,{type:'hansaRouteChoice',node:'ghoulBattle',choice:'turn'});}
 if(kind==='kolom'){s.kolomQuestAccepted=true;s=act(s,{type:'startKolom',heroIds:s.heroes.map(h=>h.id)});s.interactiveMission.node='boss';return act(s,{type:'kolomChoice',node:'boss',choice:'fight'});}
 s.heroes.forEach(h=>h.job={kind:'interactive'});s.interactiveMission={id:kind==='zil'?'zilRoute':'roofRoute',node:kind==='zil'?'stationBandits':'roofKeeper',heroIds:s.heroes.map(h=>h.id),history:[],loot:{},money:0,paidFilters:0,startedAt:0,locationRadiation:0};
 if(kind==='zil')s=act(s,{type:'interactiveChoice',node:'stationBandits',choice:'attack'});
 else{s.roofRouteProgress={visited:{},found:true};s=act(s,{type:'interactiveChoice',node:'roofKeeper',choice:guarded?'slow':'fast'},0,()=>.2);s=act(s,{type:'roofTimer',choice:'attack'},150000,()=>.2);}
 return act(s,{type:'interactiveCombat'},150001);
}
