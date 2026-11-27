import {applyProfessionBalance} from './profession-balance.js';
import {roofMission} from './roof-route.js';
export {CHANGELOG} from './changelog.js';
export const ITEMS={
 chemicalSuit:{name:'Костюм химзащиты',type:'accessory',equipmentCategory:10,requiredHeroLevel:10,stack:false,value:3000,radiationProtection:4,icon:'gasmask',description:'Дополнительная защита: +4 RAD, ещё +1 за каждый плюс качества. Требует 10-й уровень героя, сочетается с бронёй.'},
 advancedChemicalSuit:{name:'Продвинутый костюм химзащиты',type:'accessory',equipmentCategory:15,requiredHeroLevel:15,stack:false,value:9000,radiationProtection:6,icon:'gasmask',description:'Дополнительная защита: +6 RAD, ещё +1 за каждый плюс качества. Требует 15-й уровень героя, сочетается с бронёй.'},
 poisonousSting:{name:'Ядовитое жало',type:'loot',stack:true,value:250,icon:'knife',description:'Трофей хитинового скорпион-паука.'},
 fourfoldShotgun:{name:'Четырёхплет',type:'weapon',combat:'ranged',weaponClass:'shotgun',min:20,max:200,maxDistance:2,damageRolls:2,shotPenalty:10,reloadMain:true,reloadEverySlot:true,reloadCycle:2,equipmentCategory:5,requiredHeroLevel:5,value:8000,stack:false,rarity:'unique',rewardOnly:true,icon:'zauer',description:'Уникальный дробовик, 20–200 урона за попадание, дуплет −10 п.п. Магазин 4: два дуплета до перезарядки. Дистанция 0–2.'},
 radioactiveGrenade:{name:'Радиоактивная граната',type:'grenade',stack:true,value:375,min:12,max:24,dodgeDc:14,damageType:'radiation',icon:'grenade',description:'12–24 облучения минус РАД цели. Уклонение 14: половина облучения без отравления. При провале 50% пропустить следующий ход.'},
 improvedBeetleBattery:{name:'Улучшенная жучиная батарея',type:'resource',stack:true,value:3000,icon:'tool',description:'Постоянное питание оборудования без риска облучения.'},
 beetleBattery:{name:'Жучиная батарея',type:'resource',stack:true,value:1000,icon:'tool',description:'5% шанс получить 1 РАД после локации или вылазки независимо от защиты. Одна батарея навсегда подключается к герою и постоянно питает лазерное оружие. Изготавливается в Науке.'},
 laserEmitter:{name:'Лазерный излучатель',type:'resource',stack:true,value:800,icon:'tool',description:'Источник направленного термического луча. Компонент лазерного оружия.'},
 laserPistol:{requiresBeetleBattery:true,name:'Лазерный пистолет',type:'weapon',combat:'ranged',weaponClass:'pistol',damageType:'thermal',accuracyBonus:5,min:40,max:160,maxDistance:2,equipmentCategory:10,stack:false,value:4000,icon:'gun',description:'40–160 термического урона, +5 п.п. точности. Пистолет, дистанция 0–2.'},
 laserRifle:{requiresBeetleBattery:true,name:'Лазерная винтовка',type:'weapon',combat:'ranged',weaponClass:'rifle',damageType:'thermal',accuracyBonus:5,min:70,max:230,maxDistance:3,equipmentCategory:10,stack:false,value:5000,icon:'gun',description:'70–230 термического урона, +5 п.п. точности. Винтовка, дистанция 0–3, один выстрел.'},
 heavyLaser:{name:'Тяжёлый лазер',type:'weapon',combat:'ranged',weaponClass:'heavy',damageType:'thermal',accuracyBonus:5,min:35,max:125,shots:3,shotPenalty:20,maxDistance:3,equipmentCategory:10,requiresBeetleBattery:true,rangedSlotOnly:true,stack:false,value:6000,icon:'gun',description:'35–125 термического урона ×3, +5 п.п. точности, штраф −20 п.п. на выстрел, дистанция 0–3. Требует однократно подключить жучиную батарею к герою.'},
 piercerBlade:{name:'Клинок пронзателя',type:'weapon',combat:'melee',min:25,max:140,strengthMultiplier:10,piercing:true,equipmentCategory:10,value:5000,rarity:'rare',stack:false,icon:'piercerBlade',description:'25–140 + Сила ×10 физического урона. Пробивающее: игнорирует поглощение защиты цели.'},
 kolomenskayaBeetles:{name:'Живой странный жук',type:'resource',stack:true,value:200,icon:'bag',description:'Редкая находка: 5% успешных попыток ловли жука Ловкостью. Открывает исследование живого жука после изучения тушки.'},
 kolomenskayaBeetleCorpse:{name:'Тушка странного жука',type:'resource',stack:true,value:100,icon:'bag',description:'Мёртвый образец для исследования жуков. Источник получения — скоро.'},
 grassGum:{name:'Жвачка из травы',type:'stimulant',stack:false,value:700,icon:'stimulant',description:'10 применений. На время локации +1 Ловкости, +1 к обнаружению и +25% к скорости прохождения (время делится на 1,25).'},
 pukGrassDecoction:{name:'Отвар из пук-травы',type:'food',stack:true,value:400,icon:'medical',description:'На станции снимает 2–5 + Сила РАД. Не уменьшает максимум здоровья и не даёт опыта за применение.'},
 kevlarMaterial:{name:'Кевларовый материал',type:'resource',stack:true,value:700,rarity:'rare',icon:'bag',description:'Плотное многослойное полотно, обработанное химическим составом. Основа кевларовой брони.'},
 kevlarLight:{name:'Лёгкая кевларовая броня',type:'body',armorClass:'light',equipmentCategory:10,stack:false,value:3000,armor:70,thermalArmor:40,ricochet:5,rarity:'rare',icon:'jacket',description:'Лёгкая броня. Поглощение 70/40, рикошет 5%. Без штрафа точности.'},
 kevlarMedium:{name:'Средняя кевларовая броня',type:'body',armorClass:'medium',equipmentCategory:10,stack:false,value:3800,armor:85,thermalArmor:35,ricochet:10,accuracyPenalty:5,missionTimePenaltyPercent:10,evasionBonusCap:40,rarity:'rare',icon:'vestMetal',description:'Средняя броня. Поглощение 85/35, рикошет 10%. −5 п.п. точности, задания +10% времени, предел прибавки уклонения +40 п.п.'},
 kevlarHeavy:{name:'Тяжёлая кевларовая броня',type:'body',armorClass:'heavy',equipmentCategory:10,stack:false,value:5000,armor:100,thermalArmor:45,ricochet:15,accuracyPenalty:10,missionTimePenaltyPercent:20,evasionBonusCap:25,rarity:'rare',icon:'heavyWorkshop',description:'Тяжёлая броня. Поглощение 100/45, рикошет 15%. −10 п.п. точности, задания +20% времени, предел прибавки уклонения +25 п.п.'},
yatagan:{"name":"Ятаган","type":"weapon","combat":"melee","min":30,"max":160,"strengthMultiplier":10,"criticalBonus":5,"value":5200,"equipmentCategory":5,"stack":false,"icon":"knife"},
abzats:{"name":"Абзац","description":"Тяжёлый дробомёт. Урон 30–220 за попадание, очередь из 5 выстрелов со штрафом точности −25 п.п. Дистанции 0–2. Каждый выстрел расходует заранее заряженный патрон стоимостью 1 А. Поддерживает улучшения для дробовиков.","type":"weapon","combat":"ranged","weaponClass":"heavy","secondaryWeaponClass":"shotgun","min":30,"max":220,"shots":5,"shotPenalty":25,"maxDistance":2,"usesHeavyAmmo":true,"ammoCost":10,"rangedSlotOnly":true,"value":2920,"equipmentCategory":5,"stack":false,"icon":"abzats"},
doctorKit:{"name":"Аптечка доктора","type":"medicine","stack":true,"value":890,"icon":"doctorCase","description":"Лечит 40–100 + Восприятие ×10 HP. Снимает один негативный статус или одну дозу облучения."},
 airForceJacket:{equipmentCategory:5,"pendingDistribution":true,"stack":false,"rarity":"rare","icon":"pilotCoat","name":"Жёлтая куртка ВВС","type":"body","armorClass":"light","armor":65,"thermalArmor":40,"evasionBonus":5,"value":4000},
 plasticGuardArmor:{equipmentCategory:5,"pendingDistribution":true,"stack":false,"rarity":"rare","icon":"vestPlastic","evasionBonusCap":40,"missionTimePenaltyPercent":10,"name":"Страж 3 (пластик)","type":"body","armorClass":"medium","armor":70,"thermalArmor":30,"ricochet":5,"value":2000},
 beetleArmor:{equipmentCategory:10,"pendingDistribution":true,"stack":false,"rarity":"rare","icon":"vestBeetle","evasionBonusCap":40,"missionTimePenaltyPercent":10,"name":"Жук НИИ Стали","type":"body","armorClass":"medium","armor":70,"thermalArmor":40,"ricochet":10,"value":3200},
 blueSpecialArmor:{equipmentCategory:10,"pendingDistribution":true,"stack":false,"rarity":"rare","icon":"vestSpecial","evasionBonusCap":40,"missionTimePenaltyPercent":10,"name":"Спец. защита синих","type":"body","armorClass":"medium","armor":80,"thermalArmor":50,"ricochet":5,"accuracyPenalty":5,"value":3500},
 militaryVest:{name:"Военный Т-бронежилет",equipmentCategory:10,"pendingDistribution":true,"stack":false,"rarity":"rare","icon":"heavyMilitary","evasionBonusCap":25,"missionTimePenaltyPercent":20,name:"Военный Т-бронежилет","type":"body","armorClass":"heavy","armor":80,"thermalArmor":45,"ricochet":10,"accuracyPenalty":10,"value":3500},
 znka:{"pendingDistribution":true,"stack":false,"rarity":"rare","icon":"stimulant","name":"Зелёнка ZNKA","type":"stimulant","value":2000,"description":"10 применений. +3 РАД-защиты, снимает одну накопленную дозу при применении."},
 hansaAntirad:{"pendingDistribution":true,"stack":false,"rarity":"rare","icon":"stimulant","name":"Ганзийский антирад","type":"stimulant","value":1500,"description":"10 применений. Внешняя радиация делится пополам с округлением вниз до вычета защиты."},
 strongPainkiller:{"pendingDistribution":true,"stack":false,"rarity":"rare","icon":"stimulant","name":"Сильное обезболивающее","type":"stimulant","value":1000,"description":"10 применений. +15 физической и +7 термической защиты, −5 п.п. точности."},
 lu216:{"pendingDistribution":true,"stack":true,"rarity":"rare","icon":"luGrenade","name":"Граната LU 216","type":"grenade","value":300,"min":50,"max":300,"dodgeDc":13,"damageType":"thermal","description":"Термический урон 50–300, уворот 13. Партия 5 шт."},
 dynamite:{"pendingDistribution":true,"stack":true,"rarity":"rare","icon":"dynamiteBundle","name":"Динамит","type":"grenade","value":500,"min":90,"max":200,"dodgeDc":12,"intelligenceMultiplier":20,"damageType":"thermal","description":"Термический урон 90–200 + 20 × Интеллект. Уворот 12."},
 m60:{equipmentCategory:10,"pendingDistribution":true,"stack":false,"rarity":"rare","icon":"m60Belt","type":"weapon","combat":"ranged","name":"M60","weaponClass":"heavy","min":30,"max":170,"shots":6,"shotPenalty":25,"maxDistance":2,"ammoCost":10,"value":3500,"rangedSlotOnly":true,"usesHeavyAmmo":true},
 rox3:{equipmentCategory:10,"pendingDistribution":true,"stack":false,"rarity":"rare","icon":"flamethrowerAdvanced","type":"weapon","combat":"ranged","name":"РОКС3","weaponClass":"heavy","secondaryWeaponClass":"flamethrower","damageType":"thermal","flame":true,"min":150,"max":400,"maxDistance":1,"ammoCost":200,"value":5500,"rangedSlotOnly":true,"usesHeavyAmmo":true,"requiredHeroLevel":5},
 remington:{equipmentCategory:5,"pendingDistribution":true,"stack":false,"rarity":"rare","icon":"remington","type":"weapon","combat":"ranged","name":"Remington","weaponClass":"rifle","min":40,"max":210,"accuracyBonus":5,"closeAccuracyBonus":-15,"distancePenalty":12,"maxDistance":3,"value":3600},
 saiga20k:{equipmentCategory:5,"pendingDistribution":true,"stack":false,"rarity":"rare","icon":"saiga","type":"weapon","combat":"ranged","name":"Сайга 20К","weaponClass":"shotgun","min":40,"max":200,"maxDistance":2,"value":4000},
 improvedM16:{equipmentCategory:10,"pendingDistribution":true,"stack":false,"rarity":"rare","icon":"m16","type":"weapon","combat":"ranged","name":"M16 улучшенный","weaponClass":"automatic","min":50,"max":160,"shots":4,"shotPenalty":20,"accuracyBonus":5,"maxDistance":3,"value":5000},
 fiveSeven:{min:40,equipmentCategory:5,"pendingDistribution":true,"stack":false,"rarity":"rare","icon":"fiveSeven","type":"weapon","combat":"ranged","name":"FN Five Seven","weaponClass":"pistol",min:40,"max":190,"accuracyBonus":5,"maxDistance":2,"value":4000},
 american180:{equipmentCategory:10,"pendingDistribution":true,"stack":false,"rarity":"rare","icon":"americanDrum","type":"weapon","combat":"ranged","name":"American 180","weaponClass":"automatic","min":30,"max":160,"shots":10,"shotPenalty":25,"maxDistance":1,"upgradeLimit":2,"value":3600},
 poisonKnife:{equipmentCategory:5,"pendingDistribution":true,"stack":false,"rarity":"rare","icon":"knife","type":"weapon","combat":"melee","name":"Отравленный нож","min":40,"max":130,"strengthMultiplier":10,"poison":true,"value":4500},
 duskScarf:{equipmentCategory:0,"pendingDistribution":true,"name":"Красный пафосный шарф","type":"special","stack":false,"value":1800,"description":"+15 термической защиты.","effect":{"thermal":15},"portrait":"🧣","icon":"bag"},
 greenStone:{equipmentCategory:0,"pendingDistribution":true,"name":"Зелёный камень амулет","type":"special","stack":false,"value":2800,"description":"+3 HP за уровень, +1 РАД-защиты.","effect":{"hp":3,"rad":1},"portrait":"💎","icon":"bag"},
 ironJaw:{equipmentCategory:0,"pendingDistribution":true,"name":"Железная челюсть","type":"special","stack":false,"value":2000,"description":"+5 п.п. рикошета.","effect":{"ricochet":5},"portrait":"🦷","icon":"bag"},
 purpleTopHat:{equipmentCategory:0,"pendingDistribution":true,"name":"Цилиндр с лентой","type":"special","stack":false,"value":1400,"description":"+5 п.п. уклонения, −10 физической защиты.","effect":{"evasion":5,"armor":-10},"portrait":"🎩","icon":"bag"},
 goldCross:{equipmentCategory:0,"pendingDistribution":true,"name":"Тяжёлый золотой крест","type":"special","stack":false,"value":2800,"description":"+6 HP за уровень, −2 к лимиту медикаментов и гранат.","effect":{"hp":6,"supplies":-2},"portrait":"✝","icon":"bag"},
 expensiveGlasses:{equipmentCategory:0,"pendingDistribution":true,"name":"Очки за 200 долларов","type":"special","stack":false,"value":1500,"description":"Иммунитет к ослеплению.","effect":{"blind":true},"portrait":"🕶","icon":"bag"},
 powerHelmet:{equipmentCategory:0,"pendingDistribution":true,"name":"Шлем от Брони","type":"special","stack":false,"value":3200,"description":"+10 физической и термической защиты.","effect":{"armor":10,"thermal":10},"portrait":"⛑","icon":"bag"},
 spartaHelmet:{equipmentCategory:0,"pendingDistribution":true,"name":"Шлем Спарты","type":"special","stack":false,"value":1300,"description":"+7 физической защиты.","effect":{"armor":7},"portrait":"🪖","icon":"bag"},
 spartaGasHelmet:{equipmentCategory:0,"pendingDistribution":true,"name":"Шлем Спарты с противогазом","type":"special","stack":false,"value":2100,"description":"+7 физической защиты, +1 РАД-защиты.","effect":{"armor":7,"rad":1},"portrait":"🪖","icon":"bag"},
 hockeyMask:{equipmentCategory:0,"pendingDistribution":true,"name":"Хоккейная маска","type":"special","stack":false,"value":1600,"description":"+8 урона в ближнем бою.","effect":{"melee":8},"portrait":"🎭","icon":"bag"},
 germanHelmet:{equipmentCategory:0,"pendingDistribution":true,"name":"Немецкая каска","type":"special","stack":false,"value":1700,"description":"−20% базового урона критического попадания.","effect":{"crit":20},"portrait":"🪖","icon":"bag"},
 sovietArmyCap:{equipmentCategory:0,"pendingDistribution":true,"name":"Советская армейка","type":"special","stack":false,"value":1600,"description":"+4 п.п. точности стрелкового оружия.","effect":{"ranged":4},"portrait":"🧢","icon":"bag"},
 nkvdCap:{equipmentCategory:0,"pendingDistribution":true,"name":"Фуражка НКВД","type":"special","stack":false,"value":1800,"description":"+2 к броскам переговоров.","effect":{"talk":2},"portrait":"🧢","icon":"bag"},
 policeHelmet:{equipmentCategory:0,"pendingDistribution":true,"name":"Синяя каска полицейского","type":"special","stack":false,"value":2200,"description":"−25% базового урона критического попадания.","effect":{"crit":25},"portrait":"🪖","icon":"bag"},
 smokingCigarette:{equipmentCategory:0,"pendingDistribution":true,"name":"Сигарета с дымом","type":"special","stack":false,"value":2400,"description":"−10% урона от атак монстров до защиты.","effect":{"monster":10},"portrait":"🚬","icon":"bag"},
 captainTricorne:{equipmentCategory:0,"pendingDistribution":true,"name":"Треуголка капитана","type":"special","stack":false,"value":1300,"description":"+1 к поиску ценного.","effect":{"loot":1},"portrait":"🏴‍☠️","icon":"bag"},
 gangsterHat:{equipmentCategory:0,"pendingDistribution":true,"name":"Шляпа гангстера","type":"special","stack":false,"value":1800,"description":"+2 к броскам переговоров.","effect":{"talk":2},"portrait":"🎩","icon":"bag"},
 cowboyHat:{equipmentCategory:0,"pendingDistribution":true,"name":"Шляпа ковбоя","type":"special","stack":false,"value":1400,"description":"+5 урона пистолетами.","effect":{"pistol":5},"portrait":"🤠","icon":"bag"},
 shepherdPet:{equipmentCategory:0,"pendingDistribution":true,"name":"Пёс - Овчарка","type":"pet","stack":false,"value":3600,"description":"+4 к поиску ценного и обнаружению.","effect":{"loot":4,"detect":4},"portrait":"🐕","icon":"bag"},
 mouseVasya:{equipmentCategory:0,"pendingDistribution":true,"name":"Мышь - Вася","type":"pet","stack":false,"value":2400,"description":"+1 Восприятие.","effect":{"perception":1},"portrait":"🐁","icon":"bag"},
 piercerSpike:{name:'Шип-пронзатель',type:'resource',stack:true,value:800,rarity:'rare',icon:'bag',description:'Редкий реагент с Пронзателя.'},
 piercerKebab:{baseCharges:5,name:'Шашлык из Пронзателя',type:'stimulant',stack:false,value:1000,rarity:'rare',icon:'stimulant',description:'5 применений. На одно прохождение: +1 Силы, +5 п.п. уклонения и +10 физического поглощения.'},
 pukGrass:{name:'Пук-трава',type:'resource',stack:true,value:200,icon:'bag',description:'Трава для исследования.'},
 machete:{equipmentCategory:0,name:'Мачете',type:'weapon',combat:'melee',min:20,max:100,stack:false,value:500,icon:"macheteBlade",description:'Оружие ближнего боя.'},
 brenTen:{equipmentCategory:5,name:'Bren Ten',type:'weapon',combat:'ranged',maxDistance:2,weaponClass:'pistol',min:30,max:170,requiredHeroLevel:5,stack:false,value:4000,rarity:'rare',icon:"brenTen"},
 rpk:{equipmentCategory:5,name:'РПК',type:'weapon',combat:'ranged',maxDistance:3,weaponClass:'heavy',min:20,max:120,shots:10,shotPenalty:30,rangedSlotOnly:true,usesHeavyAmmo:true,stack:false,value:1250,icon:"rpkLong"},
 rox:{equipmentCategory:5,name:'РОКС2',type:'weapon',combat:'ranged',weaponClass:'heavy',secondaryWeaponClass:'flamethrower',damageType:'thermal',min:120,max:320,maxDistance:1,flame:true,ammoCost:200,rangedSlotOnly:true,usesHeavyAmmo:true,requiredHeroLevel:5,stack:false,value:4000,rarity:'rare',icon:"flamethrower"},
 zauerM:{equipmentCategory:5,name:'ZauerM',type:'weapon',combat:'ranged',weaponClass:'shotgun',min:20,max:200,maxDistance:2,damageRolls:2,shotPenalty:10,reloadMain:true,reloadEverySlot:true,requiredHeroLevel:5,stack:false,value:4000,rarity:'rare',icon:"zauer"},
 velocipedel:{equipmentCategory:5,name:'Велосипедель',type:'weapon',combat:'ranged',maxDistance:2,weaponClass:'heavy',secondaryWeaponClass:'shotgun',damageType:'physical',min:20,max:140,shots:6,shotPenalty:30,rangedSlotOnly:true,usesHeavyAmmo:true,stack:false,value:1400,rarity:'rare',icon:'velocipedel',description:'Тяжёлый дробовик. Очередь из 6 выстрелов на дистанциях 0–2, −30 п.п. точности. Каждый выстрел расходует один патрон.'},
 slugShotgun:{equipmentCategory:5,name:'Убойник',type:'weapon',combat:'ranged',weaponClass:'shotgun',damageType:'physical',min:30,max:170,maxDistance:3,stack:false,value:1500,icon:"slug",description:'Дробовик. 30–170 физического урона. Дистанция 0–3, один выстрел за ход.'},
 ppsh:{equipmentCategory:5,name:'ПП Шпагина',type:'weapon',combat:'ranged',weaponClass:'automatic',damageType:'physical',min:10,max:110,maxDistance:1,shots:10,shotPenalty:25,jamChance:10,stack:false,value:2500,icon:"ppshDrum",description:'10–110 физического урона, дистанция 0–1. Очередь из 10 выстрелов, каждый со штрафом −25 п.п. точности. Шанс заклинить в начале хода — 10%.'},
 nailGun:{equipmentCategory:5,name:'Гвоздемёт',type:'weapon',combat:'ranged',weaponClass:'automatic',damageType:'physical',min:30,max:160,maxDistance:2,shots:3,shotPenalty:20,stack:false,value:2000,icon:"nailGun",description:'30–160 физического урона, дистанция 0–2. Очередь из 3 выстрелов, каждый со штрафом −20 п.п. точности.'},
 handCrossbow:{equipmentCategory:5,name:'Ручной арбалет',type:'weapon',combat:'ranged',maxDistance:2,weaponClass:'crossbow',damageType:'physical',min:20,max:120,strengthMultiplier:20,rangedSlotOnly:true,reloadMain:true,reloadEverySlot:true,stack:false,value:1200,icon:"crossbow",description:'Только в дополнительный слот. Физический урон 20–120 + Сила × 20, на дистанциях 0–2. После выстрела пропускает ход на перезарядку.'},
 steel:{name:'Сталь',type:'resource',stack:true,value:450,icon:'metal',description:'Обработанный металл. Материал для молота из двутавра.'},
 beamHammer:{equipmentCategory:5,name:'Молот из двутавра',type:'weapon',combat:'melee',damageType:'physical',min:20,max:200,strengthMultiplier:15,twoSlots:true,stack:false,value:2500,rarity:'rare',icon:"beamHammer",description:'Редкое оружие ближнего боя. Занимает оба слота. Физический урон 20–200 + Сила × 15.'},
 tinGrenade:{name:'Граната «Жестянка»',type:'grenade',stack:true,value:350,icon:"tinBomb",min:50,max:250,dodgeDc:14,damageType:'physical',description:'50–250 физического урона. Сложность уворота 14. Можно брать на локации и в вылазки.'},
 armorUpgradePlan:{name:'Схема улучшения брони',type:'resource',stack:true,rarity:'unique',value:2000,icon:'bag',description:'Повышает качество брони в Науке. Источник пока не задан.'},
 metalMediumArmor:{equipmentCategory:5,name:'Средний металлический доспех',type:'body',armorClass:'medium',stack:false,value:1300,armor:60,thermalArmor:10,accuracyPenalty:5,missionTimePenaltyPercent:10,evasionBonusCap:40,ricochet:5,icon:"vestMetal",description:'Средняя броня. Поглощает 60 физического и 10 термического урона. −5 п.п. точности, прохождение локаций на 10% дольше, рикошет 5%. Прибавки к уклонению сверх базы ограничены 40 п.п.'},
 chitinArmor:{equipmentCategory:5,name:'Броня из хитина',type:'body',armorClass:'light',stack:false,value:2500,armor:60,thermalArmor:30,accuracyPenalty:5,ricochet:5,rarity:'rare',icon:"chitinSuit",description:'Редкая лёгкая броня. Поглощает 60 физического и 30 термического урона. −5 п.п. точности, рикошет 5%.'},
 hardChitinPlates:{name:'Твёрдые пластины хитина',type:'loot',stack:true,value:300,rarity:'rare',icon:'leather',description:'Редкий реагент.'},
 acid:{name:'Кислота',type:'loot',stack:true,value:300,rarity:'rare',icon:'bottle',description:'Редкий реагент.'},
 ak47:{equipmentCategory:5,name:'АК47',type:'weapon',combat:'ranged',maxDistance:3,weaponClass:'automatic',stack:false,value:2000,shots:3,shotPenalty:20,min:20,max:110,piercing:true,rarity:'epic',icon:'assaultRifle',description:'Эпический автомат. Очередь из трёх выстрелов, −20 п.п. точности на каждый. Пробивающий физический урон 20–110 за попадание, защита цели игнорируется.'},
 browning:{equipmentCategory:0,name:'Браунинг',type:'weapon',combat:'ranged',weaponClass:'shotgun',min:20,max:140,maxDistance:2,distancePenalty:15,stack:false,value:900,icon:"browning",description:'Дробовик. Физический урон 20–140, дистанции 0–2. Стреляет каждый ход, без отдельного хода перезарядки. Штраф точности −15 п.п. за единицу дистанции.'},
 pilotJacket:{equipmentCategory:0,name:'Куртка пилота',type:'body',armorClass:'light',armor:30,thermalArmor:30,accuracyPenalty:5,rarity:'rare',value:900,stack:false,icon:"pilotCoat",description:'Редкая лёгкая броня. Поглощает 30 физического и 30 термического урона. −5 п.п. точности.'},
 shieldUni:{equipmentCategory:0,name:'Shield Uni',type:'body',armorClass:'medium',armor:50,thermalArmor:20,accuracyPenalty:5,evasionBonusCap:40,missionTimePenaltyPercent:10,ricochet:5,value:800,stack:false,icon:"vestShield",description:'Средний бронежилет. Поглощает 50 физического и 20 термического урона. −5 п.п. точности, задания на 10% дольше. Прибавки уклонения сверх базы ограничены 40 п.п.; рикошет +5% отдельно.'},
 workshopHeavyArmor:{equipmentCategory:5,name:'Тяжёлая броня ЦЕХ',type:'body',armorClass:'heavy',armor:80,thermalArmor:20,accuracyPenalty:10,evasionBonusCap:25,missionTimePenaltyPercent:20,ricochet:10,value:3500,stack:false,icon:"heavyWorkshop",description:'Тяжёлая броня. Поглощает 80 физического и 20 термического урона. Рикошет 10%. −10 п.п. точности. Задания длятся на 20% дольше. Прибавки к уклонению сверх базы ограничены 25 п.п.'},
 heavyVest:{equipmentCategory:5,name:'Тяжёлый бронежилет',type:'body',armorClass:'heavy',armor:70,thermalArmor:20,accuracyPenalty:10,evasionBonusCap:25,missionTimePenaltyPercent:20,ricochet:10,value:1800,stack:false,icon:"heavyVest",description:'Тяжёлая броня. Поглощает 70 физического и 20 термического урона. −10 п.п. точности, задания на 20% дольше. Прибавки уклонения сверх базы ограничены 25 п.п.; рикошет +10% отдельно.'},
 oldShotgun:{equipmentCategory:0,name:'Старое ружьё',type:'weapon',combat:'ranged',weaponClass:'shotgun',min:20,max:70,maxDistance:3,distancePenalty:15,reloadMain:true,reloadEverySlot:true,stack:false,value:150,icon:"oldShotgun",description:'Дробовик. Физический урон 20–70, дистанции 0–3, штраф −15 п.п. точности за каждую дистанцию. После выстрела следующий ход уходит на перезарядку.'},
 electronicParts:{name:'Электронные запчасти',type:'resource',stack:true,value:200,icon:'tool',description:'Материал для сборки авто-стимулятора.'},
 cardioStimulator:{name:'Кардио-стимулятор',type:'stimulant',stack:false,value:850,icon:'stimulant',description:'10 применений. На время прохождения локации увеличивает максимальное и текущее HP на 15%.'},
 combatStimulator:{name:'Боевой стимулятор',type:'stimulant',stack:false,value:500,icon:'stimulant',description:'10 применений, по одному за прохождение локации. На время прохождения +40 максимального и текущего HP, +5 п.п. точности.'},
 butcherCleaver:{equipmentCategory:5,name:'Тесак Мясника',type:'weapon',combat:'melee',min:40,max:120,accuracyBonus:-5,stack:false,value:1000,rarity:'rare',icon:"cleaver",flavor:'Свежее мясо!',description:'Редкое оружие ближнего боя. Физический урон 40–120 + Сила × 10. −5 п.п. точности.'},
 kaBar:{equipmentCategory:0,name:'Нож «Ка-Бар»',type:'weapon',combat:'melee',min:5,max:60,stack:false,value:100,icon:'knife',description:'Стартовое оружие Штурмовика и Диверсанта. Физический урон 5–60 + Сила × 10.'},
 darkCrystal:{name:'Тёмный кристалл',type:'consumable',stack:false,value:10000,rarity:'epic',icon:'crystal',description:'Уникальная находка Крысиного короля. Даёт выбранному герою одну Метку: «Регенерация» или «Тёмная хватка». Регенерация лечит героя, Тёмная хватка заменяет бросок гранаты особой атакой. В текущей игре может выпасть только один раз.'},
 teaNotes:{name:'Записки бывалого Чая',type:'consumable',stack:true,value:2500,rarity:'rare',icon:'bag',description:'Даёт другому герою один дополнительный выбор перка.'},
 traderNotes:{name:'Записки бывалого торговца',type:'consumable',stack:true,value:3000,rarity:'epic',icon:'bag',description:'Даёт выбранному герою один дополнительный выбор перка.'},
 gasMaskFilter:{name:'Фильтр для противогаза',type:'currency',value:200,icon:'filter',description:'Ресурс для выходов на поверхность и вылазок с карты.'},
 emptyBottle:{name:'Пустая бутылка',type:'resource',stack:true,value:30,icon:'bag',description:'Ингредиент для коктейля Молотова. Источник появится позже.'},
 molotov:{name:'Молотов',type:'grenade',stack:true,value:150,icon:"molotovBottle",min:20,max:120,dodgeDc:13,description:'Термический урон 20–120 в начале боя и повторный урон огнём на втором ходу. Уклонение против 13 уменьшает урон вдвое.'},
 pipeGrenade:{name:'Трубная граната',type:'grenade',stack:true,value:150,icon:"pipeBomb",min:30,max:180,dodgeDc:13,description:'Одна граната в начале боя. Термический урон 30–180. Уклонение против 13 уменьшает урон вдвое. Шанс задеть себя 5%, шанс сильного взрыва 10%.'},
 dressingKit:{name:'Перевязочный набор',type:'medicine',stack:true,value:110,icon:"dressingPack",description:'Восстанавливает 20–50 + Восприятие × 10 HP. Можно взять в лечебный слот.'},
 ghoulKebab:{name:'Шашлык из Упыря',type:'food',stack:true,value:110,icon:'meat',description:'На станции восстанавливает 15% максимального HP + Сила × 7.'},
 leaderKebab:{name:'Редкий шашлык из Вожака',type:'food',stack:true,value:400,rarity:'rare',icon:'meat',description:'Восстанавливает 60–240 HP и даёт +2 к Силе на следующие четыре прохождения локаций.'},
 weaponUpgradePlan:{name:'Схема улучшения оружия',type:'resource',stack:true,value:2000,rarity:'unique',icon:'bag',description:'Трофей Упыриного вожака. Применение появится позже.'},
 antiseptic:{name:'Антисептик',type:'resource',stack:true,value:130,icon:'medical',description:'Реагент, найденный на поверхности.'},
 strongTape:{name:'Крепкая изолента',type:'resource',stack:true,value:150,icon:'bag',description:'Материал, найденный на поверхности.'},
 intactBook:{name:'Уцелевшая книга',type:'resource',stack:true,value:200,rarity:'rare',icon:'bag',description:'Редкая сохранившаяся книга.'},
 oldMedicines:{name:'Старые лекарства',type:'resource',stack:true,value:300,rarity:'rare',icon:'medical',description:'Редкий ингредиент с поверхности для Аптечки доктора. Базовая цена — 30 A.'},
 armorPlates:{name:'Бронепластины',type:'resource',stack:true,value:250,icon:'jacket',description:'Материал для брони.'},
 ak74:{equipmentCategory:5,name:'АК74',type:'weapon',combat:'ranged',maxDistance:3,weaponClass:'automatic',stack:false,value:1000,rarity:'rare',shots:3,shotPenalty:20,min:30,max:120,closeAccuracyBonus:5,icon:'assaultRifle',description:'Очередь из трёх выстрелов, −20 п.п. точности. Вплотную +5 п.п. точности.'},
 medicKit:{name:'Аптечка медика',type:'medicine',stack:true,value:300,icon:"medicBag",description:'Лечит 30–80 HP + 10 × Восприятие. Можно взять с собой на задание.'},
 radiationCloak:{equipmentCategory:5,name:'Плащ РАД-защиты',type:'accessory',stack:false,value:1500,rarity:'rare',radiationProtection:3,icon:'jacket',description:'Дополнительный слот снаряжения. +3 к защите от радиации, сочетается с бронёй.'},
 protectiveSuit:{equipmentCategory:5,name:'Защитный костюм',type:'accessory',stack:false,value:610,radiationProtection:2,icon:'gasmask',description:'Дополнительная защита. +2 РАД, ещё +1 РАД за каждый плюс качества. Сочетается с бронёй.'},
 rareMushrooms:{name:'Редкие подземные грибы',type:'resource',stack:true,value:200,rarity:'rare',icon:'bag',description:'Ингредиент для грибного чая. Можно найти по пути на Павелецкую.'},
 mushroomTea:{name:'Чай из Грибов',type:'food',stack:true,value:500,icon:'medical',description:'На станции снимает 1–4 + Сила РАД, даёт 50 опыта и навсегда уменьшает максимум HP на 3.'},
 hideArmor:{equipmentCategory:0,name:'Доспех Шкура',type:'body',stack:false,value:400,armor:20,thermalArmor:20,radiationProtection:1,icon:"hideCoat",description:'Поглощает 20 физического и 20 термического урона. Защита от РАД +1.'},
 ghoulJacket:{equipmentCategory:0,name:'Куртка из Упыря',type:'body',stack:false,value:800,armor:40,thermalArmor:10,meleeAccuracyBonus:5,rarity:'rare',icon:"ghoulCoat",description:'Редкая броня. Поглощает 40 физического и 10 термического урона. +5 п.п. к точности атак оружием ближнего боя.'},
 kazakVest:{equipmentCategory:5,name:'Бронежилет Казак',type:'body',stack:false,value:1050,armor:45,thermalArmor:25,accuracyPenalty:5,icon:"vestKazak",description:'Поглощает 45 физического и 25 термического урона. −5 п.п. точности с любым оружием.'},
 springMechanism:{name:'Пружинный механизм',type:'resource',stack:true,value:90,icon:'tool',description:'Деталь для сборки стрелкового оружия.'},
 pipe:{name:'Труба',type:'resource',stack:true,value:80,icon:'metal',description:'Материал для Обреза и винтовки Мосина. Продаётся у Юрася.'},
 bastard:{equipmentCategory:0,name:'Бастард ПП',type:'weapon',combat:'ranged',maxDistance:2,weaponClass:'automatic',min:30,max:80,shots:3,shotPenalty:20,stack:false,value:250,icon:"bastardBox",description:'Очередь из трёх выстрелов. У каждого своя проверка попадания со штрафом −20 п.п. и отдельный расчёт физического урона.'},
 sawedOff:{equipmentCategory:0,name:'Обрез',type:'weapon',combat:'ranged',weaponClass:'shotgun',min:40,max:130,maxDistance:1,damageRolls:2,shotPenalty:10,reloadMain:true,stack:false,value:600,icon:"sawedOff",description:'Дуплет на дистанции 0–1: одна проверка попадания со штрафом −10 п.п., два броска урона. В основном слоте следующий ход после выстрела уходит на перезарядку.'},
 homemadeRifle:{equipmentCategory:0,name:'Самодельная винтовка',type:'weapon',combat:'ranged',weaponClass:'rifle',min:30,max:140,reloadMain:true,reloadEverySlot:true,stack:false,value:200,icon:"homemade"},
 heavyStarterArmor:{equipmentCategory:0,name:'Средняя броня Тяжа',type:'body',armorClass:'medium',armor:45,thermalArmor:0,accuracyPenalty:5,evasionBonusCap:40,missionTimePenaltyPercent:10,stack:false,value:250,icon:"vestBasic"},
 mosin:{equipmentCategory:0,name:'Винтовка Мосина',type:'weapon',combat:'ranged',maxDistance:3,weaponClass:'rifle',min:60,max:150,distancePenalty:10,piercing:true,reloadMain:true,bayonet:{min:10,max:80},twoSlots:true,rarity:'rare',stack:false,value:900,icon:"mosinLong",description:'Занимает оба слота. Пробивающий выстрел на дистанциях 0–3. Штраф точности −10 п.п. за единицу дистанции. После выстрела перезаряжается, а вплотную в этот же ход атакует штыком.'},
 metalParts:{name:'Металлические части',type:'resource',stack:true,value:100,icon:'metal',description:'Материал для оружия в Цехе.'},
 sharpBlade:{name:'Острое лезвие',type:'resource',stack:true,value:300,rarity:'rare',icon:'knife',description:'Находка в Технопарке. Материал для Шила и винтовки Мосина.'},
 clawKnuckles:{equipmentCategory:0,name:'Когтистый кастет',type:'weapon',combat:'melee',min:30,max:100,stack:false,value:250,icon:"knuckles",description:'Физический урон 30–100 + Сила × 10.'},
 awl:{equipmentCategory:0,name:'Шило',type:'weapon',combat:'melee',min:10,max:80,stack:false,value:800,icon:"awlPoint",rarity:'rare',piercing:true,description:'Редкое оружие. Физический урон 10–80 + Сила × 10. Пробивающий: игнорирует защиту цели.'},
 fullLeather:{name:'Целая кожа',type:'resource',stack:true,value:120,icon:'leather',description:'Изготовлена из четырёх обрывков кожи. Материал для качественной кожанки; отдельный предмет от шкуры упыря.'},
 qualityJacket:{equipmentCategory:0,name:'Кожанка',type:'body',stack:false,value:220,armor:14,thermalArmor:10,icon:"leatherJacket",description:'Поглощает 14 физического и 10 термического урона.'},
 pistol:{equipmentCategory:0,name:'Пистолет ТТ',type:'weapon',combat:'ranged',maxDistance:1,weaponClass:'pistol',min:10,max:50,stack:false,value:70,icon:'pistol',description:'Пистолет. Физический урон 10–50 без прибавки силы.'},
 mr73:{equipmentCategory:5,name:'Револьвер MR-73',type:'weapon',combat:'ranged',weaponClass:'pistol',min:20,max:160,maxDistance:2,stack:false,value:760,icon:"revolver",description:'Пистолет. Физический урон 20–160. Работает на дистанциях 0–2. Штраф точности −15 п.п. за единицу дистанции.'},
 ghoulHide:{name:'Шкура упыря',type:'resource',stack:true,value:30,icon:'leather',description:'Шкура, добытая при патрулировании тоннелей.'},
 sharpClaws:{name:'Острые когти',type:'resource',stack:true,value:40,icon:'knife',description:'Трофей упыря-разведчика.'},
 ghoulMeat:{name:'Мясо упыря',type:'resource',stack:true,value:40,icon:'meat',description:'Добыча из тоннелей.'},
 toughLeather:{name:'Прочная кожа',type:'resource',stack:true,value:200,icon:'leather',description:'Редкий ингредиент, добываемый в тоннелях.'},
 crowbar:{equipmentCategory:0,name:'Монтировка',type:'weapon',combat:'melee',min:0,max:80,stack:false,value:140,icon:"crowbarTool",description:'Физический урон 0–80 + Сила × 10.'},
 ashot:{equipmentCategory:0,name:'АШОТ',type:'weapon',combat:'ranged',maxDistance:2,weaponClass:'pistol',min:20,max:100,stack:false,value:150,icon:"ashot",description:'Физический урон 20–100. Штраф точности −15 п.п. за единицу дистанции.'},
 cloth:{name:'Обрывки ткани',type:'resource',stack:true,value:20,icon:'bag',description:'Материал для старых бинтов. Можно получить за помощь на станции или купить у Юрася комплектом из 3 штук.'},
 broth:{name:'Отвар из Крысы',type:'food',stack:true,value:60,icon:'medical',description:'На станции восстанавливает 10% максимального HP + Сила × 5. С собой на задание взять нельзя.'},
 knife:{equipmentCategory:0,name:'Нож',type:'weapon',combat:'melee',min:10,max:30,stack:false,value:50,icon:'knife',description:'Простой стальной нож. Физический урон 10–30, плюс Сила × 10 владельца.'},
 jacket:{equipmentCategory:0,name:'Старая куртка',type:'body',stack:false,value:100,armor:7,icon:"jacketOld",description:'Поношенная кожа ещё держит удар. Поглощает 7 физического урона.'},
 bandage:{name:'Старые бинты',type:'medicine',stack:true,value:30,icon:"bandageRoll",description:'Восстанавливают 10–30 + 10 × восприятие HP. У диверсанта — 30–50 HP.'},
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
 initiative:{name:'Перехват инициативы',description:'Постоянно +4 к инициативе.'},
 'double-strike':{name:'Двойной удар',description:'Две атаки за ход. Каждая: −10 п.п. точности и −15% урона до поглощения цели.'}
};
export const CONFIG={hero:{criticalChance:5,maxHp:180,strength:2,agility:3,intelligence:1,perception:2,initiative:3,accuracy:10,evasion:60,armor:0,weaponMin:10,weaponMax:30},rat:{hp:80,initiative:2,stealth:4,agility:2,accuracy:5,evasion:60,armor:10,damageMin:20,damageMax:30},mission:{searches:4,searchDc:10,lootDc:7,seconds:13,baseXp:10,findXp:1,killXp:5,lootXp:3},loot:[{id:'metal',name:'Металлический мусор',chance:100},{id:'meat',name:'Крысиное мясо',chance:50},{id:'tooth',name:'Золотой зуб',chance:10}],trial:{combatTurnLimit:300,damageMode:'integer'}};
ITEMS.paoloPassport={name:'Паспорт Синих — Паоло',type:'quest',stack:false,value:0,rarity:'unique',icon:'book',description:'Личный паспорт Паоло. Документ для переговоров с Синими.'};
export const RECIPES={
 chemicalSuit:{name:'Костюм химзащиты',production:'science',level:11,research:'radProtectionSystems',ingredients:{protectiveSuit:1,strongTape:4,acid:1},cost:300,seconds:180,xp:120,chance:65,output:'chemicalSuit'},
 advancedChemicalSuit:{name:'Продвинутый костюм химзащиты',production:'science',level:16,research:'advancedRadSuit',ingredients:{chemicalSuit:1,kevlarMaterial:1,strongTape:2,electronicParts:1},cost:500,seconds:240,xp:200,chance:55,output:'advancedChemicalSuit'},
 radioactiveGrenade:{name:'Радиоактивная граната',production:'science',level:15,research:'radioactiveGrenade',ingredients:{kolomenskayaBeetleCorpse:1,acid:1,metalParts:2,springMechanism:1},cost:350,seconds:90,xp:140,chance:75,output:'radioactiveGrenade',outputQty:4,batch:true},
 paralyzingWeapon:{name:'Парализующее оружие',production:'melee',level:12,research:'beetlePoison',ingredients:{kolomenskayaBeetleCorpse:1},cost:300,seconds:60,xp:100,upgrade:true,target:'melee',chance:60,prefix:'Парализующий',poisonChance:10,rejectsPoison:true,valueIncreasePercent:25},
 beetleBattery:{name:'Жучиная батарея',production:'science',level:13,research:'beetleBatteries',ingredients:{kolomenskayaBeetleCorpse:1,steel:1,acid:1},cost:150,seconds:180,xp:80,chance:100,output:'beetleBattery',autoAllowed:true,autoKeep:true,batch:true,noQuality:true,supersededBy:'improvedBeetleBattery'},
 improvedBeetleBattery:{name:'Улучшенная жучиная батарея',production:'science',level:13,research:'beetleBatteryImprovement',ingredients:{kolomenskayaBeetleCorpse:1,steel:2,armorPlates:1,acid:2},cost:300,seconds:300,xp:140,chance:100,output:'improvedBeetleBattery',autoAllowed:true,autoKeep:true,batch:true,noQuality:true},
 laserEmitter:{name:'Лазерный излучатель',production:'science',level:12,research:'laser',ingredients:{electronicParts:3},cost:110,seconds:45,xp:50,chance:100,output:'laserEmitter',batch:true,noQuality:true},
 laserPistol:{name:'Лазерный пистолет',production:'ranged',level:12,research:'laserPistol',ingredients:{laserEmitter:1,metalParts:2,springMechanism:1},cost:2820,seconds:90,xp:110,chance:100,output:'laserPistol'},
 laserRifle:{name:'Лазерная винтовка',production:'ranged',level:13,research:'laserRifle',ingredients:{laserEmitter:2,steel:2,springMechanism:2},cost:2220,seconds:110,xp:130,chance:100,output:'laserRifle'},
 heavyLaser:{name:'Тяжёлый лазер',production:'ranged',level:15,research:'heavyLaser',ingredients:{laserEmitter:3,steel:3,electronicParts:2},cost:1740,seconds:130,xp:150,chance:100,output:'heavyLaser'},
 piercerBlade:{name:'Клинок пронзателя',production:'melee',level:11,research:'spike',ingredients:{piercerSpike:2,steel:3},cost:1960,seconds:110,xp:130,chance:100,output:'piercerBlade'},
 grassGum:{name:'Жвачка из травы',production:'medicine',level:12,research:'accelerator',ingredients:{pukGrass:2,antiseptic:1},cost:70,seconds:45,xp:50,chance:100,output:'grassGum'},
 pukGrassDecoction:{name:'Отвар из пук-травы',production:'medicine',level:11,research:'radiation',ingredients:{pukGrass:1,emptyBottle:1},cost:80,seconds:20,xp:35,chance:100,output:'pukGrassDecoction',batch:true,noQuality:true},
 kevlarCoating:{name:'Кевларовое покрытие',production:'science',level:14,research:'kevlarCoating',ingredients:{kevlarMaterial:1,acid:1,strongTape:1},cost:200,seconds:60,xp:100,upgrade:true,target:'body',chance:60,postfix:'с кевларом',armorBonus:21,valueIncreasePercent:25,replaces:['reinforcedArmor','patchedArmor']},
 kevlarMaterial:{name:'Кевларовый материал',production:'armor',level:11,research:'kevlar',ingredients:{acid:1,cloth:5,strongTape:1},cost:60,seconds:45,xp:40,chance:100,output:'kevlarMaterial',batch:true,noQuality:true},
 kevlarLight:{name:'Лёгкая кевларовая броня',production:'armor',level:12,research:'kevlarLight',ingredients:{kevlarMaterial:2,toughLeather:2,strongTape:1},cost:950,seconds:100,xp:130,output:'kevlarLight'},
 kevlarMedium:{name:'Средняя кевларовая броня',production:'armor',level:13,research:'kevlarMedium',ingredients:{kevlarMaterial:3,armorPlates:3,fullLeather:1},cost:720,seconds:120,xp:145,output:'kevlarMedium'},
 kevlarHeavy:{name:'Тяжёлая кевларовая броня',production:'armor',level:14,research:'kevlarHeavy',ingredients:{kevlarMaterial:4,armorPlates:4,steel:2},cost:180,seconds:140,xp:160,output:'kevlarHeavy'},
yatagan:{"name":"Ятаган","production":"melee","level":10,"ingredients":{"steel":4,"sharpBlade":3},"cost":2420,"seconds":100,"xp":120,"output":"yatagan"},
abzats:{"name":"Абзац","production":"ranged","level":10,"ingredients":{"steel":4,"pipe":2,"springMechanism":4},"cost":520,"seconds":100,"xp":120,"output":"abzats"},
doctorKit:{"name":"Аптечка доктора","production":"medicine","level":10,"ingredients":{"oldMedicines":2,"dressingKit":1},"cost":100,"seconds":50,"xp":60,"output":"doctorKit","batch":true,"chance":100},
armorPiercing:{"name":"Бронебойный","production":"upgrade","level":10,"ingredients":{"steel":2,"armorPlates":1},"cost":500,"seconds":60,"xp":100,"upgrade":true,"target":"ranged","excludedWeaponClasses":["shotgun","flamethrower","crossbow"],"rejectsPiercing":true,"armorFactor":0.5,"bonus":-20,"accuracyBonus":-5,"chance":60,"prefix":"Бронебойный","valueIncreasePercent":20},
fireproofArmor:{"name":"Огнеупорный","production":"science","level":10,"ingredients":{"hardChitinPlates":2,"acid":2,"fullLeather":2},"cost":400,"seconds":60,"xp":100,"upgrade":true,"target":"body","armorBonus":-10,"thermalArmorBonus":30,"radiationProtectionBonus":1,"chance":70,"prefix":"Огнеупорный","valueIncreasePercent":20},
hardArmor:{"name":"Твёрдый","production":"science","level":11,"ingredients":{"armorPlates":1,"steel":1},"cost":300,"seconds":45,"xp":110,"upgrade":true,"target":"body","armorClasses":["medium","heavy"],"ricochetBonus":5,"chance":75,"prefix":"Твёрдый","valueIncreasePercent":20},
 slugShotgun:{name:'Убойник',production:'ranged',level:7,cost:540,seconds:65,xp:70,ingredients:{steel:1,pipe:2,metalParts:3},output:'slugShotgun'},
 ppsh:{name:'ПП Шпагина',production:'ranged',level:8,cost:880,seconds:90,xp:95,ingredients:{springMechanism:4,steel:2,metalParts:3},output:'ppsh'},
 nailGun:{name:'Гвоздемёт',production:'ranged',level:9,cost:550,seconds:80,xp:110,ingredients:{springMechanism:2,steel:2,metalParts:3},output:'nailGun'},
 handCrossbow:{name:'Ручной арбалет',production:'melee',level:7,cost:330,seconds:60,xp:65,ingredients:{metalParts:4,springMechanism:3,strongTape:1},output:'handCrossbow'},
 steel:{name:'Качественная обработка металла',production:'melee',level:8,cost:90,seconds:30,xp:30,ingredients:{metalParts:3},output:'steel',batch:true},
 beamHammer:{name:'Молот из двутавра',production:'melee',level:9,cost:920,seconds:80,xp:100,ingredients:{steel:3,pipe:2},output:'beamHammer'},
 weaponGrade:{name:'Улучшение оружия схемой',production:'upgrade',level:7,cost:400,seconds:40,xp:80,ingredients:{weaponUpgradePlan:1},upgrade:true,target:'weapon',raisesQuality:true},
 tinGrenade:{name:'Граната «Жестянка»',production:'upgrade',level:8,cost:40,seconds:20,xp:25,ingredients:{strongTape:1,metal:5},output:'tinGrenade',batch:true},
 sharpEdge:{name:'Заточка ближнего оружия +20',production:'upgrade',level:9,cost:300,seconds:30,xp:60,ingredients:{metalParts:1},upgrade:true,target:'melee',chance:65,prefix:'Острый',bonus:20,replaces:'sharpen',valueIncreasePercent:20},
 spikedArmor:{name:'Шипованная броня',production:'science',level:8,cost:0,seconds:30,xp:45,ingredients:{strongTape:1,sharpClaws:8},upgrade:true,target:'body',chance:60,prefix:'Шипованная',thorns:{min:20,max:40},valueIncreasePercent:15},
 armorGrade:{name:'Улучшение брони схемой',production:'science',level:9,cost:500,seconds:60,xp:80,ingredients:{armorUpgradePlan:1},upgrade:true,target:'body',raisesQuality:true},
 metalMediumArmor:{name:'Средний металлический доспех',production:'armor',level:7,cost:100,seconds:75,ingredients:{armorPlates:3,metalParts:4},output:'metalMediumArmor',xp:70},
 armorPlates:{name:'Бронепластины',production:'armor',level:8,cost:40,seconds:15,ingredients:{metalParts:1,acid:1},output:'armorPlates',outputQty:2,xp:15,batch:true},
 workshopHeavyArmor:{name:'Тяжёлая броня ЦЕХ',production:'armor',level:10,cost:1070,seconds:110,ingredients:{steel:3,armorPlates:4},output:'workshopHeavyArmor',xp:120},
 chitinArmor:{name:'Броня из хитина',production:'armor',level:9,cost:180,seconds:90,ingredients:{kazakVest:1,hardChitinPlates:4},output:'chitinArmor',xp:100},
 fineShot:{name:'Точный или мелкая дробь',production:'upgrade',level:6,cost:300,seconds:30,ingredients:{},upgrade:true,target:'ranged',otherRanged:{prefix:'Точный',accuracyBonus:5,blocksAimedShots:false},chance:60,prefix:'Мелкая дробь',accuracyBonus:15,xp:25,blocksAimedShots:true,valueIncreasePercent:12},
 combatStimulator:{name:'Боевой стимулятор',production:'medicine',level:7,cost:20,seconds:45,xp:35,ingredients:{acid:1,antiseptic:1},output:'combatStimulator'},
 cardioStimulator:{name:'Кардио-стимулятор',production:'medicine',level:8,cost:290,seconds:60,xp:50,ingredients:{acid:1,rareMushrooms:1},output:'cardioStimulator',chance:100},
 autoStimulator:{name:'Авто-Стимулятор',production:'medicine',level:9,cost:350,seconds:75,xp:65,ingredients:{springMechanism:1,electronicParts:2},upgrade:true,target:'body',chance:100,prefix:'Авто-',autoHeal:true,valueIncreasePercent:25},
 medicKit:{name:'Аптечка медика',production:'medicine',level:6,cost:30,seconds:20,ingredients:{antiseptic:1,dressingKit:1},output:'medicKit',xp:20,batch:true},
 butcherCleaver:{name:'Тесак Мясника',production:'melee',level:6,cost:370,seconds:25,ingredients:{metalParts:3,sharpBlade:1},output:'butcherCleaver',xp:50},
 quilted:{name:'Ватник',production:'science',level:3,cost:100,seconds:20,ingredients:{ghoulHide:2},upgrade:true,target:'body',chance:70,prefix:'Ватник на',firstHitArmor:15,xp:20,valueIncreasePercent:10},
 charcoalFilters:{name:'Угольные Фильтры',production:'science',level:4,cost:200,seconds:10,ingredients:{},output:'gasMaskFilter',xp:10,chance:80,batch:true},
 molotov:{name:'Коктейль молотова',production:'science',level:5,cost:100,seconds:15,ingredients:{emptyBottle:1},output:'molotov',xp:12,chance:75,batch:true},
 ergonomic:{name:'Анатомический *',production:'upgrade',level:4,cost:50,seconds:20,ingredients:{fullLeather:1},upgrade:true,target:'melee',chance:70,prefix:'Удобный',accuracyBonus:5,xp:20,valueIncreasePercent:10},
 receiver:{name:'Улучшение ресивера',production:'upgrade',level:5,cost:150,seconds:30,ingredients:{springMechanism:1},upgrade:true,target:'ranged',chance:66,prefix:'Мощный',minBonus:10,maxBonus:20,xp:15,valueIncreasePercent:12},
 pipeGrenade:{name:'Трубная граната',production:'upgrade',level:3,cost:40,seconds:10,ingredients:{metalParts:1},output:'pipeGrenade',xp:10,chance:75,batch:true,refundOnFailure:true},
 dressingKit:{name:'Перевязочный набор',production:'medicine',level:3,cost:40,seconds:10,ingredients:{cloth:3},output:'dressingKit',xp:5,batch:true},
 ghoulKebab:{name:'Шашлык из Упыря',production:'medicine',level:4,cost:10,seconds:15,ingredients:{ghoulMeat:2},output:'ghoulKebab',xp:12,batch:true},
 mushroomTea:{name:'Чай из Грибов',production:'medicine',level:5,cost:70,seconds:10,ingredients:{rareMushrooms:2},output:'mushroomTea',xp:20,batch:true},
 hideArmor:{name:'Укрепить шкурами',production:'armor',level:4,cost:40,seconds:30,ingredients:{qualityJacket:1,ghoulHide:4},output:'hideArmor',xp:40},
 ghoulJacket:{name:'Куртка из Упыря',production:'armor',level:5,cost:150,seconds:60,ingredients:{qualityJacket:1,toughLeather:2},output:'ghoulJacket',xp:80},
 kazakVest:{name:'Бронежилет Казак',production:'armor',level:6,cost:120,seconds:60,ingredients:{toughLeather:2,armorPlates:2},output:'kazakVest',xp:50},
 springMechanism:{name:'Пружинный механизм',production:'ranged',level:2,cost:30,seconds:10,ingredients:{metal:3},output:'springMechanism',xp:8,batch:true},
 bastard:{name:'Бастард ПП',production:'ranged',level:3,cost:90,seconds:30,ingredients:{metal:3,springMechanism:1},output:'bastard',xp:20},
 sawedOff:{name:'Обрез',production:'ranged',level:4,cost:120,seconds:30,ingredients:{pipe:2,metalParts:3},output:'sawedOff',xp:30},
 homemadeRifle:{name:'Самодельная винтовка',type:'weapon',combat:'ranged',weaponClass:'rifle',min:30,max:140,reloadMain:true,reloadEverySlot:true,stack:false,value:200,icon:'rifle'},
 heavyStarterArmor:{name:'Средняя броня Тяжа',type:'body',armorClass:'medium',armor:45,thermalArmor:0,accuracyPenalty:5,evasionBonusCap:40,missionTimePenaltyPercent:10,stack:false,value:250,icon:'jacket'},
 mosin:{name:'Винтовка Мосина',production:'ranged',level:5,cost:100,seconds:60,ingredients:{pipe:1,springMechanism:1,metalParts:3,sharpBlade:1},output:'mosin',xp:50},
 mr73:{name:'Револьвер MR-73',production:'ranged',level:6,cost:170,seconds:40,ingredients:{springMechanism:2,pipe:1,metalParts:3},output:'mr73',xp:50},
 metalParts:{name:'Металлические части',production:'melee',level:3,cost:10,seconds:12,ingredients:{metal:4},output:'metalParts',xp:8,batch:true},
 clawKnuckles:{name:'Когтистый кастет',production:'melee',level:4,cost:10,seconds:20,ingredients:{metalParts:1,sharpClaws:3},output:'clawKnuckles',xp:20},
 awl:{name:'Шило',production:'melee',level:5,cost:170,seconds:30,ingredients:{sharpBlade:1,metalParts:3},output:'awl',xp:40},
 lcu:{name:'LCU',production:'science',level:2,cost:150,seconds:12,ingredients:{},upgrade:true,target:'ranged',chance:70,prefix:'LCU',accuracyBonus:5,xp:15,valueIncreasePercent:8},
 patchedArmor:{name:'Штопанная броня',production:'science',level:1,cost:100,seconds:10,ingredients:{leather:2},upgrade:true,target:'body',chance:80,prefix:'Штопаный',armorBonus:7,xp:10,supersededBy:'reinforcedArmor',valueIncreasePercent:5},
 protectiveSuit:{name:'Защитный костюм',production:'science',level:6,cost:0,seconds:30,ingredients:{ghoulHide:6,toughLeather:2},output:'protectiveSuit',chance:100,xp:20},
 reinforcedArmor:{name:'Укреплённая броня',production:'science',level:7,cost:200,seconds:20,ingredients:{toughLeather:1},upgrade:true,target:'body',chance:65,prefix:'Укреплённый',supersededBy:'kevlarCoating',armorBonus:14,thermalArmorBonus:7,xp:20,replaces:'patchedArmor',valueIncreasePercent:15},
 fullLeather:{name:'Целая кожа',production:'armor',level:2,cost:0,seconds:10,ingredients:{leather:4},output:'fullLeather',xp:10,batch:true},
 qualityJacket:{name:'Кожанка',production:'armor',level:3,cost:0,seconds:12,ingredients:{leather:3,fullLeather:1},output:'qualityJacket',xp:22},
 knife:{name:'Нож',production:'melee',level:1,cost:50,seconds:5,ingredients:{metal:1},output:'knife',xp:5,legacy:true},
 kaBar:{name:'Нож «Ка-Бар»',production:'melee',level:1,cost:60,seconds:8,ingredients:{metal:1,leather:1},output:'kaBar',xp:10},
 crowbar:{name:'Монтировка',production:'melee',level:2,cost:80,seconds:12,ingredients:{metal:3},output:'crowbar',xp:10},
 ashot:{name:'АШОТ',production:'ranged',level:1,cost:120,seconds:8,ingredients:{metal:2},output:'ashot',xp:15},
 jacket:{name:'Старая куртка',production:'armor',level:1,cost:50,seconds:8,ingredients:{leather:2},output:'jacket',xp:10},
 bandage:{name:'Старые бинты',production:'medicine',level:1,cost:20,seconds:5,ingredients:{cloth:1},output:'bandage',xp:2,batch:true},
 broth:{name:'Отвар из Крысы',production:'medicine',level:2,cost:30,seconds:7,ingredients:{meat:1},output:'broth',xp:6,batch:true},
 sharpen:{name:'Заточка оружия +7',production:'upgrade',level:1,cost:100,seconds:10,ingredients:{},upgrade:true,target:'melee',chance:80,prefix:'Заточенный',bonus:7,xp:10,supersededBy:'sharpEdge',valueIncreasePercent:5},
 psct:{name:'ПСЦТ',production:'upgrade',level:2,cost:150,seconds:12,ingredients:{},upgrade:true,target:'ranged',excludedWeaponClasses:['shotgun','flamethrower','crossbow'],chance:75,prefix:'ПСЦТ',bonus:20,accuracyBonus:-5,xp:15,valueIncreasePercent:8}
};
export const PRODUCTIONS={melee:{name:'Цех',icon:'knife'},ranged:{name:'Стрелковое оружие',icon:'gun'},armor:{name:'Броня',icon:'jacket'},medicine:{name:'Медицина',icon:'medical'},upgrade:{name:'Оружейное дело',icon:'tool'},science:{name:'Наука',icon:'science'}};
export const MAX_PRODUCTION_LEVEL=20;
export const LOCATION_LEVELS={kolomTunnels:7,help:1,mission:1,patrol:2,caravan:3,technopark:4,surface:5,zilTunnels:6,surfaceShops:7,pukGrassSearch:7};
export const PRODUCTION_XP=Object.fromEntries(Array.from({length:MAX_PRODUCTION_LEVEL-1},(_,i)=>{const level=i+1;return [level,5*level*(level+1)];}));
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
 {id:'kolomenskaya-spiders',name:'Жуки тоннелей Коломенской',area:'underground',icon:'map',requiredLevel:7,unlockedBy:'kolomenskaya',unlockText:'Откроется после очищения Коломенской.'},
 {id:'station-surroundings',name:'Рыскать в окрестностях станции',area:'surface',icon:'map'},
 {id:'surface-shops',area:'surface'},
 {id:'zil-tunnels',area:'surface'}
];

export const PATROL={requiredLevel:2,enemy:{name:'упырь-разведчик',hp:150,evasion:40,accuracy:10,initiative:1,stealth:2,armor:10,thermalArmor:0,damageMin:40,damageMax:100,attackName:'физическая атака'},mission:{searches:2,searchDc:8,lootPerKill:true,seconds:20,baseXp:10,findXp:0,killXp:20,lootXp:0},loot:[{id:'ghoulHide',name:'Шкура упыря',chance:80},{id:'sharpClaws',name:'Острые когти',chance:60},{id:'ghoulMeat',name:'Мясо упыря',chance:50},{id:'toughLeather',name:'Прочная кожа',chance:10}]};
export const SURFACE={
 bonusLoot:[{item:'oldMedicines',chance:3}],
 seconds:30,baseXp:30,dogXp:8,guardXp:15,
 description:'Слыш, гляжу у тебя кишка не тонка, может на поверхность выйти хочешь? В длинные вылазки туда ходят только по двое, но если на 10 минут — можно и одному попробовать. Один фильтр защитит тебя от радиоактивной пыли на 20 минут, так что успей вовремя вернуться, и да, радиация там то 2 то 3 у входа, запасись чем-нибудь.',
 dog:{name:'Мутировавшая собака',hp:120,evasion:50,accuracy:10,damageMin:40,damageMax:70,armor:10,thermalArmor:0,stealth:1,initiative:1,attackName:'Укус'},
 tiers:[
  {dc:8,text:'Кажется, в этом магазине ещё что-то осталось не разграбленным…',hidden:'Так, тут следы каких-то собак? Спрячусь-ка, а потом продолжим…',spotted:'Чёрт, собаки меня заметили… Ёпт, ствол где?',loot:[{item:'metalParts',chance:80},{item:'antiseptic',chance:60},{item:'strongTape',chance:20},{item:'intactBook',chance:10}]},
  {dc:13,text:'О, кажется, вон там ещё несколько растерзанных трупов за углом… посмотрим.',hidden:'Ага, это Суслики постарались, пора валить, пока меня не заметили…',spotted:'Чёрт, это Суслики… Слышен вой одного из Стражей.',loot:[{item:'armorPlates',chance:80},{currency:'money',min:12,max:30,chance:40},{currency:'filters',min:1,max:2,chance:25},{item:'ak74',chance:5}]},
  {dc:18,text:'О! Это, кажется, схрон сталкеров. Давай-ка заглянем. Проверю на ловушки…',loot:[{currency:'money',min:15,max:30,chance:60},{currency:'filters',min:1,max:2,chance:40},{item:'medicKit',chance:20},{item:'radiationCloak',chance:5}]}
 ]
};
export const CARAVAN={
 seconds:60,
 description:'Дрезина каравана сломалась, и теперь нужно идти по тоннелю пешком. Упыри иногда нападают на караван, так что нам нужна защита. Платим 30 A, если все доберутся туда живыми. А обратно тебя на дрезине привезём.',
 escort:{hp:200,armor:20,evasion:50,accuracy:5},
 enemy:{...PATROL.enemy,name:'Большой Упырь',hp:300,evasion:35,accuracy:10,stealth:1,damageMin:50,damageMax:110,powerSwing:{accuracyPenalty:10,damageBonus:20}},
 mission:{segments:3,attackChances:[25,40,35],baseXp:30,findXp:0,killXp:15,lootXp:0,lootPerKill:true},
 loot:PATROL.loot
};
export const GHOUL_LEADER={...PATROL.enemy,boss:true,name:'Упыриный вожак',hp:450,accuracy:20,damageMin:60,damageMax:140,attackName:'Когти',rage:true};
export const LOST_CARAVAN={
 seconds:120,
 chance:3,
 baseXp:40,
 killXp:15,
 leaderXp:30,
 planChance:30,
 cargo:{armorPlates:2,metalParts:3,electronicParts:1},
 stages:[
  {text:'Следы в тоннеле. Герой замечает брошенный тюк.',attackChance:20,finds:[{dc:8,id:'cloth',min:2,max:3},{dc:14,id:'dressingKit'}]},
  {text:'На рельсах стоит брошенная тележка.',attackChance:40,finds:[{dc:10,id:'metal',min:2,max:4},{dc:16,id:'springMechanism'}]},
  {text:'Герой находит растерзанный караван. Рядом большой упырь и Упыриный вожак.',attackChance:100,finds:[{dc:8,min:20,max:40},{dc:14,id:'medicKit'},{dc:18,id:'intactBook'}]}
 ]
};
export const TECHNOPARK={
 radiation:{min:1,max:3},
 seconds:35,
 description:'Тоннель за постом охраны ведёт на заброшенную станцию. Когда-то у неё был стеклянный потолок, наверное, это считалось современным. Теперь через дырки в потолке на станцию попадают снег, радиация и монстры Стражи. Их ещё называют «сусликами» из-за стойки, в которой они патрулируют территорию. Если не снять суслика первым выстрелом, он будет выть и призовёт своих собратьев, и придётся разобраться и с ними.',
 enemy:{name:'Страж',experience:15,hp:210,evasion:45,stealth:2,initiative:2,accuracy:10,armor:17,thermalArmor:0,damageMin:30,damageMax:100,attackName:'Укус',rush:{accuracyBonus:10,min:50,max:120}},
 mission:{ambushDc:10,ambushKillXp:10,baseXp:18,findXp:0,killXp:7,lootXp:0,lootPerKill:true,finds:[{id:'metal',dc:8,alternateId:'cloth',primaryChance:50,minQty:2,maxQty:3},{id:'pipe',dc:14},{id:'sharpBlade',dc:19,xp:10}]},
 loot:[{id:'leather',chance:100},{id:'fullLeather',chance:55},{id:'sharpClaws',chance:30},{id:'toughLeather',chance:10}]
};
export const patrolReady=()=>['initiative','stealth','armor','damageMin','damageMax'].every(key=>Number.isInteger(PATROL.enemy[key]));

export const PROFESSIONS={
 sniper:{name:'Снайпер',strength:2,agility:3,intelligence:2,perception:4,available:true,startReady:true,combatReady:true,weapon:'knife',rangedWeapon:'homemadeRifle',accuracy:12,perks:['initiative','sharp','sniper-cold','sniper-ammo','sniper-optics']},
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
Object.assign(PROFESSIONS.doctor,{available:true,startReady:true,combatReady:true,weapon:'knife',weaponQuality:1,startDressingKits:2,perks:['doctor-therapist','doctor-pharmacist','doctor-duty','doctor-institute']});
Object.assign(PROFESSIONS.medic,{available:true,startReady:true,combatReady:true,weapon:'pistol',accuracy:8,perks:["medic-field","medic-sanitary","medic-nimble","medic-shooter"]});
Object.assign(PROFESSIONS.heavy,{available:true,startReady:true,combatReady:true,weapon:'knife',body:'heavyStarterArmor',accuracy:8,perks:['armored','burst-fire','tough-cookie','sharp','heavy-gunner']});
Object.assign(PROFESSIONS.assault,{available:true,combatReady:true,weapon:'kaBar',accuracy:8,perks:['burst-fire','tough-cookie','quick-orders','sharp']});
Object.assign(PROFESSIONS.saboteur,{perks:['melee-evasion','evasion','initiative','double-strike'],weapon:'kaBar',accuracy:10,evasionBonus:2.5,combatReady:true});
Object.assign(PROFESSIONS.engineer,{available:true,requiredRosterLevel:1,perks:[],weapon:null,accuracy:null,evasionBonus:0,combatReady:false});

Object.assign(PERKS,{
 'heavy-gunner':{name:'Тяжёлый стрелок',description:'Тяжёлое оружие можно экипировать в основной слот. +5 п.п. точности с тяжёлым оружием в любом слоте.'},
 armored:{name:'Бронированный',description:'Постоянно +5 к поглощению физического и +5 к поглощению термического урона.'},
 greedy:{name:'Жадный',description:'При получении награды за успешное задание дополнительно приносит A по уровню героя. За серию — один раз при общем получении.'},
 gunsmith:{name:'Оружейник',qualityProductions:['upgrade','engineering'],description:'+5 п.п. к шансу качества изготовления предметов оружейного дела и будущей Инженерии за каждого инженера с этим перком, максимум 100%. На улучшения выбранных предметов не действует.'},
 'double-shot':{name:'Пистолеты',description:'Два выстрела за ход из пистолета. Каждый: −15 п.п. точности, без снижения урона.'}
});
Object.assign(PROFESSIONS.engineer,{perks:['armored','greedy','gunsmith','double-shot'],startReady:true,weapon:'pistol',rangedWeapon:null,accuracy:8,combatReady:true});

Object.assign(IDENTITIES.ivan,{bonuses:{hp:30},description:'+30 к стартовому и максимальному здоровью.'});
Object.assign(IDENTITIES.hans,{bonuses:{accuracy:5},description:'+5 п.п. точности.'});
Object.assign(IDENTITIES.izya,{bonuses:{questMoneyPercent:10},description:'+10% A за каждое успешное задание, минимум +1 A. В серии — за каждое прохождение.'});
IDENTITIES.john={name:'Джон',nationality:'Американец',bonuses:{pistolDamage:8},description:'+8 урона каждым попаданием из пистолета.'};
for(const [id,headwear] of Object.entries({ivan:'ushanka',hans:'cap',izya:'fedora',john:'cowboy'}))Object.assign(IDENTITIES[id],{gender:'male',headwear});

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

export const HOBBY_COST=200;
export const HERO_HOBBIES={
 gym:{attribute:'strength',options:{strength:'+1 Сила',endurance:'+10% к максимальному и текущему HP'}},
 fitness:{attribute:'agility',options:{agility:'+1 Ловкость',accuracy:'+5 п.п. точности'}},
 library:{attribute:'intelligence',options:{intelligence:'+1 Интеллект',experience:'+10% опыта героя'}},
 meditation:{attribute:'perception',options:{perception:'+1 Восприятие',thermal:'+10 термического поглощения'}}
};
Object.assign(PERKS,{'tea-solo':{name:'Одинокий ходок',description:'Одиночные вылазки дают двойной опыт и дополнительный предмет.'}});
Object.assign(PERKS,{"sniper-cold":{"name":"Холодный расчёт","description":"Первый выстрел из винтовки или дробовика: −15 п.п. точности, двойной урон после поглощения."},"sniper-ammo":{"name":"Любимые патроны","description":"Первые пять одиночных выстрелов за задание: +5 п.п. точности и +10 урона."},"sniper-optics":{"name":"Оптика","description":"Винтовка на дистанции 2+: +10 п.п. точности."}});
Object.assign(PERKS,{
 'doctor-therapist':{name:'Терапевт',description:'+10 HP к лечению расходниками для всех героев.'},
 'doctor-pharmacist':{name:'Аптекарь',description:'+5 п.п. качества и +10% скорости производства медицины.'},
 'doctor-duty':{name:'Дежурный',description:'+20% к лечению отдыхом и едой для всех героев.'},
 'doctor-institute':{name:'Институтский',description:'+1 к РАД-защите, ещё +1 с 6-го уровня.'}
});
Object.assign(PERKS,{"medic-field":{"name":"Полевой","description":"+20 HP при применении лечебных расходников."},"medic-sanitary":{"name":"Санитар","description":"+3 к лимиту лечения и второй слот для другого стимулятора."},"medic-nimble":{"name":"Юркий","description":"При HP ниже 50% +10 п.п. уклонения и к его лимиту."},"medic-shooter":{"name":"Стрелок","description":"+5 п.п. точности с пистолетами."}});
export const LEVEL_PERKS={
 'doctor-rounds':{name:'Обход',minLevel:2,profession:'doctor',description:'После локации шанс 20% вылечить другого раненого или облучённого героя на 30 + 10 × Восприятие Доктора HP.'},
 'doctor-health':{name:'Здоровье врача',minLevel:3,profession:'doctor',description:'+60 к максимуму HP и ещё +5 за каждый следующий уровень после выбора.'},
 'doctor-rehab':{name:'Реабилитация',minLevel:4,profession:'doctor',description:'Другие герои бесплатно восстанавливаются после гибели в локации с половиной HP и ран. Платное восстановление дешевле на 50%.'},
 'doctor-composure':{name:'Выдержка врача',minLevel:5,profession:'doctor',attributeBonus:'perception',description:'+1 Восприятие и +2 к проверкам на избегание урона или статуса.'},
 'doctor-decontamination':{name:'Дезактивация',minLevel:6,profession:'doctor',requires:'doctor-rounds',description:'Успешный Обход снимает 1 ед. облучения.'},
 'doctor-brigade':{name:'Врачебная бригада',minLevel:7,profession:'doctor',requires:'doctor-rounds',description:'Шанс Обхода увеличивается до 35%.'},
 'doctor-nerves':{name:'Стальные нервы',minLevel:8,profession:'doctor',description:'Входящий урон по Доктору снижается на 10%.'},
 'doctor-resuscitation':{name:'Чудо реанимация',minLevel:9,profession:'doctor',description:'Можно один раз воскресить героя, тело которого вынесли с вылазки. Герой получает шрамы, −1 Силы и +10 поглощения физического и термического урона.'},
 'doctor-operation':{name:'Чудо операция',minLevel:10,profession:'doctor',repeatable:true,description:'Повышает любой основной параметр другого героя на 1, до максимума 11.'},
 'medic-strength':{"name":"ЗОЖ для команды","minLevel":2,"description":"Другие герои получают +1 Силы сверх обычного предела.","profession":"medic","repeatable":false},
 'medic-knowledge':{"name":"Знания медицины","minLevel":3,"description":"Послебоевое лечение отряда получает +20 HP.","profession":"medic","repeatable":false},
 'medic-reserve':{"name":"Запас сил","minLevel":4,"description":"Первое профессиональное лечение на вылазке даёт +30 HP и сохраняет Силу пациента.","profession":"medic","repeatable":false},
 'medic-nutrition':{"name":"Пищевые добавки","minLevel":5,"description":"Весь отряд получает 7 × Восприятие Медика к максимуму HP.","profession":"medic","repeatable":false},
 'medic-double-heal':{"name":"Полевая аптечка","minLevel":6,"description":"После боя на локации Медик может применить второй расходник.","profession":"medic","repeatable":false},
 'medic-charges':{"name":"Запас стимуляторов","minLevel":7,"description":"Новые стимуляторы снаряжаются с запасом применений на 50% больше.","profession":"medic","repeatable":false},
 'medic-preserve':{"name":"Постоянные стимуляторы","minLevel":8,"description":"Шанс сохранить заряд на вылазке. Первый выбор 30%, второй +20 п.п., следующие +10 п.п.","profession":"medic","repeatable":true},
 'sniper-range':{"name":"Дальномер","description":"Штраф точности за единицу дистанции уменьшается на 4 п.п.","minLevel":2,"profession":"sniper"},
 'sniper-crit':{"name":"Охотник за головами","description":"Шанс крита +5 п.п. с винтовкой и +3 п.п. с остальным стрелковым оружием.","minLevel":3,"profession":"sniper"},
 'sniper-hit':{"name":"Снайперский выстрел","description":"Первое стрелковое попадание за бой: +20 урона с винтовкой или +10 с другим оружием.","minLevel":4,"profession":"sniper"},
 'sniper-reload':{"name":"Быстрая перезарядка","description":"Один выстрел в ход перезарядки со штрафом −10 п.п. точности. Штраф не накапливается между ходами.","minLevel":5,"profession":"sniper"},
 'sniper-weak':{"name":"Уязвимые места","description":"После первого попадания по врагу игнорирует 25% его защиты.","minLevel":7,"profession":"sniper"},
 'sniper-pierce':{"name":"Бронебойный","description":"Первый выстрел за бой игнорирует защиту.","minLevel":8,"profession":"sniper"},
 'heavy-armor':{"name":"Мастер брони","description":"Броня со штрафом точности: штраф меньше на 5 п.п. и +7 термического поглощения.","minLevel":2,"profession":"heavy"},
 'heavy-control':{"name":"Контроль очереди","description":"Тяжёлые очереди и огнемёты: +7 п.п. точности.","minLevel":3,"profession":"heavy"},
 'heavy-health':{"name":"Выносливость","description":"+20 максимума HP и +7 за каждый уровень после 4-го.","minLevel":4,"profession":"heavy"},
 'heavy-step':{"name":"Тяжёлый шаг","description":"Штраф длительности локаций от тяжёлой брони меньше на 10 п.п.","minLevel":5,"profession":"heavy"},
 'heavy-hold':{"name":"Удержать позицию","description":"Первый удар от 25% максимума HP после защиты делится пополам.","minLevel":6,"profession":"heavy"},
 'heavy-padding':{"name":"Бронеподкладка","description":"Средняя и тяжёлая броня: +15 физического и +7 термического поглощения, −5 п.п. точности, локации на 5% дольше.","minLevel":7,"profession":"heavy"},
 'heavy-burst':{"name":"Длинная очередь","description":"+1 пуля в очереди и −5 п.п. точности каждой пуле.","minLevel":8,"profession":"heavy"},
 'tea-journal':{name:'Рукописный дневник',description:'Записки бывалого Чая за каждый выбранный перк Чая, включая этот.',profession:'tea',minLevel:2},
 'tea-repeat':{name:'Порыскать еще…',description:'Один повтор каждой пройденной вылазки Чаем с сохранением добычи.',profession:'tea',minLevel:3},
 'tea-spartan':{name:'Свой спартанец',description:'Каждый пункт репутации Спарты меняет опыт Чая и денежную награду вылазки на 3%.',profession:'tea',minLevel:8},
 'tea-team':{name:'Командный игрок',description:'Чай может взять торговца с отношением выше 10.',profession:'tea',minLevel:5},
 ...Object.fromEntries(Object.entries(HERO_HOBBIES).map(([id,hobby])=>['hobby-'+id,{
  profession:'all',minLevel:4,repeatable:true,hobby:id,attributeBonus:hobby.attribute,
  name:'Развитие · '+hobby.options[hobby.attribute],description:hobby.options[hobby.attribute]+' постоянно. Можно выбрать до трёх раз.'
 } ])),
 'bandit-alert':{name:'Ухо востро',profession:'bandit',minLevel:2,repeatable:false,description:'За каждую единицу Восприятия: +4 п.п. уклонения и +4 п.п. точности ближнего оружия.'},
 'bandit-mark':{name:'Конкретно попал',profession:'bandit',minLevel:3,repeatable:false,description:'Против первого врага первого боя на локации или в вылазке: дополнительно Сила × 7 ближнего урона либо +10 стрелкового урона.'},
 'bandit-seasoned':{name:'Бывалый',profession:'bandit',minLevel:4,repeatable:false,description:'Один раз за бой входящий урон после защиты, который снял бы более 25% максимального HP, уменьшается вдвое.'},
 'bandit-rampage':{name:'Беспредел',profession:'bandit',minLevel:5,repeatable:false,description:'Пока HP ниже 50%: +5 п.п. уклонения, +20 ближнего и +10 стрелкового урона.'},
 'hunter-correction':{name:'Корректировка',profession:'hunter',minLevel:2,repeatable:false,description:'Каждый следующий выстрел в ту же цель получает накопительно +3 п.п. точности, максимум +15. Смена цели или новый бой сбрасывают бонус.'},
 'hunter-falcon-eye':{name:'Соколиный глаз',profession:'hunter',minLevel:3,repeatable:false,description:'Один раз за прохождение локации или за вылазку автоматически повторяет первую проваленную проверку Восприятия или поиска добычи с бонусом +2.'},
 'hunter-familiarity':{name:'Привыкание',profession:'hunter',minLevel:4,repeatable:false,description:'При выборе и каждом повышении уровня надетое оружие получает +5 урона привыканием, максимум +25 на оружие. Перенос между слотами сохраняет бонус, снятие или замена сбрасывают.'},
 'hunter-distance':{name:'Дистанция',profession:'hunter',minLevel:5,repeatable:false,description:'+2 к Внимательности при определении дистанции в начале боя. Дистанции 4 и 5 доступны всем героям при преимуществе 15+ и 20+ соответственно.'},
 'general-health':{name:'Общее развитие: здоровье',profession:'all',minLevel:2,repeatable:true,maxHpBonus:40,description:'+40 к максимуму HP. Текущее здоровье не увеличивается. Можно выбирать многократно.'},
 'general-evasion':{name:'Общее развитие: уклонение',profession:'all',minLevel:4,repeatable:true,evasionBonus:4,description:'+4 п.п. уклонения на любой дистанции. Можно выбирать многократно.'},
 'general-armor':{name:'Общее развитие: защита',profession:'all',minLevel:6,repeatable:true,physicalArmorBonus:5,thermalArmorBonus:5,description:'+5 к физическому и +5 к термическому поглощению. Можно выбирать многократно.'},
 'general-radiation':{name:'Общее развитие: РАД-защита',profession:'all',minLevel:8,repeatable:true,radiationProtectionBonus:1,clearsRadiation:true,description:'При выборе полностью снимает облучение и навсегда добавляет +1 к защите РАД. Можно выбирать многократно.'},
 'dual-wield':{name:'Двуеручный бой',profession:'saboteur',minLevel:2,repeatable:false,rewardRole:'sova',description:'Позволяет ближнее оружие в дополнительном слоте. Вплотную после каждой основной атаки — один удар вторым оружием без бонуса Силы. При экипированном втором ближнем оружии все атаки −10 п.п. точности.'},
 'assault-accurate':{name:'Точный',profession:'assault',minLevel:2,repeatable:false,description:'+5 п.п. точности.'},
 'assault-reaction':{name:'Боевые рефлексы',profession:'assault',minLevel:3,repeatable:false,description:'+2 к инициативе и +4 п.п. уклонения.'},
 'assault-enduring':{name:'Выносливый',profession:'assault',minLevel:4,repeatable:false,hpBonus:80,description:'Сразу +80 к текущему и максимальному HP.'},
 'assault-burst':{name:'В очередь!',profession:'assault',minLevel:5,repeatable:false,description:'+10 п.п. точности при стрельбе очередями.'},
 'engineer-shooter':{name:'Стрелок',profession:'engineer',minLevel:2,repeatable:false,description:'+5 п.п. точности со стрелковым оружием.'},
 'engineer-armorer':{name:'Бронник',profession:'engineer',minLevel:3,repeatable:false,description:'+10 к поглощению физического урона.'},
 'engineer-side-job':{name:'Халтурка',profession:'engineer',minLevel:4,repeatable:false,description:'При выборе и на каждом новом уровне приносит 80 A + 10 A × текущий уровень.'},
 'engineer-assistant':{name:'Личный помощник',profession:'engineer',minLevel:5,repeatable:false,description:'+5 п.п. к шансу успеха всех рецептов на станции, максимум 100%.'},
 'favorite-close':{name:'Любимый Ближний',profession:'saboteur',minLevel:2,repeatable:false,description:'+5 п.п. точности и +5 урона на дистанции 0.'},
 'quick-reaction':{name:'Боевая реакция',profession:'saboteur',minLevel:4,repeatable:false,description:'+2 инициативы и +3 п.п. уклонения постоянно.'},
 'samurai':{name:'КакСамурай',profession:'saboteur',minLevel:5,repeatable:false,description:'+4 к урону в ближнем бою за уровень, начиная с уровня выбора.'},
 'saboteur-rush':{name:'Рывок',profession:'saboteur',minLevel:3,description:'В первый ход сближает на 2 дистанции. При старте хода с дистанции 1 — сразу один ближний удар с −10 п.п. точности.'},
 'saboteur-arm-hit':{name:'Удар в руку',profession:'saboteur',minLevel:6,description:'Первое попадание ближним оружием за бой снижает точность цели на 10 п.п. на два её следующих хода.'},
 'saboteur-trip':{name:'Подсечка',profession:'saboteur',minLevel:7,description:'Первое попадание ближним оружием за бой снижает уклонение цели на 10 п.п. на два её следующих хода.'},
 'saboteur-second-strike':{name:'Точный второй удар',profession:'saboteur',minLevel:8,requires:'double-strike',description:'У второй атаки «Двойного удара» штраф точности снижается с −10 до −5 п.п. Штраф урона сохраняется.'},
 'saboteur-butcher':{name:'Мясник',profession:'saboteur',minLevel:9,description:'+5 п.п. к шансу крита ближним оружием. Крит наносит ×1,75 урона вместо ×1,5.'},
 'saboteur-hide':{name:'Скрыться из виду',profession:'saboteur',minLevel:10,description:'Раз за вылазку автоматически перебрасывает первую свою проваленную проверку скрытности с +2.'},
 'enduring':{legacy:true,name:'Выносливый',profession:'saboteur',minLevel:5,repeatable:true,description:'Ранее выбранный перк: +30 к максимуму HP за каждый выбор, без лечения. Бонус сохранён; для новых выборов заменён общим развитием здоровья.'}
};

Object.assign(PERKS,{
 'hunter-seasoned':{name:'Бывалый',maxHpBonus:40,description:'Максимум HP +40; все проверки Восприятия и скрытности +1.'},
 'hunter-squirrel-eye':{name:'Белки-глаз',description:'Штраф точности за каждую дистанцию с винтовками и дробовиками уменьшается на 5 п.п., минимум до 0.'},
 'hunter-stealthy':{name:'Скрытный',description:'Проверки скрытности +2; первая стрелковая атака каждого боя получает +10 п.п. точности.'},
 'hunter-vigilant':{name:'Неусыпный',description:'Обнаружение врагов и ловушек +2; поиск добычи +1.'}
});
Object.assign(PROFESSIONS.hunter,{perks:['hunter-seasoned','hunter-squirrel-eye','hunter-stealthy','hunter-vigilant'],available:true,startReady:true,combatReady:true,accuracy:10,weapon:'oldShotgun',rangedWeapon:null,evasionBonus:0});

Object.assign(PERKS,{
 'bandit-cowboy':{name:'Ковбой-самоучка',description:'Если в обоих слотах пистолеты, стреляет каждым один раз за ход со штрафом −10 п.п. точности. Каждый пистолет использует собственные параметры.'},
 'bandit-nimble':{name:'Шустрый',description:'Один раз за бой в конце своего первого хода при дистанции 0 отходит на 1 дистанцию, максимум до 3.'},
 'bandit-survivor':{name:'Живучий Уб',description:'Один раз за локацию после атаки врага при HP ниже 30% лечится на 30 + Сила × 7, не расходуя медикаменты. Спасает от смертельного удара, поднимая здоровье с нуля.'},
 'bandit-blur':{name:'Размытый силуэт',description:'+15 п.п. уклонения вплотную до завершения первого хода всех противников.'},
 'bandit-jargon':{name:'Жаргон',description:'В первый свой ход до атаки провоцирует одного противника: +10 п.п. точности и −20 п.п. уклонения противнику до конца боя.'}
});
Object.assign(PROFESSIONS.bandit,{available:true,startReady:true,combatReady:true,accuracy:9,weapon:'pistol',rangedWeapon:null,evasionBonus:0,perks:['bandit-cowboy','bandit-nimble','bandit-survivor','bandit-blur','bandit-jargon']});

PROFESSIONS.scientist={name:'Учёный',strength:1,agility:1,intelligence:4,perception:3,available:true,startReady:true,combatReady:true,weapon:'pistol',accessory:'protectiveSuit',accessoryQuality:0,perks:['scientist-lab','scientist-geiger','scientist-analyst','scientist-smart']};
Object.assign(PERKS,{
 'scientist-lab':{name:'Лаборант',description:'+10% скорости исследований, пока жив. Бонусы нескольких Лаборантов складываются.'},
 'scientist-geiger':{name:'Гейгера',description:'+1 РАД-защиты, с шестого уровня ещё +1.'},
 'scientist-analyst':{name:'Полевой аналитик',description:'+2 к поиску и проверкам Интеллекта на локациях и вылазках.'},
 'scientist-smart':{name:'Шибко умный',description:'+1 Интеллект.'}
});
Object.assign(LEVEL_PERKS,{
 'scientist-safety':{name:'Протокол безопасности',profession:'scientist',minLevel:2,description:'Раз за вылазку +2 к первой проверке против отравления или кислотного эффекта.'},
 'scientist-control':{name:'Контрольная проба',profession:'scientist',minLevel:3,description:'Один переброс собственной проверки поиска, взлома или ловушки с +2 за вылазку. Можно сохранить попытку.'},
 'scientist-cross':{name:'Смежная специальность',profession:'scientist',minLevel:4,repeatable:true,description:'Выбор одного из пяти случайных стартовых перков других профессий. Имеющиеся исключаются.'},
 'scientist-eureka':{name:'Эврика!',profession:'scientist',minLevel:5,description:'+2 к собственным небоевым проверкам на вылазке, если в них не входит Интеллект.'},
 'scientist-dose':{name:'Замер дозы',profession:'scientist',minLevel:6,description:'При возвращении снижает полученную дозу радиации участников на 1. Бонусы живых обладателей складываются.'},
 'scientist-experiment':{name:'Экспериментатор',profession:'scientist',minLevel:7,description:'+5 п.п. к успеху и качеству Науки. Один бонус на станцию, максимум 100%.'},
 'scientist-thirst':{name:'Жажда знаний',profession:'scientist',minLevel:9,description:'+10% опыта из всех источников. Локации длятся на 10% дольше.'},
 'scientist-mechanism':{name:'Уязвимость механизма',profession:'scientist',minLevel:8,description:'+20% урона и опыта за механических противников и прототипы.'},
 'scientist-secret':{name:'Секретная разработка',profession:'scientist',minLevel:10,description:'Открывает цепочку исследований лазерного оружия в исследовательском центре.'}
});
for(const [profession,profile] of Object.entries(PROFESSIONS)){
 for(const id of profile.perks??[]){
  LEVEL_PERKS[id]={...PERKS[id],profession,minLevel:1,repeatable:false,starterEffect:id};
 }
}

// Remains a creation perk; later choices use the repeatable general defense perk.
LEVEL_PERKS.armored.maxPickLevel=5;
LEVEL_PERKS['heavy-gunner'].maxPickLevel=1;

// Interactive routes are enabled only after the first playable stage is described.
export const STATION_BUILD_SECONDS=180;
export const STATION_BUILDINGS={
 gym:{name:'Спортзал',cost:500,ingredients:{metalParts:10,springMechanism:5},bonus:'Открывает хобби на экране отдыха.'},
 fitness:{name:'Фитнес-центр',cost:500,ingredients:{fullLeather:20,ghoulHide:20},bonus:'Открывает хобби на экране отдыха.'},
 library:{name:'Библиотека',cost:400,ingredients:{cloth:10,intactBook:2},bonus:'Открывает хобби на экране отдыха.'},
 meditation:{name:'Место для медитации',cost:450,ingredients:{fullLeather:20,rareMushrooms:4},bonus:'Открывает хобби на экране отдыха.'},
 medicTent:{name:'Палатка медика',cost:500,ingredients:{cloth:10,dressingKit:3,medicKit:1},bonus:'Бесплатно восстанавливает 5% доступного максимума HP после каждой завершённой локации или вылазки. Доход 1–8 А в минуту, до 60 минут за цикл.'},
 tradingPost:{name:'Торговый пост',role:'shekel',cost:750,ingredients:{metalParts:10,fullLeather:6},bonus:'Продажа предметов на 5 п.п. выгоднее.'},
 housing:{name:'Улучшение жилья',role:'sova',cost:650,ingredients:{metalParts:10,fullLeather:10},bonus:'Открывает развитие станции метро и 20 мест для жителей. Общий инвентарь +4 ячейки.'},
 laboratory:{name:'Своя лаборатория',role:'pin',cost:200,ingredients:{fullLeather:10,pipe:3,acid:2,rareMushrooms:2},bonus:'Шанс качества изготовления в Науке +5 п.п.'},
 researchCenter:{name:'Исследовательский центр',cost:1000,seconds:300,ingredients:{metalParts:12,electronicParts:4,steel:2},bonus:'Открывает меню исследований.'},
 trainingCenter:{name:'Центр подготовки',role:'tea',cost:800,ingredients:{metalParts:12,springMechanism:5,cloth:10},bonus:'Личная постройка Чая для постоянных походов героев.'}
};
export const INTERACTIVE_MISSIONS={
 roofRoute:roofMission,
 repairMaterials:{
  name:'Поиск материалов для ремонта',filtersPerHero:1,minHeroes:1,maxHeroes:1,
  radiation:2,entry:'search',
  nodes:{search:{title:'Окрестности Технопарка',image:'./zil-exit.webp',
   text:'У разбитого павильона виднеются листы металла и балки. Отмечаем, где лежат материалы, и возвращаемся доложить Смотрителю.',
   choices:[{id:'reportMaterials',label:'Отметить материалы и вернуться',resolve:'repairMaterials'}]}}
 },
  "zilRoute": {
    "name": "Открыть путь на ЗИЛ",
    "filtersPerHero": 3,
    "minHeroes": 1,
    "maxHeroes": 2,
    "entry": "exit",
    "nodes": {
      "exit": {
        "sceneNumber": 1,
        "title": "Выход",
        "image": "./zil-exit.webp",
        "imageAlt": "Заснеженная разрушенная Москва, мост со Стражем и тёмная подворотня.",
        "text": "Вы выходите на свет: всё вокруг завалено снегом. Между разрушенными домами тянется дорога к мосту. Вдалеке на мосту стоит Страж. Что вы будете делать?",
        "playable": true,
        "choices": [
          {
            "id": "sneak",
            "resolve": "stealth",
            "label": "Пройти мимо незамеченными",
            "checkLabel": "Каждый герой: скрытность (или Ловкость), сложность 12."
          },
          {
            "id": "detour",
            "resolve": "detour",
            "label": "Свернуть в подворотню и искать обходной путь",
            "checkLabel": "Каждый герой: Интеллект и Восприятие, сложность 11. Нужен хотя бы один успех."
          }
        ]
      },
      "alleyDeadEnd": {
        "sceneNumber": 2,
        "title": "Обход не найден",
        "image": "./zil-alley.webp",
        "imageAlt": "Заснеженный переулок между разрушенными домами.",
        "text": "Похоже, суслики вас не заметили. Вы спокойно осмотрели переулок, но обходного пути не нашли. Остаётся вернуться и попробовать проскользнуть мимо Стража.",
        "choices": [
          {
            "id": "returnToGuard",
            "resolve": "stealth",
            "label": "Вернуться к пряткам со Стражем",
            "checkLabel": "Каждый герой: скрытность (или Ловкость), сложность 12."
          }
        ]
      },
      "sewerHatch": {
        "sceneNumber": 3,
        "title": "Канализационный люк",
        "image": "./zil-hatch.webp",
        "imageAlt": "Канализационный люк в заснеженном переулке.",
        "text": "Похоже, суслики вас не заметили. Вы спокойно ищете другой путь. Среди снега найден канализационный люк.",
        "playable": false,
        "choices": [
          {
            "id": "descend",
            "label": "Спуститься в канализацию",
            "resolve": "goto",
            "next": "sewerFork"
          }
        ]
      },
      "bridge": {
        "sceneNumber": 4,
        "title": "Мост",
        "image": "./zil-bridge-snow.webp",
        "imageAlt": "Заснеженный разрушенный мост над Москвой-рекой.",
        "text": "Каждый герой дважды проверяет Ловкость против сложности 10. При первом провале герой падает: 30–120 физического урона с учётом брони. Если кто-либо упал, появляется матёрый Страж.",
        "playable": true,
        "choices": [
          {
            "id": "crossBridge",
            "resolve": "bridge",
            "label": "Перейти мост",
            "checkLabel": "Каждому: два успеха Ловкости против 10. Падение: 30–120 физического урона.",
            "configured": true
          }
        ],
        "check": {
          "attribute": "agility",
          "dc": 10,
          "attemptsPerHero": 2,
          "allRequired": true,
          "stopOnFirstFailure": true,
          "failureDamage": {
            "min": 30,
            "max": 120,
            "type": "physical",
            "applyArmor": true,
            "maxHitsPerHero": 1
          },
          "success": "stationEntrance",
          "failure": "matureGuardBattle"
        }
      },
      "guardRecovery": {
        "sceneNumber": 5,
        "title": "После боя",
        "image": "./zil-alley.webp",
        "text": "Стражи повержены. Ваш поверженный товарищ приходит в себя с 1 HP. Можно подлечиться и обыскать трупы.",
        "playable": false,
        "choices": [
          {
            "id": "continue",
            "label": "Продолжить к мосту",
            "next": "bridge"
          }
        ]
      },
      "guardBattle": {
        "sceneNumber": 6,
        "title": "Стражи заметили отряд",
        "image": "./zil-guard-ambush.webp",
        "text": "Суслик замечает вас и начинает выть. Вы не успеваете оглянуться, как вокруг появляются несколько Стражей. Пятеро против вашего отряда — начинается групповой бой.",
        "playable": false,
        "combat": {
          "enemy": "guard",
          "count": 5
        },
        "choices": []
      },
      "matureGuardBattle": {
        "sceneNumber": 7,
        "title": "Матёрый Страж",
        "image": "./zil-mature-guard.webp",
        "text": "Неудача на мосту привлекла тёмного матёрого Стража. Он преграждает путь отряду. После победы можно продолжить путь ко входу на станцию.",
        "playable": false,
        "combat": {
          "enemy": "matureGuard",
          "count": 1,
          "afterRecovery": "stationEntrance"
        },
        "choices": []
      },
      "stationEntrance": {
        "sceneNumber": 8,
        "title": "Вход на ЗИЛ",
        "image": "./zil-gates.webp",
        "imageAlt": "Закрытые металлические ворота станции ЗИЛ.",
        "text": "Каждый герой проверяет Интеллект против 12 и Силу против 14. Два успеха на весь отряд откроют ворота. Иначе остаётся подрыв двумя взрывными гранатами или возвращение на станцию.",
        "playable": true,
        "choices": [
          {
            "id": "tryGate",
            "resolve": "gateChecks",
            "label": "Попробовать открыть ворота",
            "checkLabel": "Каждому: Интеллект 12 и Сила 14. Нужны два успеха на отряд.",
            "configured": true
          }
        ],
        "check": {
          "checksPerHero": [
            {
              "attribute": "intelligence",
              "dc": 12
            },
            {
              "attribute": "strength",
              "dc": 14
            }
          ],
          "requiredSuccesses": 2,
          "success": "stationBandits",
          "failure": "gateBlocked",
          "oneAttemptPerVisit": true
        }
      },
      "sewerFork": {
        "sceneNumber": 9,
        "title": "Развилка в канализации",
        "image": "./zil-sewer-fork.webp",
        "imageAlt": "Подземный коридор с проходами налево и направо.",
        "text": "Вы спускаетесь через канализационный люк. Внизу расходятся два коридора. Можно пойти налево или направо.",
        "choices": [
          {
            "id": "left",
            "label": "Пойти налево",
            "resolve": "goto",
            "next": "molotovCorridor"
          },
          {
            "id": "right",
            "label": "Пойти направо",
            "resolve": "goto",
            "next": "longCorridor"
          }
        ]
      },
      "molotovCorridor": {
        "sceneNumber": 10,
        "title": "Левый коридор",
        "image": "./zil-sewer-trap.webp",
        "imageAlt": "Растяжка с бутылкой в тёмном подземном проходе.",
        "text": "Передний герой проверяет обнаружение ловушки против сложности 13. Найденную ловушку можно обезвредить и забрать Молотов. Провал вызовет два удара огня.",
        "playable": true,
        "trap": {
          "item": "molotov",
          "rules": "surface-stash",
          "reward": {
            "moneyMin": 20,
            "moneyMax": 100,
            "items": [
              {
                "item": "shieldUni",
                "quantity": 1,
                "quality": 1
              }
            ]
          },
          "next": null,
          "checkHero": "formation.front",
          "attribute": "perception",
          "dc": 13
        },
        "choices": [
          {
            "id": "checkTrap",
            "resolve": "leftTrap",
            "label": "Осмотреть коридор",
            "checkLabel": "Передний: обнаружение ловушек против 13."
          }
        ]
      },
      "longCorridor": {
        "sceneNumber": 11,
        "title": "Длинный коридор",
        "image": "./zil-long-corridor.webp",
        "text": "Коридор уводит вас всё дальше под землю. В конце появляется проход в тоннель рядом со станцией ЗИЛ. Здесь отряд поджидает кислотный паук.",
        "choices": [
          {
            "id": "continue",
            "label": "Войти в тоннель",
            "resolve": "goto",
            "next": "acidSpiderBattle"
          }
        ]
      },
      "acidSpiderBattle": {
        "sceneNumber": 12,
        "title": "Кислотный Паукан",
        "image": "./zil-spider.webp",
        "text": "В конце туннеля вы выходите в большой коридор с рельсами, и нежданно на вас нападает огромный кислотный паук.",
        "playable": false,
        "combat": {
          "enemy": "acidSpider",
          "count": 1,
          "afterRecovery": "spiderTunnel"
        },
        "choices": []
      },
      "stationBandits": {
        "sceneNumber": 13,
        "title": "Станция ЗИЛ: встреча с бандитами",
        "image": "./zil-station-bandits.webp",
        "text": "Ура, мы на станции ЗИЛ. Здесь вы видите следы жизни людей, всякий мусор, бочки, в которых недавно горел костёр. Рядом с одной из бочек вы видите две фигуры. Судя по всему, это бандиты. Они замечают вас и подходят с оружием в руках!",
        "choices": [
          {
            "id": "talk",
            "resolve": "zilBandits",
            "label": "Поговорить с бандитами мирно",
            "checkLabel": "Восприятие против 14. Достаточно одного успеха."
          },
          {
            "id": "threaten",
            "resolve": "zilBandits",
            "label": "Угрожать бандитам",
            "checkLabel": "Восприятие против 14. К броску добавляется разница с уровнем бандитов (4)."
          },
          {
            "id": "bribe",
            "resolve": "zilBandits",
            "label": "Откупиться за 50 A",
            "checkLabel": "Бандиты уйдут без проверок."
          },
          {
            "id": "attack",
            "resolve": "zilBandits",
            "label": "Напасть первыми",
            "checkLabel": "+4 к инициативе каждого героя."
          }
        ]
      },
      "banditBattle": {
        "sceneNumber": 14,
        "title": "Бой с бандитами",
        "image": "./zil-bandit-battle.webp",
        "text": "Один бандит вскидывает «Бастард ПП», второй берёт вас на мушку из «Браунинга».",
        "choices": []
      },
      "stationInside": {
        "sceneNumber": 15,
        "title": "На станции ЗИЛ",
        "image": "./zil-station.webp",
        "text": "Платформа опустела. Путь на ЗИЛ найден.",
        "choices": [
          {
            "id": "finish",
            "resolve": "finishZil",
            "label": "Вернуться - Задание выполнено"
          }
        ]
      },
      "returnHome": {
        "sceneNumber": 16,
        "title": "Путь на ЗИЛ открыт",
        "image": "./zil-gates.webp",
        "text": "Вход на станцию разблокирован. Отряд может вернуться на Автозаводскую. Вылазка будет считаться выполненной.",
        "playable": false,
        "completion": {
          "success": true,
          "rewards": {
            "xp": 150,
            "sharedEqually": true,
            "unlockLocation": "zilTunnels"
          }
        },
        "choices": []
      },
      "gateBlocked": {
        "sceneNumber": 17,
        "title": "Ворота не поддаются",
        "image": "./zil-gate-blocked.webp",
        "text": "Без подрыва пройти не получится. Нужно две взрывные гранаты из снаряжения отряда; Молотовы не подходят. Можно вернуться на станцию и начать вылазку заново позже.",
        "playable": true,
        "demolition": {
          "count": 2,
          "source": "partyCarriedGrenades",
          "exclude": [
            "molotov"
          ],
          "explosiveOnly": true,
          "success": "stationBandits"
        },
        "choices": [
          {
            "id": "blastGate",
            "resolve": "gateGrenades",
            "label": "Подорвать вход — 2 взрывные гранаты",
            "configured": true
          },
          {
            "id": "return",
            "resolve": "returnUnfinished",
            "label": "Вернуться на станцию",
            "configured": true
          }
        ],
        "returnOutcome": {
          "status": "unfinished",
          "refundFilters": false,
          "keepEarnedCombatAndCheckXp": true,
          "restartFromEntry": true
        }
      },
      "leftStash": {
        "sceneNumber": 18,
        "title": "Схрон сталкера",
        "image": "./zil-stash.webp",
        "text": "Тут дальше тупик, и схрон сталкера.",
        "choices": [
          {
            "id": "search",
            "resolve": "leftStash",
            "label": "Посмотреть что в схроне"
          },
          {
            "id": "return",
            "resolve": "goto",
            "next": "sewerFork",
            "label": "Вернуться обратно к развилке"
          }
        ]
      },
      "spiderTunnel": {
        "sceneNumber": 19,
        "title": "Путь свободен",
        "image": "./zil-station.webp",
        "text": "Кислотный Паукан повержен. За ним рельсы уходят в тоннель к станции.",
        "choices": [
          {
            "id": "continue",
            "resolve": "goto",
            "next": "stationBandits",
            "label": "Идти дальше в тоннеле по рельсам"
          }
        ]
      }
    }
  }
};

export const MEDIC_TREATMENT={min:60,max:100,perceptionMultiplier:10,strengthCost:1,maxUsesPerCombat:1};

export const MATURE_GUARD={...TECHNOPARK.enemy,boss:false,name:'Матёрый Страж',experience:45,loot:[{id:'armorUpgradePlan',chance:20},{id:'toughLeather',chance:80,minQty:1,maxQty:3},{id:'leaderKebab',chance:10,minQty:1,maxQty:1}],hp:330,accuracy:20,damageMin:50,damageMax:150};

// Interactive adventure enemy; encounter resolution remains under development.
export const ACID_SPIDER={boss:true,
 name:'Кислотный Паукан',experience:45,loot:[{id:'hardChitinPlates',chance:70,minQty:1,maxQty:2},{id:'acid',chance:50,minQty:1,maxQty:2}],hp:340,evasion:35,accuracy:15,stealth:4,
 damageType:'thermal',damageMin:30,damageMax:120,
 mainAttack:{name:'Кислотный укус',distance:0,damageType:'thermal',damageMin:30,damageMax:120},
 webAttack:{name:'Кислотная паутина',distance:1,accuracyBonus:15,damageType:'thermal',damageMin:15,damageMax:90,
  onHit:{status:'entangled',attribute:'strength',dc:13,escapeCostsTurn:true}},
 tactics:{normal:['web','main'],allHeroesEntangled:['main','main'],entangledTarget:'lowestCurrentHp',mainTarget:'firstUnentangledInFormation'},
};

export const ZIL_TUNNELS={
 name:'Осмотреть тоннели ЗИЛ', unlockedBy:'zilRoute', requiredLevel:LOCATION_LEVELS.zilTunnels,
 filtersPerHero:2, seconds:90, returnMoney:550, baseXp:36,
 description:'На станции ЗИЛ у заброшенной дрезины приоткрыта дверь в служебный тоннель. За ней проход к складу. В тоннеле могут быть кислотные пауки или бандиты.',
 spider:{name:'Кислотный паук',hp:200,armor:15,thermalArmor:5,accuracy:18,evasion:45,initiative:4,stealth:2,damageMin:40,damageMax:85,attackName:'Укус'},
 bandits:[
  {name:'Бандит-стрелок',hp:150,armor:10,thermalArmor:0,accuracy:10,evasion:40,initiative:2,stealth:2,damageMin:20,damageMax:65,attackName:'Пистолет ТТ',attackRange:3},
  {name:'Бандит с монтировкой',hp:180,armor:15,thermalArmor:0,accuracy:15,evasion:35,initiative:2,stealth:2,damageMin:35,damageMax:80,attackName:'Удар монтировкой'}
 ]
};

export const SURFACE_SHOPS={
 name:'Осмотреть ближайшие магазины', unlockedBy:'surface', filtersPerHero:2, seconds:100,
 trapItem:'tinGrenade', radiationMax:4,
 description:'За разбитыми витринами торгового ряда видны продуктовый, хозяйственный и аптека. Ищи припасы и берегись собак, мародёров и растяжек.',
 baseXp:0, dogXp:0, guardXp:0, dog:SURFACE.dog, dogMaxCount:3, enemyGroup:ZIL_TUNNELS.bandits,
 tiers:[
  {dc:8,text:'У разбитой витрины свежие собачьи следы.',hidden:'Герой проходит мимо стаи.',spotted:'Собаки замечают героя.',loot:[]},
  {dc:13,text:'У витрин хозяйничают мародёры.',hidden:'Герой обходит мародёров через служебный вход.',spotted:'Двое мародёров перекрывают проход.',loot:[]},
  {dc:18,text:'За дверью подсобки может быть растяжка.',loot:[]}
 ],
 bonusLoot:[{item:'electronicParts',chance:35},{item:'intactBook',chance:10},{item:'oldMedicines',chance:5}],
 caches:[
  {rollMax:40,name:'Продуктовый',xp:45,money:550,loot:{metalParts:2,strongTape:1}},
  {rollMax:80,name:'Хозяйственный',xp:55,money:500,loot:{armorPlates:2,metalParts:1}},
  {rollMax:100,name:'Аптека',xp:65,money:500,loot:{medicKit:2,strongTape:1}}
 ]
};

applyProfessionBalance({PROFESSIONS,PERKS,LEVEL_PERKS});

Object.assign(PROFESSIONS,{demolition:{name:'Подрывник',strength:4,agility:1,intelligence:2,perception:2,accuracy:10,available:true,startReady:true,combatReady:true,weapon:'crowbar',perks:['demo-grenadier','demo-thrower','demo-risk','demo-scar','demo-burned']}});
Object.assign(PERKS,Object.fromEntries([['demo-grenadier','Гранатчик','+2 места для гранат и +7 урона гранат, кроме радиоактивных.'],['demo-thrower','Метатель','+1 дистанция броска; можно выбрать дважды.'],['demo-risk','Рисковый','+5 п.п. большого взрыва, +3 п.п. взрыва под ногами.'],['demo-scar','Со шрамом','Вдвое меньше шанс взрыва под ногами.'],['demo-burned','Обожжённый','+14 термического и +7 физического поглощения.']].map(([id,name,description])=>[id,{name,description}])));
Object.assign(LEVEL_PERKS,Object.fromEntries([['demo-thrower','Метатель',1,'+1 дистанция броска.',2],['demo-armor','Мастер брони',2,'Снимает до 5 п.п. штрафа брони и даёт +7 термозащиты при броне со штрафом.'],['demo-extra','Доп. граната',3,'Каждый второй собственный ход автобоя бросает гранату вместо атаки, если есть цель и граната.'],['demo-pyro','Пироман',4,'+20 к минимуму и +30 к максимуму урона огнемётов и Молотовых.'],['demo-dodge','Сложные броски',5,'+1 сложности уклонения от своих гранат и огнемётов.',3],['demo-area','Площадный огонь',6,'Граната задевает одного дополнительного противника на следующей дистанции.'],['demo-armored','Бронированный',7,'В средней/тяжёлой броне +15 поглощения первого входящего урона.'],['demo-explosion','Усиленный взрыв',8,'+10 к минимуму и +20 к максимуму взрывных гранат, кроме Молотова и радиационной.'],['demo-padding','Бронеподкладка',9,'В средней/тяжёлой броне +15 физической, +7 термической защиты; −5 п.п. точности и +5% времени локаций.'],['demo-refund','Самодельные гранаты',10,'Возвращает 25% фактически потраченных гранат; доли копятся по видам.']].map(([id,name,minLevel,description,maxPicks])=>[id,{name,minLevel,description,profession:'demolition',repeatable:!!maxPicks,maxPicks}])));

// Quest storage is automatic and does not consume ordinary inventory cells.
for(const id of ["paoloPassport","darkCrystal","teaNotes","traderNotes","kolomenskayaBeetles","kolomenskayaBeetleCorpse"])ITEMS[id].questStorage=true;

ITEMS.paoloArmor={...ITEMS.blueSpecialArmor,name:"Броня Пауло",rarity:"rare",rainbowBorder:true,armor:ITEMS.blueSpecialArmor.armor+10,thermalArmor:ITEMS.blueSpecialArmor.thermalArmor-7,value:Math.round(ITEMS.blueSpecialArmor.value*1.10),pendingDistribution:true,description:"Личная броня Пауло. Единственный экземпляр — трофей после победы над ним. Можно улучшать приписками и схемами."};

RECIPES.condensedAccumulators={name:"Конденсированные накопители",production:"upgrade",level:13,research:"energyWeaponImprovement",ingredients:{electronicParts:2,steel:1,acid:1},cost:1000,seconds:120,xp:150,chance:65,upgrade:true,target:"ranged",energyOrFlame:true,minBonus:15,maxBonus:30,prefix:"Конденс.",valueIncreasePercent:25};
