const assert=require('node:assert/strict');
const {analyze,graphSpace}=require('../dist/engine.js');
function reference(n,pairs,s,mode){const adjacency=Array.from({length:n},()=>Array(n).fill(0));pairs.forEach(([u,v],i)=>{if(s&(1<<i))adjacency[u][v]=adjacency[v][u]=1});const degree=adjacency.map(row=>row.reduce((a,b)=>a+b,0));let t=0;pairs.forEach(([u,v],i)=>{let edge=adjacency[u][v];if(degree[u]===degree[v])edge=mode==='u'?1-edge:mode==='u+'?1:0;if(edge)t|=1<<i;});return t;}
const expected=[0,1,2,4,11,34,156],labeledPositive=[0,1,2,5,36,349,7490];
for(let n=1;n<=6;n++){
 const space=graphSpace(n);assert.equal(space.count,expected[n]);
 assert.equal(space.multiplicity.reduce((a,b)=>a+b,0),space.labeledCount);
 const frequencies=Array(space.count).fill(0);for(let s=0;s<space.labeledCount;s++){assert.ok(space.classOf[s]>=0);frequencies[space.classOf[s]]++;assert.ok(space.representatives[space.classOf[s]]<=s);}assert.deepEqual(frequencies,Array.from(space.multiplicity));
 for(const mode of ['u','u+','u-']){
  const a=analyze(n,mode);assert.equal(a.count,expected[n]);
  // Exhaustively check the quotient is well-defined on EVERY labeled graph, not just representatives.
  for(let mask=0;mask<space.labeledCount;mask++){
   const id=space.classOf[mask],nextMask=reference(n,space.pairs,mask,mode);
   assert.equal(a.next[id],space.classOf[nextMask]);
   if(mode==='u+')assert.equal(mask&nextMask,mask);
   if(mode==='u-')assert.equal(mask&nextMask,nextMask);
  }
  for(const cycle of a.cycles){if(mode!=='u')assert.equal(cycle.length,1);cycle.forEach((s,i)=>assert.equal(a.next[s],cycle[(i+1)%cycle.length]));}
  let weightedPlus=0,weightedMinus=0;
  for(let s=0;s<a.count;s++){
   assert.equal(a.basin[s],a.basin[a.next[s]]);if(a.depth[s])assert.equal(a.depth[s],a.depth[a.next[s]]+1);
   assert.equal(reference(n,a.pairs,a.representatives[a.plusStable[s]],'u+'),a.representatives[a.plusStable[s]]);
   assert.equal(reference(n,a.pairs,a.representatives[a.minusStable[s]],'u-'),a.representatives[a.minusStable[s]]);
   if(a.plusStable[s]===a.completeState)weightedPlus+=a.multiplicity[s];
   if(a.minusStable[s]===a.emptyState)weightedMinus+=a.multiplicity[s];
  }
  assert.equal(weightedPlus,labeledPositive[n]);assert.equal(weightedMinus,labeledPositive[n]);
  assert.equal(a.plusCompleteCount,a.minusCollapsibleCount);
 }
 console.log(`n=${n}: ${space.count} classes, ${space.labeledCount} labeled graphs; all three quotient rules verified.`);
}
// A self-complementary structure can be fixed up to isomorphism under u without being a labeled fixed point.
const a=analyze(4,'u');assert.ok(Array.from(a.next).some((t,s)=>t===s&&reference(4,a.pairs,a.representatives[s],'u')!==a.representatives[s]));
assert.throws(()=>analyze(8));assert.throws(()=>analyze(4,'bad'));
console.log('All checks passed, including quotient equivariance, class totals, weighted classifications, and structural fixed points.');

// n=7: full orbit partition, all representative transitions, and deterministic relabeling samples.
const space7=graphSpace(7);assert.equal(space7.count,1044);assert.equal(space7.multiplicity.reduce((a,b)=>a+b,0),2097152);
for(const mode of ['u','u+','u-']){
 const a=analyze(7,mode);assert.equal(a.count,1044);assert.equal(a.plusCompleteCount,114);assert.equal(a.minusCollapsibleCount,114);
 for(let id=0;id<a.count;id++){
  const mask=a.representatives[id],t=reference(7,a.pairs,mask,mode);assert.equal(a.next[id],space7.classOf[t]);
  if(mode==='u+')assert.equal(mask&t,mask);if(mode==='u-')assert.equal(mask&t,t);
  assert.equal(reference(7,a.pairs,a.representatives[a.plusStable[id]],'u+'),a.representatives[a.plusStable[id]]);
  assert.equal(reference(7,a.pairs,a.representatives[a.minusStable[id]],'u-'),a.representatives[a.minusStable[id]]);
 }
 for(let i=0;i<8192;i++){const mask=(i*1103515245+12345)&2097151;assert.equal(a.next[space7.classOf[mask]],space7.classOf[reference(7,a.pairs,mask,mode)]);}
 for(const c of a.cycles){if(mode!=='u')assert.equal(c.length,1);c.forEach((s,i)=>assert.equal(a.next[s],c[(i+1)%c.length]));}
 console.log(`n=7 ${mode}: all 1044 representatives and 8192 labeled transition samples passed.`);
}
