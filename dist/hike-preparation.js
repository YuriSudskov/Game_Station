import {ITEMS} from './data.js';
import {heroEffectiveStrength,heroConfig,itemName} from './game.js';
export const MAIN_SAVE_KEY='stantsiya-save-v1';
const allowed=new Set(['weapon','body','grenade','food','medicine','stimulant']);
export function stackLimit(row){return row.item==='$filters'?20:row.item==='$ammo'?500:ITEMS[row.item]?.stack===false?1:10;}
export function slotCount(rows){return rows.reduce((n,row)=>n+Math.ceil(row.qty/stackLimit(row)),0);}
export function mergeCargo(rows){const grouped=new Map();for(const row of rows){const previous=grouped.get(row.sourceIndex);grouped.set(row.sourceIndex,previous?{...previous,qty:previous.qty+row.qty}:{...row});}return [...grouped.values()];}
export function groupCapacity(heroes){return 2+heroes.reduce((n,h)=>n+heroEffectiveStrength(h),0);}
export function copySource(save){
  if(!save||!Array.isArray(save.heroes)||!Array.isArray(save.inventory))throw Error('Основное сохранение не найдено. Откройте игру в этом браузере или импортируйте JSON-сейв.');
  const heroes=structuredClone(save.heroes.filter(h=>!h.dead&&h.hp>0));heroes.forEach(h=>{h.job=null;h.unconscious=false;});
  return {heroes,inventory:structuredClone(save.inventory.filter(row=>row.qty>0&&allowed.has(ITEMS[row.item]?.type))),filters:Math.max(0,save.filters??0),ammo:200,copiedAt:Date.now()};
}
export function availableRows(source){return [{item:'$filters',qty:source.filters},{item:'$ammo',qty:source.ammo},...source.inventory].filter(r=>r.qty>0);}
export function validateLoadout(source,ids,cargo){
  const heroes=ids.map(id=>source.heroes.find(h=>h.id===id));if(heroes.length<1||heroes.length>3||heroes.some(h=>!h)||new Set(ids).size!==ids.length)throw Error('Выберите от одного до трёх героев.');
  const stock=availableRows(source),used=new Map();
  for(const row of cargo){if(!Number.isInteger(row.qty)||row.qty<=0||!Number.isInteger(row.sourceIndex)||!stock[row.sourceIndex]||row.item!==stock[row.sourceIndex].item)throw Error('Некорректное количество или предмет.');used.set(row.sourceIndex,(used.get(row.sourceIndex)??0)+row.qty);}
  for(const[i,qty]of used)if(qty>stock[i].qty)throw Error('На складе недостаточно предметов.');
  if(slotCount(cargo)>groupCapacity(heroes))throw Error('В сумке не хватает свободных ячеек.');return heroes;
}
const title=row=>row.item==='$filters'?'Фильтры':row.item==='$ammo'?'Патроны':itemName(row);
export function mountPreparation(root,{source,onStart,onRefresh,onAmmoChange,previousDraft}){
  let ids=previousDraft?.heroIds??[],cargo=previousDraft?.cargo??[],reserve=previousDraft?.reserveFilters??true,picker=null,error='';
  let heroSlots=Array.from({length:3},(_,i)=>(previousDraft?.heroSlots??ids)[i]??null),heroPicker=null;
  heroSlots=heroSlots.map((id,i)=>source.heroes.some(h=>h.id===id)&&heroSlots.indexOf(id)===i?id:null);ids=heroSlots.filter(Boolean);
  const stock=availableRows(source);
  const selected=()=>ids.map(id=>source.heroes.find(h=>h.id===id));
  const persist=()=>{ids=heroSlots.filter(Boolean);try{localStorage.setItem('station-hike-preparation-draft-v1',JSON.stringify({heroIds:ids,heroSlots,cargo,reserveFilters:reserve}));}catch{}};
  function el(tag,text,parent=root){const e=document.createElement(tag);if(text)e.textContent=text;parent.append(e);return e;}
  function button(label,fn,parent=root){const b=el('button',label,parent);b.type='button';b.onclick=fn;return b;}
  function render(){
    root.replaceChildren();el('h2','Сбор группы');el('p','Копия локального сейва. Основная игра не изменяется.');
    const ammoLabel=el('label','Запас патронов на складе прототипа: '),ammoInput=el('input','',ammoLabel);ammoInput.type='number';ammoInput.min='0';ammoInput.step='1';ammoInput.value=source.ammo;ammoInput.setAttribute('aria-label','Тестовый запас патронов');ammoInput.onchange=()=>{const qty=Number(ammoInput.value);if(!Number.isInteger(qty)||qty<0){error='Запас патронов должен быть целым неотрицательным числом.';render();return;}onAmmoChange(qty);};
    el('p',`Участников: ${ids.length} из 3. Можно отправиться одним, двумя или тремя героями.`);
    const heroList=el('div');heroList.className='prep-hero-slots';
    function heroDetails(h,parent){el('strong',`${h.name} · ур. ${h.level}`,parent);el('p',`Сила ${heroEffectiveStrength(h)} · РАД ${heroConfig({heroes:source.heroes},h,'surface').hero.radiationProtection??0}`,parent);el('small',[h.weapon?itemName({item:h.weapon,...h.weaponDetails}):'Без оружия',h.rangedWeapon?itemName({item:h.rangedWeapon,...h.rangedWeaponDetails}):null,h.body?itemName({item:h.body,...h.bodyDetails}):'Без брони'].filter(Boolean).join(' / '),parent);}
    heroSlots.forEach((id,index)=>{const slot=el('section','',heroList);slot.className='prep-hero-slot';el('small',`Слот ${index+1}`,slot);const h=source.heroes.find(h=>h.id===id);if(h){heroDetails(h,slot);button('Заменить',()=>{heroPicker=index;render();},slot);button('Убрать',()=>{heroSlots[index]=null;persist();render();},slot);}else button('Выбрать героя',()=>{heroPicker=index;render();},slot);});
    if(!source.heroes.length)el('p','В сохранении нет доступных живых героев.');
    const heroes=selected(),capacity=groupCapacity(heroes),used=slotCount(cargo),filters=cargo.filter(r=>r.item==='$filters').reduce((n,r)=>n+r.qty,0),ammo=cargo.filter(r=>r.item==='$ammo').reduce((n,r)=>n+r.qty,0);
    el('h2',`Сумка группы · свободно ${Math.max(0,capacity-used)} из ${capacity}`);
    el('p',`Фильтры: ${filters} / ${source.filters} · патроны: ${ammo} / ${source.ammo}. Стопки: 20 фильтров, 500 патронов, 10 обычных предметов. Оружие и броня — по одному.`);
    const bag=el('div');bag.className='prep-bag';
    cargo.forEach((row,index)=>{let left=row.qty;while(left>0){const qty=Math.min(left,stackLimit(row));const b=button(`${title(row)} ×${qty}`,()=>{picker={edit:index,sourceIndex:row.sourceIndex};render();},bag);b.title='Изменить количество или убрать из сумки';left-=qty;}});
    for(let i=used;i<capacity;i++)button('+',()=>{picker={};render();},bag).setAttribute('aria-label','Добавить предмет в ячейку');
    const quick=el('div');quick.className='prep-quick';
    function setSupply(item,qty){const sourceIndex=stock.findIndex(r=>r.item===item);if(sourceIndex<0){error='Этих припасов нет на складе.';render();return;}const next=cargo.filter(r=>r.item!==item);if(qty>0)next.push({...stock[sourceIndex],qty,sourceIndex});try{validateLoadout(source,ids,next);cargo=next;error='';persist();}catch(e){error=e.message;}render();}
    for(const[item,label,total]of [['$filters','Фильтры',source.filters],['$ammo','Патроны',source.ammo]])button(`${label}: выбрать количество`,()=>{const index=stock.findIndex(r=>r.item===item);if(index<0){error=`${label}: в копии сейва запас равен нулю.`;render();return;}picker={sourceIndex:index,edit:cargo.findIndex(r=>r.item===item)};render();},quick);
    button('Фильтры на день · 30 на героя',()=>setSupply('$filters',Math.min(source.filters,heroes.length*30)),quick);button('Фильтры Max',()=>setSupply('$filters',source.filters),quick);
    const label=el('label'),check=el('input','',label);check.type='checkbox';check.checked=reserve;check.onchange=()=>{reserve=check.checked;persist();};label.append(document.createTextNode(' Создать запас фильтров для возвращения'));
    el('p','Запас автоматически вычитается из доступных фильтров на обратный путь до Автозаводской. Он остаётся в сумке и не списывается дважды. В походе пересчитывается по времени пути.');
    el('p','Если группа погибнет, за её вещами придётся отправить другую группу.');
    if(!source.ammo)el('small','В основном сейве нет общего запаса обычных патронов. Для тестового запаса количество ещё не задано.');
    if(error)el('p',error).className='prep-error';
    button('Обновить копию из локального сейва',onRefresh);
    const upload=el('input');upload.type='file';upload.accept='.json,application/json';upload.setAttribute('aria-label','Импортировать копию JSON-сохранения');upload.onchange=async()=>{try{onRefresh(JSON.parse(await upload.files[0].text()));}catch(e){error=e.message;render();}};
    button('Отправиться в поход',()=>{try{const heroes=validateLoadout(source,ids,cargo);persist();onStart({heroes:structuredClone(heroes),cargo:structuredClone(cargo),filters,ammo,reserveFilters:reserve,capacity});}catch(e){error=e.message;render();}}).className='prep-depart';
    if(heroPicker!==null){
      const overlay=el('div');overlay.className='prep-overlay';const dialog=el('section','',overlay);dialog.className='prep-picker';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');el('h2',`Выберите героя · слот ${heroPicker+1}`,dialog);
      for(const h of source.heroes){const row=el('section','',dialog);row.className='prep-hero-option';heroDetails(h,row);const occupied=heroSlots.some((id,i)=>id===h.id&&i!==heroPicker);const b=button(occupied?'Уже в группе':`Выбрать ${h.name}`,()=>{heroSlots[heroPicker]=h.id;heroPicker=null;error='';persist();render();},row);b.disabled=occupied;}
      button('Отмена',()=>{heroPicker=null;render();},dialog);
    }
    if(picker){
      const overlay=el('div');overlay.className='prep-overlay';const dialog=el('section','',overlay);dialog.className='prep-picker';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');
      el('h2','Выберите предмет и количество',dialog);const select=el('select','',dialog);select.setAttribute('aria-label','Предмет со склада');
      stock.forEach((row,i)=>{const other=cargo.filter((r,index)=>index!==picker.edit&&r.sourceIndex===i).reduce((n,r)=>n+r.qty,0);const option=el('option',`${title(row)} · доступно ${row.qty-other}`,select);option.value=i;});select.value=String(picker.sourceIndex??0);
      const count=el('input','',dialog);count.type='number';count.min='1';count.step='1';count.value=String(picker.edit>=0?cargo[picker.edit].qty:1);count.setAttribute('aria-label','Количество');
      const message=el('p','',dialog);
      function deposit(qty){const sourceIndex=Number(select.value),next=cargo.filter((_,i)=>i!==picker.edit);if(!Number.isInteger(qty)||qty<=0){message.textContent='Укажите целое положительное количество.';return;}next.push({...stock[sourceIndex],qty,sourceIndex});const merged=mergeCargo(next);try{validateLoadout(source,ids,merged);cargo=merged;picker=null;error='';persist();render();}catch(e){message.textContent=e.message;}}
      const shortcuts=el('div','',dialog);shortcuts.className='prep-stack-shortcuts';count.after(shortcuts);
      function updateShortcuts(){
        shortcuts.replaceChildren();const sourceIndex=Number(select.value),row=stock[sourceIndex];if(!row)return;
        const remaining=row.qty-cargo.filter((r,i)=>i!==picker.edit&&r.sourceIndex===sourceIndex).reduce((n,r)=>n+r.qty,0);count.max=String(remaining);
        for(const stacks of [1,2]){const qty=stackLimit(row)*stacks;const b=button(`Положить ${qty}`,()=>deposit(qty),shortcuts);b.title=`${stacks===1?'Одна стопка':'Две стопки'}`;
          try{if(qty>remaining)throw Error('Недостаточно на складе');validateLoadout(source,ids,mergeCargo([...cargo.filter((_,i)=>i!==picker.edit),{...row,qty,sourceIndex}]));}catch(e){b.disabled=true;b.title=e.message;}
        }
      }
      select.onchange=updateShortcuts;updateShortcuts();
      button('Положить в сумку',()=>deposit(Number(count.value)),dialog);
      if(picker.edit>=0)button('Убрать из сумки',()=>{cargo=cargo.filter((_,i)=>i!==picker.edit);picker=null;persist();render();},dialog);
      button('Отмена',()=>{picker=null;render();},dialog);
    }
  }
  render();
}

