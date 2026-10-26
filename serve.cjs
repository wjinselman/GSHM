const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.json':'application/json'};
http.createServer((req,res)=>{let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end('Invalid request');}
const target=path.resolve(__dirname,'.'+(name==='/'?'/index.html':name));
if(!target.startsWith(__dirname+path.sep)){res.writeHead(403);return res.end('Forbidden');}
fs.readFile(target,(err,body)=>{if(err){res.writeHead(404);return res.end('Page not found');}
res.writeHead(200,{'Content-Type':types[path.extname(target)]||'text/plain; charset=utf-8','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Cache-Control':'no-store'});res.end(body);});
}).listen(4175,'127.0.0.1',()=>console.log('Museum review: http://127.0.0.1:4175/index.html'));
