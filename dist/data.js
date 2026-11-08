export const ITEMS={
 butcherCleaver:{name:'Тесак Мясника',type:'weapon',combat:'melee',min:40,max:120,accuracyBonus:-5,stack:false,value:1000,rarity:'rare',icon:'knife',flavor:'Свежее мясо!',description:'Редкое оружие ближнего боя. Физический урон 40–120 + Сила × 10. −5 п.п. точности.'},
 kaBar:{name:'Нож «Ка-Бар»',type:'weapon',combat:'melee',min:5,max:60,stack:false,value:100,icon:'knife',description:'Стартовое оружие Штурмовика. Физический урон 5–60 + Сила × 10.'},
 traderNotes:{name:'Записки бывалого торговца',type:'consumable',stack:true,value:500,rarity:'rare',icon:'bag',description:'Даёт выбранному герою один дополнительный выбор перка.'},
 gasMaskFilter:{name:'Фильтр для противогаза',type:'currency',icon:'filter',description:'Ресурс для вылазок на поверхность.'},
 emptyBottle:{name:'Пустая бутылка',type:'resource',stack:true,icon:'bag',description:'Ингредиент для коктейля Молотова. Источник появится позже.'},
 molotov:{name:'Молотов',type:'grenade',stack:true,value:150,icon:'grenade',min:20,max:120,dodgeDc:13,description:'Термический урон 20–120 в начале боя и повторный урон огнём на втором ходу. Уклонение против 13 уменьшает урон вдвое.'},
 pipeGrenade:{name:'Трубная граната',type:'grenade',stack:true,value:150,icon:'grenade',min:30,max:180,dodgeDc:13,description:'Одна граната в начале боя. Термический урон 30–180. Уклонение против 13 уменьшает урон вдвое. Шанс задеть себя 5%, шанс сильного взрыва 10%.'},
 dressingKit:{name:'Перевязочный набор',type:'medicine',stack:true,value:90,icon:'medical',description:'Восстанавливает 20–50 + Восприятие × 10 HP. Можно взять на вылазку.'},
 ghoulKebab:{name:'Шашлык из Упыря',type:'food',stack:true,value:110,icon:'meat',description:'На станции восстанавливает 15% максимального HP + Сила × 7.'},
 leaderKebab:{name:'Редкий шашлык из Вожака',type:'food',stack:true,value:400,rarity:'rare',icon:'meat',description:'Восстанавливает 60–240 HP и даёт +2 к Силе на следующие четыре прохождения локаций.'},
 weaponUpgradePlan:{name:'Схема улучшения оружия',type:'resource',stack:true,rarity:'rare',icon:'bag',description:'Трофей Упыриного вожака. Применение появится позже.'},
 antiseptic:{name:'Антисептик',type:'resource',stack:true,value:130,icon:'medical',description:'Реагент, найденный на поверхности.'},
 strongTape:{name:'Крепкая изолента',type:'resource',stack:true,value:150,icon:'bag',description:'Материал, найденный на поверхности.'},
 intactBook:{name:'Уцелевшая книга',type:'resource',stack:true,value:200,rarity:'rare',icon:'bag',description:'Редкая сохранившаяся книга.'},
 armorPlates:{name:'Бронепластины',type:'resource',stack:true,value:250,icon:'jacket',description:'Материал для брони.'},
 ak74:{name:'АК74',type:'weapon',combat:'ranged',stack:false,value:1000,shots:3,shotPenalty:20,min:30,max:120,closeAccuracyBonus:5,icon:'assaultRifle',description:'Очередь из трёх выстрелов, −20 п.п. точности. Вплотную +5 п.п. точности.'},
 medicKit:{name:'Аптечка медика',type:'medicine',stack:true,value:300,icon:'medical',description:'Лечит 30–80 HP + 10 × Восприятие. Можно взять с собой на задание.'},
 radiationCloak:{name:'Плащ РАД-защиты',type:'accessory',stack:false,value:1500,radiationProtection:3,icon:'jacket',description:'Дополнительный слот снаряжения. +3 к защите от радиации, сочетается с бронёй.'},
 protectiveSuit:{name:'Защитный костюм',type:'accessory',stack:false,value:500,radiationProtection:2,icon:'gasmask',description:'Дополнительная защита. +2 РАД, ещё +1 РАД за каждый плюс качества. Сочетается с бронёй.'},
 rareMushrooms:{name:'Редкие подземные грибы',type:'resource',stack:true,value:200,rarity:'rare',icon:'bag',description:'Ингредиент для грибного чая. Можно найти по пути на Павелецкую.'},
 mushroomTea:{name:'Чай из Грибов',type:'food',stack:true,value:250,icon:'medical',description:'На станции снимает 1–4 + Сила РАД, даёт 50 опыта и навсегда уменьшает максимум HP на 3.'},
 hideArmor:{name:'Доспех Шкура',type:'body',stack:false,value:400,armor:20,thermalArmor:20,radiationProtection:1,icon:'jacket',description:'Поглощает 20 физического и 20 термического урона. Защита от РАД +1.'},
 ghoulJacket:{name:'Куртка из Упыря',type:'body',stack:false,value:800,armor:40,thermalArmor:10,meleeAccuracyBonus:5,rarity:'rare',icon:'jacket',description:'Редкая броня. Поглощает 40 физического и 10 термического урона. +5 п.п. к точности атак оружием ближнего боя.'},
 kazakVest:{name:'Бронежилет Казак',type:'body',stack:false,value:1050,armor:45,thermalArmor:25,accuracyPenalty:5,icon:'jacket',description:'Поглощает 45 физического и 25 термического урона. −5 п.п. точности с любым оружием.'},
 springMechanism:{name:'Пружинный механизм',type:'resource',stack:true,value:90,icon:'tool',description:'Деталь для сборки стрелкового оружия.'},
 pipe:{name:'Труба',type:'resource',stack:true,value:80,icon:'metal',description:'Материал для Обреза и винтовки Мосина. Продаётся у Юрася.'},
 bastard:{name:'Бастард ПП',type:'weapon',combat:'ranged',weaponClass:'automatic',min:30,max:80,shots:3,shotPenalty:20,stack:false,value:250,icon:'smg',description:'Очередь из трёх выстрелов. У каждого своя проверка попадания со штрафом −20 п.п. и отдельный расчёт физического урона.'},
 sawedOff:{name:'Обрез',type:'weapon',combat:'ranged',min:40,max:130,maxDistance:1,damageRolls:2,shotPenalty:10,reloadMain:true,stack:false,value:600,icon:'shotgun',description:'Дуплет на дистанции 0–1: одна проверка попадания со штрафом −10 п.п., два броска урона. В основном слоте следующий ход после выстрела уходит на перезарядку.'},
 mosin:{name:'Винтовка Мосина',type:'weapon',combat:'ranged',min:60,max:150,distancePenalty:10,piercing:true,reloadMain:true,bayonet:{min:10,max:80},twoSlots:true,rarity:'rare',stack:false,value:900,icon:'rifle',description:'Занимает оба слота. Пробивающий выстрел на любой дистанции. Штраф точности −10 п.п. за единицу дистанции. После выстрела перезаряжается, а вплотную в этот же ход атакует штыком.'},
 metalParts:{name:'Металлические части',type:'resource',stack:true,value:100,icon:'metal',description:'Материал для оружия в Цехе.'},
 sharpBlade:{name:'Острое лезвие',type:'resource',stack:true,value:300,rarity:'rare',icon:'knife',description:'Находка в Технопарке. Материал для Шила и винтовки Мосина.'},
 clawKnuckles:{name:'Когтистый кастет',type:'weapon',combat:'melee',min:30,max:100,stack:false,value:250,icon:'knife',description:'Физический урон 30–100 + Сила × 10.'},
 awl:{name:'Шило',type:'weapon',combat:'melee',min:10,max:80,stack:false,value:800,icon:'knife',rarity:'rare',piercing:true,description:'Редкое оружие. Физический урон 10–80 + Сила × 10. Пробивающий: игнорирует защиту цели.'},
 fullLeather:{name:'Целая кожа',type:'resource',stack:true,value:80,icon:'leather',description:'Изготовлена из четырёх обрывков кожи. Материал для качественной кожанки; отдельный предмет от шкуры упыря.'},
 qualityJacket:{name:'Качественная кожанка',type:'body',stack:false,value:220,armor:14,thermalArmor:10,icon:'jacket',description:'Поглощает 14 физического и 10 термического урона.'},
 pistol:{name:'Пистоль',type:'weapon',combat:'ranged',weaponClass:'pistol',min:10,max:50,stack:false,value:70,icon:'pistol',description:'Пистолет. Физический урон 10–50 без прибавки силы.'},
 mr73:{name:'Револьвер MR-73',type:'weapon',combat:'ranged',weaponClass:'pistol',min:20,max:160,maxDistance:2,stack:false,value:760,icon:'pistol',description:'Пистолет. Физический урон 20–160. Работает на дистанциях 0–2. Штраф точности −15 п.п. за единицу дистанции.'},
 ghoulHide:{name:'Шкура упыря',type:'resource',stack:true,value:30,icon:'leather',description:'Шкура, добытая при патрулировании тоннелей.'},
 sharpClaws:{name:'Острые когти',type:'resource',stack:true,value:40,icon:'knife',description:'Трофей упыря-разведчика.'},
 ghoulMeat:{name:'Мясо упыря',type:'resource',stack:true,value:40,icon:'meat',description:'Добыча из тоннелей.'},
 toughLeather:{name:'Прочная кожа',type:'resource',stack:true,value:200,icon:'leather',description:'Редкий ингредиент, добываемый в тоннелях.'},
 crowbar:{name:'Монтировка',type:'weapon',combat:'melee',min:0,max:80,stack:false,value:140,icon:'tool',description:'Физический урон 0–80 + Сила × 10.'},
 ashot:{name:'АШОТ',type:'weapon',combat:'ranged',weaponClass:'pistol',min:20,max:100,stack:false,value:150,icon:'pistol',description:'Физический урон 20–100. Штраф точности −15 п.п. за единицу дистанции.'},
 cloth:{name:'Обрывки ткани',type:'resource',stack:true,value:20,icon:'bag',description:'Материал для старых бинтов. Можно получить за помощь на станции или купить у Юрася комплектом из 3 штук.'},
 broth:{name:'Отвар из Крысы',type:'food',stack:true,value:60,icon:'medical',description:'На станции восстанавливает 10% максимального HP + Сила × 5. С собой на задание взять нельзя.'},
 knife:{name:'Нож',type:'weapon',combat:'melee',min:10,max:30,stack:false,value:50,icon:'knife',description:'Простой стальной нож. Физический урон 10–30, плюс Сила × 10 владельца.'},
 jacket:{name:'Старая кожаная куртка',type:'body',stack:false,value:100,armor:7,icon:'jacket',description:'Поношенная кожа ещё держит удар. Поглощает 7 физического урона.'},
 bandage:{name:'Старые бинты',type:'medicine',stack:true,value:30,icon:'medical',description:'Восстанавливают 10–30 + 10 × восприятие HP. У диверсанта — 30–50 HP.'},
 metal:{name:'Металлический мусор',type:'resource',stack:true,value:20,icon:'metal',description:'Из этого ещё можно что-нибудь сделать. Материал для оружейников.'},
 meat:{name:'Крысиное мясо',type:'resource',stack:true,value:30,icon:'meat',description:'На станции ничего не пропадает. Можно продать за 3 A.'},
 tooth:{name:'Золотой зуб',type:'resource',stack:true,value:200,icon:'tooth',description:'Чья-то забытая ценность. Базовая цена — 20 A.'},
 leather:{name:'Обрывки кожи',type:'resource',stack:true,value:30,icon:'leather',description:'Два обрывка нужны для старой кожаной куртки.'}
};
export const PERKS={
 'burst-fire':{name:'Огонь очередями',description:'На один выстрел больше в каждой очереди.'},
 'tough-cookie':{name:'Твёрдый орешек',description:'После каждого выигранного боя без оставшихся медикаментов восстанавливает 5 × Сила HP.'},
 'quick-orders':{name:'Быстрые приказы',description:'Время выполнения заданий сокращается на 15%.'},
 sharp:{name:'Резкий',description:'+2 инициативы и +3 п.п. уклонения.'},
 'melee-evasion':{name:'Чутьё бойца',description:'+1,4 п.п. уклонения за каждый уровень только на дистанции 0. На дистанции 1 и больше бонус не действует.'},
 evasion:{name:'Лёгкий шаг',description:'Постоянно +5 п.п. уклонения.'},
 initiative:{name:'Быстрая реакция',description:'Постоянно +4 к инициативе.'},
 'double-strike':{name:'Двойной удар',description:'Две атаки за ход. Каждая: −10 п.п. точности и −20 урона. Навык пока дорабатывается.'}
};
export const CONFIG={hero:{maxHp:180,strength:2,agility:3,intelligence:1,perception:2,initiative:3,accuracy:10,evasion:60,armor:0,weaponMin:10,weaponMax:30},rat:{hp:80,initiative:2,stealth:4,agility:2,accuracy:5,evasion:60,armor:10,damageMin:20,damageMax:30},mission:{searches:4,searchDc:10,lootDc:7,seconds:7,baseXp:10,findXp:1,killXp:5,lootXp:3},loot:[{id:'metal',name:'Металлический мусор',chance:100},{id:'meat',name:'Крысиное мясо',chance:50},{id:'tooth',name:'Золотой зуб',chance:10}],trial:{combatTurnLimit:300,damageMode:'integer'}};
export const RECIPES={
 medicKit:{name:'Аптечка медика',production:'medicine',level:6,cost:50,seconds:20,ingredients:{antiseptic:1,dressingKit:1},output:'medicKit',xp:20,batch:true},
 butcherCleaver:{name:'Тесак Мясника',production:'melee',level:6,cost:200,seconds:25,ingredients:{metalParts:3,sharpBlade:1},output:'butcherCleaver',xp:50},
 quilted:{name:'Ватник',production:'science',level:3,cost:100,seconds:20,ingredients:{ghoulHide:2},upgrade:true,target:'body',chance:70,prefix:'Ватник на',firstHitArmor:15,valueBonus:160,xp:20},
 charcoalFilters:{name:'Угольные Фильтры',production:'science',level:4,cost:200,seconds:10,ingredients:{},output:'gasMaskFilter',xp:10,chance:80,batch:true},
 molotov:{name:'Коктейль молотова',production:'science',level:5,cost:100,seconds:15,ingredients:{emptyBottle:1},output:'molotov',xp:12,chance:75,batch:true},
 ergonomic:{name:'Анатомический *',production:'upgrade',level:4,cost:50,seconds:20,ingredients:{fullLeather:1},upgrade:true,target:'melee',chance:70,prefix:'Удобный',accuracyBonus:5,valueBonus:150,xp:20},
 receiver:{name:'Улучшение ресивера',production:'upgrade',level:5,cost:150,seconds:30,ingredients:{springMechanism:1},upgrade:true,target:'ranged',chance:66,prefix:'Мощный',minBonus:10,maxBonus:20,valueBonus:250,xp:15},
 pipeGrenade:{name:'Трубная граната',production:'upgrade',level:3,cost:40,seconds:10,ingredients:{metalParts:1},output:'pipeGrenade',xp:10,chance:75,batch:true,refundOnFailure:true},
 dressingKit:{name:'Перевязочный набор',production:'medicine',level:3,cost:40,seconds:10,ingredients:{cloth:2},output:'dressingKit',xp:5,batch:true},
 ghoulKebab:{name:'Шашлык из Упыря',production:'medicine',level:4,cost:20,seconds:15,ingredients:{ghoulMeat:2},output:'ghoulKebab',xp:12,batch:true},
 mushroomTea:{name:'Чай из Грибов',production:'medicine',level:5,cost:30,seconds:10,ingredients:{rareMushrooms:1},output:'mushroomTea',xp:20,batch:true},
 hideArmor:{name:'Укрепить шкурами',production:'armor',level:4,cost:100,seconds:30,ingredients:{qualityJacket:1,ghoulHide:4},output:'hideArmor',xp:40},
 ghoulJacket:{name:'Куртка из Упыря',production:'armor',level:5,cost:0,seconds:60,ingredients:{qualityJacket:1,toughLeather:2},output:'ghoulJacket',xp:80},
 kazakVest:{name:'Бронежилет Казак',production:'armor',level:6,cost:150,seconds:60,ingredients:{toughLeather:2,armorPlates:2},output:'kazakVest',xp:50},
 springMechanism:{name:'Пружинный механизм',production:'ranged',level:2,cost:50,seconds:10,ingredients:{metal:3},output:'springMechanism',xp:8,batch:true},
 bastard:{name:'Бастард ПП',production:'ranged',level:3,cost:100,seconds:30,ingredients:{metal:3,springMechanism:1},output:'bastard',xp:20},
 sawedOff:{name:'Обрез',production:'ranged',level:4,cost:150,seconds:30,ingredients:{pipe:2,metalParts:3},output:'sawedOff',xp:30},
 mosin:{name:'Винтовка Мосина',production:'ranged',level:5,cost:0,seconds:60,ingredients:{pipe:1,springMechanism:1,metalParts:3,sharpBlade:1},output:'mosin',xp:50},
 mr73:{name:'Револьвер MR-73',production:'ranged',level:6,cost:200,seconds:40,ingredients:{springMechanism:2,pipe:1,metalParts:3},output:'mr73',xp:50},
 metalParts:{name:'Металлические части',production:'melee',level:3,cost:40,seconds:12,ingredients:{metal:4},output:'metalParts',xp:8,batch:true},
 clawKnuckles:{name:'Когтистый кастет',production:'melee',level:4,cost:0,seconds:20,ingredients:{metalParts:1,sharpClaws:3},output:'clawKnuckles',xp:20},
 awl:{name:'Шило',production:'melee',level:5,cost:100,seconds:30,ingredients:{sharpBlade:1,metalParts:3},output:'awl',xp:40},
 lcu:{name:'LCU',production:'science',level:2,cost:150,seconds:12,ingredients:{},upgrade:true,target:'ranged',chance:70,prefix:'LCU',accuracyBonus:5,valueBonus:150,xp:15},
 patchedArmor:{name:'Штопанная броня',production:'science',level:1,cost:100,seconds:10,ingredients:{leather:2},upgrade:true,target:'body',chance:80,prefix:'Штопаный',armorBonus:7,valueBonus:100,xp:10,supersededBy:'reinforcedArmor'},
 protectiveSuit:{name:'Защитный костюм',production:'science',level:6,cost:0,seconds:30,ingredients:{ghoulHide:6,toughLeather:2},output:'protectiveSuit',chance:100,xp:20},
 reinforcedArmor:{name:'Укреплённая броня',production:'science',level:7,cost:200,seconds:20,ingredients:{toughLeather:1},upgrade:true,target:'body',chance:65,prefix:'Укреплённый',armorBonus:14,thermalArmorBonus:7,valueBonus:400,xp:20,replaces:'patchedArmor'},
 fullLeather:{name:'Целая кожа',production:'armor',level:2,cost:30,seconds:10,ingredients:{leather:4},output:'fullLeather',xp:10,batch:true},
 qualityJacket:{name:'Качественная кожанка',production:'armor',level:3,cost:100,seconds:12,ingredients:{leather:3,fullLeather:1},output:'qualityJacket',xp:22},
 knife:{name:'Нож',production:'melee',level:1,cost:50,seconds:5,ingredients:{metal:1},output:'knife',xp:5,legacy:true},
 kaBar:{name:'Нож «Ка-Бар»',production:'melee',level:1,cost:40,seconds:8,ingredients:{metal:1,leather:1},output:'kaBar',xp:10},
 crowbar:{name:'Монтировка',production:'melee',level:2,cost:70,seconds:12,ingredients:{metal:3},output:'crowbar',xp:10},
 ashot:{name:'АШОТ',production:'ranged',level:1,cost:100,seconds:8,ingredients:{metal:2},output:'ashot',xp:15},
 jacket:{name:'Старая кожаная куртка',production:'armor',level:1,cost:50,seconds:8,ingredients:{leather:2},output:'jacket',xp:10},
 bandage:{name:'Старые бинты',production:'medicine',level:1,cost:10,seconds:5,ingredients:{cloth:1},output:'bandage',xp:2,batch:true},
 broth:{name:'Отвар из Крысы',production:'medicine',level:2,cost:20,seconds:7,ingredients:{meat:1},output:'broth',xp:6,batch:true},
 sharpen:{name:'Заточка оружия +7',production:'upgrade',level:1,cost:100,seconds:10,ingredients:{},upgrade:true,target:'melee',chance:80,prefix:'Заточенный',bonus:7,valueBonus:100,xp:10},
 psct:{name:'ПСЦТ',production:'upgrade',level:2,cost:150,seconds:12,ingredients:{},upgrade:true,target:'ranged',chance:75,prefix:'ПСЦТ',bonus:20,accuracyBonus:-5,valueBonus:150,xp:15}
};
export const PRODUCTIONS={melee:{name:'Цех',icon:'knife'},ranged:{name:'Стрелковое оружие',icon:'gun'},armor:{name:'Броня',icon:'jacket'},medicine:{name:'Медицина',icon:'medical'},upgrade:{name:'Оружейное дело',icon:'tool'},science:{name:'Наука',icon:'science'}};
export const MAX_PRODUCTION_LEVEL=13;
export const LOCATION_LEVELS={help:1,mission:2,patrol:3,caravan:4,technopark:5,surface:6};
export const PRODUCTION_XP={1:10,2:30,3:60,4:100,5:150,6:210,7:280,8:360,9:450,10:550,11:660,12:780};
export function productionXpThreshold(id,level){return Object.hasOwn(PRODUCTIONS,id)&&level<MAX_PRODUCTION_LEVEL?PRODUCTION_XP[level]:undefined;}
export const TRADE_MODIFIERS=[-15,-10,0,10,15];
export const TRADE_EFFECTS={ '-15':{xp:.5,cooldown:2},'-10':{xp:.7,cooldown:1.5},0:{xp:1,cooldown:1},10:{xp:1.3,cooldown:.7},15:{xp:1.5,cooldown:.5}};
export const CAPACITY=20;
export const STARTING_SHELVES=4;
export const MAX_SHELVES=16;

// Routes announced by the author; gameplay parameters will be specified separately.
export const PLANNED_LOCATIONS=[
 {id:'tunnel-patrol',name:'Патрулирование тоннелей',area:'underground',icon:'map'},
 {id:'paveletskaya-caravan',name:'С караваном на Павелецкую',area:'underground',icon:'bag'},
 {id:'technopark',name:'Исследовать Технопарк',area:'underground',icon:'station'},
 {id:'station-surroundings',name:'Рыскать в окрестностях станции',area:'surface',icon:'map'},
 {id:'surface-shops',name:'Осмотреть магазины',area:'surface',icon:'shop'},
 {id:'zil',name:'Исследовать ЗИЛ',area:'surface',icon:'station'}
];

export const PATROL={requiredLevel:3,enemy:{name:'упырь-разведчик',hp:150,evasion:40,accuracy:10,initiative:1,stealth:2,armor:10,thermalArmor:0,damageMin:40,damageMax:100,attackName:'физическая атака'},mission:{searches:2,searchDc:8,lootPerKill:true,seconds:14,baseXp:10,findXp:0,killXp:20,lootXp:0},loot:[{id:'ghoulHide',name:'Шкура упыря',chance:80},{id:'sharpClaws',name:'Острые когти',chance:60},{id:'ghoulMeat',name:'Мясо упыря',chance:50},{id:'toughLeather',name:'Прочная кожа',chance:10}]};
export const SURFACE={
 seconds:20,baseXp:30,dogXp:8,guardXp:15,
 description:'Слыш, гляжу у тебя кишка не тонка, может на поверхность выйти хочешь? В длинные вылазки туда ходят только по двое, но если на 10 минут — можно и одному попробовать. Один фильтр защитит тебя от радиоактивной пыли на 20 минут, так что успей вовремя вернуться, и да, радиация там то 2 то 3 у входа, запасись чем-нибудь.',
 dog:{name:'Мутировавшая собака',hp:120,evasion:50,accuracy:10,damageMin:40,damageMax:70,armor:10,thermalArmor:0,stealth:1,initiative:1,attackName:'Укус'},
 tiers:[
  {dc:8,text:'Кажется, в этом магазине ещё что-то осталось не разграбленным…',hidden:'Так, тут следы каких-то собак? Спрячусь-ка, а потом продолжим…',spotted:'Чёрт, собаки меня заметили… Ёпт, ствол где?',loot:[{item:'metalParts',chance:80},{item:'antiseptic',chance:40},{item:'strongTape',chance:25},{item:'intactBook',chance:10}]},
  {dc:13,text:'О, кажется, вон там ещё несколько растерзанных трупов за углом… посмотрим.',hidden:'Ага, это Суслики постарались, пора валить, пока меня не заметили…',spotted:'Чёрт, это Суслики… Слышен вой одного из Стражей.',loot:[{item:'armorPlates',chance:80},{currency:'money',min:12,max:30,chance:40},{currency:'filters',chance:25},{item:'ak74',chance:10}]},
  {dc:18,text:'О! Это, кажется, схрон сталкеров. Давай-ка заглянем. Проверю на ловушки…',loot:[{currency:'money',min:15,max:30,chance:80},{currency:'filters',min:1,max:2,chance:40},{item:'medicKit',chance:25},{item:'radiationCloak',chance:10}]}
 ]
};
export const CARAVAN={
 seconds:60,
 description:'Дрезина каравана сломалась, и теперь нужно идти по тоннелю пешком. Упыри иногда нападают на караван, так что нам нужна защита. Платим 30 A, если все доберутся туда живыми. А обратно тебя на дрезине привезём.',
 escort:{hp:200,armor:20,evasion:50,accuracy:5},
 enemy:{...PATROL.enemy,name:'Большой Упырь',hp:300,evasion:35,accuracy:10,stealth:1,damageMin:50,damageMax:110,powerSwing:{accuracyPenalty:10,damageBonus:20}},
 mission:{segments:3,attackChances:[25,40,50],baseXp:30,findXp:0,killXp:15,lootXp:0,lootPerKill:true},
 loot:PATROL.loot
};
export const TECHNOPARK={
 radiation:2,
 seconds:30,
 description:'Тоннель за постом охраны ведёт на заброшенную станцию. Когда-то у неё был стеклянный потолок, наверное, это считалось современным. Теперь через дырки в потолке на станцию попадают снег, радиация и монстры Стражи. Их ещё называют «сусликами» из-за стойки, в которой они патрулируют территорию. Если не снять суслика первым выстрелом, он будет выть и призовёт своих собратьев, и придётся разобраться и с ними.',
 enemy:{name:'Страж',hp:210,evasion:45,stealth:2,initiative:2,accuracy:10,armor:17,thermalArmor:0,damageMin:30,damageMax:100,attackName:'Укус',rush:{accuracyBonus:10,min:50,max:120}},
 mission:{ambushDc:10,baseXp:20,findXp:0,killXp:15,lootXp:0,lootPerKill:true,finds:[{id:'metal',dc:8},{id:'pipe',dc:12},{id:'sharpBlade',dc:19,xp:10}]},
 loot:[{id:'leather',chance:100},{id:'fullLeather',chance:55},{id:'sharpClaws',chance:30},{id:'toughLeather',chance:10}]
};
export const patrolReady=()=>['initiative','stealth','armor','damageMin','damageMax'].every(key=>Number.isInteger(PATROL.enemy[key]));

export const PROFESSIONS={
 "saboteur": {
  "name": "Диверсант",
  "strength": 2,
  "agility": 3,
  "intelligence": 1,
  "perception": 2,
  "available": true,
  "requiredRosterLevel": 1
 },
 "assault": {
  "name": "Штурмовик",
  "strength": 3,
  "agility": 2,
  "intelligence": 1,
  "perception": 2,
  "available": false,
  "requiredRosterLevel": 1
 },
 "heavy": {
  "name": "Тяж",
  "strength": 4,
  "agility": 1,
  "intelligence": 0,
  "perception": 3,
  "available": false,
  "requiredRosterLevel": 1
 },
 "hunter": {
  "name": "Охотник",
  "strength": 2,
  "agility": 2,
  "intelligence": 1,
  "perception": 3,
  "available": false,
  "requiredRosterLevel": 1
 },
 "engineer": {
  "name": "Инженер",
  "strength": 3,
  "agility": 0,
  "intelligence": 4,
  "perception": 1,
  "available": false,
  "requiredRosterLevel": 5
 },
 "bandit": {
  "name": "Бандит",
  "strength": 2,
  "agility": 3,
  "intelligence": 0,
  "perception": 3,
  "available": false,
  "requiredRosterLevel": 1
 },
 "medic": {
  "name": "Медик",
  "strength": 2,
  "agility": 1,
  "intelligence": 2,
  "perception": 3,
  "available": false,
  "requiredRosterLevel": 1
 },
 "doctor": {
  "name": "Доктор",
  "strength": 1,
  "agility": 1,
  "intelligence": 2,
  "perception": 4,
  "available": false,
  "requiredRosterLevel": 1
 }
};

export const IDENTITIES={ivan:{name:'Иван',nationality:'Русский'},hans:{name:'Ганс',nationality:'Немец'},izya:{name:'Изя',nationality:'Еврей'}};
Object.assign(PROFESSIONS.assault,{available:true,combatReady:true,weapon:'kaBar',accuracy:8,perks:['burst-fire','tough-cookie','quick-orders','sharp']});
Object.assign(PROFESSIONS.saboteur,{perks:['melee-evasion','evasion','initiative','double-strike'],weapon:'knife',accuracy:10,evasionBonus:2.5,combatReady:true});
Object.assign(PROFESSIONS.engineer,{available:true,requiredRosterLevel:1,perks:[],weapon:null,accuracy:null,evasionBonus:0,combatReady:false});

Object.assign(PERKS,{
 armored:{name:'Бронированный',description:'Постоянно +5 к поглощению физического и +5 к поглощению термического урона.'},
 greedy:{name:'Жадный',description:'При получении награды за успешное задание дополнительно приносит A по уровню героя. За серию — один раз при общем получении.'},
 gunsmith:{name:'Оружейник',description:'Все рецепты оружейного дела получают +5 п.п. к шансу успеха за каждого инженера с этим перком. Максимум 100%.'},
 'double-shot':{name:'Пистолеты',description:'Два выстрела за ход из пистолета. Каждый: −15 п.п. точности, без снижения урона.'}
});
Object.assign(PROFESSIONS.engineer,{perks:['armored','greedy','gunsmith','double-shot'],startReady:true,weapon:'pistol',rangedWeapon:null,accuracy:8,combatReady:true});

Object.assign(IDENTITIES.ivan,{bonuses:{hp:30},description:'+30 к стартовому и максимальному здоровью.'});
Object.assign(IDENTITIES.hans,{bonuses:{accuracy:5},description:'+5 п.п. точности.'});
Object.assign(IDENTITIES.izya,{bonuses:{questMoneyPercent:10},description:'+10% A за каждое успешное задание, минимум +1 A. В серии — за каждое прохождение.'});
IDENTITIES.john={name:'Джон',nationality:'Американец',bonuses:{pistolDamage:8},description:'+8 урона каждым попаданием из пистолета.'};

// Explicit author-approved levels only. Intelligence 6–10 is not specified yet.
export const LEVEL_PERK_SCHEDULES={
 0:[4,8,12,16,20,24,28,32],
 1:[3,6,9,12,15,18,20,23,26,29,32],
 2:[3,5,8,10,13,15,18,20,23,25],
 3:[3,5,7,9,11,13,15,17,20],
 4:[2,4,6,8,10,12,14,16,18,20],
 5:[2,4,5,7,8,10,11,13,15,17,18,20],
 6:[2,4,5,7,8,10,11,13,14,16,17,19,20],
 7:[2,3,5,6,7,8,10,11,12,14,15,16,17,19,20],
 8:[2,3,4,6,7,8,9,10,12,13,14,15,16,18,19,20],
 9:[2,3,4,5,6,7,8,9,10,12,13,14,15,16,17,18,19,20],
 10:[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]
};

export const LEVEL_PERKS={
 'assault-accurate':{name:'Точный',profession:'assault',minLevel:2,repeatable:false,description:'+5 п.п. точности.'},
 'assault-reaction':{name:'Быстрая реакция',profession:'assault',minLevel:3,repeatable:false,description:'+2 к инициативе и +4 п.п. уклонения.'},
 'assault-enduring':{name:'Выносливый',profession:'assault',minLevel:4,repeatable:false,hpBonus:80,description:'Сразу +80 к текущему и максимальному HP.'},
 'assault-burst':{name:'В очередь!',profession:'assault',minLevel:5,repeatable:false,description:'+10 п.п. точности при стрельбе очередями.'},
 'engineer-shooter':{name:'Стрелок',profession:'engineer',minLevel:2,repeatable:false,description:'+5 п.п. точности со стрелковым оружием.'},
 'engineer-armorer':{name:'Бронник',profession:'engineer',minLevel:3,repeatable:false,description:'+10 к поглощению физического урона.'},
 'engineer-side-job':{name:'Халтурка',profession:'engineer',minLevel:4,repeatable:false,description:'При выборе и на каждом новом уровне приносит 80 A + 10 A × текущий уровень.'},
 'engineer-assistant':{name:'Личный помощник',profession:'engineer',minLevel:5,repeatable:false,description:'+5 п.п. к шансу успеха всех рецептов на станции, максимум 100%.'},
 'favorite-close':{name:'Любимый Ближний',profession:'saboteur',minLevel:2,repeatable:false,description:'+5 п.п. точности и +5 урона на дистанции 0.'},
 'quick-reaction':{name:'Быстрая реакция',profession:'saboteur',minLevel:3,repeatable:false,description:'+2 инициативы и +3 п.п. уклонения постоянно.'},
 'samurai':{name:'КакСамурай',profession:'saboteur',minLevel:4,repeatable:false,description:'+4 к урону в ближнем бою за уровень, начиная с уровня выбора.'},
 'enduring':{name:'Выносливый',profession:'saboteur',minLevel:5,repeatable:true,description:'+30 к максимуму HP. Можно выбирать многократно; текущее здоровье не увеличивается.'}
};

for(const [profession,profile] of Object.entries(PROFESSIONS)){
 for(const id of profile.perks??[]){
  LEVEL_PERKS[id]={...PERKS[id],profession,minLevel:1,repeatable:false,starterEffect:id};
 }
}
