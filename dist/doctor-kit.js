// Remove one harmful effect per dose; unrelated injuries and permanent losses remain.
export function doctorKitCure(hero){
 for(const key of ['poisoned','poisonTurns','poisonAccuracy','entangled','skipNextTurn']){
  if(!hero[key])continue;
  if(key.startsWith('poison')){delete hero.poisoned;delete hero.poisonTurns;delete hero.poisonAccuracy;}
  else delete hero[key];
  return key;
 }
 if((hero.radiation??0)>0){hero.radiation--;hero.doctorRadiationRemoved=(hero.doctorRadiationRemoved??0)+1;return 'radiation';}
 return null;
}
