import {heroConfig,effectiveMaxHp,levelUp} from './game.js';
import {TECHNOPARK,MATURE_GUARD,ITEMS} from './data.js';
import {rng,heroAttackStats,hits,damageAfterArmor,bandageHeal} from './combat.js';
import {preparePartyCombat,advancePartyCombat,decidePartyCasualty,partyBattleExperience} from './party-combat.js';
import {validateManualAction,healingSupplies,grenadeSupplies} from './kolom-jrpg.js';
import {prepareMagazines,magazineState} from './jrpg-magazines.js';
import {springShelterTraps} from './hike-rest-tasks.js';
export const GUARD_CHANCE=.1;
const rolls=()=>rng(Math.floor(Math.random()*4294967296));
const alive=s=>s.heroes.filter(h=>!h.dead&&!h.unconscious&&h.hp>0);
const fields=[...Object.values(healingSupplies),...Object.values(grenadeSupplies),'heavyAmmo','jrpgMagazines','poisonDoses','favoriteShots','poisonAttributeRecovery','attributeLossOrder','temporaryAttributeLoss'];
const config=(s,h)=>heroConfig({heroes:s.heroes},h,'surface').hero;
export function skill(s,h,kind,dc,r=rolls()){
 const c=config(s,h),bonus=kind==='stealth'?c.agility+(c.stealthCheckBonus??0):kind==='intelligence'?c.intelligence+(c.intelligenceCheckBonus??0):c.perception+(c.detectionBonus??0)+(c.perceptionCheckBonus??0);
 const roll=r.int(1,20),success=roll+bonus-(c.checkPenalty??0)>=dc;
 if(success)levelUp(Object.assign(h,{xp:h.xp??0}),5);
 (s.encounterLog??=[]).push(`${h.name}: ${kind} ${roll} + ${bonus} против ${dc} — ${success?'успех (+5 опыта)':'провал'}`);
 return {success,total:roll+bonus};
}
export function beginGuard(s){
 const e=s.pending[0];if(e?.type!=='guard'||e.phase)return;
 e.guard={...structuredClone(TECHNOPARK.enemy),id:'hike-lone-guard'};
 e.phase=alive(s).map(h=>skill(s,h,'perception',10)).some(c=>c.success)?'choice':'alarm';
 if(e.phase==='alarm')startGuardBattle(s);
}
export function startGuardBattle(s){
 const e=s.pending[0],r=rolls(),n=r.int(4,6),mature=e.night||r.int(1,100)<=20;
 const enemies=Array.from({length:n},(_,i)=>i===n-1&&mature?{...MATURE_GUARD}:{...TECHNOPARK.enemy});enemies[0]={...e.guard};
 const fighters=alive(s).map(h=>{const f={...config(s,h),id:h.id,name:h.name,hp:h.hp,maxHp:effectiveMaxHp(h)};for(const k of fields)if(h[k]!==undefined)f[k]=structuredClone(h[k]);return f;});
 e.combat=preparePartyCombat(fighters,enemies,r);if(e.night)springShelterTraps(s,e.combat,r);e.combat.manual=true;e.combat.frames=[];e.phase='combat';advancePartyCombat(e.combat,r,{maxActors:100});syncBattle(s);
}
export function guardChoice(s,choice,id){
 const e=s.pending[0];if(e?.phase!=='choice')return;
 if(choice==='sneak'){if(alive(s).map(h=>skill(s,h,'stealth',12)).every(c=>c.success))e.phase='done';else startGuardBattle(s);}
 if(choice==='shoot'){
  const h=alive(s).find(h=>h.id===id);if(!h)return;const c=config(s,h),weapons=Object.values(c.weapons??{}).filter(w=>w?.type==='ranged'&&!w.flame&&!w.blocksAimedShots);
  const weapon=weapons.sort((a,b)=>(b.min+b.max)-(a.min+a.max))[0];if(!weapon)throw Error('Нет оружия для одиночного выстрела в голову.');
  const slot=Object.entries(c.weapons).find(([,w])=>w===weapon)[0];c.jrpgMagazines=h.jrpgMagazines;prepareMagazines(c);const mag=magazineState(c,slot);if(mag?.rounds===0)throw Error('Магазин оружия пуст. Выберите другого героя.');if(mag){c.jrpgMagazines[slot].rounds--;h.jrpgMagazines=c.jrpgMagazines;}
  const w={...weapon,shots:undefined,shotPenalty:0,damageRolls:1},stats=heroAttackStats(c,w,1),r=rolls(),hit=hits(r.int(1,100),stats.accuracy-30,e.guard.evasion);
  const damage=hit?damageAfterArmor((r.int(w.min,w.max)+(stats.bonus??0)-(stats.damagePenalty??0))*(stats.damageMultiplier??1),w.damageType==='thermal'?e.guard.thermalArmor:e.guard.armor)*2:0;
  e.guard.hp=Math.max(0,e.guard.hp-damage);(s.encounterLog??=[]).push(`${h.name}: ${hit?'попадание в голову, урон '+Math.round(damage):'Промах'}`);
  if(e.guard.hp<=0){e.phase='recovery';e.reportSeen=true;e.combat={heroes:[],enemies:[e.guard],status:'victory'};awardBattle(s);}else startGuardBattle(s);
 }
}
export function syncBattle(s){const e=s.pending[0],b=e?.combat;if(!b)return;
 for(const f of b.heroes){const h=s.heroes.find(h=>h.id===f.id);if(!h)continue;const doses=Math.max(0,(f.poisonDoses??0)-(h.poisonDoses??0));for(let i=0;i<doses;i++)for(const key of ["strength","agility"])(h.attributeLossOrder??=[]).push({key,type:"poison"});f.attributeLossOrder=h.attributeLossOrder;h.hp=Math.max(0,f.hp);h.dead=Boolean(f.dead||f.hp<=0);for(const k of fields)if(f[k]!==undefined)h[k]=structuredClone(f[k]);}
 if(['victory','escaped','defeat','poisonRetreat'].includes(b.status)){e.phase='recovery';awardBattle(s);}
}
function awardBattle(s){const e=s.pending[0];if(e.awarded)return;e.awarded=true;const xp=partyBattleExperience(e.combat),members=alive(s);for(const h of members)levelUp(Object.assign(h,{xp:h.xp??0}),Math.floor(xp/Math.max(1,members.length)));(s.encounterLog??=[]).push(`Бой завершён: ${e.combat.status}. Опыт за поверженных: ${xp} на отряд.`);}
export function battleAction(s,command){const b=s.pending[0]?.combat;if(!b)return;validateManualAction(b,command);b.manualAction=structuredClone(command);b.manualRevision=(b.manualRevision??0)+1;b.manualStarted=true;b.frames=[];advancePartyCombat(b,rolls(),{maxActors:100});syncBattle(s);}
export function continueBattle(s){const b=s.pending[0]?.combat;if(b.status==='casualty')decidePartyCasualty(b,'fight');b.frames=[];advancePartyCombat(b,rolls(),{maxActors:100});syncBattle(s);}
export function healEncounter(s,id,item){const h=alive(s).find(h=>h.id===id),field=healingSupplies[item];if(!h||!field||!(h[field]>0))return;const cfg={hero:{...config(s,h),maxHp:effectiveMaxHp(h)}};const result=bandageHeal(cfg,rolls(),h.hp,item);h[field]--;h.hp=result.hp;if(s.pending?.[0])s.pending[0].healed=true;}




