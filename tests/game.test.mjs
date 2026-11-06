import test from 'node:test';import assert from 'node:assert/strict';
import {createGame,act,tradeQuote,sellerPrice,roundRatio,ready,openYuras,countItem,heroConfig,getHeroes,normalizeGame,hireCost}from'../dist/game.js';
import {ITEMS,CAPACITY,MAX_SHELVES}from'../dist/data.js';
import {reportTurnCount,seriesTurnCount,inventoryCapacity,inventorySlotCost,shelfCost,canReceive} from '../dist/game.js';
test('Бой останавливается на 300-м ходе и засчитывает поражение',()=>{
 const c=heroConfig(hire());assert.equal(c.trial.combatTurnLimit,300);c.hero.armor=10000;c.hero.accuracy=1000;c.rat={...c.rat,hp:10000,armor:10000,accuracy:1000,stealth:100};const result=battle(c,{int:(min,max)=>max},10000);assert.equal(result.turns,300);assert.equal(result.won,false);assert.equal(result.reason,'лимит');assert.ok(result.hp>0);
});
test('Ходы серии суммируются по боям, учитывают поражение и неизвестные старые результаты',()=>{
 const won={kind:'mission',result:{battles:[{turns:5},{turns:12}]}},lost={kind:'patrol',result:{alive:false,battles:[{turns:300}]}};assert.equal(reportTurnCount(won),17);assert.equal(seriesTurnCount({reports:[won,lost]}),317);assert.equal(seriesTurnCount({reports:[{kind:'help'},{kind:'rest'}]}),0);assert.equal(seriesTurnCount({reports:[won,{kind:'mission',result:{}}]}),null);assert.equal(reportTurnCount({kind:'mission',result:{battles:[]}}),0);
});
import {levelPerkOptions} from '../dist/game.js';
test('Оставшиеся стартовые перки одноразовые, доступны в развитии и складываются с новыми',()=>{
 let s=hire();s.hero.level=12;assert.equal(levelPerkOptions(s.hero).some(p=>p.id==='evasion'),false);s=act(s,{type:'chooseLevelPerk',perk:'initiative'},t);s=act(s,{type:'chooseLevelPerk',perk:'quick-reaction'},t);s=act(s,{type:'chooseLevelPerk',perk:'melee-evasion'},t);s=act(s,{type:'chooseLevelPerk',perk:'double-strike'},t);const c=heroConfig(s);assert.equal(c.hero.evasion,68);assert.equal(c.hero.initiative,9);assert.equal(c.hero.meleeEvasionBonus,16.8);assert.equal(c.hero.attacksPerTurn,2);assert.equal(c.hero.attackAccuracyPenalty,10);assert.equal(s.hero.startPerk,'evasion');assert.equal(c.hero.perk,'evasion');assert.equal(levelPerkOptions(s.hero).some(p=>['evasion','initiative','quick-reaction','melee-evasion','double-strike'].includes(p.id)),false);s.hero.level=15;assert.throws(()=>act(s,{type:'chooseLevelPerk',perk:'initiative'},t),/недоступен/);
});
test('Выбранный на старте перк исключается для всех стартовых вариантов диверсанта',()=>{
 for(const perk of ['evasion','initiative','melee-evasion','double-strike']){const s=act(game(),{type:'hire',perk},t,()=>.1);const options=levelPerkOptions(s.hero);assert.equal(options.some(p=>p.id===perk),false);assert.equal(options.filter(p=>p.starterEffect).length,3);}
});
test('Перки Диверсанта: уровни открытия, выбор, одноразовость и стартовый перк',()=>{
 let s=hire();s.hero.level=2;assert.deepEqual(levelPerkOptions(s.hero).map(p=>p.id),['favorite-close','melee-evasion','initiative','double-strike']);assert.throws(()=>act(s,{type:'chooseLevelPerk',perk:'favorite-close'},t),/выбора/);s.hero.level=3;assert.throws(()=>act(s,{type:'chooseLevelPerk',perk:'samurai'},t),/недоступен/);s=act(s,{type:'chooseLevelPerk',perk:'quick-reaction'},t);assert.equal(s.hero.perk,'evasion');assert.equal(s.hero.levelPerks[0].level,3);assert.equal(heroConfig(s).hero.initiative,5);assert.equal(heroConfig(s).hero.evasion,68);assert.equal(levelPerkOptions(s.hero).some(p=>p.id==='quick-reaction'),false);s.hero.level=6;assert.throws(()=>act(s,{type:'chooseLevelPerk',perk:'quick-reaction'},t),/недоступен/);
});
test('Выносливый: повторяется, не лечит, максимум сохраняется при повышении уровня',()=>{
 let s=hire();s.hero.level=9;s.hero.hp=80;for(let i=0;i<3;i++)s=act(s,{type:'chooseLevelPerk',perk:'enduring'},t);assert.equal(s.hero.maxHp,270);assert.equal(s.hero.hp,80);assert.equal(levelPerkOptions(s.hero).some(p=>p.id==='enduring'),true);s.hero.xp=899;s.hero.job={kind:'help',endsAt:t,result:{loot:{},money:0,xp:1}};s=act(s,{type:'claimHero'},t);assert.equal(s.hero.level,10);assert.equal(s.hero.maxHp,180+9*(10+20/3)+90);
});
test('Боевые перки: Любимый Ближний только вплотную, КакСамурай от уровня выбора',()=>{
 const s=hire();s.hero.level=6;s.hero.levelPerks=[{level:3,perk:'favorite-close',pickedAtLevel:3},{level:6,perk:'samurai',pickedAtLevel:5}];s.hero.rangedWeapon='pistol';const c=heroConfig(s);assert.equal(c.hero.meleeDamageBonus,8);c.rat.hp=1000;const attacks=battle(c,{int:(min,max)=>max},1000,{trace:true}).events.filter(e=>e.type==='атака'&&e.actor==='герой');assert.equal(attacks[0].accuracy,16.25-30);assert.equal(attacks[0].bonus,0);const close=attacks.find(e=>e.distance===0);assert.equal(close.accuracy,21.25);assert.equal(close.bonus,33);
 s.hero.level=7;assert.equal(heroConfig(s).hero.meleeDamageBonus,12);
});
test('Перки нельзя выбирать во время серии, а погибшая серия не выдаёт новых возможностей',()=>{
 let s=hire();s.hero.level=3;s=act(s,{type:'startSeries',location:'help',total:2,threshold:15},t,()=>.1);assert.throws(()=>act(s,{type:'chooseLevelPerk',perk:'favorite-close'},t+100),/занят/);assert.equal(s.hero.levelPerks,undefined);
});
import {earnedPerkLevels,availablePerkLevels} from '../dist/game.js';
test('Перки по уровню: стартовый отдельно, старые герои и несколько полученных возможностей',()=>{
 const s=hire();assert.deepEqual(earnedPerkLevels(s.hero),[]);s.hero.level=20;assert.deepEqual(earnedPerkLevels(s.hero),[3,6,9,12,15,18,20]);s.hero.levelPerks=[{level:3,perk:'future'}];assert.deepEqual(availablePerkLevels(s.hero),[6,9,12,15,18,20]);const loaded=normalizeGame(JSON.parse(JSON.stringify(s)));assert.deepEqual(availablePerkLevels(loaded.hero),[6,9,12,15,18,20]);
});
test('Расписание перков точно учитывает интеллект 0–5 и будущие уровни',()=>{
 const s=hire(),p=PROFESSIONS.saboteur,original=p.intelligence;
 try{for(const [intelligence,expected] of [[0,[4,8,12,16,20]],[1,[3,6,9,12,15,18,20]],[2,[3,5,8,10,13,15,18,20]],[3,[3,5,7,9,11,13,15,17,20]],[4,[2,4,6,8,10,12,14,16,18,20]],[5,[2,4,5,7,8,10,11,13,15,17,18,20]]]){p.intelligence=intelligence;s.hero.level=20;assert.deepEqual(earnedPerkLevels(s.hero),expected);s.hero.level=1;assert.deepEqual(earnedPerkLevels(s.hero),[]);}p.intelligence=0;s.hero.level=32;assert.deepEqual(earnedPerkLevels(s.hero),[4,8,12,16,20,24,28,32]);}finally{p.intelligence=original;}
});
test('Лечебное: Макс заполняет свободные места по силе героя',()=>{
 let s=hire();s.hero.bandages=2;s.inventory=[row('bandage',7),row('broth',3)];
 s=act(s,{type:'pack',qty:1},t);
 assert.equal(s.hero.bandages,3);
 assert.throws(()=>act(s,{type:'pack',qty:3},t),/лимит/);
 s=act(s,{type:'pack',max:true},t);
 assert.equal(s.hero.bandages,5);assert.equal(countItem(s,'bandage'),4);assert.equal(countItem(s,'broth'),3);
 assert.throws(()=>act(s,{type:'pack',max:true},t),/лимит/);
 s.hero.bandages=8;
 s=act(s,{type:'pack',qty:-1},t);
 assert.equal(s.hero.bandages,7);assert.equal(countItem(s,'bandage'),5);
});
test('Лечебное: нельзя пополнить запас занятому или погибшему герою',()=>{
 let s=hire();s.inventory=[row('bandage',4)];s=act(s,{type:'help'},t);assert.throws(()=>act(s,{type:'pack',max:true},t+100),/занят/);assert.equal(countItem(s,'bandage'),4);assert.equal(s.hero.bandages,0);s.hero.job=null;s.hero.dead=true;assert.throws(()=>act(s,{type:'pack',max:true},t),/восстанов/);
});
test('Отвар: партия по Max, общие расходы и время, получение в существующий стек',()=>{
 let s=game();s.productions.medicine.level=2;s.money=75;s.inventory=[row('meat',10),row('broth',2)];assert.equal(ITEMS.broth.stack,true);assert.equal(maxCraftQuantity(s,'broth'),3);s=act(s,{type:'craft',recipe:'broth',max:true},t);assert.equal(s.money,15);assert.equal(countItem(s,'meat'),7);assert.equal(s.productions.medicine.job.qty,3);assert.equal(s.productions.medicine.job.endsAt,t+21000);
 s.inventory.push(...Array.from({length:CAPACITY-2},(_,i)=>row('knife',1,'k'+i)));s=act(s,{type:'claimCraft',production:'medicine'},t+21000);assert.equal(countItem(s,'broth'),5);assert.equal(s.inventory.filter(r=>r.item==='broth').length,1);assert.equal(s.inventory.length,CAPACITY);assert.equal(s.productions.medicine.xp,18);
});
test('Отвар: ручное количество и ограничение Max мясом',()=>{
 let s=game();s.productions.medicine.level=2;s.inventory=[row('meat',4)];assert.equal(maxCraftQuantity(s,'broth'),4);s=act(s,{type:'craft',recipe:'broth',qty:2},t);assert.equal(s.productions.medicine.job.qty,2);assert.equal(s.productions.medicine.job.endsAt,t+14000);assert.equal(countItem(s,'meat'),2);assert.equal(s.money,1460);
});
import {evasionAtDistance} from '../dist/combat.js';
test('Чутьё бойца: 1,4 п.п. за уровень только на дистанции 0',()=>{
 const s=hire();s.hero.perk='melee-evasion';
 for(const [level,bonus] of [[1,1.4],[2,2.8],[10,14],[20,28]]){
  s.hero.level=level;const c=heroConfig(s);assert.equal(c.hero.meleeEvasionBonus,bonus);assert.equal(evasionAtDistance(c.hero,0),60+bonus);for(const distance of [1,2,3])assert.equal(evasionAtDistance(c.hero,distance),60);
 }
});
test('Точность всех героев: каждый переход уровня даёт ровно 1,25 п.п.',()=>{
 for(const profession of ['saboteur','engineer']){
  const s=hire();s.hero.profession=profession;const base=profession==='engineer'?8:10;
  for(let level=1;level<=20;level++){s.hero.level=level;assert.equal(heroConfig(s).hero.accuracy,base+1.25*(level-1));}
  s.hero.nationalityBonuses={accuracy:5};s.hero.wounds=4;assert.equal(heroConfig(s).hero.accuracy,base+23.75+5-10);
 }
});
import {itemValue,itemArmor,upgradeValueBonus,maxCraftQuantity} from '../dist/game.js';

test('Max: ограничение материалами или деньгами, расходы и время всей партии',()=>{
 let s=game();s.inventory=[row('cloth',7)];s.money=35;assert.equal(maxCraftQuantity(s,'bandage'),3);s=act(s,{type:'craft',recipe:'bandage',max:true},t);assert.equal(s.money,5);assert.equal(countItem(s,'cloth'),4);assert.equal(s.productions.medicine.job.qty,3);assert.equal(s.productions.medicine.job.endsAt,t+15000);assert.equal(maxCraftQuantity(s,'bandage'),0);s=act(s,{type:'claimCraft',production:'medicine'},t+15000);assert.equal(countItem(s,'bandage'),3);assert.equal(s.productions.medicine.xp,6);
 s=game();s.inventory=[row('cloth',2)];assert.equal(maxCraftQuantity(s,'bandage'),2);s=act(s,{type:'craft',recipe:'bandage',max:true},t);assert.equal(countItem(s,'cloth'),0);assert.equal(s.money,1480);assert.equal(s.productions.medicine.job.qty,2);
});
test('Max: ноль ресурсов не запускает производство, повторное нажатие не списывает ресурсы',()=>{
 let s=game();assert.equal(maxCraftQuantity(s,'bandage'),0);const before=JSON.stringify(s);assert.throws(()=>act(s,{type:'craft',recipe:'bandage',max:true},t),/ресурсов/);assert.equal(JSON.stringify(s),before);assert.equal(maxCraftQuantity(s,'knife'),0);assert.throws(()=>act(s,{type:'craft',recipe:'knife',max:true},t),/количество/);
 s.inventory=[row('cloth',5)];s=act(s,{type:'craft',recipe:'bandage',max:true},t);const started=JSON.stringify(s);assert.throws(()=>act(s,{type:'craft',recipe:'bandage',max:true},t),/готовое/);assert.equal(JSON.stringify(s),started);
});
test('Max: все ингредиенты будущих рецептов и повторный расчёт на запуске',()=>{
 const original=RECIPES.bandage.ingredients;try{RECIPES.bandage.ingredients={cloth:2,leather:3};let s=game();s.inventory=[row('cloth',9),row('leather',7)];assert.equal(maxCraftQuantity(s,'bandage'),2);s.money=10;assert.equal(maxCraftQuantity(s,'bandage'),1);s=act(s,{type:'craft',recipe:'bandage',max:true,qty:999},t);assert.equal(s.productions.medicine.job.qty,1);assert.equal(countItem(s,'cloth'),7);assert.equal(countItem(s,'leather'),4);}finally{RECIPES.bandage.ingredients=original;}
});

test('LCU: уровень 2, стрелковое оружие, 15 A, 12 секунд и 15 XP',()=>{
 let s=hire();s.inventory=[row('pistol')];assert.throws(()=>act(s,{type:'upgrade',recipe:'lcu',uid:'pistol'},t),/уровень/);assert.equal(canUpgrade(row('knife'),'lcu'),false);assert.equal(canUpgrade(row('jacket'),'lcu'),false);assert.equal(canUpgrade(row('ashot'),'lcu'),true);
 s.productions.science.level=2;s=act(s,{type:'upgrade',recipe:'lcu',uid:'pistol'},t,()=>.69);assert.equal(s.productions.science.job.chance,70);assert.equal(s.productions.science.job.endsAt,t+12000);assert.equal(s.money,850);s=act(s,{type:'claimCraft',production:'science'},t+12000);const gun=s.inventory[0];assert.equal(gun.upgrades[0].prefix,'LCU');assert.equal(gun.upgrades[0].accuracyBonus,5);assert.equal(gun.upgrades[0].bonus,0);assert.equal(itemValue(gun),220);assert.equal(s.productions.science.xp,15);assert.equal(canUpgrade(gun,'lcu'),false);
 s=act(s,{type:'equip',uid:gun.uid,slot:'main'},t+12000);const c=heroConfig(s);c.rat.stealth=100;const attack=battle(c,{int:(min,max)=>max},180,{trace:true}).events.find(e=>e.type==='атака'&&e.actor==='герой');assert.equal(attack.accuracy,15);assert.equal(attack.bonus,0);assert.equal(attack.base,50);
});
test('LCU: неудача не меняет оружие; сочетается с ПСЦТ',()=>{
 let s=hire();s.inventory=[row('ashot')];s.productions.science.level=2;s=act(s,{type:'upgrade',recipe:'lcu',uid:'ashot'},t,()=>.7);s=act(s,{type:'claimCraft',production:'science'},t+12000);assert.deepEqual(s.inventory[0],row('ashot'));assert.equal(s.money,850);assert.equal(s.productions.science.xp,15);
 s.productions.upgrade.level=2;s=act(s,{type:'upgrade',recipe:'psct',uid:'ashot'},t+12000,()=>0);s=act(s,{type:'claimCraft',production:'upgrade'},t+24000);s=act(s,{type:'upgrade',recipe:'lcu',uid:'ashot'},t+24000,()=>0);s=act(s,{type:'claimCraft',production:'science'},t+36000);const gun=s.inventory[0];assert.equal(itemTier(gun),2);assert.equal(itemValue(gun),450);s=act(s,{type:'equip',uid:gun.uid,slot:'ranged'},t+36000);assert.equal(heroConfig(s).hero.weapons.ranged.accuracyBonus,0);assert.equal(heroConfig(s).hero.weapons.ranged.bonus,20);assert.equal(tradeQuote(gun,1,0,'buyer').price,495);
});
test('Цена улучшения: стоимость рецепта по умолчанию, явное значение имеет приоритет',()=>{
 assert.equal(upgradeValueBonus({upgrade:true,cost:170}),170);assert.equal(upgradeValueBonus({upgrade:true,cost:170,valueBonus:40}),40);assert.equal(upgradeValueBonus({upgrade:true,cost:170,valueBonus:0}),0);assert.equal(upgradeValueBonus({cost:170}),0);
 const explicit=RECIPES.lcu.valueBonus;try{delete RECIPES.lcu.valueBonus;let s=hire();s.productions.science.level=2;s.inventory=[row('pistol')];s=act(s,{type:'upgrade',recipe:'lcu',uid:'pistol'},t,()=>0);s=act(s,{type:'claimCraft',production:'science'},t+12000);assert.equal(s.inventory[0].upgrades[0].valueBonus,150);assert.equal(itemValue(s.inventory[0]),220);}finally{RECIPES.lcu.valueBonus=explicit;}
});

test('Наука: старое сохранение дополняется без потерь, улучшение независимо от оружейного дела',()=>{
 const old=hire();delete old.productions.science;old.productions.upgrade.job={recipe:'sharpen',endsAt:t+10000};const fixed=normalizeGame(old);assert.deepEqual(fixed.productions.science,{level:1,xp:0,job:null});assert.deepEqual(fixed.productions.upgrade,old.productions.upgrade);assert.deepEqual(fixed.inventory,old.inventory);assert.equal(fixed.money,old.money);
 fixed.inventory=[row('jacket'),row('leather',2)];const s=act(fixed,{type:'upgrade',recipe:'patchedArmor',uid:'jacket'},t,()=>0);assert.ok(s.productions.upgrade.job);assert.equal(s.productions.science.job.endsAt,t+10000);assert.equal(s.money,fixed.money-100);assert.equal(countItem(s,'leather'),0);
});
test('Штопанная броня: успех, экипировка, снятие, цена и запрет повторения',()=>{
 let s=hire();s.inventory=[row('qualityJacket'),row('leather',2)];s=act(s,{type:'upgrade',recipe:'patchedArmor',uid:'qualityJacket'},t,()=>.79);s=act(s,{type:'claimCraft',production:'science'},t+10000);const armor=s.inventory[0];assert.equal(itemArmor(armor),21);assert.equal(itemValue(armor),320);assert.equal(itemTier(armor),1);assert.equal(canUpgrade(armor,'patchedArmor'),false);assert.equal(s.productions.science.level,2);assert.equal(s.productions.science.xp,0);assert.equal(s.productions.upgrade.xp,0);
 s=act(s,{type:'equip',uid:armor.uid},t+10000);assert.equal(heroConfig(s).hero.armor,21);assert.equal(heroConfig(s).hero.thermalArmor,10);s=act(s,{type:'unequipBody'},t+10000);assert.equal(itemArmor(s.inventory[0]),21);assert.equal(itemValue(s.inventory[0]),320);
 s=act(s,{type:'sell',uid:s.inventory[0].uid},t+10000);assert.equal(s.shelves[0].price,320);assert.equal(s.shelves[0].endsAt,t+74000);
});
test('Штопанная броня: неудача тратит кожу и A; неподходящий предмет и нехватка материалов',()=>{
 let s=hire();s.inventory=[row('jacket'),row('leather',1),row('knife')];const before=JSON.stringify(s);assert.throws(()=>act(s,{type:'upgrade',recipe:'patchedArmor',uid:'jacket'},t),/материалов/);assert.throws(()=>act(s,{type:'upgrade',recipe:'patchedArmor',uid:'knife'},t),/предмет/);assert.equal(JSON.stringify(s),before);
 s.inventory[1].qty=2;s=act(s,{type:'upgrade',recipe:'patchedArmor',uid:'jacket'},t,()=>.8);s=act(s,{type:'claimCraft',production:'science'},t+10000);assert.deepEqual(s.inventory.find(r=>r.item==='jacket'),row('jacket'));assert.equal(s.money,900);assert.equal(countItem(s,'leather'),0);assert.equal(s.productions.science.level,2);
});
test('Наука: готовая броня ждёт места; инженерный бонус относится к оружейному делу',()=>{
 let s=hire();s.inventory=[row('jacket'),row('leather',2)];s=act(s,{type:'upgrade',recipe:'patchedArmor',uid:'jacket'},t,()=>0);s.inventory=Array.from({length:CAPACITY},(_,i)=>row('knife',1,'k'+i));assert.throws(()=>act(s,{type:'claimCraft',production:'science'},t+10000),/места/);assert.ok(s.productions.science.job);assert.equal(s.productions.science.xp,0);
 s.heroes=[{profession:'engineer',perk:'gunsmith'}];assert.equal(upgradeChance(s,'patchedArmor'),80);assert.equal(upgradeChance(s,'sharpen'),85);
});

test('ПСЦТ: уровень, тип оружия, успех, повтор, цена и XP',()=>{
 let s=game();s.inventory=[row('pistol')];assert.throws(()=>act(s,{type:'upgrade',recipe:'psct',uid:'pistol'},t,()=>0),/уровень/);
 assert.equal(canUpgrade(row('knife'),'psct'),false);assert.equal(canUpgrade(row('ashot'),'psct'),true);
 s.productions.upgrade.level=2;s=act(s,{type:'upgrade',recipe:'psct',uid:'pistol'},t,()=>.74);
 assert.equal(s.money,1350);assert.equal(s.productions.upgrade.job.endsAt,t+12000);assert.equal(s.productions.upgrade.job.chance,75);
 s=act(s,{type:'claimCraft',production:'upgrade'},t+12000);const gun=s.inventory[0];
 assert.equal(itemValue(gun),220);assert.equal(gun.upgrades[0].bonus,20);assert.equal(gun.upgrades[0].accuracyBonus,-5);assert.equal(canUpgrade(gun,'psct'),false);assert.equal(s.productions.upgrade.xp,15);
 const sold=act(s,{type:'sell',uid:gun.uid},t+12000);assert.equal(sold.shelves[0].price,220);assert.equal(sold.shelves[0].endsAt,t+56000);assert.equal(tradeQuote(gun,1,0,'buyer').price,242);
});
test('ПСЦТ: неудача сохраняет предмет; бонус инженера и старая заточка',()=>{
 let s=game();s.inventory=[row('ashot')];s.productions.upgrade.level=2;s=act(s,{type:'upgrade',recipe:'psct',uid:'ashot'},t,()=>.75);s=act(s,{type:'claimCraft',production:'upgrade'},t+12000);assert.deepEqual(s.inventory[0],row('ashot'));assert.equal(s.money,1350);assert.equal(itemValue(s.inventory[0]),150);
 s.heroes=[{profession:'engineer',perk:'gunsmith'},{profession:'engineer',perk:'gunsmith'}];assert.equal(upgradeChance(s,'psct'),85);
 assert.equal(itemValue({...row('knife'),upgrades:[{recipe:'sharpen',prefix:'Заточенный',bonus:7}]}),150);
});
test('ПСЦТ: прибавка урона и штраф точности только выбранного оружия',()=>{
 let s=hire();s.inventory=[{...row('pistol'),upgrades:[{recipe:'psct',prefix:'ПСЦТ',bonus:20,accuracyBonus:-5,valueBonus:150}]}];s=act(s,{type:'equip',uid:'pistol',slot:'ranged'},t);
 const c=heroConfig(s);c.rat.hp=1000;const attacks=battle(c,{int:(min,max)=>max},180,{trace:true}).events.filter(e=>e.type==='атака'&&e.actor==='герой');
 assert.equal(attacks[0].accuracy,10-30-5);assert.equal(attacks[0].bonus,20);const knife=attacks.find(e=>e.weapon==='knife');assert.ok(knife);assert.equal(knife.accuracy,10);assert.equal(knife.bonus,20);
});
const random=()=>.1,t=100000;
const game=()=>createGame(t,random);
const hire=()=>act(game(),{type:'hire',perk:'evasion'},t,random);
const row=(item,qty=1,uid=item)=>({item,qty,uid});
function success(s,loot={metal:2,meat:1,tooth:0}){s.hero.job={kind:'mission',endsAt:t,startedAt:t-7000,result:{alive:true,hp:100,bandagesRemaining:1,loot,xp:25,killed:2}};return s;}
test('Цены комплектов, обычное округление и торг в обе стороны',()=>{assert.equal(sellerPrice('bandage',5),180);assert.equal(sellerPrice('leather',2),72);assert.equal(tradeQuote('leather',2,-15,'seller').price,61);assert.equal(roundRatio(65,50),33);assert.equal(tradeQuote('knife',1,0,'buyer').price,55);assert.equal(tradeQuote('knife',1,15,'buyer').cooldown,50000);assert.equal(tradeQuote('knife',1,-15,'buyer').cooldown,12500);});
test('Найм и недостаток денег на второго героя не списывают деньги дважды',()=>{const s=hire();assert.equal(s.money,1000);assert.equal(s.hero.hp,180);assert.throws(()=>act(s,{type:'hire',perk:'evasion'},t),/патронов/);assert.equal(s.money,1000);assert.equal(getHeroes(s).length,1);});
test('Комплект покупки, XP и защита от повторной сделки',()=>{let s=game();s=act(s,{type:'openYuras'},t,random);const id=s.yuras.visit.id;s=act(s,{type:'trade',visitId:id,offer:1,modifier:0},t,random);assert.equal(s.money,1320);assert.equal(countItem(s,'bandage'),5);assert.equal(s.yuras.xp,18);assert.equal(s.yuras.nextAt,t+25000);assert.throws(()=>act(s,{type:'trade',visitId:id,offer:1,modifier:0},t+50000,random),/визит/);});
test('Недостаток денег и переполнение не съедают покупку',()=>{const s=game();openYuras(s,t,random);s.money=1;assert.throws(()=>act(s,{type:'trade',visitId:s.yuras.visit.id,offer:0,modifier:0},t,random),/патронов/);assert.equal(s.inventory.length,0);assert.equal(s.money,1);s.money=1500;s.inventory=Array.from({length:CAPACITY},(_,i)=>row('knife',1,'k'+i));assert.throws(()=>act(s,{type:'trade',visitId:s.yuras.visit.id,offer:0,modifier:0},t,random),/места/);assert.equal(s.money,1500);});
test('Вся добыча принимается атомарно, стеки учитываются',()=>{const s=success(hire());s.inventory=[...Array.from({length:CAPACITY-1},(_,i)=>row('knife',1,'k'+i)),row('metal',2)];assert.throws(()=>act(s,{type:'claimHero'},t),/места/);assert.equal(countItem(s,'metal'),2);assert.equal(s.hero.xp,0);s.inventory.shift();const got=act(s,{type:'claimHero'},t);assert.equal(got.inventory.length,CAPACITY);assert.equal(countItem(got,'metal'),4);assert.equal(countItem(got,'meat'),1);});
test('Полный инвентарь принимает добычу в существующий стек',()=>{const s=success(hire(),{metal:2,meat:0,tooth:0});s.inventory=[...Array.from({length:CAPACITY-1},(_,i)=>row('knife',1,'k'+i)),row('metal',3)];const got=act(s,{type:'claimHero'},t);assert.equal(countItem(got,'metal'),5);assert.equal(got.inventory.length,CAPACITY);assert.equal(got.hero.xp,25);assert.throws(()=>act(got,{type:'claimHero'},t),/не готов/);});
test('Вылазка фиксирует результат, блокирует экипировку и переживает сериализацию',()=>{const s=hire();s.inventory=[row('jacket')];const sent=act(s,{type:'mission'},t,random);assert.equal(sent.hero.xp,0);assert.equal(sent.hero.job.endsAt,t+7000);const reloaded=JSON.parse(JSON.stringify(sent));assert.deepEqual(reloaded.hero.job.result,sent.hero.job.result);assert.equal(ready(reloaded.hero.job,t+6999),false);assert.equal(ready(reloaded.hero.job,t+7000),true);assert.throws(()=>act(reloaded,{type:'equip',uid:'jacket'},t+8000),/занят/);});
test('Поражение, бесплатное восстановление и штраф',()=>{const s=hire();s.hero.body='jacket';s.hero.bandages=4;s.hero.job={kind:'mission',endsAt:t,result:{alive:false}};const dead=act(s,{type:'claimHero'},t);assert.equal(dead.hero.dead,true);assert.equal(dead.hero.bandages,0);assert.equal(dead.hero.body,'jacket');const revived=act(dead,{type:'revive',paid:false},t);assert.equal(revived.hero.hp,1);assert.equal(revived.hero.wounds,4);const c=heroConfig(revived);assert.equal(c.hero.perception,2);assert.equal(c.hero.checkPenalty,2);assert.equal(c.hero.accuracy,0);assert.equal(c.hero.initiative,1);});
test('Отдых оплачивается заранее, результат ждёт нажатия',()=>{const s=hire();s.hero.hp=160;const resting=act(s,{type:'rest'},t);assert.equal(resting.money,900);assert.equal(resting.hero.hp,160);assert.throws(()=>act(resting,{type:'claimHero'},t+14999),/не готов/);const got=act(resting,{type:'claimHero'},t+15000);assert.equal(got.hero.hp,180);assert.equal(got.money,900);});
test('Производство выдаёт нож и XP ровно один раз',()=>{const s=hire();s.inventory=[row('metal',1)];const made=act(s,{type:'craft',recipe:'knife'},t);assert.equal(made.money,950);assert.equal(countItem(made,'metal'),0);assert.equal(made.productions.melee.xp,0);const got=act(made,{type:'claimCraft',production:'melee'},t+5000);assert.equal(countItem(got,'knife'),1);assert.equal(got.productions.melee.xp,5);assert.throws(()=>act(got,{type:'claimCraft',production:'melee'},t+5000),/не готов/);});
test('Продажа ждёт получения и выдаёт деньги один раз',()=>{const s=hire();s.inventory=[row('knife')];const listed=act(s,{type:'sell',uid:'knife'},t);assert.equal(listed.money,1000);assert.equal(listed.inventory.length,0);assert.equal(listed.shelves[0].endsAt,t+10000);assert.throws(()=>act(listed,{type:'claimSale',slot:0},t+9999),/не продан/);const got=act(listed,{type:'claimSale',slot:0},t+10000);assert.equal(got.money,1050);assert.throws(()=>act(got,{type:'claimSale',slot:0},t+16000),/не продан/);});
test('Снятие с продажи при полном инвентаре не теряет нож',()=>{const s=hire();s.inventory=[row('knife')];const listed=act(s,{type:'sell',uid:'knife'},t);listed.inventory=Array.from({length:CAPACITY},(_,i)=>row('knife',1,'k'+i));assert.throws(()=>act(listed,{type:'cancelSale',slot:0},t+1000),/места/);assert.ok(listed.shelves[0]);});
test('Бинт после вылазки лечит и тратится один раз',()=>{const s=hire();s.hero.hp=170;s.inventory=[row('bandage',5)];const healed=act(s,{type:'bandage'},t,random);assert.equal(healed.hero.hp,180);assert.equal(countItem(healed,'bandage'),4);assert.throws(()=>act(healed,{type:'bandage'},t,random),/полное/);});
test('Покупатель фиксирует варианты, не захватывает полки и не меняет их при открытии',()=>{const s=hire();s.inventory=[row('metal',2),row('tooth',1)];s.yuras.visit={id:'buyer',role:'buyer',offers:null};const v=openYuras(s,t,random);assert.equal(v.offers.length,2);const original=JSON.stringify(v.offers);openYuras(s,t,()=>.9);assert.equal(JSON.stringify(v.offers),original);});
test('Старое сохранение с одним героем мигрирует без потери вылазки и предметов',()=>{const sent=act(hire(),{type:'mission'},t,random);const old=JSON.parse(JSON.stringify(sent));delete old.heroes;delete old.selectedHeroId;old.inventory=[row('metal',5)];const fixed=normalizeGame(old);assert.equal(fixed.heroes.length,1);assert.equal(fixed.selectedHeroId,old.hero.id);assert.deepEqual(fixed.hero,old.hero);assert.deepEqual(fixed.inventory,old.inventory);assert.equal(fixed.money,old.money);const again=normalizeGame(JSON.parse(JSON.stringify(fixed)));assert.deepEqual(again,fixed);});
test('Цена найма: 50, 150, 300, 600, 1200 A; отдельные перки и ID',()=>{let s=game();s.money=50000;const prices=[500,1500,3000,6000,12000];for(let i=0;i<prices.length;i++){assert.equal(hireCost(s),prices[i]);s=act(s,{type:'hire',perk:i%2?'initiative':'evasion'},t,random);}assert.equal(new Set(s.heroes.map(h=>h.id)).size,5);assert.equal(s.heroes[1].perk,'initiative');assert.equal(s.heroes[0].perk,'evasion');assert.equal(s.money,50000-prices.reduce((a,b)=>a+b,0));assert.equal(hireCost(s),24000);});
test('Два героя независимо заняты, торговля и производство продолжаются',()=>{let s=hire();s.money=10000;const first=s.hero.id;s=act(s,{type:'hire',perk:'initiative'},t,random);const second=s.hero.id;s.hero.hp=100;s.inventory=[row('metal',3)];s=act(s,{type:'mission',heroId:first},t,random);const firstJob=JSON.parse(JSON.stringify(s.hero.job));s=act(s,{type:'rest',heroId:second},t+100,random);s=act(s,{type:'craft',recipe:'knife'},t+200,random);s=act(s,{type:'openYuras'},t+300,random);s=act(s,{type:'trade',visitId:s.yuras.visit.id,offer:1,modifier:0},t+400,random);assert.deepEqual(s.heroes.find(h=>h.id===first).job,firstJob);assert.equal(s.heroes.find(h=>h.id===second).job.endsAt,t+15100);assert.ok(s.productions.melee.job);assert.equal(countItem(s,'bandage'),5);const after=act(s,{type:'claimHero',heroId:first},t+7000,random);assert.equal(after.heroes.find(h=>h.id===first).job,null);assert.ok(after.heroes.find(h=>h.id===second).job);});
test('Экипировка адресована выбранному герою и не затрагивает другого',()=>{let s=hire();s.money=10000;const first=s.hero.id;s=act(s,{type:'hire',perk:'initiative'},t,random);const second=s.hero.id;s.inventory=[row('jacket')];s=act(s,{type:'equip',heroId:second,uid:'jacket'},t,random);assert.equal(s.heroes.find(h=>h.id===first).body,null);assert.equal(s.heroes.find(h=>h.id===second).body,'jacket');s=act(s,{type:'mission',heroId:first},t,random);assert.throws(()=>act(s,{type:'unequipBody',heroId:first},t),/занят/);assert.equal(act(s,{type:'unequipBody',heroId:second},t).heroes.find(h=>h.id===second).body,null);});
test('Все предметы продаются за базовую цену со временем 2 × цена',()=>{for(const [item,definition]of Object.entries(ITEMS)){const s=hire();s.inventory=[row(item)];if(definition.value==null){assert.throws(()=>act(s,{type:'sell',uid:item},t),/Цена/);continue;}const listed=act(s,{type:'sell',uid:item},t);assert.equal(listed.shelves[0].item,item);assert.equal(listed.shelves[0].price,definition.value);assert.equal(listed.shelves[0].endsAt-t,definition.value*200);const sold=act(listed,{type:'claimSale',slot:0},t+definition.value*200);assert.equal(sold.money,1000+definition.value);}});
test('Часть стека на продаже: цена, время, возврат и остаток',()=>{const s=hire();s.inventory=[row('meat',5)];const listed=act(s,{type:'sell',uid:'meat',qty:3},t);assert.equal(countItem(listed,'meat'),2);assert.equal(listed.shelves[0].qty,3);assert.equal(listed.shelves[0].price,90);assert.equal(listed.shelves[0].endsAt,t+18000);const back=act(listed,{type:'cancelSale',slot:0},t+1000);assert.equal(countItem(back,'meat'),5);assert.equal(back.shelves[0],null);assert.equal(back.money,1000);});

import {restartQuote,restartGame} from '../dist/game.js';
test('Расходы: найм, отдых, производство, покупки; доход не увеличивает счётчик',()=>{
 let s=createGame(t,random);s=act(s,{type:'hire',perk:'evasion'},t,random);assert.equal(s.totalSpent,500);
 s.hero.hp=80;s=act(s,{type:'rest'},t,random);assert.equal(s.totalSpent,600);
 s.inventory=[row('metal',2)];s=act(s,{type:'craft',recipe:'knife'},t,random);assert.equal(s.totalSpent,650);
 s=act(s,{type:'openYuras'},t,random);s=act(s,{type:'trade',visitId:s.yuras.visit.id,offer:1,modifier:0},t,random);assert.equal(s.totalSpent,830);
 const before=s.totalSpent;s=act(s,{type:'sell',uid:s.inventory.find(x=>x.item==='metal').uid},t,random);s=act(s,{type:'claimSale',slot:0},t+5000,random);assert.equal(s.totalSpent,before);
 assert.throws(()=>act(s,{type:'hire',perk:'evasion'},t,random));assert.equal(s.totalSpent,before);
});
test('Перезапуск: 2%, округление, полный сброс и новый счётчик',()=>{
 let s=createGame(t,random);s.money=5000;s=act(s,{type:'hire',perk:'evasion'},t,random);s.totalSpent=12525;
 const q=restartQuote(s);assert.deepEqual(q,{spent:12525,bonus:251,money:1751});
 const fresh=restartGame(s,t+1,random);assert.equal(fresh.money,1751);assert.equal(fresh.totalSpent,0);assert.equal(fresh.heroes.length,0);assert.deepEqual(fresh.inventory,[]);assert.ok(fresh.shelves.every(x=>x===null));assert.ok(Object.values(fresh.productions).every(x=>x.level===1&&x.xp===0&&!x.job));assert.equal(fresh.yuras.xp,0);assert.equal(fresh.history.length,0);assert.notEqual(fresh.id,s.id);assert.equal(s.heroes.length,1);assert.equal(restartGame(fresh,t+2,random).money,1751);const saved=JSON.parse(JSON.stringify(fresh));saved.totalSpent=5000;assert.equal(restartGame(saved,t+3,random).money,1851);
});
test('Старое сохранение не выдумывает расходы; счётчик сохраняется после загрузки',()=>{
 const s=createGame(t,random);delete s.totalSpent;delete s.spendingPartial;const loaded=normalizeGame(s);assert.equal(loaded.totalSpent,0);assert.equal(loaded.spendingPartial,true);const hired=act(loaded,{type:'hire',perk:'evasion'},t,random);assert.equal(normalizeGame(JSON.parse(JSON.stringify(hired))).totalSpent,500);assert.equal(restartQuote(hired).money,1510);
});


import {RECIPES,CONFIG} from '../dist/data.js';
import {battle} from '../dist/combat.js';
import {itemName,itemTier,canUpgrade} from '../dist/game.js';
test('Новые рецепты: ограничения уровня, ресурсы, сроки, XP и выдача',()=>{
 for(const id of ['crowbar','ashot','jacket','broth']){const r=RECIPES[id];let s=hire();s.money=10000;s.inventory=Object.entries(r.ingredients).map(([id,q])=>row(id,q));
 if(r.level>1){assert.throws(()=>act(s,{type:'craft',recipe:id},t),/уровень/);s.productions[r.production].level=r.level;}
 const started=act(s,{type:'craft',recipe:id},t);assert.equal(started.productions[r.production].job.endsAt,t+r.seconds*1000);assert.equal(started.totalSpent-s.totalSpent,r.cost);assert.throws(()=>act(started,{type:'claimCraft',production:r.production},t),/не готов/);
 const got=act(started,{type:'claimCraft',production:r.production},t+r.seconds*1000);assert.equal(countItem(got,r.output),1);assert.equal(countItem(got,Object.keys(r.ingredients)[0]),0);assert.throws(()=>act(got,{type:'claimCraft',production:r.production},t+999999),/не готов/);
 }
});
test('Бинты партией: суммарные время, цена, ресурсы и перенос опыта',()=>{
 let s=hire();s.inventory=[row('cloth',5)];s=act(s,{type:'craft',recipe:'bandage',qty:5},t);assert.equal(s.money,950);assert.equal(s.productions.medicine.job.endsAt,t+25000);assert.equal(countItem(s,'cloth'),0);
 const full=structuredClone(s);full.inventory=Array.from({length:CAPACITY},(_,i)=>row('knife',1,'full'+i));assert.throws(()=>act(full,{type:'claimCraft',production:'medicine'},t+25000),/места/);assert.ok(full.productions.medicine.job);
 s=act(s,{type:'claimCraft',production:'medicine'},t+25000);assert.equal(countItem(s,'bandage'),5);assert.equal(s.productions.medicine.level,2);assert.equal(s.productions.medicine.xp,0);
 assert.throws(()=>act(s,{type:'craft',recipe:'bandage',qty:0},t),/количество/);
});
test('Отвар: лечит выбранного героя по максимальному HP, не берётся в вылазку',()=>{
 let s=hire();s.money=3000;s=act(s,{type:'hire',perk:'evasion'},t);s.heroes[0].hp=100;s.heroes[1].hp=80;s.inventory=[row('broth',2)];const first=s.heroes[0].id;
 s=act(s,{type:'broth',heroId:first},t);assert.equal(s.heroes[0].hp,128);assert.equal(s.heroes[1].hp,80);assert.equal(countItem(s,'broth'),1);
 s.hero.hp=179;s=act(s,{type:'broth'},t);assert.equal(s.hero.hp,180);assert.throws(()=>act(s,{type:'broth'},t),/полное/);
});
function upgraded(success){let s=hire();s.inventory=[row('knife')];return act(s,{type:'upgrade',recipe:'sharpen',uid:'knife'},t,()=>success?.1:.9);}
test('Заточка фиксирует исход, даёт +7, сохраняет экземпляр и запрещает повтор',()=>{
 let s=upgraded(true);assert.equal(s.money,900);assert.equal(s.inventory.length,0);assert.equal(s.productions.upgrade.job.endsAt,t+10000);assert.equal(s.productions.upgrade.job.success,true);
 s=act(JSON.parse(JSON.stringify(s)),{type:'claimCraft',production:'upgrade'},t+10000);const knife=s.inventory[0];assert.equal(knife.uid,'knife');assert.equal(itemName(knife),'Заточенный Нож');assert.equal(itemTier(knife),1);assert.equal(canUpgrade(knife,'sharpen'),false);assert.throws(()=>act(s,{type:'upgrade',recipe:'sharpen',uid:knife.uid},t+10000),/улучшения/);
 s=act(s,{type:'equip',uid:knife.uid},t+10000);assert.equal(heroConfig(s).hero.weaponBonus,7);
 const other=s.inventory.find(x=>!x.upgrades?.length);s=act(s,{type:'equip',uid:other.uid},t+10000);assert.equal(itemName(s.inventory[0]),'Заточенный Нож');
 s=act(s,{type:'sell',uid:s.inventory[0].uid},t+10000);s=act(s,{type:'cancelSale',slot:0},t+10001);assert.equal(s.inventory[0].upgrades[0].bonus,7);
});
test('Неудачная заточка возвращает неизменённое оружие; заполненный инвентарь сохраняет результат',()=>{
 let s=upgraded(false);const target=structuredClone(s.productions.upgrade.job.target);s.inventory=Array.from({length:CAPACITY},(_,i)=>row('knife',1,'k'+i));assert.throws(()=>act(s,{type:'claimCraft',production:'upgrade'},t+10000),/места/);assert.ok(s.productions.upgrade.job);s.inventory=[];s=act(s,{type:'claimCraft',production:'upgrade'},t+10000);assert.deepEqual(s.inventory[0],target);assert.equal(s.money,900);assert.equal(canUpgrade(s.inventory[0],'sharpen'),true);
});
test('Три разных приписки максимум; дальнее оружие не подходит заточке',()=>{
 assert.equal(canUpgrade(row('ashot'),'sharpen'),false);assert.equal(canUpgrade({...row('knife'),upgrades:[{recipe:'a'},{recipe:'b'},{recipe:'c'}]},'sharpen'),false);assert.equal(itemTier({upgrades:[{},{},{}]}),3);assert.equal(canUpgrade({...row('knife'),upgrades:[{recipe:'a'},{recipe:'b'}]},'sharpen'),true);
});
test('Нож и монтировка получают Сила ×10, АШОТ стреляет с дистанционным штрафом без силы',()=>{
 let s=hire();assert.equal(heroConfig(s).hero.weaponMin,10);assert.equal(heroConfig(s).hero.weaponMax,30);s.inventory=[row('ashot')];s=act(s,{type:'equip',uid:'ashot'},t);const c=heroConfig(s);assert.equal(c.hero.weapons.ranged.type,'ranged');assert.equal(c.hero.weapons.ranged.min,20);assert.equal(c.hero.weapons.ranged.max,100);assert.equal(c.hero.weapons.main.item,'knife');
 const result=battle(c,{int:(min,max)=>max},180,{trace:true});const attack=result.events.find(e=>e.type==='атака'&&e.actor==='герой');assert.equal(result.initialDistance,2);assert.equal(attack.accuracy,-20);assert.equal(attack.base,100);assert.equal(attack.bonus,0);
 const melee=heroConfig(hire());const hit=battle(melee,{int:(min,max)=>max},180,{trace:true}).events.find(e=>e.type==='атака'&&e.actor==='герой');assert.equal(hit.bonus,20);
});

import {stationHelp} from '../dist/combat.js';
test('Помощь: четыре успеха дают 4 A, три материала и 17 XP; неуспехи — 5 XP',()=>{
 const good=stationHelp(CONFIG,{int:(min,max)=>max});assert.equal(good.events.length,4);assert.equal(good.money,40);assert.deepEqual(good.loot,{cloth:1,leather:1,metal:1});assert.equal(good.xp,17);
 const bad=stationHelp(CONFIG,{int:(min,max)=>min});assert.equal(bad.successes,0);assert.equal(bad.money,0);assert.deepEqual(bad.loot,{cloth:0,leather:0,metal:0});assert.equal(bad.xp,5);
});
test('Помощь: равенство сложности не успех, характеристики и тяжёлые раны учитываются',()=>{
 const rolls=[6,5,7,6];const equal=stationHelp(CONFIG,{int:()=>rolls.shift()});assert.equal(equal.successes,0);
 const c=structuredClone(CONFIG);c.hero.checkPenalty=2;const wounded=stationHelp(c,{int:()=>8});assert.equal(wounded.successes,1);assert.deepEqual(wounded.loot,{cloth:1,leather:0,metal:0});
 const moneyRolls=[7,1,1,1,1];assert.equal(stationHelp(CONFIG,{int:()=>moneyRolls.shift()}).money,10);
});
test('Помощь: фиксированные 10 секунд, сохранение, HP и бинты неизменны; награда однократно',()=>{
 let s=hire();s.hero.hp=1;s.hero.bandages=2;s.hero.weapon=null;s=act(s,{type:'help'},t,random);assert.equal(s.hero.job.endsAt,t+10000);assert.equal(s.hero.hp,1);assert.equal(s.hero.bandages,2);assert.equal(s.hero.xp,0);assert.throws(()=>act(s,{type:'claimHero'},t+9999),/не готов/);
 const loaded=normalizeGame(JSON.parse(JSON.stringify(s))),result=loaded.hero.job.result;assert.deepEqual(result,s.hero.job.result);const before=loaded.money;s=act(loaded,{type:'claimHero'},t+1000000);assert.equal(s.money,before+result.money);assert.equal(s.hero.xp,result.xp);assert.equal(s.hero.hp,1);assert.equal(s.hero.bandages,2);assert.equal(s.hero.weapon,null);assert.equal(s.totalSpent,500);assert.throws(()=>act(s,{type:'claimHero'},t+1000001),/не готов/);
});
test('Помощь: переполнение сохраняет весь результат, включая A и XP',()=>{
 let s=hire();s=act(s,{type:'help'},t,random);s.hero.job.result=stationHelp(CONFIG,{int:(min,max)=>max});s.inventory=Array.from({length:CAPACITY},(_,i)=>row('knife',1,'full'+i));assert.throws(()=>act(s,{type:'claimHero'},t+10000),/места/);assert.equal(s.money,1000);assert.equal(s.hero.xp,0);assert.ok(s.hero.job);
 s.inventory.splice(0,3);s=act(s,{type:'claimHero'},t+10000);assert.equal(s.money,1040);assert.equal(s.hero.xp,17);assert.equal(countItem(s,'cloth'),1);assert.equal(s.inventory.length,CAPACITY);
});
test('Юрась продаёт комплект 3 ткани за 7,2 A; старый визит дополняется однократно',()=>{
 let s=game();openYuras(s,t,random);assert.equal(sellerPrice('cloth',3),72);let index=s.yuras.visit.offers.findIndex(x=>x.item==='cloth');assert.equal(s.yuras.visit.offers[index].qty,3);
 s=act(s,{type:'trade',visitId:s.yuras.visit.id,offer:index,modifier:0},t,random);assert.equal(countItem(s,'cloth'),3);assert.equal(s.money,1428);assert.equal(s.totalSpent,72);
 let old=game();openYuras(old,t,random);old.yuras.visit.offers=old.yuras.visit.offers.filter(x=>x.item!=='cloth');old=normalizeGame(normalizeGame(old));assert.equal(old.yuras.visit.offers.filter(x=>x.item==='cloth').length,1);
});

test('Два слота: дальнее не снимает основное; замена ближнего сохраняет заточку',()=>{
 let s=hire();s.inventory=[row('ashot'),{...row('crowbar'),upgrades:[{recipe:'sharpen',prefix:'Заточенный',bonus:7}]}];s=act(s,{type:'equip',uid:'ashot'},t);assert.equal(s.hero.weapon,'knife');assert.equal(s.hero.rangedWeapon,'ashot');assert.equal(s.inventory.some(x=>x.item==='knife'),false);
 s=act(s,{type:'equip',uid:'crowbar'},t);assert.equal(s.hero.weapon,'crowbar');assert.equal(s.hero.rangedWeapon,'ashot');assert.equal(countItem(s,'knife'),1);assert.equal(heroConfig(s).hero.weapons.main.bonus,7);
 s=act(s,{type:'unequipWeapon',slot:'main'},t);assert.equal(s.hero.weapon,null);assert.equal(s.hero.rangedWeapon,'ashot');assert.equal(s.inventory.find(x=>x.item==='crowbar').upgrades[0].bonus,7);
});
test('Автовыбор оружия: АШОТ на дистанции, нож вплотную; сила и двойной удар только вблизи',()=>{
 let s=hire();s.inventory=[row('ashot')];s=act(s,{type:'equip',uid:'ashot'},t);const c=heroConfig(s);c.hero.attacksPerTurn=2;c.hero.attackAccuracyPenalty=10;c.hero.attackDamagePenalty=20;c.rat.hp=1000;
 const result=battle(c,{int:(min,max)=>max},180,{trace:true});const attacks=result.events.filter(x=>x.type==='атака'&&x.actor==='герой');assert.equal(attacks[0].weapon,'ashot');assert.equal(attacks[0].distance,2);assert.equal(attacks[0].accuracy,-20);assert.equal(attacks[0].bonus,0);assert.equal(attacks[0].damagePenalty,0);assert.equal(attacks.filter(x=>x.turn===attacks[0].turn).length,1);
 const melee=attacks.find(x=>x.distance===0);assert.equal(melee.weapon,'knife');assert.equal(melee.bonus,20);assert.equal(melee.damagePenalty,20);assert.equal(attacks.filter(x=>x.turn===melee.turn).length,2);
});
test('Миграция старого АШОТа: дополнительный слот без дублирования и без изменения готовой вылазки',()=>{
 const s=hire();s.hero.weapon='ashot';s.hero.weaponDetails={item:'ashot',uid:'old-gun',qty:1};s.hero.job={kind:'mission',endsAt:t,result:{alive:true,hp:100,loot:{},xp:10}};const result=structuredClone(s.hero.job);const migrated=normalizeGame(s);assert.equal(migrated.hero.weapon,'ashot');assert.equal(migrated.hero.rangedWeapon,null);assert.equal(migrated.hero.weaponDetails.uid,'old-gun');assert.deepEqual(migrated.hero.job,result);assert.deepEqual(normalizeGame(migrated),migrated);assert.equal(migrated.inventory.length,0);
});
test('Нельзя снять оружие в задании или переполнить инвентарь; пустые слоты пропускают атаку',()=>{
 let s=hire();s.inventory=Array.from({length:CAPACITY},(_,i)=>row('knife',1,'k'+i));assert.throws(()=>act(s,{type:'unequipWeapon',slot:'main'},t),/места/);assert.equal(s.hero.weapon,'knife');s=act(s,{type:'mission'},t,random);assert.throws(()=>act(s,{type:'unequipWeapon',slot:'main'},t),/занят/);
 const empty=hire();empty.hero.weapon=null;const c=heroConfig(empty);const result=battle(c,{int:(min,max)=>max},180,{trace:true});assert.equal(result.events.some(x=>x.type==='атака'&&x.actor==='герой'),false);assert.ok(result.events.some(x=>x.type==='ожидание'&&x.reason==='Нет основного оружия'));
});

import {advanceSeries} from '../dist/game.js';
const series=(location='help',total=2,threshold=50)=>act(hire(),{type:'startSeries',location,total,threshold},t,random);
test('Серия: передышка ровно 3 секунды; награды только после всех прохождений',()=>{
 let s=series();assert.equal(s.hero.job.endsAt,t+10000);assert.equal(advanceSeries(s,t+9999),false);advanceSeries(s,t+10000);assert.equal(s.hero.job.phase,'break');assert.equal(s.hero.job.completed,1);assert.equal(s.hero.job.endsAt,t+13000);assert.equal(s.inventory.length,0);assert.equal(s.hero.xp,0);assert.equal(s.money,1000);advanceSeries(s,t+12999);assert.equal(s.hero.job.phase,'break');advanceSeries(s,t+13000);assert.equal(s.hero.job.phase,'running');advanceSeries(s,t+23000);assert.equal(ready(s.hero.job,t+23000),true);const expected=structuredClone(s.hero.job);s=act(s,{type:'claimHero'},t+23000);assert.equal(s.hero.xp,expected.worker.xp);assert.equal(s.money,1000+expected.money);for(const [id,q]of Object.entries(expected.loot))assert.equal(countItem(s,id),q);assert.throws(()=>act(s,{type:'claimHero'},t+24000),/не готов/);
});
test('Серия: сохранение и долгое отсутствие дают те же 5 прохождений',()=>{
 let a=series('help',5),b=normalizeGame(JSON.parse(JSON.stringify(a)));for(let at=t;at<=t+62000;at+=500)advanceSeries(a,at);advanceSeries(b,t+999999);assert.equal(b.hero.job.completed,5);assert.deepEqual(a.hero.job,b.hero.job);assert.equal(b.inventory.length,0);
});
test('Остановить серию можно только на передышке; полный инвентарь сохраняет накопленное',()=>{
 let s=series();assert.throws(()=>act(s,{type:'stopSeries'},t+100),/передышки/);s=act(s,{type:'stopSeries'},t+10000);assert.equal(s.hero.job.phase,'done');assert.equal(s.hero.job.completed,1);s.hero.job.loot={cloth:2};s.inventory=Array.from({length:CAPACITY},(_,i)=>row('knife',1,'k'+i));assert.throws(()=>act(s,{type:'claimHero'},t+10001),/места/);assert.equal(s.hero.job.phase,'done');const money=s.money;s.inventory.pop();s=act(s,{type:'claimHero'},t+999999);assert.equal(countItem(s,'cloth'),2);assert.ok(s.money>=money);
});
test('Серия: остановка ниже порога, равенство порогу допускает продолжение',()=>{
 for(const [hp,phase]of [[89,'done'],[90,'break']]){let s=series('mission',2,50);s.hero.job.run.result={alive:true,hp,bandagesRemaining:0,loot:{metal:1},xp:10,killed:0};advanceSeries(s,t+7000);assert.equal(s.hero.job.phase,phase);assert.equal(s.hero.job.completed,1);}
 for(const threshold of [50,30,15]){const s=series('mission',2,threshold);s.hero.job.run.result={alive:true,hp:180*threshold/100-1,bandagesRemaining:0,loot:{},xp:10,killed:0};advanceSeries(s,t+7000);assert.equal(s.hero.job.phase,'done');}
});
test('Гибель во втором прохождении теряет всю добычу и XP, сохраняя исходный уровень',()=>{
 let s=hire();s.hero.xp=99;s=act(s,{type:'startSeries',location:'mission',total:2,threshold:15},t,random);s.hero.job.run.result={alive:true,hp:150,bandagesRemaining:1,loot:{tooth:1},xp:20,killed:1};advanceSeries(s,t+7000);assert.equal(s.hero.job.worker.level,2);advanceSeries(s,t+10000);s.hero.job.run.result={alive:false,hp:0,loot:{},xp:0};advanceSeries(s,t+17000);assert.deepEqual(s.hero.job.loot,{});assert.equal(s.hero.job.xp,0);assert.equal(s.hero.job.money,0);s=act(s,{type:'claimHero'},t+17000);assert.equal(s.hero.dead,true);assert.equal(s.hero.level,1);assert.equal(s.hero.xp,99);assert.equal(s.hero.hp,0);assert.equal(s.hero.bandages,0);assert.equal(s.inventory.length,0);
});
test('Повторить задание: получение и запуск атомарны; таймер начинается с нажатия',()=>{
 let s=act(hire(),{type:'help'},t,random);const xp=s.hero.job.result.xp;s=act(s,{type:'repeatHero'},t+10000,random);assert.equal(s.hero.xp,xp);assert.equal(s.hero.job.kind,'help');assert.equal(s.hero.job.startedAt,t+10000);assert.equal(s.hero.job.endsAt,t+20000);
 s.hero.job.result.loot={cloth:1};s.inventory=Array.from({length:CAPACITY},(_,i)=>row('knife',1,'k'+i));assert.throws(()=>act(s,{type:'repeatHero'},t+20000),/места/);assert.equal(s.hero.xp,xp);assert.equal(s.hero.job.startedAt,t+10000);
});
test('Нельзя запустить новую серию отдыха',()=>{
 const s=hire();s.hero.hp=1;
 assert.throws(()=>act(s,{type:'startSeries',location:'rest',total:5,threshold:50},t,random),/локации/);
 assert.equal(s.money,1000);assert.equal(s.hero.job,null);
});
test('Серия: валидация, блокировка экипировки и независимость других героев',()=>{
 for(const total of [1,6,2.5])assert.throws(()=>act(hire(),{type:'startSeries',location:'help',total,threshold:50},t),/прохождений/);assert.throws(()=>act(hire(),{type:'startSeries',location:'help',total:2,threshold:40},t),/порог/);
 let s=hire();s.money=3000;s=act(s,{type:'hire',perk:'evasion'},t);const second=s.hero.id;s=act(s,{type:'startSeries',location:'help',total:2,threshold:50,heroId:s.heroes[0].id},t,random);assert.throws(()=>act(s,{type:'unequipWeapon',slot:'main'},t),/занят/);assert.throws(()=>act(s,{type:'help',heroId:second},t,random),/занята/);s=act(s,{type:'mission',heroId:second},t,random);assert.equal(s.hero.job.kind,'mission');assert.equal(s.heroes[0].job.kind,'series');
});

import {locationOwner} from '../dist/game.js';
function twoHeroes(){let s=hire();s.money=5000;return act(s,{type:'hire',perk:'evasion'},t,random);}
test('Последняя локация сохраняется у прошедшего её героя после получения результата',()=>{
 let s=twoHeroes();
 const [first,second]=s.heroes.map(h=>h.id);
 s=act(s,{type:'startSeries',location:'help',total:2,threshold:50,heroId:first},t,random);
 s=act(s,{type:'stopSeries',heroId:first},t+11000);
 assert.equal(s.heroes[0].lastCompletedLocation,undefined);
 s=act(s,{type:'claimHero',heroId:first},t+11000);
 assert.equal(s.heroes[0].lastCompletedLocation,'help');
 assert.equal(s.heroes[1].lastCompletedLocation,undefined);
 s=normalizeGame(JSON.parse(JSON.stringify(s)));
 assert.equal(s.heroes[0].lastCompletedLocation,'help');
 s.heroes[0].job={kind:'mission',endsAt:t+12000,result:{alive:false}};
 s=act(s,{type:'claimHero',heroId:first},t+12000);
 assert.equal(s.heroes[0].lastCompletedLocation,'help');
});
test('Одна локация: запрет второму герою до получения результата первого',()=>{
 let s=twoHeroes();const first=s.heroes[0].id,second=s.heroes[1].id;s=act(s,{type:'help',heroId:first},t,random);assert.equal(locationOwner(s,'help').id,first);
 for(const at of [t+100,t+10000,t+99999]){assert.throws(()=>act(s,{type:'help',heroId:second},at),/занята/);assert.throws(()=>act(s,{type:'startSeries',location:'help',total:2,threshold:50,heroId:second},at),/занята/);}
 s=act(s,{type:'claimHero',heroId:first},t+10000);assert.equal(locationOwner(s,'help'),null);s=act(s,{type:'help',heroId:second},t+10000,random);assert.equal(locationOwner(s,'help').id,second);
});
test('Серия удерживает локацию на работе, передышке и после остановки до получения',()=>{
 let s=twoHeroes();const first=s.heroes[0].id,second=s.heroes[1].id;s=act(s,{type:'startSeries',location:'help',total:2,threshold:50,heroId:first},t,random);advanceSeries(s,t+10000);assert.equal(s.heroes[0].job.phase,'break');assert.throws(()=>act(s,{type:'help',heroId:second},t+11000),/занята/);
 s=act(s,{type:'stopSeries',heroId:first},t+11000);assert.equal(locationOwner(s,'help').id,first);assert.throws(()=>act(s,{type:'help',heroId:second},t+11001),/занята/);s=act(s,{type:'claimHero',heroId:first},t+11001);assert.equal(locationOwner(s,'help'),null);
});
test('Герои отдыхают параллельно, досрочное завершение начисляет долю лечения без возврата оплаты',()=>{
 let s=twoHeroes();const [first,second]=s.heroes.map(h=>h.id);const balance=s.money;
 s.heroes[0].hp=1;s.heroes[1].hp=1;s.heroes[1].level=4;
 s=act(s,{type:'rest',heroId:first},t);
 s=act(s,{type:'rest',heroId:second,restType:'meal'},t);
 assert.equal(s.money,balance-150);
 assert.equal(s.heroes[1].job.endsAt,t+600000);
 assert.throws(()=>act(s,{type:'repeatHero',heroId:first},t+30000),/без повторов/);
 s=act(s,{type:'interruptRest',heroId:first},t+7500);
 assert.equal(s.heroes[0].hp,29);assert.equal(s.heroes[0].job,null);
 s=act(normalizeGame(JSON.parse(JSON.stringify(s))),{type:'interruptRest',heroId:second},t+300000);
 assert.equal(s.heroes[1].hp,25);assert.equal(s.heroes[1].job,null);assert.equal(s.money,balance-150);
 assert.throws(()=>act(s,{type:'interruptRest',heroId:second},t+300001),/не отдыхает/);
});
test('Переполнение и гибель не освобождают локацию преждевременно; старые параллельные задания сохраняются',()=>{
 let s=twoHeroes();const first=s.heroes[0].id,second=s.heroes[1].id;s=act(s,{type:'help',heroId:first},t,random);s.heroes[0].job.result.loot={cloth:1};s.inventory=Array.from({length:CAPACITY},(_,i)=>row('knife',1,'q'+i));assert.throws(()=>act(s,{type:'claimHero'},t+10000),/места/);assert.equal(locationOwner(s,'help').id,first);
 s.heroes[1].job=structuredClone(s.heroes[0].job);s=normalizeGame(s);assert.ok(s.heroes[0].job&&s.heroes[1].job);s.inventory=[];s=act(s,{type:'claimHero',heroId:first},t+10000);assert.equal(locationOwner(s,'help').id,second);
 s.heroes[1].job={kind:'mission',startedAt:t,endsAt:t+7000,result:{alive:false,hp:0,loot:{},xp:0}};assert.equal(locationOwner(s,'mission').id,second);s=act(s,{type:'claimHero',heroId:second},t+10000);assert.equal(locationOwner(s,'mission'),null);assert.equal(s.hero.dead,true);
});

import {PATROL,patrolReady} from '../dist/data.js';
import {expedition} from '../dist/combat.js';
function patrolConfig(){const c=heroConfig(hire());c.rat=structuredClone(PATROL.enemy);c.mission=structuredClone(PATROL.mission);c.loot=structuredClone(PATROL.loot);return c;}
test('Патруль: два боя, 50 XP и независимая добыча без второй проверки восприятия',()=>{
 const c=patrolConfig();c.hero.weapons.main.min=1000;c.hero.weapons.main.max=1000;c.hero.accuracy=200;let d20=0,d100=0;
 const e=expedition(c,{int:(min,max)=>{if(max===20){d20++;return 20;}if(max===100){d100++;return 1;}return max;}},{trace:true});assert.equal(e.alive,true);assert.equal(e.found,2);assert.equal(e.killed,2);assert.equal(e.xp,50);assert.deepEqual(e.loot,{ghoulHide:2,sharpClaws:2,ghoulMeat:2,toughLeather:2});assert.equal(d20,8);assert.equal(d100,10);assert.equal(e.events.filter(x=>x.type==='добыча противника').length,2);assert.ok(e.events.filter(x=>x.type==='бой').every(x=>x.events.find(x=>x.type==='инициатива').ratBonus===1));
});
test('Патруль: без встреч базовые 10 XP, равенство сложности не успех',()=>{
 const e=expedition(patrolConfig(),{int:()=>6},{trace:true});assert.equal(e.found,0);assert.equal(e.xp,10);assert.equal(e.battles.length,0);assert.ok(Object.values(e.loot).every(x=>x===0));
});
test('Патруль: вероятность выпадения включительно на границах 80/60/50/10',()=>{
 const c=patrolConfig();c.hero.weapons.main.min=1000;c.hero.weapons.main.max=1000;c.hero.accuracy=200;const rolls=[1,1,80,61,50,11,81,60,51,10];const e=expedition(c,{int:(min,max)=>max===100?rolls.shift():max});assert.deepEqual(e.loot,{ghoulHide:1,sharpClaws:1,ghoulMeat:1,toughLeather:1});assert.equal(rolls.length,0);
});
test('Патруль: 14 секунд, сохранение, занятость, повтор и цены добычи',()=>{
 assert.equal(patrolReady(),true);assert.equal(PATROL.enemy.damageMin,40);assert.equal(PATROL.enemy.damageMax,100);assert.equal(PATROL.enemy.thermalArmor,0);let s=twoHeroes();s.heroes[0].level=2;const first=s.heroes[0].id,second=s.heroes[1].id;s=act(s,{type:'patrol',heroId:first},t,random);assert.equal(s.hero.job.endsAt,t+14000);assert.equal(locationOwner(s,'patrol').id,first);assert.throws(()=>act(s,{type:'patrol',heroId:second},t+14000),/занята/);assert.deepEqual(normalizeGame(JSON.parse(JSON.stringify(s))).hero.job,s.hero.job);
 s.hero.job.result={alive:true,hp:100,bandagesRemaining:0,loot:{ghoulHide:1,sharpClaws:1,ghoulMeat:1,toughLeather:1},xp:30,killed:1};s=act(s,{type:'repeatHero',heroId:first},t+14000,random);assert.equal(s.hero.job.kind,'patrol');assert.equal(s.hero.job.endsAt,t+28000);assert.equal(s.hero.xp,30);for(const [item,price]of [['ghoulHide',30],['sharpClaws',40],['ghoulMeat',40],['toughLeather',200]])assert.equal(ITEMS[item].value,price);
});
test('Патруль: серия переносит HP и бинты; гибель теряет весь накопленный результат',()=>{
 let base=hire();base.hero.level=2;let s=act(base,{type:'startSeries',location:'patrol',total:2,threshold:15},t,random);s.hero.job.run.result={alive:true,hp:100,bandagesRemaining:1,loot:{toughLeather:1},xp:30,killed:1};advanceSeries(s,t+14000);assert.equal(s.hero.job.worker.hp,100);assert.equal(s.hero.job.worker.bandages,1);advanceSeries(s,t+17000);s.hero.job.run.result={alive:false,hp:0,loot:{},xp:0};advanceSeries(s,t+31000);assert.equal(s.hero.job.worker.dead,true);assert.deepEqual(s.hero.job.loot,{});assert.equal(s.hero.job.xp,0);s=act(s,{type:'claimHero'},t+31000);assert.equal(s.hero.dead,true);assert.equal(s.hero.hp,0);assert.equal(s.hero.xp,0);
});

test('Патруль: уровень именно выбранного героя ограничивает одиночный запуск и серию',()=>{
 let s=twoHeroes();s.heroes[0].level=2;const rookie=s.heroes[1].id,experienced=s.heroes[0].id;
 assert.throws(()=>act(s,{type:'patrol',heroId:rookie},t),/со 2-го уровня/);assert.throws(()=>act(s,{type:'startSeries',location:'patrol',total:2,threshold:50,heroId:rookie},t),/со 2-го уровня/);assert.equal(s.money,3500);assert.ok(s.heroes.every(h=>!h.job));
 const single=act(s,{type:'patrol',heroId:experienced},t,random);assert.equal(single.hero.job.kind,'patrol');const repeated=act(s,{type:'startSeries',location:'patrol',total:2,threshold:50,heroId:experienced},t,random);assert.equal(repeated.hero.job.location,'patrol');
});
test('Старый патруль героя 1 уровня сохраняется и завершается, но новый запуск закрыт',()=>{
 let s=hire();s.hero.job={kind:'patrol',startedAt:t,endsAt:t+14000,result:{alive:true,hp:150,bandagesRemaining:0,loot:{ghoulHide:1},xp:10,killed:0}};s=normalizeGame(s);assert.equal(s.hero.job.kind,'patrol');s=act(s,{type:'claimHero'},t+14000);assert.equal(countItem(s,'ghoulHide'),1);assert.equal(s.hero.xp,10);assert.throws(()=>act(s,{type:'patrol'},t+14000),/со 2-го уровня/);
});


import {PROFESSIONS,IDENTITIES} from '../dist/data.js';
test('Найм: профессия, имя и национальность сохраняются без изменения цены и бонусов',()=>{
 for(const identity of Object.keys(IDENTITIES)){const s=act(game(),{type:'hire',profession:'saboteur',identity,perk:'initiative'},t);assert.equal(s.hero.name,IDENTITIES[identity].name);assert.equal(s.hero.nationality,IDENTITIES[identity].nationality);assert.equal(s.hero.profession,'saboteur');assert.equal(s.hero.identityId,identity);assert.equal(s.hero.weapon,'knife');assert.equal(s.hero.maxHp,180+(IDENTITIES[identity].bonuses?.hp??0));assert.equal(s.money,1000);assert.equal(heroConfig(s).hero.initiative,7);assert.equal(heroConfig(s).hero.evasion,60);assert.equal(normalizeGame(JSON.parse(JSON.stringify(s))).hero.nationality,s.hero.nationality);}
});
test('Найм: недоступные профессии, неверная национальность и чужой перк не списывают A',()=>{
 const s=game();assert.throws(()=>act(s,{type:'hire',profession:'heavy',identity:'ivan',perk:'initiative'},t),/недоступна/);assert.throws(()=>act(s,{type:'hire',profession:'saboteur',identity:'unknown',perk:'initiative'},t),/имя/);assert.throws(()=>act(s,{type:'hire',profession:'engineer',identity:'ivan',perk:'initiative'},t),/этой профессии/);assert.equal(s.money,1500);assert.equal(s.heroes.length,0);
});
test('Одинаковые имена не смешивают героев; старые герои не переименовываются',()=>{
 let s=game();s.money=5000;for(let i=0;i<2;i++)s=act(s,{type:'hire',profession:'saboteur',identity:'ivan',perk:'evasion'},t);assert.equal(s.heroes[0].name,'Иван');assert.equal(s.heroes[1].name,'Иван');assert.notEqual(s.heroes[0].id,s.heroes[1].id);const old=hire();assert.equal(normalizeGame(old).hero.name,'Диверсант');
});

import {upgradeChance,claimBonus} from '../dist/game.js';
const engineer=(perk='armored')=>act(game(),{type:'hire',profession:'engineer',identity:'ivan',perk},t,random);
test('Халтурка платит за уровень выбора и все уровни, полученные за серию',()=>{
 let s=engineer();s.hero.level=4;
 s=act(s,{type:'chooseLevelPerk',perk:'engineer-side-job'},t);
 assert.equal(s.money,2200);
 s=act(s,{type:'startSeries',location:'help',total:2,threshold:50},t,random);
 s.hero.job.run.result.xp=900;
 advanceSeries(s,t+23000);
 assert.equal(s.money,2200);
 const reward=s.hero.job.money;
 s=act(s,{type:'claimHero'},t+23000);
 assert.equal(s.hero.level,6);
 assert.equal(s.money,2200+reward+1300+1400);
 assert.throws(()=>act(s,{type:'claimHero'},t+23001),/не готов/);
});
test('Личный помощник повышает шанс Науки и складывается с Оружейником',()=>{
 let s=engineer('gunsmith');s.hero.level=4;
 assert.throws(()=>act(s,{type:'chooseLevelPerk',perk:'engineer-assistant'},t),/недоступен/);
 s.hero.level=5;s=act(s,{type:'chooseLevelPerk',perk:'engineer-assistant'},t);
 assert.equal(upgradeChance(s,'patchedArmor'),85);
 assert.equal(upgradeChance(s,'sharpen'),90);
 assert.equal(upgradeChance(s,'bandage'),100);
 s.heroes.push({...structuredClone(s.hero),id:'another-engineer'});
 assert.equal(upgradeChance(s,'sharpen'),100);
 assert.equal(upgradeChance(s,'patchedArmor'),90);
});
test('Стрелок повышает точность только стрелкового оружия, Бронник усиливает физическую защиту',()=>{
 let s=engineer();s.hero.level=2;
 assert.throws(()=>act(s,{type:'chooseLevelPerk',perk:'engineer-armorer'},t),/недоступен/);
 s=act(s,{type:'chooseLevelPerk',perk:'engineer-shooter'},t);
 s.hero.level=4;
 s=act(s,{type:'chooseLevelPerk',perk:'engineer-armorer'},t);
 const c=heroConfig(s);
 assert.equal(c.hero.armor,15);assert.equal(c.hero.thermalArmor,5);
 const attackAccuracy=()=>{
  const result=battle(c,{int:(min,max)=>max},240,{trace:true});
  return result.events.find(x=>x.type==='атака'&&x.actor==='герой').accuracy;
 };
 c.rat.stealth=100;
 assert.equal(attackAccuracy(),c.hero.accuracy+5);
 c.hero.weapons.main={type:'melee',min:10,max:30};
 assert.equal(attackAccuracy(),c.hero.accuracy);
});
test('Инженер нанимается с 210 HP, Пистолем и точностью 8; характеристики и перки отдельные',()=>{
 const s=engineer();const c=heroConfig(s);assert.equal(s.hero.name,'Иван');assert.equal(s.hero.profession,'engineer');assert.equal(s.hero.maxHp,240);assert.equal(s.hero.weapon,'pistol');assert.equal(s.hero.rangedWeapon,null);assert.equal(ITEMS.pistol.value,70);assert.equal(c.hero.weapons.main.weaponClass,'pistol');assert.equal(c.hero.weapons.main.min,10);assert.equal(c.hero.weapons.main.max,50);assert.equal(c.hero.accuracy,8);assert.equal(c.hero.evasion,35);assert.equal(c.hero.strength,3);assert.equal(c.hero.initiative,0);assert.equal(c.hero.perception,1);assert.equal(s.money,1000);
 assert.throws(()=>act(game(),{type:'hire',profession:'saboteur',identity:'ivan',perk:'armored'},t),/этой профессии/);
});
test('Бронированный: постоянная защита складывается с курткой и остаётся после снятия',()=>{
 let s=engineer();assert.equal(heroConfig(s).hero.armor,5);assert.equal(heroConfig(s).hero.thermalArmor,5);s.inventory=[row('jacket')];s=act(s,{type:'equip',uid:'jacket'},t);assert.equal(heroConfig(s).hero.armor,12);assert.equal(heroConfig(s).hero.thermalArmor,5);s=act(s,{type:'unequipBody'},t);assert.equal(heroConfig(s).hero.armor,5);
});
test('Жадный: деньги только при успешном получении, включая опыт без предметов',()=>{
 let s=engineer('greedy');s=act(s,{type:'help'},t,random);s.hero.job.result={loot:{},xp:5,money:0};assert.equal(s.money,1000);assert.equal(claimBonus(s.hero,s.hero.job),10);s=act(s,{type:'claimHero'},t+10000);assert.equal(s.money,1010);assert.equal(s.hero.xp,5);assert.throws(()=>act(s,{type:'claimHero'},t+10001),/не готов/);
 s.hero.job={kind:'mission',endsAt:t,result:{alive:false,hp:0,loot:{},xp:0}};s=act(s,{type:'claimHero'},t);assert.equal(s.money,1010);
 const h=engineer('greedy').hero;h.level=20;assert.equal(claimBonus(h,{kind:'help',result:{loot:{},xp:5,money:0}}),200);assert.equal(claimBonus(h,{kind:'help',result:{loot:{},xp:0,money:0}}),0);
});
test('Жадный: один бонус за общий сбор серии; переполнение и гибель не дают бонуса',()=>{
 let s=engineer('greedy');s=act(s,{type:'startSeries',location:'help',total:2,threshold:50},t,random);advanceSeries(s,t+23000);const result=structuredClone(s.hero.job);assert.equal(claimBonus(s.hero,result),10);s=act(s,{type:'claimHero'},t+23000);assert.equal(s.money,1000+result.money+10);
 s=engineer('greedy');s.hero.job={kind:'help',endsAt:t,result:{loot:{cloth:1},xp:5,money:0}};s.inventory=Array.from({length:CAPACITY},(_,i)=>row('knife',1,'b'+i));assert.throws(()=>act(s,{type:'claimHero'},t),/места/);assert.equal(s.money,1000);assert.equal(s.hero.xp,0);
 const dead=structuredClone(result);dead.worker.dead=true;assert.equal(claimBonus(s.hero,dead),0);
});
test('Оружейники: +5 п.п. за каждого, предел 100%, шанс фиксируется при запуске',()=>{
 let s=engineer('gunsmith');assert.equal(upgradeChance(s,'sharpen'),85);s.heroes.push({...structuredClone(s.hero),id:'engineer2'});assert.equal(upgradeChance(s,'sharpen'),90);s.inventory=[row('knife')];let started=act(s,{type:'upgrade',recipe:'sharpen',uid:'knife'},t,()=>.899);assert.equal(started.productions.upgrade.job.chance,90);assert.equal(started.productions.upgrade.job.success,true);started=act(s,{type:'upgrade',recipe:'sharpen',uid:'knife'},t,()=>.9);assert.equal(started.productions.upgrade.job.success,false);
 s.heroes.push({...structuredClone(s.hero),id:'engineer3'},{...structuredClone(s.hero),id:'engineer4'},{...structuredClone(s.hero),id:'engineer5'});assert.equal(upgradeChance(s,'sharpen'),100);
});
test('Пистолеты: Пистоль и АШОТ стреляют дважды с -15 точности, без штрафа урона',()=>{
 for(const item of ['pistol','ashot']){const s=engineer('double-shot');s.hero.rangedWeapon=item;s.hero.weapon='knife';const c=heroConfig(s);c.rat.hp=1000;const e=battle(c,{int:(min,max)=>max},210,{trace:true}),attacks=e.events.filter(x=>x.type==='атака'&&x.actor==='герой');const first=attacks[0];assert.equal(first.distance,1);assert.equal(first.accuracy,8-15-15);assert.equal(first.damagePenalty,0);assert.equal(first.base,ITEMS[item].max);assert.equal(attacks.filter(x=>x.turn===first.turn).length,2);const melee=attacks.find(x=>x.distance===0);if(melee)assert.equal(attacks.filter(x=>x.turn===melee.turn).length,1);}
});
test('Пистолеты не удваивают выстрелы из оружия другого класса',()=>{
 const c=heroConfig(engineer('double-shot'));c.hero.weapons.main.weaponClass='rifle';c.rat.hp=500;const e=battle(c,{int:(min,max)=>max},210,{trace:true});const shots=e.events.filter(x=>x.type==='атака'&&x.actor==='герой');assert.equal(shots.filter(x=>x.turn===shots[0].turn).length,1);assert.equal(shots[0].accuracy,8-15);
});

import {nationalityMoneyBonus,nationalityClaimBonus} from '../dist/game.js';
const nationalHero=(identity,profession='saboteur',perk='evasion')=>act(game(),{type:'hire',profession,identity,perk},t,random);
test('Русский: +30 текущего и максимального HP, бонус сохраняется при повышениях',()=>{
 let s=nationalHero('ivan');assert.equal(s.hero.hp,210);assert.equal(s.hero.maxHp,210);s.hero.job={kind:'help',endsAt:t,result:{loot:{},money:0,xp:100}};s=act(s,{type:'claimHero'},t);assert.equal(s.hero.level,2);assert.ok(Math.abs(s.hero.maxHp-(210+10+20/3))<1e-9);
 const eng=nationalHero('ivan','engineer','armored');assert.equal(eng.hero.hp,240);assert.equal(eng.hero.maxHp,240);
});
test('Немец: +5 п.п. точности, складывается с профессией и тяжёлыми ранами',()=>{
 let s=nationalHero('hans');assert.equal(heroConfig(s).hero.accuracy,15);s.hero.wounds=2;assert.equal(heroConfig(s).hero.accuracy,5);const e=nationalHero('hans','engineer','double-shot');assert.equal(heroConfig(e).hero.accuracy,13);assert.equal(e.hero.maxHp,210);
});
test('Еврей: 10% денежной награды, минимум 1 A, округление до десятых',()=>{
 const s=nationalHero('izya');assert.equal(nationalityMoneyBonus(s.hero,0),10);assert.equal(nationalityMoneyBonus(s.hero,150),15);assert.equal(nationalityMoneyBonus(s.hero,155),16);
 s.hero.job={kind:'help',endsAt:t,result:{loot:{},money:150,xp:5}};assert.equal(nationalityClaimBonus(s.hero,s.hero.job),15);const got=act(s,{type:'claimHero'},t);assert.equal(got.money,1000+150+15);assert.throws(()=>act(got,{type:'claimHero'},t),/не готов/);
 const failed={kind:'patrol',result:{alive:false,loot:{},xp:0}};assert.equal(nationalityClaimBonus(s.hero,failed),0);
});
test('Еврей: бонус за каждое прохождение серии и потеря всех бонусов при гибели',()=>{
 let s=nationalHero('izya');s=act(s,{type:'startSeries',location:'help',total:3,threshold:50},t,random);advanceSeries(s,t+999999);assert.equal(s.hero.job.nationalityBonus,30);const money=s.hero.job.money;s=act(s,{type:'claimHero'},t+999999);assert.equal(s.money,1000+money);
 s=nationalHero('izya');s=act(s,{type:'startSeries',location:'mission',total:2,threshold:15},t,random);s.hero.job.run.result={alive:true,hp:150,bandagesRemaining:0,loot:{},xp:10,killed:0};advanceSeries(s,t+7000);assert.equal(s.hero.job.nationalityBonus,10);advanceSeries(s,t+10000);s.hero.job.run.result={alive:false,hp:0,loot:{},xp:0};advanceSeries(s,t+17000);assert.equal(s.hero.job.money,0);assert.equal(s.hero.job.nationalityBonus,0);
});
test('Еврей и Жадный: национальная надбавка к награде плюс отдельный бонус инженера',()=>{
 let s=nationalHero('izya','engineer','greedy');s.hero.job={kind:'help',endsAt:t,result:{loot:{},money:0,xp:5}};s=act(s,{type:'claimHero'},t);assert.equal(s.money,1020);
});
test('Американец: +8 каждым попаданием из пистолета, включая оба выстрела',()=>{
 const s=nationalHero('john','engineer','double-shot'),c=heroConfig(s);c.hero.accuracy=200;c.rat.hp=1000;const e=battle(c,{int:(min,max)=>max},210,{trace:true});const shots=e.events.filter(x=>x.type==='атака'&&x.actor==='герой');assert.equal(shots[0].bonus,8);assert.equal(shots[1].bonus,8);assert.equal(shots[0].damage,48);assert.equal(shots[0].damagePenalty,0);
 c.hero.weapons.main.weaponClass='rifle';const r=battle(c,{int:(min,max)=>max},210,{trace:true}).events.find(x=>x.type==='атака'&&x.actor==='герой');assert.equal(r.bonus,0);
});
test('Старые герои без национальных бонусов не получают скрытое лечение при загрузке',()=>{
 const s=hire();s.hero.hp=12;const loaded=normalizeGame(s);assert.equal(loaded.hero.hp,12);assert.equal(loaded.hero.maxHp,180);assert.equal(nationalityMoneyBonus(loaded.hero,1000),0);
});

import {heroTitle} from '../dist/game.js';
test('Подпись героя: имя, стартовый перк и профессия; имя не изменяется',()=>{
 const s=engineer('greedy');assert.equal(heroTitle(s.hero),'Иван, жадный инженер');assert.equal(s.hero.name,'Иван');s.hero.perk='armored';assert.equal(heroTitle(s.hero),'Иван, жадный инженер');const other=engineer('armored');assert.equal(heroTitle(other.hero),'Иван, бронированный инженер');assert.equal(normalizeGame(JSON.parse(JSON.stringify(s))).hero.startPerk,'greedy');
});

test('Основной пистолет стреляет вплотную: двойной выстрел и +8 сохраняются',()=>{
 const c=heroConfig(nationalHero('john','engineer','double-shot'));c.rat.stealth=100;c.rat.hp=500;const e=battle(c,{int:(min,max)=>max},210,{trace:true});const shots=e.events.filter(x=>x.type==='атака'&&x.actor==='герой');assert.equal(shots[0].distance,0);assert.equal(shots[0].weapon,'pistol');assert.equal(shots[0].accuracy,8-15);assert.equal(shots[0].damage,48);assert.equal(shots[0].bonus,8);assert.equal(shots.filter(x=>x.turn===shots[0].turn).length,2);
});
test('Основной дальний слот приоритетен дополнительному; нож использует дополнительный на расстоянии',()=>{
 let s=engineer('double-shot');s.inventory=[row('ashot')];s=act(s,{type:'equip',uid:'ashot',slot:'ranged'},t);let c=heroConfig(s);c.rat.hp=500;let e=battle(c,{int:(min,max)=>max},210,{trace:true});assert.equal(e.events.find(x=>x.type==='атака'&&x.actor==='герой').weapon,'pistol');assert.equal(s.hero.weapon,'pistol');assert.equal(s.hero.rangedWeapon,'ashot');
 s.inventory=[row('knife')];s=act(s,{type:'equip',uid:'knife',slot:'main'},t);c=heroConfig(s);c.rat.hp=500;e=battle(c,{int:(min,max)=>max},210,{trace:true});const attacks=e.events.filter(x=>x.type==='атака'&&x.actor==='герой');assert.equal(attacks[0].weapon,'ashot');assert.equal(attacks.find(x=>x.distance===0).weapon,'knife');
});
test('Выбор слота из инвентаря: дальнее в любой слот, ближнее только в основной',()=>{
 let s=hire();s.inventory=[row('ashot'),row('crowbar')];assert.throws(()=>act(s,{type:'equip',uid:'crowbar',slot:'ranged'},t),/только дистанционное/);s=act(s,{type:'equip',uid:'ashot',slot:'main'},t);assert.equal(s.hero.weapon,'ashot');assert.equal(countItem(s,'knife'),1);assert.equal(normalizeGame(s).hero.weapon,'ashot');assert.equal(act(s,{type:'selectHero',heroId:s.hero.id},t).hero.weapon,'ashot');
});
test('Перенос между слотами: обмен двух пистолетов без места в инвентаре',()=>{
 let s=engineer();s.hero.weaponDetails={uid:'p1',item:'pistol',qty:1};s.hero.rangedWeapon='ashot';s.hero.rangedWeaponDetails={uid:'p2',item:'ashot',qty:1};s.inventory=Array.from({length:CAPACITY},(_,i)=>row('knife',1,'move'+i));s=act(s,{type:'moveWeapon',slot:'ranged'},t);assert.equal(s.hero.weapon,'ashot');assert.equal(s.hero.weaponDetails.uid,'p2');assert.equal(s.hero.rangedWeapon,'pistol');assert.equal(s.hero.rangedWeaponDetails.uid,'p1');assert.equal(s.inventory.length,CAPACITY);
});
test('Перенос дистанционного в основной возвращает ближнее в инвентарь атомарно',()=>{
 let s=hire();s.hero.rangedWeapon='pistol';s.inventory=Array.from({length:CAPACITY},(_,i)=>row('knife',1,'return'+i));assert.throws(()=>act(s,{type:'moveWeapon',slot:'ranged'},t),/места/);assert.equal(s.hero.weapon,'knife');assert.equal(s.hero.rangedWeapon,'pistol');s.inventory.pop();s=act(s,{type:'moveWeapon',slot:'ranged'},t);assert.equal(s.hero.weapon,'pistol');assert.equal(s.hero.rangedWeapon,null);assert.equal(s.inventory.length,CAPACITY);s=act(s,{type:'help'},t,random);assert.throws(()=>act(s,{type:'moveWeapon',slot:'main'},t),/занят/);
});

test('Настройки повторов отдельно по героям и локациям, сохраняются после загрузки',()=>{
 let s=twoHeroes();const first=s.heroes[0].id,second=s.heroes[1].id;
 s=act(s,{type:'setRepeatPreferences',heroId:first,location:'help',total:5,threshold:15},t);s=act(s,{type:'setRepeatPreferences',heroId:first,location:'mission',total:3,threshold:30},t);s=act(s,{type:'setRepeatPreferences',heroId:second,location:'help',total:2,threshold:50},t);
 s=normalizeGame(JSON.parse(JSON.stringify(s)));assert.deepEqual(s.heroes[0].repeatPreferences.help,{total:5,threshold:15});assert.deepEqual(s.heroes[0].repeatPreferences.mission,{total:3,threshold:30});assert.deepEqual(s.heroes[1].repeatPreferences.help,{total:2,threshold:50});assert.equal(s.heroes[1].repeatPreferences.mission,undefined);assert.ok(s.heroes.every(h=>!h.job));
});
test('Запуск серии записывает настройки; неверные параметры не меняют предыдущий выбор',()=>{
 let s=series('help',4,30);assert.deepEqual(s.hero.repeatPreferences.help,{total:4,threshold:30});assert.throws(()=>act(s,{type:'setRepeatPreferences',location:'help',total:6,threshold:15},t),/прохождений/);assert.throws(()=>act(s,{type:'setRepeatPreferences',location:'help',total:4,threshold:12},t),/порог/);assert.deepEqual(s.hero.repeatPreferences.help,{total:4,threshold:30});
});

test('Целая кожа: уровень 2, 4 обрывка +3 A, 10 секунд, 10 XP; шкура упыря не подходит',()=>{
 let s=hire();s.inventory=[row('leather',4)];assert.throws(()=>act(s,{type:'craft',recipe:'fullLeather'},t),/уровень/);s.productions.armor.level=2;s=act(s,{type:'craft',recipe:'fullLeather'},t);assert.equal(s.money,970);assert.equal(countItem(s,'leather'),0);assert.equal(s.productions.armor.job.endsAt,t+10000);s=act(s,{type:'claimCraft',production:'armor'},t+10000);assert.equal(countItem(s,'fullLeather'),1);assert.equal(s.productions.armor.xp,10);assert.equal(ITEMS.fullLeather.value,80);
 s.inventory=[row('ghoulHide',4)];assert.throws(()=>act(s,{type:'craft',recipe:'fullLeather'},t),/материалов/);assert.equal(countItem(s,'ghoulHide'),4);
});
test('Качественная кожанка: уровень 3, куртка из инвентаря и целая кожа, 5 A/12 сек/22 XP',()=>{
 let s=hire();s.productions.armor.level=2;s.inventory=[row('jacket'),row('fullLeather')];assert.throws(()=>act(s,{type:'craft',recipe:'qualityJacket'},t),/уровень/);s.productions.armor.level=3;s=act(s,{type:'craft',recipe:'qualityJacket'},t);assert.equal(s.money,950);assert.equal(s.inventory.length,0);assert.equal(s.productions.armor.job.endsAt,t+12000);s=act(s,{type:'claimCraft',production:'armor'},t+12000);assert.equal(countItem(s,'qualityJacket'),1);assert.equal(s.productions.armor.xp,22);assert.equal(ITEMS.qualityJacket.value,220);s=act(s,{type:'equip',uid:s.inventory[0].uid},t+12000);assert.equal(s.hero.body,'qualityJacket');assert.equal(heroConfig(s).hero.armor,14);assert.equal(heroConfig(s).hero.thermalArmor,10);
});
test('Надетая куртка не расходуется в рецепте; броня складывается с перком инженера',()=>{
 let s=engineer('armored');s.productions.armor.level=3;s.hero.body='jacket';s.inventory=[row('fullLeather')];assert.throws(()=>act(s,{type:'craft',recipe:'qualityJacket'},t),/материалов/);assert.equal(s.hero.body,'jacket');s.inventory.push(row('qualityJacket'));s=act(s,{type:'equip',uid:'qualityJacket'},t);assert.equal(heroConfig(s).hero.armor,19);assert.equal(heroConfig(s).hero.thermalArmor,15);assert.equal(countItem(s,'jacket'),1);s=act(s,{type:'unequipBody'},t);assert.equal(countItem(s,'qualityJacket'),1);assert.equal(heroConfig(s).hero.armor,5);assert.equal(heroConfig(s).hero.thermalArmor,5);
});
test('Новая броня: переполнение сохраняет готовое изделие; продажа за 22 A / 44 сек',()=>{
 let s=hire();s.productions.armor.level=3;s.inventory=[row('jacket'),row('fullLeather')];s=act(s,{type:'craft',recipe:'qualityJacket'},t);s.inventory=Array.from({length:CAPACITY},(_,i)=>row('knife',1,'armor'+i));assert.throws(()=>act(s,{type:'claimCraft',production:'armor'},t+12000),/места/);assert.ok(s.productions.armor.job);assert.equal(s.productions.armor.xp,0);s.inventory=[];s=act(s,{type:'claimCraft',production:'armor'},t+12000);s=act(s,{type:'sell',uid:s.inventory[0].uid},t+12000);assert.equal(s.shelves[0].price,220);assert.equal(s.shelves[0].endsAt,t+56000);
});


test('Пружинные механизмы производятся партией, труба продаётся у Юрася',()=>{
 let s=game();
 assert.deepEqual(openYuras(s,t,random).offers.find(x=>x.item==='pipe'),{item:'pipe',qty:1});
 assert.equal(sellerPrice('pipe'),96);
 s.productions.ranged.level=2;
 s.inventory=[row('metal',6)];
 s=act(s,{type:'craft',recipe:'springMechanism',max:true},t);
 assert.equal(s.productions.ranged.job.endsAt,t+20000);
 s=act(s,{type:'claimCraft',production:'ranged'},t+20000);
 assert.equal(countItem(s,'springMechanism'),2);
 assert.equal(s.productions.ranged.xp,16);
});

test('Бастард делает три проверки, Обрез делает одну с двумя бросками урона и перезаряжается',()=>{
 function trace(weapon){
  const s=hire();
  s.hero.weapon=weapon;
  const c=heroConfig(s);
  Object.assign(c.rat,{hp:10000,stealth:100,armor:10});
  c.trial.combatTurnLimit=3;
  return battle(c,{int:(_,max)=>max},180,{trace:true}).events;
 }
 const burst=trace('bastard').filter(e=>e.type==='атака'&&e.turn===1);
 assert.deepEqual(burst.map(e=>[e.accuracy,e.damage]),[[-10,70],[-10,70],[-10,70]]);
 const sawedOff=trace('sawedOff');
 assert.deepEqual(sawedOff.filter(e=>e.type==='атака'&&e.actor==='герой').map(e=>[e.turn,e.accuracy,e.components]),[[1,0,[120,120]]]);
 assert.equal(sawedOff.find(e=>e.type==='перезарядка').turn,3);
});

test('Винтовка занимает оба слота, пробивает броню выстрелом и отдельно улучшает штык',()=>{
 let s=hire();
 s.hero.rangedWeapon='ashot';
 s.inventory=[{...row('mosin'),upgrades:[{recipe:'sharpen',bonus:7},{recipe:'psct',bonus:20,accuracyBonus:-5}]}];
 s=act(s,{type:'equip',uid:'mosin',slot:'main'},t);
 assert.equal(s.hero.rangedWeapon,null);
 assert.equal(countItem(s,'knife'),1);
 assert.equal(countItem(s,'ashot'),1);
 const c=heroConfig(s);
 Object.assign(c.rat,{hp:10000,stealth:100,armor:10});
 c.trial.combatTurnLimit=3;
 const attacks=battle(c,{int:(_,max)=>max},180,{trace:true}).events.filter(e=>e.type==='атака'&&e.actor==='герой');
 assert.deepEqual(attacks.map(e=>[e.turn,e.accuracy,e.armor,e.damage]),[[1,5,0,170],[3,10,10,97]]);
 assert.equal(attacks[1].bayonet,true);
 const ashot=s.inventory.find(x=>x.item==='ashot');
 s=act(s,{type:'equip',uid:ashot.uid,slot:'ranged'},t);
 assert.equal(s.hero.weapon,null);
 assert.equal(s.hero.rangedWeapon,'ashot');
 assert.equal(countItem(s,'mosin'),1);
});


test('Ячейки инвентаря открываются по цене 5, 10, 20, 30, 40 A и сохраняются',()=>{
 let s=game();
 assert.equal(inventoryCapacity(s),20);
 for(const price of [50,100,200,300,400]){
  assert.equal(inventorySlotCost(s),price);
  const balance=s.money;
  s=act(s,{type:'buyInventorySlot'},t);
  assert.equal(s.money,balance-price);
 }
 assert.equal(s.totalSpent,1050);
 assert.equal(inventoryCapacity(normalizeGame(JSON.parse(JSON.stringify(s)))),25);
 s.inventory=Array.from({length:24},(_,i)=>row('knife',1,'extra'+i));
 assert.equal(canReceive(s,[row('jacket')]),true);
 assert.equal(canReceive(s,[row('jacket'),row('ashot')]),false);
});

test('Предметы из старого инвентаря сверх лимита сохраняются',()=>{
 let s=game();
 delete s.inventorySlotsBought;
 s.inventory=[...Array.from({length:23},(_,i)=>row('knife',1,'legacy'+i)),row('metal')];
 s=normalizeGame(s);
 assert.equal(s.inventory.length,24);
 assert.equal(inventoryCapacity(s),20);
 assert.equal(canReceive(s,[row('metal')]),true);
 assert.equal(canReceive(s,[row('jacket')]),false);
});

test('Купленная полка хранит товар, цены растут на 20 A, лимит 16',()=>{
 let s=game();
 for(const price of [200,400,600]){
  assert.equal(shelfCost(s),price);
  s=act(s,{type:'buyShelf'},t);
 }
 assert.equal(s.shelves.length,7);
 assert.equal(s.money,300);
 assert.throws(()=>act(s,{type:'buyShelf'},t),/патронов/);
 s.inventory=[row('knife',1,'for-new-shelf')];
 s.shelves.fill({item:'knife'},0,6);
 s=act(s,{type:'sell',uid:'for-new-shelf'},t);
 s=normalizeGame(JSON.parse(JSON.stringify(s)));
 assert.equal(s.shelves[6].uid,'for-new-shelf');
 s.shelves.length=MAX_SHELVES;
 assert.throws(()=>act(s,{type:'buyShelf'},t),/открыты/);
});
