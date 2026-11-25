export const PAOLO_DELAY=300000;
export const paoloEligible=s=>Boolean(s.completedLocations?.technoparkRoof&&(s.stationBuildings?.researchCenter||s.completedLocations?.kolomenskaya));
export function advanceQuestEvent(s,now=Date.now()){
 if(!paoloEligible(s)||s.paoloEvent)return false;
 s.paoloEvent={dueAt:now+PAOLO_DELAY};return true;
}
export const urgentQuestEvent=(s,now=Date.now())=>Boolean(paoloEligible(s)&&!s.interactiveMission&&!s.paoloTrial&&!s.heroes?.some(h=>h.job?.kind==='interactive')&&s.paoloEvent&&now>=s.paoloEvent.dueAt);
export const questAction=a=>/Quest|ToothQuest|BobrovBunker/.test(a)||['interactiveChoice','interactiveCombat','kolomChoice','hansaRouteChoice','choosePlayerRole','molchunTask','acceptKolom','startKolom','startHansaExpedition','startInteractiveMission','repairTechnoparkRoof','appeaseDurenForQuest','hireDurenForQuest'].includes(a);
export function finishPaoloEvent(s,now){
 if(!urgentQuestEvent(s,now))throw new Error('Паоло пока не просил подойти.');
 s.paoloEvent={dueAt:now+PAOLO_DELAY};
}

export function currentStationQuest(state,{keeperQuestView,shekelQuestView,countItem,hansaQuestAvailable},now=Date.now()){
 if(urgentQuestEvent(state,now))return {color:'red',title:'Просят подойти',action:'paolo'};
 const quests=[],q=keeperQuestView(state);
 if(q.stage<=6)quests.push({title:q.title,action:'toothQuest',ready:q.status==='accepted'&&q.progress>=q.target});
 if(state.playerRole==='shekel'){const sq=shekelQuestView(state);quests.push({title:sq.stage===1?'Развернуть торговый пост':'Задание Шекеля',action:'player',ready:sq.ready});}
 if(state.playerRole==='sova'&&!state.sovaQuest?.reward)quests.push({title:'Отремонтировать крышу Технопарка',action:'player',ready:Boolean(state.completedLocations.technoparkRoof)});
 if(state.npcMeetings?.molchun&&!state.molchunStashesDone)quests.push({title:'Укрепление схронов',action:'molchunQuest',ready:countItem(state,'metalParts')>=10});
 if(!state.hansaShop&&(state.hansaQuestAccepted||hansaQuestAvailable(state)))quests.push({title:'Договориться о поставках с Ганзой',action:state.hansaQuestAccepted?'hansaExpedition':'hansaQuest'});
 if(state.completedLocations.technoparkRoof&&!state.completedLocations.kolomenskaya)quests.push({title:'Очистка Коломенской · Дима Лось',action:'kolom'});
 if(state.bobrovMet)quests.push({title:'Бункер Серова',action:'bobrov'});
 const next=quests.find(x=>x.ready)??quests[0];
 return next?{...next,color:next.ready?'yellow':'green'}:{color:'green',title:'Нет текущих заданий',action:'toothQuest'};
}
