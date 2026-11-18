/* Exact unlabeled simple undirected graphs: complete permutation orbits, n <= 7. */
(function(root){
function graphSpace(n){
 if(!Number.isInteger(n)||n<1||n>7)throw Error('Choose an integer from 1 to 7.');
 const pairs=[],index=Array.from({length:n},()=>Array(n));
 for(let u=0;u<n;u++)for(let v=u+1;v<n;v++){index[u][v]=index[v][u]=pairs.length;pairs.push([u,v]);}
 const maps=[];
 function permute(prefix,rest){if(!rest.length){maps.push(pairs.map(([u,v])=>1<<index[prefix[u]][prefix[v]]));return;}rest.forEach((v,i)=>permute([...prefix,v],[...rest.slice(0,i),...rest.slice(i+1)]));}
 permute([],Array.from({length:n},(_,i)=>i));
 const labeledCount=2**pairs.length,classOf=new Int32Array(labeledCount).fill(-1),representatives=[],multiplicity=[];
 for(let mask=0;mask<labeledCount;mask++){
  if(classOf[mask]>=0)continue;
  const id=representatives.length;representatives.push(mask);let size=0;
  const present=[];for(let i=0;i<pairs.length;i++)if(mask&(1<<i))present.push(i);
  for(const map of maps){let relabeled=0;for(const i of present)relabeled|=map[i];if(classOf[relabeled]<0){classOf[relabeled]=id;size++;}else if(classOf[relabeled]!==id)throw Error('Orbit overlap');}
  multiplicity.push(size);
 }
 return{n,pairs,labeledCount,classOf,representatives:Int32Array.from(representatives),multiplicity:Int32Array.from(multiplicity),count:representatives.length,completeState:classOf[labeledCount-1],emptyState:classOf[0]};
}
function progressMask(n,pairs,mask,mode){
 const d=new Uint8Array(n);pairs.forEach(([u,v],i)=>{if(mask&(1<<i)){d[u]++;d[v]++;}});
 let t=mask;pairs.forEach(([u,v],i)=>{if(d[u]!==d[v])return;const bit=1<<i;if(mode==='u')t^=bit;else if(mode==='u+')t|=bit;else t&=~bit;});return t;
}
function transitions(space,mode){
 const{n,pairs,count,representatives,classOf}=space,next=new Int32Array(count),indeg=new Int32Array(count);
 for(let s=0;s<count;s++){const t=classOf[progressMask(n,pairs,representatives[s],mode)];next[s]=t;indeg[t]++;}
 const queue=[];for(let s=0;s<count;s++)if(!indeg[s])queue.push(s);
 for(let i=0;i<queue.length;i++){const t=next[queue[i]];if(--indeg[t]===0)queue.push(t);}
 const basin=new Int32Array(count).fill(-1),depth=new Int32Array(count),cycles=[];
 for(let s=0;s<count;s++)if(indeg[s]&&basin[s]<0){const id=cycles.length,c=[];let t=s;do{basin[t]=id;c.push(t);t=next[t];}while(t!==s);cycles.push(c);}
 for(let i=queue.length-1;i>=0;i--){const s=queue[i];basin[s]=basin[next[s]];depth[s]=depth[next[s]]+1;}
 const sizes=new Int32Array(cycles.length);for(let s=0;s<count;s++)sizes[basin[s]]++;
 return{next,basin,depth,cycles,sizes,maxDepth:Math.max(...depth)};
}
let cachedSpace;
function analyze(n,mode='u'){
 if(!['u','u+','u-'].includes(mode))throw Error('Choose u, u+, or u-.');
 const space=cachedSpace?.n===n?cachedSpace:(cachedSpace=graphSpace(n));
 const plus=transitions(space,'u+'),minus=transitions(space,'u-'),active=mode==='u+'?plus:mode==='u-'?minus:transitions(space,'u');
 const {classOf,...publicSpace}=space,plusStable=new Int32Array(space.count),minusStable=new Int32Array(space.count);
 let plusCompleteCount=0,minusCollapsibleCount=0;
 for(let s=0;s<space.count;s++){plusStable[s]=plus.cycles[plus.basin[s]][0];minusStable[s]=minus.cycles[minus.basin[s]][0];if(plusStable[s]===space.completeState)plusCompleteCount++;if(minusStable[s]===space.emptyState)minusCollapsibleCount++;}
 return{...publicSpace,mode,...active,plusStable,minusStable,plusDepth:plus.depth,minusDepth:minus.depth,plusCompleteCount,minusCollapsibleCount};
}
if(typeof module!=='undefined')module.exports={analyze,graphSpace,progressMask};else root.GraphEngine={analyze};
})(typeof self!=='undefined'?self:globalThis);
