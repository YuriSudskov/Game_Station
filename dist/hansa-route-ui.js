import {manualBattleBody} from './kolom-jrpg.js';
import {ITEMS} from './data.js';
import {HANSA_SCENES} from './hansa-route.js';
export function hansaRouteBody(s,{btn,esc,money,itemName,health,price,duty,renderLog,inventoryItemIcon,weaponDescription,armorDescription}){
 const a=s.interactiveMission,h=s.heroes.find(h=>h.id===a.heroIds[0]),node=a.node;
 const b=(label,choice,disabled=false,cls='secondary')=>btn(label,'hansaRouteChoice',`data-node="${node}" data-choice="${choice}" ${disabled?'disabled':''}`,cls);
 if(a.transition)return '<img class="hansa-route-art" src="./vasek-scenes/'+node+'.webp" alt="'+esc(HANSA_SCENES[node][0])+'"><h3>'+esc(HANSA_SCENES[node][0])+' · результат</h3><section class="hansa-choice-result hansa-transition" aria-live="polite">'+a.transition.lines.map(t=>'<p>'+esc(t)+'</p>').join('')+'</section>'+b(a.transition.label,'nextScene',false,'mission-start full');
 if(a.combat?.manual&&a.combat.manualStarted&&['pending','running'].includes(a.combat.status))return manualBattleBody({...a,battleTitle:'Бой на дрезине'},s.heroes);
 const back=b('Вернуться к торговцам','back'),customs=b('Идти к кордону Ганзы','customs'),izya=b('Встретиться с Изей Кацманом','izya');
 const stock=lots=>'<div class="hansa-route-stock">'+lots.map((lot,i)=>{const item=ITEMS[lot.item],description=item.type==='weapon'?weaponDescription(lot,false,h):item.type==='body'?armorDescription(lot):item.description??'';return '<div class="hansa-route-lot"><span class="item-icon">'+inventoryItemIcon(lot.item)+'</span><div><strong>'+esc(itemName(lot))+(lot.qty>1?' ×'+lot.qty:'')+'</strong><small>'+esc(description)+'</small></div>'+btn(lot.sold?'Куплено':money(price(s,lot))+' А','hansaRouteBuy',`data-index="${i}" ${lot.sold||s.money<price(s,lot)?'disabled':''}`,'secondary')+'</div>';}).join('')+'</div>'+btn('Купить все оставшиеся','hansaRouteBuy','data-index="-1" '+(lots.every(l=>l.sold)?'disabled':''),'secondary full');
 let actions='';
 if(['departure','tunnel1','tunnel2'].includes(node))actions=b(node==='departure'?'Отправиться в путь':'Продолжить путь','go');
 if(node==='ghoulBattle'){
  const combat=a.combat;
  actions=!combat?b('Бросить две гранаты и уехать','grenades',['grenades','molotovs','tinGrenades','lu216Grenades','dynamites'].reduce((n,k)=>n+(h[k]??0),0)<2)+b('Вступить в бой','fight',false,'danger'):combat.status==='recovery'?[['bandage','bandages','Бинт'],['dressingKit','dressingKits','Перевязочный набор'],['medicKit','medicKits','Аптечка медика'],['doctorKit','doctorKits','Аптечка доктора']].filter(([,key])=>h[key]>0).map(([item,key,label])=>b(label+' · '+h[key],'heal:'+item)).join('')+b('Продолжить путь','continue'):b(combat.status==='casualty'?'Продолжить бой с Васьком':'Следующий ход боя','turn',false,'mission-start');
  if(combat?.status==='recovery'&&['medic','doctor'].includes(h.profession))actions+=b('Профессиональное лечение · −1 Силы','treatment',combat.treatmentUsed);

 }
 if(node==='paveletskaya')actions=b('Осмотреть Павелецкую','market')+customs;
 if(node==='localMarket')actions=b(a.fortuneVisited?'Гадалка ушла':'Узнать судьбу · 10 А','fortune',a.fortuneVisited||s.money<100)+b('Посмотреть редкие товары','trader')+customs;
 if(node==='fortune')actions=a.fortuneStep<3?b('Продолжить разговор · ВОС '+[16,15,13][a.fortuneStep],'check'):back+customs;
 if(node==='rareTrader')actions=stock(a.rareStock)+b((a.discount??0)?'Торговаться дальше · скидка '+a.discount+'%':'Торговаться · ВОС 13','bargain',a.bargainClosed||(a.discount??0)>=30,(a.discount??0)>=20?'danger':(a.discount??0)?'rest-required':'secondary')+back+customs;
 if(node==='customs')actions=b('Заплатить пошлину · '+money(duty(s))+' А','duty',s.money<duty(s))+b('Дискутировать · ВОС 19','talk',a.failed.talk)+b('Договориться о мзде · ВОС 13, до 30 А','bribe',a.failed.bribe)+b('Вступить в бой — здесь нас завалят','fight',true)+b('Вернуться без договора','abandon');
 if(node==='hansa')actions=b('Осмотреть местную станцию','market')+izya;
 if(node==='hansaMarket')actions=stock(a.market)+b('Посидеть в кафе · две проверки ВОС 16','cafe')+izya;
 if(node==='specialTrader')actions=stock([a.special])+b('Вернуться к торговым рядам','back')+izya;
 if(node==='izya')actions=b('Поставки бесплатно · ВОС 18','free',a.failed.free)+b('За половину стоимости · ВОС 14, до 500 А','half',a.failed.half)+b('Заплатить до 1000 А','full')+b('Заплатить позже · постоянные +10% к ценам','credit');
 if(node==='return')actions=b('Вернуться обратно','finish',false,'mission-start');
 const dialogue=node==='fortune'?[
 'Гадалка: «Дай взглянуть на твою судьбу… Не отводи глаз, слушай меня».',
 'Гадалка: «Богатым будешь, молодым, красивым! Только позолоти ручку ещё немного».',
 'Пока гадалка прощается, рядом протискивается её сообщница. Следите за вещами.',
 'Разговор окончен. Гадалка скрылась среди людей — здесь её больше не найти.'
 ][a.fortuneStep??0]:node==='rareTrader'?(a.bargainClosed?'Торговец: «Вот окончательная цена. Покупаешь или дальше идёшь?»':(a.discount??0)>=30?'Торговец: «Последняя уступка. Ни патрона больше не скину».':'Торговец: «Присмотрись. Редкие вещи, не мусор. Выбирай — можем обсудить цену».'):node==='ghoulBattle'&&a.combat?(a.combat.status==='recovery'?'Васёк: «Отбились! Переведи дух, подлечись — и поедем дальше».':'Васёк: «Держись! Не давай им добраться до дрезины!»'):(HANSA_SCENES[node][1]);
 const feedback=a.feedbackNode===node?(a.feedback??[]):[];
 return '<img class="hansa-route-art" src="./vasek-scenes/'+node+'.webp" alt="'+esc(HANSA_SCENES[node][0])+'"><h3>'+esc(HANSA_SCENES[node][0])+'</h3><p class="hansa-dialogue">'+esc(dialogue)+'</p>'+health(h)+'<p class="note">С собой: '+money(s.money)+' А · Васёк: '+Math.max(0,a.vasek.hp)+' HP</p><div class="hansa-choice-result" aria-live="polite">'+feedback.map(t=>'<p>'+esc(t)+'</p>').join('')+'</div>'+(node==='ghoulBattle'&&a.combat?'<section class="battle-log">'+renderLog(a.combat.events)+'</section>':'')+'<div class="research-options">'+actions+'</div>';
}
