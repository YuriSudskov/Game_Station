import {playKolomFrames} from './kolom-jrpg-animation.js';
import {createGame,act,heroMaximumHp} from './game.js';
import {kolomBody} from './kolomenskaya-ui.js';
const root=document.querySelector('#battle');
const key='station-kolom-jrpg-preview-v1';
let state;
try{state=JSON.parse(localStorage.getItem(key));}catch{}
if(!state?.interactiveMission){
 state=createGame();state.money=100000;
 for(let i=0;i<2;i++){
  state=act(state,{type:'hire',profession:'assault',perk:'sharp'});
  Object.assign(state.hero,{profession:'assault',level:7,body:'metalMediumArmor',weapon:i?'sawedOff':'ak47',weaponDetails:{quality:2},rangedWeapon:i?'ppsh':'rox',rangedWeaponDetails:{quality:i?1:0},heavyAmmo:100,bandages:2,medicKits:2});
  state.hero.hp=state.hero.maxHp=heroMaximumHp(state.hero);
 }
 state.kolomQuestAccepted=true;
 state=act(state,{type:'startKolom',heroIds:state.heroes.map(h=>h.id)});
 state.interactiveMission.node='boss';
}
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(){
 root.innerHTML=kolomBody(state,{
  btn:(text,action,attrs='',classes='')=>'<button class="'+classes+'" data-action="'+action+'" '+attrs+'>'+text+'</button>',
  esc:escape,health:h=>'<p>'+Math.round(h.hp)+' HP</p>',heroPortrait:()=>'',renderLog:events=>events.slice(-12).map(e=>'<p>'+escape(e.text??e.type)+'</p>').join('')
 })+'<p><button data-action="previewReset">Начать пробу заново</button></p>';
}
function commit(action){
 try{const previous=state.interactiveMission?.combat;state=act(state,action);localStorage.setItem(key,JSON.stringify(state));render();if(['fight','manual'].includes(action.choice))playKolomFrames(root,previous,state.interactiveMission?.combat);}catch(e){document.querySelector('#announcement').className='';document.querySelector('#announcement').textContent=e.message;}
}
root.addEventListener('change',event=>{
 const field=event.target.dataset.jrpgField;if(!field)return;
 commit({type:'kolomChoice',node:'combat',choice:'manualPrefs',prefs:{[field]:event.target.value,...(field==='slot'?{mode:'single'}:{})}});
});
root.addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button)return;
 const action=button.dataset.action;
 if(action==='previewReset'){localStorage.removeItem(key);location.reload();return;}
 if(action==='kolomChoice'){commit({type:'kolomChoice',node:button.dataset.node,choice:button.dataset.choice,targetHeroId:button.dataset.target});return;}
 const combat=state.interactiveMission?.combat,hero=combat?.heroes.find(h=>h.id===combat.waitingHeroId);if(!hero)return;
 const prefs=hero.manualPrefs??{},kind=button.dataset.kind??prefs.kind??'attack';
 if(action==='jrpgTarget'){commit({type:'kolomChoice',node:'combat',choice:'manualPrefs',prefs:{targetId:button.dataset.id}});return;}
 if(action==='jrpgSelect'&&!(prefs.armed&&kind===(prefs.kind??'attack'))){commit({type:'kolomChoice',node:'combat',choice:'manualPrefs',prefs:{kind,armed:true}});return;}
 if(!['jrpgSelect','jrpgExecute'].includes(action))return;
 const value=field=>root.querySelector('[data-jrpg-field="'+field+'"]')?.value;
 commit({type:'kolomChoice',node:'combat',choice:'manual',command:{revision:combat.manualRevision??0,kind,slot:value('slot'),mode:value('mode'),aim:value('aim'),item:value('item'),targetId:kind==='heal'?value('patient'):(combat.enemies.find(e=>e.id===prefs.targetId&&e.hp>0)??combat.enemies.find(e=>e.hp>0))?.id}});
});
render();
