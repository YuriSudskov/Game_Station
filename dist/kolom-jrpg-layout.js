let previousArenaKey='';
const previousPositions=new Map();
export function layoutBattleDistances(arena){
 const bounds=arena.getBoundingClientRect();
 if(!bounds.width)return;
 const key=[...arena.querySelectorAll('.kj-unit')].map(unit=>unit.dataset.id).join('|')+':'+Math.round(bounds.width);
 if(key!==previousArenaKey){previousPositions.clear();previousArenaKey=key;}
 for(const enemy of arena.querySelectorAll('.kj-unit.foe')){
  const hero=[...arena.querySelectorAll('.kj-unit.hero')].find(unit=>unit.dataset.id===enemy.dataset.plannedTarget);
  if(!hero)continue;
  const heroSprite=hero.querySelector('.kj-sprite'),sprite=enemy.querySelector('.kj-sprite');
  const anchor=heroSprite.getBoundingClientRect();
  // Reserve four body widths so that every distance remains readable on phones.
  const available=bounds.right-anchor.right-10;
  const natural=Math.min(bounds.width*(enemy.style.getPropertyValue('--cell').trim()==='1'?.24:.13),enemy.style.getPropertyValue('--cell').trim()==='1'?190:115);
  const width=Math.max(20,Math.min(natural,available/4.5));
  sprite.style.width=width+'px';
  const distance=Number(enemy.dataset.distance);
  const gap=distance===0?5:distance*width;
  const left=distance>3?bounds.width-width/2-5:anchor.right-bounds.left+gap+width/2;
  // Align miniature centres with the intended victim, independent of label height.
  const enemyBox=enemy.getBoundingClientRect(),spriteBox=sprite.getBoundingClientRect();
  const x=left+enemyBox.width/2-(spriteBox.left-enemyBox.left)-spriteBox.width/2;
  enemy.style.left=x+'px';
  const centre=anchor.top+anchor.height/2-bounds.top;
  const y=centre+enemyBox.height*.55-(spriteBox.top-enemyBox.top)-spriteBox.height/2;
  enemy.style.top=y+'px';
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
