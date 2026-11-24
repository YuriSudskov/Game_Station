export const FACTIONS={
  hansa:{name:'Ганза',stations:['Серпуховская'],ringLine:true,marker:'#a77952'},
  spades:{name:'Пики',stations:['Ленинский проспект','Крымская']},
  crosses:{name:'Сектанты Кресты',stations:['Дубровка']},
  polis:{name:'Полис',stations:['Александровский сад','Арбатская','Библиотека имени Ленина','Боровицкая']},
  blues:{name:'Синие',stations:['Площадь Революции','Чкаловская']},
  reds:{name:'Красные',stations:['Кропоткинская','Парк Культуры']},
  diamonds:{name:'Бубны',stations:['Третьяковская']},
  hearts:{name:'Червы',stations:['Севастопольская','Каховская','Чертановская']},
};
const normalize=s=>s.toLocaleLowerCase('ru').replaceAll('ё','е');
export function stationFaction(station){
  if(station.lineColor==='brown')return 'hansa';
  return Object.entries(FACTIONS).find(([,f])=>f.stations.some(name=>normalize(name)===normalize(station.name)))?.[0]??null;
}
