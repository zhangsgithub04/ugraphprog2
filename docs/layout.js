/* Planar layout for a functional digraph: reverse trees above a cycle baseline.
 * Disjoint subtree intervals prevent crossings. Cycle closing arcs stay below trees.
 */
(function(root){
function buildLayout(data,basins,aspect=1.6){
 const children=Array.from({length:data.count},()=>[]),width=new Float64Array(data.count),height=new Int32Array(data.count);
 for(let s=0;s<data.count;s++)if(data.depth[s]>0)children[data.next[s]].push(s);
 const order=Array.from({length:data.count},(_,i)=>i).sort((a,b)=>data.depth[b]-data.depth[a]||a-b);
 for(const s of order){width[s]=Math.max(1,children[s].reduce((sum,c)=>sum+width[c],0));height[s]=children[s].length?1+Math.max(...children[s].map(c=>height[c])):0;children[s].sort((a,b)=>height[a]-height[b]||width[a]-width[b]||a-b);}
 const X=100,Y=115,PAD=65,GAP=65,FOOT=100;
 const tiles=basins.map(b=>{const roots=data.cycles[b],depth=Math.max(...roots.map(s=>height[s]));return{b,roots,depth,width:roots.reduce((sum,s)=>sum+width[s]*X,0)+GAP*(roots.length-1)+2*PAD,height:depth*Y+FOOT+2*PAD};});
 const area=tiles.reduce((a,t)=>a+(t.width+GAP)*(t.height+GAP),0),target=Math.max(Math.sqrt(area*aspect),...tiles.map(t=>t.width));
 const points=new Array(data.count),routes=new Array(data.count),visible=[],boxes=[];let left=0,top=0,rowHeight=0;
 function place(s,x,y,mirror){points[s]={x:x+width[s]*X/2,y};visible.push(s);let offset=x;const list=mirror?[...children[s]].reverse():children[s];for(const child of list){place(child,offset,y-Y,mirror);offset+=width[child]*X;}}
 for(const tile of tiles){if(left&&left+tile.width>target){left=0;top+=rowHeight+GAP;rowHeight=0;}
  const baseline=top+PAD+tile.depth*Y;let x=left+PAD;
  tile.roots.forEach((s,i)=>{place(s,x,baseline,i>=tile.roots.length/2);x+=width[s]*X+GAP;});
  boxes.push({basin:tile.b,x:left,y:top,width:tile.width,height:tile.height});
  tile.roots.forEach((s,i)=>{const a=points[s],b=points[data.next[s]],r=9;
   if(s===data.next[s])routes[s]={type:'cubic',points:[{x:a.x+r,y:a.y+3},{x:a.x+55,y:a.y+72},{x:a.x-55,y:a.y+72},{x:a.x-r,y:a.y+3}]};
   else if(i===tile.roots.length-1)routes[s]={type:'cubic',points:[{x:a.x,y:a.y+r},{x:a.x,y:a.y+90},{x:b.x,y:b.y+90},{x:b.x,y:b.y+r}]};
   else routes[s]={type:'line',points:[{x:a.x+r,y:a.y},{x:b.x-r,y:b.y}]};
  });
  left+=tile.width+GAP;rowHeight=Math.max(rowHeight,tile.height);
 }
 for(const s of visible)if(data.depth[s]>0){const a=points[s],b=points[data.next[s]],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),r=11;routes[s]={type:'line',points:[{x:a.x+dx/len*r,y:a.y+dy/len*r},{x:b.x-dx/len*r,y:b.y-dy/len*r}]};}
 const minX=Math.min(...boxes.map(b=>b.x)),maxX=Math.max(...boxes.map(b=>b.x+b.width)),minY=Math.min(...boxes.map(b=>b.y)),maxY=Math.max(...boxes.map(b=>b.y+b.height));
 const labels=new Array(data.count);for(const s of visible){const p=points[s],cycle=data.cycles[data.basin[s]],i=cycle.indexOf(s);if(data.depth[s]>0)labels[s]={x:p.x+16,y:p.y+4,anchor:'start'};else if(i===0)labels[s]={x:p.x-16,y:p.y+4,anchor:'end'};else if(i===cycle.length-1)labels[s]={x:p.x+16,y:p.y+4,anchor:'start'};else labels[s]={x:p.x,y:p.y+90,anchor:'middle'};}
 return{points,routes,visible,boxes,labels,bounds:{minX,maxX,minY,maxY}};
}
function toSvg(data,l){
 const {minX,minY,maxX,maxY}=l.bounds,parts=[`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${maxX-minX} ${maxY-minY}" width="${maxX-minX}" height="${maxY-minY}"><title>Unlabeled graph progression n=${data.n}, rule ${data.mode}</title><rect x="${minX}" y="${minY}" width="${maxX-minX}" height="${maxY-minY}" fill="#f8f9ff"/><defs><marker id="gray" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7Z" fill="#929fba"/></marker><marker id="red" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7Z" fill="#ec6a4b"/></marker></defs><g font-family="Arial,sans-serif">`];
 for(const box of l.boxes)parts.push(`<text x="${box.x+20}" y="${box.y+25}" fill="#8b90a7" font-size="12">B${box.basin+1} · period ${data.cycles[box.basin].length}</text>`);
 for(const s of l.visible){const r=l.routes[s],p=r.points,cycle=data.depth[s]===0,d=r.type==='line'?`M${p[0].x} ${p[0].y}L${p[1].x} ${p[1].y}`:`M${p[0].x} ${p[0].y}C${p[1].x} ${p[1].y} ${p[2].x} ${p[2].y} ${p[3].x} ${p[3].y}`;parts.push(`<path d="${d}" fill="none" stroke="${cycle?'#ec6a4b':'#929fba'}" stroke-width="1.5" marker-end="url(#${cycle?'red':'gray'})"/>`);}
 for(const s of l.visible){const p=l.points[s],t=l.labels[s],color=data.depth[s]===0?'#ec6a4b':data.depth[s]===1?'#e9ae40':'#6366e7';parts.push(`<circle cx="${p.x}" cy="${p.y}" r="8.5" fill="${color}"/><text x="${t.x}" y="${t.y}" font-size="13" font-weight="600" text-anchor="${t.anchor}" fill="#343c58">U${s}</text>`);}
 parts.push('</g></svg>');return parts.join('');
}
if(typeof module!=='undefined')module.exports={buildLayout,toSvg};else root.FunctionalLayout={buildLayout,toSvg};
})(typeof self!=='undefined'?self:globalThis);
