require.def('cell/config', 
   [ 'cell/util/createClass' ],
   function(createClass){
   
   var __getConfigPath = function(cfgEl){
         var path = [cfgEl.name];
         var p = cfgEl.parent;
         while(p && p.name){
            path.unshift(p.name);
            p = p.parent;
         }
         return path.join('.');
       },
       
       __passThrough = function(v){return v;},
       
       __returnTrue = function(){return true;},
       
       __validateFunction = function(value){
         return (typeof value === 'function');
       },
       
       __validateString = function(value){
          return (typeof value === 'string');
       },
       __sanitizeResourceBasePath = function(path){
          return (path === '' || path.charAt(path.length-1) === '/') 
                    ? path
                    : path+'/';   
       },
       
       ConfigElement = createClass({
         'init':function(desc){
            return {
               'description': {'enumerable':true,'value':desc},
               'parent':      {'enumerable':true,'writable':true,'value':undefined},
               'name':        {'enumerable':true,'writable':true,'value':undefined},
               'getConfigPath':{'value':__getConfigPath.bind(undefined,this)}
         };}
       }),
       
       Group = createClass({
          'extend': ConfigElement, 
          'init':function(desc,optsOrGroups){
             this.callSuper(desc);
             
             var rtn = {},
                 _this = this;
             
             Object.keys(optsOrGroups).forEach(function(key){
                var og = optsOrGroups[key];
                og.parent = _this;
                og.name = key;
                rtn[key] = {value: og};
             });
             
             return rtn;
          }
       }),
       
       Option = createClass({
          'extend':ConfigElement,
          'init':function(desc,def,validate,sanitize){
             this.callSuper(desc);
             var _this = this;
             
             return {
                'defaultValue': {'enumerable':true, 'value':def},
                'value':        { 'enumerable':true, 
                                  'get': function(){return def;},
                                  'set': function(v){
                                     if(_this.validate(v)){
                                        v = _this.sanitize(v);
                                        console.log('cell.configure(): Setting '+_this.getConfigPath()+' => '+v);
                                        def = v;
                                     }else{
                                        console.log('cell.configure(): Could not Could not configure '+_this.getConfigPath()+', value('+v+') did not pass validation.');
                                     }
                                  }
                                },
                'validate':     {'value': (validate && typeof(validate)==='function')
                                       ? validate
                                       : __returnTrue},
                'sanitize':     {'value': (sanitize && typeof(sanitize)==='function')
                                       ? sanitize
                                       : __passThrough}
             };
          }
       }),

       _this = Group('Cell Configuration',{
            'resourceBasePaths': Group('Base Paths for Cell resources (Styling, Controller, Template).',{
               'all':        Option('Base Path for all Cell files {(tyling, Controller, Template).',
                                 '',
                                 __validateString,
                                 __sanitizeResourceBasePath),
                                 
               'styling':    Option('Base Path for Cell Styling (CSS/LESS) files',
                                 undefined,
                                 __validateString,
                                 __sanitizeResourceBasePath),
                                 
               'controller': Option('Base Path for Cell Controller (JavaScript) files',
                                 undefined,
                                 __validateString,
                                 __sanitizeResourceBasePath),
                                 
               'template':   Option('Base Path for Cell Template (XHTML) files',
                                 undefined,
                                 __validateString,
                                 __sanitizeResourceBasePath)
            }),
            
            'resourceExtensions': Group('File Extensions for Component resources (Styling, Controller, Template).',{
               'styling':    Option('Cell Styling file extension.','less',__validateString),
               'controller': Option('Cell Presenter (JavaScript) file extension.','js',__validateString),
               'template':   Option('Cell Template file extension.','html',__validateString)
            }),
            
            'defaultTemplateRenderer' : Option('Default function used to render Template to a DOM Node',
                  undefined,
                  __validateFunction),
                  
            'defaultStyleRenderer' : Option('Default function used to render Style to a DOM Node',
                  undefined,
                  __validateFunction)
       }),
       
       __doConfig = function(cfg,k,v){
          var c = cfg[k];
          if(c instanceof Option){
            c.value = v;
          }else if(c instanceof Group){
             Object.keys(v).forEach(function(k2){
               __doConfig(c, k2, v[k2]);
             });
          }else{
             console.log('cell.config.configure(): Could not configure "'+k+'" in '+cfg.description+'  '+cfg.getConfigPath());
          }
       };
   
   Object.defineProperty(_this,'configure',{
      value: function(s){
         if(s instanceof Object){
            Object.keys(s).forEach(function(key){
               __doConfig(_this, key, s[key]);
            });
         }
      }
   });
   return _this;
});
