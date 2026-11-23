// Magazine sizes apply only to manual JRPG encounters.
// Named real models use their listed configuration; fictional models use game capacities.
export const JRPG_MAGAZINES={
 sawedOff:2,zauerM:2,oldShotgun:2,rox:6,rox3:6,
 ak47:30,ak74:30,rpk:100,ppsh:71,m60:100,improvedM16:30,american180:177,
 pistol:8,mr73:6,fiveSeven:20,brenTen:10,mosin:5,remington:5,
 saiga20k:5,browning:5,slugShotgun:5,abzats:20,velocipedel:60,
 bastard:30,nailGun:30,handCrossbow:1,homemadeRifle:1,ashot:1,
 laserPistol:10,laserRifle:10,heavyLaser:30
};
export function magazineState(hero,slot){
 const weapon=hero.weapons?.[slot];
 if(!weapon||weapon.type!=='ranged')return null;
 const capacity=JRPG_MAGAZINES[weapon.item]??(weapon.flame?6:weapon.shots?30:weapon.damageRolls??(weapon.weaponClass==='pistol'?8:weapon.weaponClass==='rifle'?5:1));
 const saved=hero.jrpgMagazines?.[slot];
 if(saved&&saved.item===weapon.item&&Number.isFinite(saved.rounds))return {...saved,capacity,rounds:Math.max(0,Math.min(capacity,saved.rounds))};
 return {item:weapon.item,capacity,rounds:weapon.usesHeavyAmmo?Math.min(capacity,hero.heavyAmmo??0):capacity};
}
export function prepareMagazines(hero){
 hero.jrpgMagazines??={};
 for(const slot of ['main','ranged']){
  const magazine=magazineState(hero,slot);
  if(magazine)hero.jrpgMagazines[slot]=magazine;
 }
 // Older manual saves used one automatic reload flag for both weapons.
 delete hero.reloading;
 delete hero.reloadWeapon;
}
export function roundsForMode(hero,weapon,mode){
 if(mode==='bayonet'||weapon.type!=='ranged')return 0;
 if(mode==='double')return weapon.damageRolls??1;
 if(mode==='pistolDouble')return hero.pistolAttacks??2;
 return 1;
}
export function reloadMagazine(hero,slot){
 const magazine=magazineState(hero,slot),weapon=hero.weapons[slot];
 magazine.rounds=weapon.usesHeavyAmmo?Math.min(magazine.capacity,hero.heavyAmmo??0):magazine.capacity;
 hero.jrpgMagazines[slot]=magazine;
 return magazine;
}
