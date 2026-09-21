const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
http.createServer((req,res)=>{
  const name=decodeURIComponent(req.url.split('?')[0]);
  const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  fs.readFile(file,(err,body)=>{
    if(err){res.writeHead(404);return res.end('Not found');}
    res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.gif':'image/gif','.svg':'image/svg+xml','.json':'application/json; charset=utf-8'})[path.extname(file)]||'application/octet-stream');
    res.end(body);
  });
}).listen(4300,'127.0.0.1',()=>console.log('http://127.0.0.1:4300'));
