export const GRENADE_FIELDS={pipeGrenade:'grenades',molotov:'molotovs',tinGrenade:'tinGrenades',lu216:'lu216Grenades',dynamite:'dynamites',radioactiveGrenade:'radioactiveGrenades'};
export function grenadeSpec(hero,item,spec){
 if(!hero||item==='darkGrasp')return spec;
 const radiation=item==='radioactiveGrenade',fire=item==='molotov'||spec.flame;
 const common=radiation?0:hero.grenadeDamageBonus??0;
 const low=common+(fire&&hero.demoPyro?20:0)+(!fire&&!radiation&&hero.demoExplosion?10:0);
 const high=common+(fire&&hero.demoPyro?30:0)+(!fire&&!radiation&&hero.demoExplosion?20:0);
 return {...spec,min:spec.min+low,max:spec.max+high,dodgeDc:(spec.dodgeDc??14)+(hero.grenadeDodgeBonus??0)};
}
export function recordGrenade(hero,item){if(!GRENADE_FIELDS[item])return;(hero.grenadeUseCounts??={})[item]=(hero.grenadeUseCounts?.[item]??0)+1;}
export function grenadeRefund(hero,counts=hero.grenadeUseCounts??{}){
 if(!(hero.levelPerks??[]).some(p=>p.perk==='demo-refund'))return [];
 hero.grenadeRefundProcessed??={};hero.grenadeRefundQuarters??={};const items=[];
 for(const item of Object.keys(GRENADE_FIELDS)){const spent=Math.max(0,(counts[item]??0)-(hero.grenadeRefundProcessed[item]??0));hero.grenadeRefundProcessed[item]=counts[item]??0;const quarters=(hero.grenadeRefundQuarters[item]??0)+spent;const qty=Math.floor(quarters/4);hero.grenadeRefundQuarters[item]=quarters%4;if(qty)items.push({item,qty});}
 return items;
}
