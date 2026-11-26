export function floorDepth(scene,x,rank=0){return scene==='roofRoute'?Math.min(.95,.97-.38*Math.min(.76,Math.max(0,x))+rank*.012):null;}
export function overlapRatio(a,b){const w=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left)),h=Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));return w*h/Math.max(1,Math.min(a.width*a.height,b.width*b.height));}
function separateUnit(unit,placed,bounds,roof,attempt=0){
 const sprite=unit.querySelector('.kj-sprite'),r=sprite.getBoundingClientRect();let best=0,score=Infinity;
 const minFoot=roof?bounds.top+bounds.height*(.72-.30*(r.left+r.width/2-bounds.left)/bounds.width):bounds.top+r.height+18;
 const maxFoot=roof?bounds.top+bounds.height*Math.min(.95,1.85-1.55*(r.left+r.width/2-bounds.left)/bounds.width):bounds.bottom-28;
 const candidates=[0,...Array.from({length:24},(_,i)=>(i%2? -1:1)*Math.ceil((i+1)/2)*r.height*.15),...placed.flatMap(o=>[o.top-r.bottom-.25,o.bottom-r.top+.25])].sort((a,b)=>Math.abs(a)-Math.abs(b));
 for(const offset of candidates){if(r.bottom+offset<minFoot||r.bottom+offset>maxFoot)continue;const shifted={...{left:r.left,right:r.right,width:r.width,height:r.height},top:r.top+offset,bottom:r.bottom+offset};const overlaps=placed.map(other=>({ratio:overlapRatio(shifted,other),protected:unit.classList.contains('foe')&&other.hero}));const overlap=Math.max(0,...overlaps.map(o=>o.protected&&o.ratio>0?100+o.ratio:o.ratio));if(overlap<score){score=overlap;best=offset;}if(overlap<=.3)break;}
 if(score>.3&&unit.classList.contains('foe')&&attempt<1&&r.width>30){
  const width=Math.max(30,r.width*.92);sprite.style.width=width+'px';
  const arena=unit.closest('.kj-arena'),hero=[...arena.querySelectorAll('.kj-unit.hero')].find(h=>h.dataset.id===unit.dataset.plannedTarget);
  if(hero){const anchor=hero.querySelector('.kj-sprite').getBoundingClientRect(),distance=Number(unit.dataset.distance),edge=roof?bounds.left+bounds.width*.76:bounds.right;
   const left=distance>3?edge-bounds.left-width/2-5:anchor.right-bounds.left+(distance===0?5:distance*width)+width/2;
   const box=unit.getBoundingClientRect(),art=sprite.getBoundingClientRect();unit.style.left=(left+box.width/2-(art.left-box.left)-art.width/2)+'px';
   const foot=roof?bounds.height*floorDepth('roofRoute',left/bounds.width):anchor.bottom-bounds.top;
   unit.style.top=(foot+box.height*.55-(art.bottom-box.top))+'px';
  }
  separateUnit(unit,placed,bounds,roof,attempt+1);return;
 }
 if(best){unit.style.top=(parseFloat(unit.style.top)+best)+'px';unit.style.zIndex=String(Math.round(r.bottom+best-bounds.top));}
 const final=sprite.getBoundingClientRect();placed.push({left:final.left,right:final.right,top:final.top,bottom:final.bottom,width:final.width,height:final.height,hero:unit.classList.contains('hero')});
}
let previousArenaKey='';
const previousPositions=new Map();
const settledPositions=new Map();
function rememberUnit(unit,state){const sprite=unit.querySelector('.kj-sprite');settledPositions.set(unit.dataset.id,{state,left:unit.style.left,top:unit.style.top,z:unit.style.zIndex,width:sprite.style.width,approached:Boolean(unit.dataset.approachTarget)||Boolean(settledPositions.get(unit.dataset.id)?.approached)});}
function restoreUnit(unit,state,placed){const previous=settledPositions.get(unit.dataset.id);if(!previous||previous.state!==state)return false;unit.style.left=previous.left;unit.style.top=previous.top;unit.style.zIndex=previous.z;const sprite=unit.querySelector('.kj-sprite');sprite.style.width=previous.width;const r=sprite.getBoundingClientRect();placed.push({left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,hero:unit.classList.contains('hero')});return true;}

export function layoutBattleDistances(arena){
 const compact=matchMedia('(max-width: 760px)').matches;
 let crop=arena.parentElement?.classList.contains('kj-arena-crop')?arena.parentElement:null;
 if(compact){if(!crop){crop=document.createElement('div');crop.className='kj-arena-crop';arena.before(crop);crop.append(arena);}const height=arena.offsetHeight;crop.style.height=(height*.9)+'px';arena.style.marginTop=(-height*.1)+'px';}
 else if(crop){arena.style.marginTop='';crop.before(arena);crop.remove();}
 const bounds=arena.getBoundingClientRect();
 if(!bounds.width)return;
 const key=[...arena.querySelectorAll('.kj-unit')].map(unit=>unit.dataset.id).join('|')+':'+arena.dataset.scene+':'+Math.round(bounds.width)+':'+Math.round(bounds.height);
 arena.dataset.perspective='true';
 if(key!==previousArenaKey){previousPositions.clear();settledPositions.clear();previousArenaKey=key;}
 const roof=arena.dataset.scene==='roofRoute';
 const heroes=[...arena.querySelectorAll('.kj-unit.hero')],placed=[];
 // Feet sit on the floor; distant ranks shrink towards the horizon.
 for(const [index,unit] of heroes.entries()){
  const sprite=unit.querySelector('.kj-sprite');if(!sprite)continue;
  const state='hero:'+index+':'+unit.dataset.approachTarget+':'+unit.classList.contains('fallen')+':'+unit.classList.contains('prone');if(restoreUnit(unit,state,placed))continue;
  // A defeated close-range target must not send the fighter back to the starting lane.
  const previous=settledPositions.get(unit.dataset.id);
  if(!unit.dataset.approachTarget&&previous?.approached&&restoreUnit(unit,previous.state,placed)){rememberUnit(unit,state);continue;}
  const laneX=.055+index*.09;
  if(roof)unit.style.left=(bounds.width*laneX)+'px';
  const depth=roof?.95-index*.075:heroes.length===1?.78:.60+.27*index/Math.max(1,heroes.length-1);
  const width=Math.max(24,Math.min(115,bounds.width*(roof?.10:.145)))*(.78+.22*(depth-.6)/.27)*1.10;
  sprite.style.width=width+'px';
  const box=unit.getBoundingClientRect(),art=sprite.getBoundingClientRect();
  const foot=bounds.height*depth;
  unit.style.top=(foot+box.height*.55-(art.bottom-box.top))+'px';
  unit.style.zIndex=String(Math.round(foot));
  const target=[...arena.querySelectorAll('.kj-unit.foe')].find(e=>e.dataset.id===unit.dataset.approachTarget),anchorPosition=target&&settledPositions.get(target.dataset.id);
  if(target&&anchorPosition){target.style.left=anchorPosition.left;target.style.top=anchorPosition.top;target.querySelector('.kj-sprite').style.width=anchorPosition.width;const r=target.querySelector('.kj-sprite').getBoundingClientRect(),box=unit.getBoundingClientRect(),art=sprite.getBoundingClientRect();unit.style.left=(r.left-bounds.left-5-art.width+box.width/2-(art.left-box.left))+'px';unit.style.top=(r.bottom-bounds.top+box.height*.55-(art.bottom-box.top))+'px';}
  separateUnit(unit,placed,bounds,roof);rememberUnit(unit,state);
 }
 for(const enemy of arena.querySelectorAll('.kj-unit.foe')){
  const hero=[...arena.querySelectorAll('.kj-unit.hero')].find(unit=>unit.dataset.id===enemy.dataset.plannedTarget);
  if(!hero)continue;
  const layoutState=enemy.dataset.plannedTarget+':'+enemy.dataset.distance+':'+enemy.classList.contains('fallen')+':'+enemy.classList.contains('prone');
  const prior=settledPositions.get(enemy.dataset.id);if(prior&&heroes.some(h=>h.dataset.approachTarget===enemy.dataset.id)){restoreUnit(enemy,prior.state,placed);rememberUnit(enemy,layoutState);continue;}
  if(restoreUnit(enemy,layoutState,placed))continue;
  const heroSprite=hero.querySelector('.kj-sprite'),sprite=enemy.querySelector('.kj-sprite');
  const anchor=heroSprite.getBoundingClientRect();
  // Reserve four body widths so that every distance remains readable on phones.
  const edge=roof?bounds.left+bounds.width*.86:bounds.right;
  const available=edge-anchor.right-10;
  const natural=Math.min(bounds.width*(enemy.style.getPropertyValue('--cell').trim()==='1'?.24:.13),enemy.style.getPropertyValue('--cell').trim()==='1'?190:115);
  const distance=Number(enemy.dataset.distance);
  const depthScale=Math.max(.70,1-Math.min(4,distance)*.06);
  const width=Math.max(30,Math.min(natural,available/4.2))*depthScale;
  sprite.style.width=width+'px';
  const gap=distance===0?5:distance*width;
  const left=distance>3?edge-bounds.left-width/2-5:anchor.right-bounds.left+gap+width/2;
  // Align miniature centres with the intended victim, independent of label height.
  const enemyBox=enemy.getBoundingClientRect(),spriteBox=sprite.getBoundingClientRect();
  const x=left+enemyBox.width/2-(spriteBox.left-enemyBox.left)-spriteBox.width/2;
  enemy.style.left=x+'px';
  const floor=anchor.bottom-bounds.top-Math.min(gap*(roof?.12:.18),bounds.height*.18);
  const y=floor+enemyBox.height*.55-(spriteBox.bottom-enemyBox.top);
  enemy.style.zIndex=String(Math.round(floor));
  enemy.style.top=y+'px';
  if(arena.dataset.scene==='paolo'){
   const siblings=[...arena.querySelectorAll('.kj-unit.foe')],rank=siblings.indexOf(enemy);
   const positions=[[.62,.70],[.81,.73],[.63,.94],[.84,.94]],position=positions[rank%positions.length];
   const foot=bounds.height*position[1],box=enemy.getBoundingClientRect(),art=sprite.getBoundingClientRect();
   enemy.style.left=(bounds.width*position[0]+box.width/2-(art.left-box.left)-art.width/2)+'px';
   enemy.style.top=(foot+box.height*.55-(art.bottom-box.top))+'px';
  }
  separateUnit(enemy,placed,bounds,roof);rememberUnit(enemy,layoutState);
  const previous=previousPositions.get(enemy.dataset.id);
  const state=enemy.dataset.plannedTarget+':'+distance;
  if(previous&&previous.state!==state&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
   enemy.animate([{translate:(previous.x-x)+'px '+(previous.y-y)+'px'},{translate:'0 0'}],{duration:210,easing:'ease-out'});
  }
  previousPositions.set(enemy.dataset.id,{x,y,state});
  enemy.title='Цель · '+hero.querySelector('.kj-label').firstChild.textContent+' · дистанция '+(distance>3?'3+':distance);
 }
}
if(typeof MutationObserver!=='undefined'&&typeof ResizeObserver!=='undefined'){
 const observed=new WeakSet();
 const resize=new ResizeObserver(entries=>entries.forEach(entry=>layoutBattleDistances(entry.target)));
 const update=()=>{
  for(const arena of document.querySelectorAll('.kj-arena')){
   if(observed.has(arena))continue;
   observed.add(arena);layoutBattleDistances(arena);resize.observe(arena);
  }
 };
 new MutationObserver(update).observe(document.body,{childList:true,subtree:true});
 update();
}
