importScripts('engine.js');
onmessage=e=>{try{postMessage({data:GraphEngine.analyze(e.data.n,e.data.mode)})}catch(e){postMessage({error:e.message})}};
