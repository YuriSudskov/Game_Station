let kolomPlayback=0;
export function playKolomFrames(container,previous,current){
 const stage=container.querySelector('.kj-battle');
 if(!stage||!current)return;
 const token=++kolomPlayback;
 const frames=current.frames??[];
 if(!frames.length)return;
 stage.inert=true;
 const initial=new Map([...previous.heroes,...previous.enemies].map(h=>[h.id,h.hp]));
 function paint(id,hp){
  const unit=stage.querySelector('[data-id="'+CSS.escape(id)+'"]');
  if(!unit)return;
  const bar=unit.querySelector('progress');bar.value=Math.max(0,hp);
  const label=unit.querySelector('[data-jrpg-hp]');if(label)label.textContent=Math.round(Math.max(0,hp));
  unit.classList.toggle('fallen',hp<=0);
 }
 for(const [id,hp]of initial)paint(id,hp);
 frames.forEach((frame,index)=>setTimeout(()=>{
  if(token!==kolomPlayback||!stage.isConnected)return;
  const target=stage.querySelector('[data-id="'+CSS.escape(frame.targetId)+'"]');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const actor=stage.querySelector('[data-id="'+CSS.escape(frame.actorId)+'"]');
  if(target){
   paint(frame.targetId,frame.hp);
   const label=document.createElement('span');label.className='kj-float';label.textContent=frame.hit?'−'+Math.round(frame.damage):'Промах';target.append(label);setTimeout(()=>label.remove(),450);
   if(frame.hit&&!reduced)target.querySelector('.kj-sprite')?.animate([{transform:'translateX(0)'},{transform:'translateX(4px)'},{transform:'translateX(0)'}],{duration:180});
  }
  if(!reduced)actor?.querySelector('.kj-sprite')?.animate([{transform:'translateX(0)'},{transform:'translateX('+(actor.classList.contains('foe')?'-14px':'4px')+')',filter:'brightness(1.4)'},{transform:'translateX(0)'}],{duration:180});
 },index*210));
 setTimeout(()=>{if(token===kolomPlayback&&stage.isConnected){stage.inert=false;for(const h of [...current.heroes,...current.enemies])paint(h.id,h.hp);}},frames.length*210+200);
}
