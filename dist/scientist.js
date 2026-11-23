export const hasScientistPerk=(hero,id)=>hero?.perk==='scientist-'+id||(hero?.levelPerks??[]).some(p=>p.perk==='scientist-'+id);
export const scientistRadiationReduction=(heroes,random=Math.random)=>heroes.filter(h=>h&&!h.dead&&h.hp>0&&hasScientistPerk(h,'dose')).reduce(sum=>sum+1+Math.floor(random()*2),0);
export const mechanicalEnemy=enemy=>enemy?.mechanical===true||enemy?.prototype===true||['mechanical','robot','prototype'].includes(enemy?.kind);
export function scientistSafetyBonus(hero){
 if(!hero.scientistSafety||hero.scientistSafetyUsed)return 0;
 hero.scientistSafetyUsed=true;
 return 2;
}

let checkContext=null;
export function withScientistChecks(context,callback){
 const previous=checkContext;checkContext=context;
 try{return callback();}finally{checkContext=previous;}
}
export function scientistCheck(hero,random,result,kind='search'){
 const context=checkContext;
 if(!context||result.success||!hero.scientistControl||context.used.has(hero.id)||!['search','trap','hack'].includes(kind))return result;
 const index=context.index++;
 const decision=context.decisions[index];
 if(decision==null){
  const error=new Error('Контрольная проба');
  error.scientistCheck={heroId:hero.id,name:hero.name,...result,index};
  throw error;
 }
 if(decision==='skip')return result;
 context.used.add(hero.id);
 const roll=random.int(1,20),bonus=result.bonus+2,total=roll+bonus;
 return {...result,firstRoll:result.roll,roll,bonus,total,success:result.inclusive?total>=result.dc:total>result.dc,scientistReroll:true};
}
