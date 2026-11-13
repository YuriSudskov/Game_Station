const choose=(id,label)=>({id,label,resolve:'roofRoute'});
const scene=(title,image,text,choices=[])=>({title,image:'./zil-'+image+'.svg',text,choices});
export const roofWeather={2:'Ясно',3:'Пасмурно',4:'Идёт зелёный снег'};
export const roofSceneNumbers={
 roofHub:1,roofApproach:2,roofGuard:3,shop:4,roofBoss:5,roofShopSearch:6,
 depot:7,roofSilent:8,roofSilentMeeting:9,warehouse:10,roofRats:11,roofGrass:12,
 roofSearch:13,roofNight:14,roofLost:15,roofFound:16,roofKeeper:17,roofTimer:18,
 roofAttack:19,roofFinal:20,'battle-report':21,recovery:22,casualty:23
};
export const roofIllustration=(number,variant='')=>'./roof-scenes/technopark-'+number+variant+'.webp';
export function roofCombatIllustration(number,combat){
 const variant={roofShopSearch:'b',roofGrass:'c',roofTimer:'d',roofSilent:'e'}[combat.nextNode]??'';
 return roofIllustration(number,variant);
}
export const roofMission={
 name:'Материалы для крыши Технопарка',filtersPerHero:0,minHeroes:1,maxHeroes:2,entry:'roofHub',
 nodes:{
  roofHub:scene('Выход на поверхность','exit','По сведениям из предыдущих вылазок есть три места где надо искать. С чего начнём?',[
   choose('shop','Разрушенный строймагазин'),choose('depot','Открытая ветка депо'),choose('warehouse','Крытый склад завода'),choose('report','Доложить Смотрителю')]),
  roofApproach:scene('Прячемся от Стражей','alley','Отряд пытается пройти незамеченным.',[choose('sneak','Проверить скрытность · 12')]),
  roofGuard:scene('Стая Стражей','guard-ambush','Стражи заметили отряд.'),
  shop:scene('Приоткрытая дверь склада','hatch','Заглянем тихонечко.',[choose('boss','Подкрасться и осмотреться · 14')]),
  roofBoss:scene('Аберрация','mature-guard','Из темноты выходит Аберрация.'),
  roofShopSearch:scene('Обыск строймагазина','stash','Теперь можно осмотреть склад целиком.',[choose('searchShop','Обыскать трупы в магазине')]),
  depot:scene('Ловушки на ветке депо','sewer-trap','Впереди капкан, растяжка и нажимная мина.',[choose('trap','Проверить следующую ловушку')]),
  roofSilent:scene('База Молчуна','rail-walk','За последней ловушкой виднеется укрытие. Из-за мешков с песком на отряд смотрит снайпер.',[choose('enterSilent','Подойти к укрытию')]),
  roofSilentMeeting:scene('Знакомство с Молчуном','stash','Молчун в камуфляже кивает вам, глядя через прицел СФД. «Вот и познакомились», — говорит первый герой.',[choose('meet','Поговорить о материалах')]),
  warehouse:scene('Островок зелёной травы','alley','Посреди талого снега колосится пук-трава.',[choose('rats','Изучить траву'),choose('skip','Пройти к складу')]),
  roofRats:scene('Стая бешеных крыс','guard-ambush','Из укрытий бросаются бешеные крысы.'),
  roofGrass:scene('Пук-трава','alley','Путь к траве свободен.',[choose('grass','Собрать две пук-травы')]),
  roofSearch:scene('Крытый склад завода','long-corridor','Склад большой. Похоже, здесь никого.',[choose('search','Искать материалы · 17')]),
  roofNight:scene('Стемнело','recovery','Можно уйти и вернуться позже или остаться на ночь. Риск гибели всего отряда — 50%.',[choose('sleep','Заночевать · 8 фильтров')]),
  roofLost:scene('Утром никто не вернулся','recovery','Догоревший костёр, пустые лежаки и глаза в темноте.',[choose('lost','Утром никто не вернулся')]),
  roofFound:scene('Итог осмотра','stash','',[choose('hub','Вернуться к выбору мест')]),
  roofKeeper:scene('Доклад Смотрителю','station','Материалы доставлены. Как будем ремонтировать свод?',[
   choose('slow','Медленно · 5 минут · 300 А · риск 35%'),choose('fast','Быстро · 2 минуты · бесплатно · риск 65%')]),
  roofTimer:scene('Ремонт стеклянного свода','station','Отряд устанавливает остекление.'),
  roofAttack:scene('Защита Технопарка','guard-ambush','Четыре Стража атакуют. Со второго раунда к ним присоединится Матёрый.'),
  roofFinal:scene('Технопарк восстановлен','technopark-restored','Под целым стеклянным сводом чистая платформа. В углублении путей стоит вода, посреди неё — разбитая машина. Радиация: 0 РАД.',[choose('finish','Осмотреть Технопарк')])
 }
};
