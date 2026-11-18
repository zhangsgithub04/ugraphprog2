const assert=require('node:assert/strict'),{analyze}=require('../dist/engine.js'),{buildLayout}=require('../dist/layout.js');
function sample(route){if(route.type==='line')return route.points;const[a,b,c,d]=route.points;return Array.from({length:33},(_,i)=>{const t=i/32,v=1-t;return{x:v*v*v*a.x+3*v*v*t*b.x+3*v*t*t*c.x+t*t*t*d.x,y:v*v*v*a.y+3*v*v*t*b.y+3*v*t*t*c.y+t*t*t*d.y}})}
function orient(a,b,c){return(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x)}
function crossing(a,b,c,d){return orient(a,b,c)*orient(a,b,d)<-1e-6&&orient(c,d,a)*orient(c,d,b)<-1e-6;}
for(let n=1;n<=7;n++)for(const mode of ['u','u+','u-']){
 const a=analyze(n,mode),l=buildLayout(a,a.cycles.map((_,i)=>i));assert.equal(l.visible.length,a.count);
 const occupied=new Set();for(const s of l.visible){const p=l.points[s];assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));const key=`${p.x},${p.y}`;assert.ok(!occupied.has(key),'node overlap');occupied.add(key);if(a.depth[s])assert.ok(p.y<l.points[a.next[s]].y);}
 const sampled=l.routes.map(sample);
 for(let s=0;s<a.count;s++)for(let t=s+1;t<a.count;t++){
  if(a.basin[s]!==a.basin[t]||s===a.next[t]||t===a.next[s]||a.next[s]===a.next[t])continue;
  const p=sampled[s],q=sampled[t];for(let i=1;i<p.length;i++)for(let j=1;j<q.length;j++)assert.ok(!crossing(p[i-1],p[i],q[j-1],q[j]),`crossing n=${n} ${mode} ${s},${t}`);
 }
 // Basin boxes must have disjoint interiors; no routes escape their assigned box.
 for(let i=0;i<l.boxes.length;i++)for(let j=i+1;j<l.boxes.length;j++){const b=l.boxes[i],c=l.boxes[j];assert.ok(b.x+b.width<=c.x||c.x+c.width<=b.x||b.y+b.height<=c.y||c.y+c.height<=b.y);}
 for(const s of l.visible){const box=l.boxes.find(b=>b.basin===a.basin[s]);for(const p of sampled[s])assert.ok(p.x>=box.x&&p.x<=box.x+box.width&&p.y>=box.y&&p.y<=box.y+box.height);}
 // The one-basin view retains every state in that component.
 if(a.cycles.length>1){const one=buildLayout(a,[0]);assert.equal(one.visible.length,a.sizes[0]);}
 console.log(`n=${n} ${mode}: ${a.count} states, no node overlaps or nonincident edge crossings.`);
}
