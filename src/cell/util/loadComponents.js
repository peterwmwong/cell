require.def('cell/util/loadComponents',
   [ 'cell/config' ], 
   function(config) {
   var __getXhr = function() {
       return (__getXhr.impl && __getXhr.impl())
        || (__getXhr.impl = 
              ((typeof XMLHttpRequest !== "undefined")
                 ? function(){return new XMLHttpRequest();}
                 : [ 'Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0' ].reduce(function(p,c){
                      if(p===undefined){
                         try{
                            new ActiveXObject(c);
                            return (function(pid){return new ActiveXObject(pid);}).bind(undefined,c); 
                         }catch(e){}
                      }
                      return p;
                   }))
           )();
      },
      __fetchText = function(url, callback) {
         var xhr = __getXhr();
         xhr.open('GET', url, true);
         xhr.onreadystatechange = function(evt) {
            // Do not explicitly handle errors, those should be
            // visible via console output in the browser.
            if (xhr.readyState === 4) {
               callback(xhr.responseText, (xhr.status === 404));
            }
         };
         xhr.send(null);
      },
      __resloader = function(restype, ctx, cb) {
         var loaded = ctx.loaded;
         var url = (config.resourceBasePaths[restype].value || config.resourceBasePaths.all.value)
               + ctx.qname
               + "."
               + config.resourceExtensions[restype].value;
         
         __fetchText(url, function(result, errors) {
            
            loaded[restype] = true;
            
            if (!errors) {
               cb(result, url);
            }
            
            // Wait until all components are loaded
            if (loaded.template && loaded.styling && loaded.controller) {
               ctx.completeCb(ctx.errors.length>0?ctx.errors:undefined);
               ctx = {};
            }
         });
      };
      
   
   return function(qname, loadCtrlCb, loadTplCb, loadStyleCb, completeCb) {
      var _loadingCtx = {
             qname: qname,
             loaded:{},
             errors:[],
             completeCb: completeCb
          };

      __resloader('controller',_loadingCtx,loadCtrlCb);
      __resloader('template',_loadingCtx,loadTplCb);
      __resloader('styling',_loadingCtx,loadStyleCb);
   };
});
