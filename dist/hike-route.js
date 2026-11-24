import {cells,key,distance} from './hike-map-model.js';
const directions=[[1,0],[0,1],[-1,1],[-1,0],[0,-1],[1,-1]];
const available=new Set(cells.map(c=>key(c.q,c.r)));
export function findRoute(start,target,blocked=()=>false,cost=()=>1){
  const end=key(target.q,target.r),first=key(start.q,start.r);
  const known=start.explored?new Set(start.explored):null;
  if(!available.has(end)||blocked(target)||first===end)return [];
  const queue=[{q:start.q,r:start.r}],parents=new Map([[first,null]]),costs=new Map([[first,0]]),done=new Set();
  while(queue.length){
    queue.sort((a,b)=>costs.get(key(a.q,a.r))-costs.get(key(b.q,b.r)));
    const here=queue.shift(),hereId=key(here.q,here.r);if(done.has(hereId))continue;done.add(hereId);
    if(hereId===end){const result=[];let point=here;while(point&&key(point.q,point.r)!==first){result.push(point);point=parents.get(key(point.q,point.r));}return result.reverse();}
    if(known&&hereId!==first&&!known.has(hereId))continue;
    for(const [dq,dr] of directions){const next={q:here.q+dq,r:here.r+dr},id=key(next.q,next.r);
      if(!available.has(id)||done.has(id)||blocked(next))continue;
      const value=costs.get(hereId)+cost(next);if(value>=(costs.get(id)??Infinity))continue;
      costs.set(id,value);parents.set(id,here);queue.push(next);
    }
  }
  return [];
}
