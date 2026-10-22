import {handleBrain} from '../netlify/functions/_brain/http.mjs';
export function knowledgeBrainPreview() {
  return {name:'knowledge-brain-preview',configureServer(server) {
    server.middlewares.use('/api/knowledge-brain',async(req,res)=> {
      try {
        const chunks=[];let size=0;
        for await (const chunk of req){size+=chunk.length;if(size>600000){res.writeHead(413);res.end();return;}chunks.push(chunk);}
        const origin=`http://${req.headers.host}`;
        const forwarded=req.headers['x-forwarded-proto']==='https'?'https:':'http:';
        const url=new URL('/api/knowledge-brain'+req.url,origin);url.protocol=forwarded;
        const response=await handleBrain(new Request(url,{method:req.method,headers:req.headers,...(req.method==='POST'?{body:Buffer.concat(chunks)}:{})}));
        res.writeHead(response.status,Object.fromEntries(response.headers));res.end(await response.text());
      }catch{res.writeHead(503,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:false,code:'backendUnavailable'}));}
    });
  }};
}
