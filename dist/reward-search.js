import {ITEMS,RECIPES} from './data.js';
import {perceptionCheck} from './combat.js';
const weighted=(rows,r)=>{let n=r.int(1,1000000)/10000;for(const [value,weight] of rows){n-=weight;if(n<=0)return value;}return rows.at(-1)[0];};
const pick=(rows,r)=>rows[r.int(0,rows.length-1)];
export function rewardQuality(r){if(r.int(1,10000)>1500)return 0;const n=r.int(1,10000);return n<=50?4:n<=250?3:n<=2050?2:1;}
export function generateReward(level,r,c){
 const budget=(10+5*level+2*level*level)*10,min=Math.ceil(budget*.8),cap=budget*2,category=5*Math.floor(level/5);
 const weights=level>=20?[25,25,20,15,5,10]:level>=15?[25,25,20,15,8,7]:level>=10?[25,25,20,15,10,5]:level>=5?[30,20,15,15,15,5]:[35,15,10,15,20,5];
 const types=['supply','weapon','body','resource','money','plan'];let type=weighted(types.map((v,i)=>[v,weights[i]]),r),money=0,items=[];
 const resources=['strongTape','antiseptic','steel','acid','electronicParts','hardChitinPlates'];
 const eligible=Object.keys(ITEMS).filter(id=>{const w=ITEMS[id];return Number.isInteger(w.value)&&w.value>0&&!w.pendingDistribution&&!w.rewardOnly&&w.value<=cap&&(w.equipmentCategory??0)<=category;});
 if(['weapon','body'].includes(type)&&level>=7&&r.int(1,10000)<=Math.min(100,level*10)&&type==='weapon')items=[{item:'fourfoldShotgun',qty:1,rarity:'unique'}];
 else if(type!=='money'){
  let pool=eligible.filter(id=>type==='supply'?['medicine','food','stimulant','grenade'].includes(ITEMS[id].type)&&!['teaNotes','oldMedicines'].includes(id):type==='resource'?resources.includes(id):type==='plan'?['weaponUpgradePlan','armorUpgradePlan'].includes(id):ITEMS[id].type===type);
  if(!pool.length&&type==='plan')pool=eligible.filter(id=>resources.includes(id));
  if(pool.length){
   if(['weapon','body'].includes(type)){
    const cats=[...new Set(pool.map(id=>ITEMS[id].equipmentCategory??0))].sort((a,b)=>b-a),categoryWeights=cats.map((v,i)=>[v,i===0?60:i===1?30:10/Math.max(1,cats.length-2)]),sum=categoryWeights.reduce((n,x)=>n+x[1],0);
    const selected=weighted(categoryWeights.map(([v,w])=>[v,w*100/sum]),r);pool=pool.filter(id=>(ITEMS[id].equipmentCategory??0)===selected);
    if(type==='weapon'){const classes=[['melee',25],['pistol',20],['automatic',20],['shotgun',20],['rifle',10],['heavy',5]].filter(([k])=>pool.some(id=>(ITEMS[id].combat==='melee'?'melee':ITEMS[id].weaponClass)===k));const sum=classes.reduce((n,x)=>n+x[1],0);if(sum){const k=weighted(classes.map(([k,v])=>[k,v*100/sum]),r);pool=pool.filter(id=>(ITEMS[id].combat==='melee'?'melee':ITEMS[id].weaponClass)===k);}}
   }
   let row={item:pick(pool,r),qty:1};
   if(['weapon','body','stimulant'].includes(ITEMS[row.item].type))row.quality=rewardQuality(r);
   if(['weapon','body'].includes(type)){
    const count=level>=15?weighted([[0,45],[1,35],[2,15],[3,5]],r):level>=10?weighted([[0,65],[1,25],[2,8],[3,2]],r):level>=5?weighted([[0,82],[1,15],[2,3]],r):0;
    for(let i=0;i<count;i++){const pool=Object.keys(RECIPES).filter(id=>{const p=RECIPES[id];return p.upgrade&&!p.raisesQuality&&p.level<=level&&c.canUpgrade(row,id)&&!(row.upgrades??[]).some(u=>[p.replaces].flat().includes(u.recipe));});if(!pool.length)break;row=c.upgradedItem(row,pick(pool,r));}
   }
   items.push(row);
  }
 }
 if(type==='money'||!items.length)money=budget;
 const value=items.reduce((n,row)=>n+c.itemValue(row)*row.qty,0)+money;
 money+=Math.max(0,min-value);
 return {items:items.map(x=>({...x,lootQualityResolved:true})),money,budget,min};
}
export function searchRewards(state,active,key,level,final,r,c){
 active.rewardSearches??={};if(active.rewardSearches[key])return active.rewardSearches[key];
 const dc=Math.ceil(8+level/2),checks=active.heroIds.map(id=>state.heroes.find(h=>h.id===id)).filter(h=>h&&!h.dead&&h.hp>0&&!h.unconscious).map(h=>{const cfg=c.heroConfig(state,h,'surface').hero;return {heroId:h.id,name:h.name,...perceptionCheck(cfg,r,cfg.perception+(cfg.perceptionCheckBonus??0)+(cfg.detectionBonus??0),dc,{inclusive:true}),dc};});
 const best=Math.max(-Infinity,...checks.map(x=>x.total)),count=1+Number(best>=dc)+Number(final&&best>=dc+5),rewards=Array.from({length:count},()=>generateReward(level,r,c));
 const result={key,level,dc,checks,count,items:rewards.flatMap(x=>x.items),money:rewards.reduce((n,x)=>n+x.money,0)};
 active.rewardSearches[key]=result;return result;
}
