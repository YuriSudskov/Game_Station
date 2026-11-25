import './kolom-jrpg-layout.js';
let playbackToken=0;
export function playKolomFrames(container,previous,current,onComplete){
 const stage=container.querySelector('.kj-battle');
 if(!stage||!current){onComplete?.();return;}
 const token=++playbackToken,frames=current.frames??[];
 if(!frames.length){onComplete?.();return;}
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const arena=stage.querySelector('.kj-arena');
 const find=id=>stage.querySelector('[data-id="'+CSS.escape(id)+'"]');
 const units=[...current.heroes,...current.enemies];
 const names=new Map(units.map(unit=>[unit.id,unit.name]));
 const notice=document.createElement('div');
 notice.className='kj-action-notice';notice.setAttribute('role','status');arena.append(notice);
 const activeHero=stage.querySelector('.active-hero')?.dataset.id;
 const selectedTarget=stage.querySelector('.foe[aria-pressed="true"]')?.dataset.id;
 stage.inert=true;
 function paint(id,hp,maxHp){
  const unit=find(id);if(!unit)return;
  const bar=unit.querySelector('progress');
  if(maxHp)bar.max=maxHp;
  bar.value=Math.max(0,hp);
  unit.querySelector('[data-jrpg-hp]').textContent=Math.round(Math.max(0,hp));
  unit.classList.toggle('fallen',hp<=0);
 }
 const before=previous?[...previous.heroes,...previous.enemies]:units.map(unit=>{const frame=frames.find(f=>f.targetId===unit.id&&f.hp!=null);return {...unit,hp:frame?frame.hp+(frame.damage??0):unit.hp};});
 for(const unit of before){
  paint(unit.id,unit.hp,unit.maxHp);
  find(unit.id)?.classList.toggle('poisoned',Boolean(unit.poisonDoses));
 }
 function later(fn,delay){setTimeout(()=>{if(token===playbackToken&&stage.isConnected)fn();},delay);}
 function popup(target,text,style=''){
  if(!target)return;
  const label=document.createElement('span');
  label.className='kj-float '+style;label.textContent=text;target.append(label);
  setTimeout(()=>label.remove(),650);
 }
 function line(actor,target,kind,speed=1){
  if(!actor||!target)return;
  const from=actor.querySelector('.kj-sprite').getBoundingClientRect(),to=target.querySelector('.kj-sprite').getBoundingClientRect(),bounds=arena.getBoundingClientRect();
  const mouth=kind==='web';
  const sourceX=Number(actor.dataset[mouth?'mouthX':'muzzleX']??.5);
  const sourceY=Number(actor.dataset[mouth?'mouthY':'muzzleY']??.5);
  const x=from.x+from.width*sourceX-bounds.x,y=from.y+from.height*sourceY-bounds.y;
  const dx=to.x+to.width*.5-bounds.x-x,dy=to.y+to.height*.5-bounds.y-y;
  const beam=document.createElement('span');
  beam.className='kj-tracer '+kind;
  Object.assign(beam.style,{left:x+'px',top:y+'px',width:Math.hypot(dx,dy)+'px',transform:'rotate('+Math.atan2(dy,dx)+'rad)'});
  arena.append(beam);setTimeout(()=>beam.remove(),reduced?180:140*speed);
 }
 let elapsed=0;
 for(const frame of frames){
  const enemyTurn=current.enemies.some(unit=>unit.id===frame.actorId);
  if(frame.kind==='turn'){
   later(()=>{
    notice.textContent='Ход · '+(names.get(frame.actorId)??'Противник');
    stage.querySelectorAll('.hero').forEach(unit=>unit.classList.remove('active-hero'));
    stage.querySelectorAll('.foe').forEach(unit=>unit.classList.toggle('acting-enemy',unit.dataset.id===frame.actorId));
   },elapsed);
   elapsed+=500;
   continue;
  }
  const speed=enemyTurn?2:1;
  const duration=(frame.kind==='shot'?210:frame.kind==='poison'?380:550)*speed;
  later(()=>{
   const actor=find(frame.actorId),target=find(frame.targetId),sprite=actor?.querySelector('.kj-sprite');
   stage.querySelectorAll('.hero').forEach(unit=>unit.classList.toggle('active-hero',unit===actor));
   stage.querySelectorAll('.foe').forEach(unit=>unit.setAttribute('aria-pressed',String(unit===target)));
   const action={shot:'стреляет',melee:'атакует',grenade:'взрыв гранаты',fire:'огонь',web:'паутина',poison:'отравление',reload:'перезаряжается',jam:'осечка',escapeWeb:'пытается выпутаться'}[frame.kind]??'атакует';
   notice.textContent=(names.get(frame.actorId)??'')+' → '+(names.get(frame.targetId)??'')+' · '+action;
   if(frame.kind==='jam'){popup(actor,'Осечка','kj-miss');return;}
   if(frame.kind==='escapeWeb'){popup(actor,frame.success?'Выпутался':'Не выпутался','kj-web-text');return;}
   if(frame.kind==='reload'){popup(actor,'Перезарядка','kj-web-text');return;}
   if(frame.kind==='poison'){
    target?.classList.add('poisoned');paint(frame.targetId,frame.hp,frame.maxHp);
    popup(target,'Отравлен · '+frame.poisonDoses,'kj-poison-text');return;
   }
   if(['shot','web','fire','grenade'].includes(frame.kind))line(actor,target,frame.kind,speed);
   if(sprite&&!reduced){
    const direction=actor.classList.contains('foe')?-1:1;
    sprite.animate([{translate:'0 0'},{translate:(frame.kind==='melee'?direction*28:-direction*4)+'px 0'},{translate:'0 0'}],{duration:(frame.kind==='melee'?260:130)*speed});
   }
   later(()=>{
    if(frame.kind==='web'){popup(target,frame.hit?(frame.restriction==='movement'?'Движение сковано':'Опутан'):'Промах',frame.hit?'kj-web-text':'kj-miss');return;}
    paint(frame.targetId,frame.hp,frame.maxHp);
    if(!frame.hit){popup(target,'Промах','kj-miss');return;}
    const targetSprite=target?.querySelector('.kj-sprite');
    if(targetSprite){
     targetSprite.classList.remove('kj-hit-flash','kj-red-flash');
     void targetSprite.offsetWidth;
     targetSprite.classList.add(['grenade','fire'].includes(frame.kind)?'kj-red-flash':'kj-hit-flash');
     setTimeout(()=>targetSprite.classList.remove('kj-hit-flash','kj-red-flash'),200);
     if(!reduced){
      const direction=target.classList.contains('hero')?-1:1;
      targetSprite.animate([{translate:'0 0'},{translate:direction*12+'px 0'},{translate:'0 0'}],{duration:190*speed});
     }
    }
    popup(target,(frame.critical?'КРИТ −':'−')+Math.round(frame.damage),frame.critical?'kj-critical':'');
   },reduced?0:(frame.kind==='shot'?65:180)*speed);
  },elapsed);
  elapsed+=duration;
 }
 later(()=>{
  stage.inert=false;notice.remove();
  stage.querySelectorAll('.acting-enemy').forEach(unit=>unit.classList.remove('acting-enemy'));
  stage.querySelectorAll('.hero').forEach(unit=>unit.classList.toggle('active-hero',unit.dataset.id===activeHero));
  stage.querySelectorAll('.foe').forEach(unit=>unit.setAttribute('aria-pressed',String(unit.dataset.id===selectedTarget)));
  for(const unit of units){paint(unit.id,unit.hp,unit.maxHp);find(unit.id)?.classList.toggle('poisoned',Boolean(unit.poisonDoses));}
 },elapsed);
 later(()=>onComplete?.(),elapsed+500);
}
