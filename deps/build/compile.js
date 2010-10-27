const js   = require('fs').readFileSync(process.argv[2]),
      body = require('querystring').stringify({
               js_code:js.toString(), 
               compilation_level:'WHITESPACE_ONLY', 
               output_format:'text', 
               output_info:'compiled_code'
         }),
      req  = require('http')
               .createClient(80,'closure-compiler.appspot.com')
               .request('POST','/compile',{
                  Host: 'closure-compiler.appspot.com',
                  'Content-Length': body.length,
                  'Content-Type': 'application/x-www-form-urlencoded'
         });

req.end(body);
req.on('response',function(rsp){
   rsp.on('data',function(data){
      console.log(data.toString());
   });
});
