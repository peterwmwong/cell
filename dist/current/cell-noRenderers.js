/*
 RequireJS Copyright (c) 2010, The Dojo Foundation All Rights Reserved.
 Available via the MIT or new BSD license.
 see: http://github.com/jrburke/requirejs for details
*/
var require,define;
(function(){function A(a){return H.call(a)==="[object Function]"}function B(a,b,d){var c=h.plugins.defined[a];if(c)c[d.name].apply(null,d.args);else{c=h.plugins.waiting[a]||(h.plugins.waiting[a]=[]);c.push(d);f(["require/"+a],b.contextName)}}function C(a,b){D.apply(f,a);b.loaded[a[0]]=true}function I(a,b,d){var c,e,g;for(c=0;g=b[c];c++){g=typeof g==="string"?{name:g}:g;e=g.location;if(d&&(!e||e.indexOf("/")!==0&&e.indexOf(":")===-1))g.location=d+"/"+(g.location||g.name);g.location=g.location||g.name;
g.lib=g.lib||"lib";g.main=g.main||"main";a[g.name]=g}}function J(a){var b=true,d=a.config.priorityWait,c,e;if(d){for(e=0;c=d[e];e++)if(!a.loaded[c]){b=false;break}b&&delete a.config.priorityWait}return b}function x(a){var b,d=h.paused;if(a.scriptCount<=0){for(a.scriptCount=0;t.length;){b=t.shift();b[0]===null?f.onError(new Error("Mismatched anonymous require.def modules")):C(b,a)}if(!(a.config.priorityWait&&!J(a))){if(d.length)for(a=0;b=d[a];a++)f.checkDeps.apply(f,b);f.checkLoaded(h.ctxName)}}}function R(a,
b){var d=h.plugins.callbacks[a]=[];h.plugins[a]=function(){for(var c=0,e;e=d[c];c++)if(e.apply(null,arguments)===true&&b)return true;return false}}function K(a,b){if(!a.jQuery)if((b=b||(typeof jQuery!=="undefined"?jQuery:null))&&"readyWait"in b){a.jQuery=b;if(!a.defined.jquery&&!a.jQueryDef)a.defined.jquery=b;if(a.scriptCount){b.readyWait+=1;a.jQueryIncremented=true}}}function S(a){return function(b){a.exports=b}}function u(a,b,d){return function(){var c=[].concat(T.call(arguments,0));c.push(b,d);
return(a?require[a]:require).apply(null,c)}}function U(a,b){var d=a.contextName,c=u(null,d,b);f.mixin(c,{modify:u("modify",d,b),def:u("def",d,b),get:u("get",d,b),nameToUrl:u("nameToUrl",d,b),ready:f.ready,context:a,config:a.config,isBrowser:h.isBrowser});return c}var p={},h,o,v=[],E,y,L,w,M,r={},N,V=/^(complete|loaded)$/,W=/(\/\*([\s\S]*?)\*\/|\/\/(.*)$)/mg,X=/require\(["']([\w-_\.\/]+)["']\)/g,D,q=!!(typeof window!=="undefined"&&navigator&&document),O=!q&&typeof importScripts!=="undefined",H=Object.prototype.toString,
P=Array.prototype,T=P.slice,F,f,z,t=[],Q=false,G;if(typeof require!=="undefined")if(A(require))return;else r=require;f=require=function(a,b,d,c,e){var g;if(typeof a==="string"&&!A(b))return require.get(a,b,d,c);if(!require.isArray(a)){g=a;if(require.isArray(b)){a=b;b=d;d=c;c=e}else a=[]}D(null,a,b,g,d,c);(a=h.contexts[d||g&&g.context||h.ctxName])&&a.scriptCount===0&&x(a)};f.onError=function(a){throw a;};define=f.def=function(a,b,d,c){var e,g,i=G;if(typeof a!=="string"){c=d;d=b;b=a;a=null}if(!f.isArray(b)){c=
d;d=b;b=[]}if(!a&&!b.length&&f.isFunction(d)){d.toString().replace(W,"").replace(X,function(j,l){b.push(l)});b=["require","exports","module"].concat(b)}if(!a&&Q){e=document.getElementsByTagName("script");for(a=e.length-1;a>-1&&(g=e[a]);a--)if(g.readyState==="interactive"){i=g;break}i||f.onError(new Error("ERROR: No matching script interactive for "+d));a=i.getAttribute("data-requiremodule")}if(typeof a==="string")h.contexts[h.ctxName].jQueryDef=a==="jquery";t.push([a,b,d,null,c])};D=function(a,b,
d,c,e,g){var i,j,l,m,k;e=e?e:c&&c.context?c.context:h.ctxName;i=h.contexts[e];if(a){j=a.indexOf("!");if(j!==-1){l=a.substring(0,j);a=a.substring(j+1,a.length)}else l=i.defPlugin[a];j=i.waiting[a];if(i&&(i.defined[a]||j&&j!==P[a]))return}if(e!==h.ctxName){j=h.contexts[h.ctxName]&&h.contexts[h.ctxName].loaded;m=true;if(j)for(k in j)if(!(k in p))if(!j[k]){m=false;break}if(m)h.ctxName=e}if(!i){i={contextName:e,config:{waitSeconds:7,baseUrl:h.baseUrl||"./",paths:{},packages:{}},waiting:[],specified:{require:true,
exports:true,module:true},loaded:{},scriptCount:0,urlFetched:{},defPlugin:{},defined:{},modifiers:{}};h.plugins.newContext&&h.plugins.newContext(i);i=h.contexts[e]=i}if(c){if(c.baseUrl)if(c.baseUrl.charAt(c.baseUrl.length-1)!=="/")c.baseUrl+="/";m=i.config.paths;j=i.config.packages;f.mixin(i.config,c,true);if(c.paths){for(k in c.paths)k in p||(m[k]=c.paths[k]);i.config.paths=m}if((m=c.packagePaths)||c.packages){if(m)for(k in m)k in p||I(j,m[k],k);c.packages&&I(j,c.packages);i.config.packages=j}if(c.priority){f(c.priority);
i.config.priorityWait=c.priority}if(c.deps||c.callback)f(c.deps||[],c.callback);c.ready&&f.ready(c.ready);if(!b)return}if(b){k=b;b=[];for(c=0;c<k.length;c++)b[c]=f.splitPrefix(k[c],a||g,i)}g=i.waiting.push({name:a,deps:b,callback:d});if(a){i.waiting[a]=g-1;i.specified[a]=true;if(g=i.modifiers[a]){f(g,e);if(g=g.__deferMods)for(c=0;c<g.length;c++){k=g[c];j=k[k.length-1];if(j===undefined)k[k.length-1]=e;else typeof j==="string"&&g.push(e);require.def.apply(require,k)}}}if(a&&d&&!f.isFunction(d))i.defined[a]=
d;l&&B(l,i,{name:"require",args:[a,b,d,i]});h.paused.push([l,a,b,i]);if(a){i.loaded[a]=true;i.jQueryDef=a==="jquery"}};f.mixin=function(a,b,d){for(var c in b)if(!(c in p)&&(!(c in a)||d))a[c]=b[c];return f};f.version="0.14.5";h=f.s={ctxName:"_",contexts:{},paused:[],plugins:{defined:{},callbacks:{},waiting:{}},skipAsync:{},isBrowser:q,isPageLoaded:!q,readyCalls:[],doc:q?document:null};f.isBrowser=h.isBrowser;if(q){h.head=document.getElementsByTagName("head")[0];if(z=document.getElementsByTagName("base")[0])h.head=
z.parentNode}f.plugin=function(a){var b,d,c,e=a.prefix,g=h.plugins.callbacks,i=h.plugins.waiting[e],j;b=h.plugins.defined;c=h.contexts;if(b[e])return f;b[e]=a;j=["newContext","isWaiting","orderDeps"];for(b=0;d=j[b];b++){h.plugins[d]||R(d,d==="isWaiting");g[d].push(a[d])}if(a.newContext)for(d in c)if(!(d in p)){b=c[d];a.newContext(b)}if(i){for(b=0;c=i[b];b++)a[c.name]&&a[c.name].apply(null,c.args);delete h.plugins.waiting[e]}return f};f.completeLoad=function(a,b){for(var d;t.length;){d=t.shift();if(d[0]===
null){d[0]=a;break}else if(d[0]===a)break;else C(d,b)}d&&C(d,b);b.loaded[a]=true;K(b);b.scriptCount-=1;x(b)};f.pause=f.resume=function(){};f.checkDeps=function(a,b,d,c){if(a)B(a,c,{name:"checkDeps",args:[b,d,c]});else for(a=0;b=d[a];a++)if(!c.specified[b.fullName]){c.specified[b.fullName]=true;c.startTime=(new Date).getTime();b.prefix?B(b.prefix,c,{name:"load",args:[b.name,c.contextName]}):f.load(b.name,c.contextName)}};f.modify=function(a,b,d,c,e){var g,i,j=(typeof a==="string"?e:b)||h.ctxName,l=
h.contexts[j],m=l.modifiers;if(typeof a==="string"){i=m[a]||(m[a]=[]);if(!i[b]){i.push(b);i[b]=true}l.specified[a]?f.def(b,d,c,e):(i.__deferMods||(i.__deferMods=[])).push([b,d,c,e])}else for(g in a)if(!(g in p)){b=a[g];i=m[g]||(l.modifiers[g]=[]);if(!i[b]){i.push(b);i[b]=true;l.specified[g]&&f([b],j)}}};f.isArray=function(a){return H.call(a)==="[object Array]"};f.isFunction=A;f.get=function(a,b,d){if(a==="require"||a==="exports"||a==="module")f.onError(new Error("Explicit require of "+a+" is not allowed."));
b=b||h.ctxName;var c=h.contexts[b];a=f.normalizeName(a,d,c);d=c.defined[a];d===undefined&&f.onError(new Error("require: module name '"+a+"' has not been loaded yet for context: "+b));return d};f.load=function(a,b){var d=h.contexts[b],c=d.urlFetched,e=d.loaded;h.isDone=false;e[a]||(e[a]=false);if(b!==h.ctxName)v.push(arguments);else{e=f.nameToUrl(a,null,b);if(!c[e]){d.scriptCount+=1;f.attach(e,b,a);c[e]=true;if(d.jQuery&&!d.jQueryIncremented){d.jQuery.readyWait+=1;d.jQueryIncremented=true}}}};f.jsExtRegExp=
/\.js$/;f.normalizeName=function(a,b,d){if(a.charAt(0)==="."){b||f.onError(new Error("Cannot normalize module name: "+a+", no relative module name available."));if(d.config.packages[b])b=[b];else{b=b.split("/");b=b.slice(0,b.length-1)}a=b.concat(a.split("/"));for(o=0;b=a[o];o++)if(b==="."){a.splice(o,1);o-=1}else if(b===".."){a.splice(o-1,2);o-=2}a=a.join("/")}return a};f.splitPrefix=function(a,b,d){var c=a.indexOf("!"),e=null;if(c!==-1){e=a.substring(0,c);a=a.substring(c+1,a.length)}a=f.normalizeName(a,
b,d);return{prefix:e,name:a,fullName:e?e+"!"+a:a}};f.nameToUrl=function(a,b,d,c){var e,g,i,j;j=h.contexts[d];d=j.config;a=f.normalizeName(a,c,j);if(a.indexOf(":")!==-1||a.charAt(0)==="/"||f.jsExtRegExp.test(a))a=a+(b?b:"");else{e=d.paths;g=d.packages;c=a.split("/");for(j=c.length;j>0;j--){i=c.slice(0,j).join("/");if(e[i]){c.splice(0,j,e[i]);break}else if(i=g[i]){e=i.location+"/"+i.lib;if(a===i.name)e+="/"+i.main;c.splice(0,j,e);break}}a=c.join("/")+(b||".js");a=(a.charAt(0)==="/"||a.match(/^\w+:/)?
"":d.baseUrl)+a}return d.urlArgs?a+((a.indexOf("?")===-1?"?":"&")+d.urlArgs):a};f.checkLoaded=function(a){var b=h.contexts[a||h.ctxName],d=b.config.waitSeconds*1E3,c=d&&b.startTime+d<(new Date).getTime(),e,g=b.defined,i=b.modifiers,j="",l=false,m=false,k,n=h.plugins.isWaiting,s=h.plugins.orderDeps;if(!b.isCheckLoaded){if(b.config.priorityWait)if(J(b))x(b);else return;b.isCheckLoaded=true;d=b.waiting;e=b.loaded;for(k in e)if(!(k in p)){l=true;if(!e[k])if(c)j+=k+" ";else{m=true;break}}if(!l&&!d.length&&
(!n||!n(b)))b.isCheckLoaded=false;else{if(c&&j){e=new Error("require.js load timeout for modules: "+j);e.requireType="timeout";e.requireModules=j;f.onError(e)}if(m){b.isCheckLoaded=false;if(q||O)setTimeout(function(){f.checkLoaded(a)},50)}else{b.waiting=[];b.loaded={};s&&s(b);for(k in i)k in p||g[k]&&f.execModifiers(k,{},d,b);for(e=0;g=d[e];e++)f.exec(g,{},d,b);b.isCheckLoaded=false;if(b.waiting.length||n&&n(b))f.checkLoaded(a);else if(v.length){e=b.loaded;b=true;for(k in e)if(!(k in p))if(!e[k]){b=
false;break}if(b){h.ctxName=v[0][1];k=v;v=[];for(e=0;b=k[e];e++)f.load.apply(f,b)}}else{h.ctxName="_";h.isDone=true;f.callReady&&f.callReady()}}}}};f.exec=function(a,b,d,c){if(a){var e=a.name,g=a.callback;g=a.deps;var i,j,l=c.defined,m,k=[],n,s=false;if(e){if(b[e]||e in l)return l[e];b[e]=true}if(g)for(i=0;j=g[i];i++){j=j.name;if(j==="require")j=U(c,e);else if(j==="exports"){j=l[e]={};s=true}else if(j==="module"){n=j={id:e,uri:e?f.nameToUrl(e,null,c.contextName):undefined};n.setExports=S(n)}else j=
j in l?l[j]:b[j]?undefined:f.exec(d[d[j]],b,d,c);k.push(j)}if((g=a.callback)&&f.isFunction(g)){m=f.execCb(e,g,k);if(e)if(s&&m===undefined&&(!n||!("exports"in n)))m=l[e];else if(n&&"exports"in n)m=l[e]=n.exports;else{e in l&&!s&&f.onError(new Error(e+" has already been defined"));l[e]=m}}f.execModifiers(e,b,d,c);return m}};f.execCb=function(a,b,d){return b.apply(null,d)};f.execModifiers=function(a,b,d,c){var e=c.modifiers,g=e[a],i,j;if(g){for(j=0;j<g.length;j++){i=g[j];i in d&&f.exec(d[d[i]],b,d,c)}delete e[a]}};
f.onScriptLoad=function(a){var b=a.currentTarget||a.srcElement,d;if(a.type==="load"||V.test(b.readyState)){d=b.getAttribute("data-requirecontext");a=b.getAttribute("data-requiremodule");d=h.contexts[d];f.completeLoad(a,d);b.removeEventListener?b.removeEventListener("load",f.onScriptLoad,false):b.detachEvent("onreadystatechange",f.onScriptLoad)}};f.attach=function(a,b,d,c,e){var g;if(q){c=c||f.onScriptLoad;g=document.createElement("script");g.type=e||"text/javascript";g.charset="utf-8";if(!h.skipAsync[a])g.async=
true;g.setAttribute("data-requirecontext",b);g.setAttribute("data-requiremodule",d);if(g.addEventListener)g.addEventListener("load",c,false);else{Q=true;g.attachEvent("onreadystatechange",c)}g.src=a;G=g;z?h.head.insertBefore(g,z):h.head.appendChild(g);G=null;return g}else if(O){c=h.contexts[b];b=c.loaded;b[d]=false;importScripts(a);f.completeLoad(d,c)}return null};h.baseUrl=r.baseUrl;if(q&&(!h.baseUrl||!h.head)){E=document.getElementsByTagName("script");L=r.baseUrlMatch?r.baseUrlMatch:/(allplugins-)?require\.js(\W|$)/i;
for(o=E.length-1;o>-1&&(y=E[o]);o--){if(!h.head)h.head=y.parentNode;if(!r.deps)if(w=y.getAttribute("data-main"))r.deps=[w];if((w=y.src)&&!h.baseUrl)if(M=w.match(L)){h.baseUrl=w.substring(0,M.index);break}}}f.pageLoaded=function(){if(!h.isPageLoaded){h.isPageLoaded=true;F&&clearInterval(F);if(N)document.readyState="complete";f.callReady()}};f.callReady=function(){var a=h.readyCalls,b,d,c;if(h.isPageLoaded&&h.isDone){if(a.length){h.readyCalls=[];for(b=0;d=a[b];b++)d()}a=h.contexts;for(c in a)if(!(c in
p)){b=a[c];if(b.jQueryIncremented){b.jQuery.readyWait-=1;b.jQueryIncremented=false}}}};f.ready=function(a){h.isPageLoaded&&h.isDone?a():h.readyCalls.push(a);return f};if(q){if(document.addEventListener){document.addEventListener("DOMContentLoaded",f.pageLoaded,false);window.addEventListener("load",f.pageLoaded,false);if(!document.readyState){N=true;document.readyState="loading"}}else if(window.attachEvent){window.attachEvent("onload",f.pageLoaded);if(self===self.top)F=setInterval(function(){try{if(document.body){document.documentElement.doScroll("left");
f.pageLoaded()}}catch(a){}},30)}document.readyState==="complete"&&f.pageLoaded()}f(r);typeof setTimeout!=="undefined"&&setTimeout(function(){var a=h.contexts[r.context||"_"];K(a);x(a)},0)})();

require.def('cell/util/createClass',[],function(){
   return function(cdesc) {
      var extend = cdesc.extend, 
          initializer = cdesc.init,
          initializerFunc = (typeof initializer === 'object')
                               ? function(){return initializer;}
                               : (typeof initializer === 'function')
                                    ? initializer
                                    : doerror('cell/util/createClass(): initializer was not a function or object (property definitions), instead was'+initializer),
          protoInitializer = cdesc.protoInit,
          prototype = Object.create((extend && extend.prototype) || Object.prototype);

      if (protoInitializer){
         try{
            Object.defineProperties(
               prototype, 
               (typeof protoInitializer === 'function')
                  ? protoInitializer.apply(prototype)
                  : (typeof protoInitializer === 'object')
                       ? protoInitializer
                       : (function(){throw 'cell/util/createClass(): protoInitializer was not a function or object (property definitions), instead was'+protoInitializer;})()
            );
         }catch(e){
            console.log('cell/util/createClass():',e);
         }
      }
      
      var construct = function(that, args) {
         if (typeof initializer === 'function'){
            if (typeof extend === 'function' && extend.internalConstruct && typeof extend.internalConstruct === 'function'){
               that.callSuper = function(){
                  var superInstanceProps = extend.internalConstruct.apply(that, [that].concat(arguments));
                  // Prevent multiple calls to super constructor
                  delete that.callSuper;
               };
            }
         }
         var props = initializerFunc.apply(that,args);
         if(props){
            Object.defineProperties(that, props);
         }
         delete that.callSuper;
         return that;
      };
      
      var func = function() {
         return construct(Object.create(prototype),arguments);
      };

      // Allows instanceof to work
      func.prototype = prototype;
      prototype.constructor = func;
      func.internalConstruct = construct;
      return func;
   };
});


require.def('cell/util/Delegator',
   [ 'cell/util/createClass' ],
   function(createClass){
      var __getProp = function(name){
         return this[name];
      };
      return createClass({
         'init':function(delMap){
            var _this = this,
                _delMap = {};
            
            Object.keys(delMap).forEach(function(delName){
               _delMap[delName] = delMap[delName];
               
               // Create proxy getter for delegate
               // to internal delegate map (_delMap)
               Object.defineProperty(_this,delName,{
                  enumerable: true,
                  configurable: false,
                  get: __getProp.bind(_delMap,delName)
               });
            });
            
            delMap = undefined;
            
            return {
              /**
               * Binds a handler to an event.
               * 
               * @param {String} evtype Event Type
               * @param {String=} evdata [OPTIONAL] Additional data 
               *    object to passed to the handler when the event 
               *    fires.
               * @param {function(event)} handler
               */
              'delegate': {'value':function(type,handler){
                 if(typeof type === 'string' 
                       && type in _delMap  
                       && typeof handler === 'function'){
                    _delMap[type] = handler;
                 }
              }}
            };
         }
      });
   }
);

require.def('cell/util/EventSource',
   [ 'cell/util/createClass' ],
   function(createClass){
   
   return createClass({
      'init':function(){
         var handlers = {};
         return {
           /**
            * Binds a handler to an event.
            * 
            * @param {String} evtype Event Type
            * @param {String=} evdata [OPTIONAL] Additional data 
            *    object to passed to the handler when the event 
            *    fires.
            * @param {function(event)} handler
            */
           'on': {'value':function(evtype,handler,evdata,once){
              if(evtype && typeof evtype === 'string' && handler && typeof handler === 'function'){
                 var theHandler = {'handler':handler, 'data':evdata, 'once':(once)?true:false};
                 if(!handlers[evtype]){
                    handlers[evtype] = [theHandler];
                 }else{
                    if( !handlers[evtype].some( function(el){return el.handler === handler;} ) ){
                       handlers[evtype].push(theHandler);
                    }
                 }
              }
           }},
           
           'once': {'value':function(evtype,handler,evdata){
              this.on(evtype,handler,evdata,true);
           }},
           
           /**
            * Triggers an event, invoking handlers of event.
            * 
            * @param {hela.Event} ev Event object
            * @param {Array} extraParams [OPTIONAL] Extra parameters passed to handlers  
            */
           'trigger': {'value':function(ev,extraParams){
              var event = (typeof ev === 'string') 
                             ? {type: ev}
                             : (typeof ev === 'object' && ev.type && typeof ev.type === 'string')
                                   ? ev
                                   : (function(){throw 'cell/util/EventSource.trigger(): event was not a string or object with type field, instead was '+ev;})();
              
              if(handlers[event.type]){
                 var eparams =
                    (extraParams) ? ((extraParams instanceof Array)
                                       ? extraParams
                                       : [extraParams])
                                  : [];
                    
                 handlers[event.type] = handlers[event.type].filter(function(el){
                    var handlerEvent = 
                       (el.data) ? Object.create(event,{'data': {value:el.data} })
                                 : event;
                    try{
                       el.handler.apply(el.handler, [handlerEvent].concat(eparams));
                    }catch(e){
                       console.log("hela.EventEmitter.trigger(): Exception thrown notifying handler("+el+") of event("+event.type+"). Exception="+e);
                    }
                    return !el.handler.once; // remove the once handlers
                 });
              }
           }},
           
           /**
            * Unbinds handler from event type.
            * If no handler is specified, all handlers for event 
            * type are are removed.
            * 
            * @param {String} evtype Event type
            * @param {function(event)} handler [OPTIONAL] Handler to be removed
            */
           'unbind': {'value':function(evtype, handler){
              if(evtype && typeof evtype === 'string'){
                 if(handler && typeof handler === 'function' && handlers[evtype]){
                    handlers[evtype] = handlers[evtype].filter(function(el){
                       return (el.handler !== handler); 
                    });
                 }else{
                    delete handlers[evtype];
                 }
              }
           }}
         };}
   });
});
require.def('cell/util/isHTMLNode', [], function(){
   return function(node){
      return node && (node instanceof HTMLElement || node instanceof HTMLBodyElement || node.nodeType === Node.ELEMENT_NODE);
   };
});require.def('cell/config', 
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
               'styling':    Option('Cell Styling file extension.','cless',__validateString),
               'controller': Option('Cell Presenter (JavaScript) file extension.','cjs',__validateString),
               'template':   Option('Cell Template file extension.','chtml',__validateString)
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
               callback(xhr.responseText, !(xhr.status === 200 || xhr.status === 0));
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
require.def('cell/util/renderCSS',
   [ 'cell/config' ], 
   function(config) {
   return function(cname, styling){
         if(styling){
            var styleTagId = 'cell_'+cname+'_styling';
            
            // CSS hasn't been rendered yet
            if(!document.getElementById(styleTagId)){
               var styleRenderer = config.defaultStyleRenderer.value;
               
               if(styleRenderer !== undefined){
                  styleRenderer(styling,function(css,err){                  
                     // If no errors and a style tag for this cell doesn't already exist 
                     if(!document.getElementById(styleTagId)){
                        if(!err){
                           var st = document.createElement('style');
                           st.id = styleTagId;
                           st.type = 'text/css';
                           
                           // IE special case
                           if (st.styleSheet) {
                              st.styleSheet.cssText = css;
                           } else {
                              var tt1 = document.createTextNode(css);
                              st.appendChild(tt1);
                           }
                           document.getElementsByTagName('head')[0].appendChild(st);
                        }else{
                           console.log('cell.Cell.renderStyling(): error thrown rendering style for "'+cname+'"',err);
                        }
                     }
                  });  
               }else{
                  console.log('cell.Cell.renderStyling(): No Style Renderer for "'+cname+'"');
               }
            }
         }
       };
});require.def('cell/CellInstance',
   [ 'cell/util/createClass',
     'cell/config' ],
   function(createClass,config){
      var passThrough = function(data,cb){cb(data);};
   
      return createClass({
         'init': function(_cell,_instId,_cellDelegates,
                          _targetNode, _replaceNode, _data, _callback){
            var _this = this,
                _mangledName = _cell.name.replace('/','_'),
                _getRenderData = (_cellDelegates && _cellDelegates.getRenderData) || passThrough,
                _templateRenderer = (_cellDelegates && _cellDelegates.templateRenderer) || config.defaultTemplateRenderer.value,
                _container = {
                     node:null,
                     id:(typeof _instId === 'number' && _mangledName+_instId)
                           || (typeof _instId === 'string' && _instId),
                     className:_mangledName
                  };
            
            Object.defineProperties(_this,{
               'cell' : {enumerable:true, get:function(){return _cell;}},
               
               'data' : {enumerable:true, get:function(){return _data;}},
               
               'node' : {enumerable:true, get:function(){return _container.node;}}
            });
            
            _getRenderData(_data,function(newData){
               _data = newData;
               
               _templateRenderer(_cell,_container,_data,function(xhtml){
                  // Attach DOM Node
                  if(_replaceNode){
                     _targetNode.parentNode.replaceChild(_container.node,_targetNode);
                  }else{
                     _targetNode.appendChild(_container.node);
                  }
   
                  try{
                     if(typeof _callback === 'function'){
                        _callback(_this);
                     }
                  }catch(e){
                     console.log(e);
                  }
               });
            });
         }
      });
   }
);
require.def('cell/Cell',
   [ 'cell/util/createClass',
     'cell/util/EventSource',
     'cell/util/Delegator',
     'cell/CellInstance',
     'cell/util/isHTMLNode',
     'cell/util/loadComponents',
     'cell/util/renderCSS',
     'cell/config' ], 
   function(createClass, EventSource, Delegator, CellInstance, isHTMLNode, loadComponents, renderCSS, config){
   var __render = function(cell, ctx, domNodes, replaceNodes, data, cb, id){
          if(!domNodes){
             console.log("cell.Cell.render(): domNodes must be a DOM Node or an Array of DOM nodes");
          }else if(!(domNodes instanceof Array)){
             domNodes = [domNodes];
          }
          
          domNodes.forEach(function(node){
             if(isHTMLNode(node)){
                CellInstance( cell,
                              (typeof id === 'string') ? id : ctx.renderedInstances++,
                              ctx.delegator,
                              node,replaceNodes,data,
                              function(cellInst){
                                 ctx.events.trigger({
                                    type:'render',
                                    node:cellInst.node,
                                    data:cellInst.data,
                                    cell:cellInst
                                 });
                                 try{
                                    if(cb && typeof cb === 'function'){
                                       cb(cellInst);
                                    }
                                 }catch(e){
                                    console.log("cell.Cell.render(): callback(",cb,") threw an error:",e);
                                 }
                              }
                );
             }
          });
       },
       __loadComplete = function(ctx,errors){
          ctx.status = (errors)?'error':'loaded';
         
          if(!errors){
            try{
               // Execute controller's creation code, with:
               //    * an empty ExecutionContext ThisBinding
               //    * free variables: on, delegate
               (new Function('on','delegate',ctx.controllerSrc)).call(
                     ctx.cell,
                     ctx.events.on,
                     ctx.delegator.delegate);
            }catch(e2){
               var theError = new Error("cell.Cell.<init>(): Controller for Cell("+qname+") from url("+u+"), threw error=");
               theError.stack = e2;
               errors.push(theError);
            }finally{
               delete ctx.controllerSrc;
            }
         }
 
          // Log Load Errors
          if(errors){
             errors.forEach(function(err){
                console.log(err);
             });
          }
          
          // Call Load Callback passing reference to Cell and errors 
          try{
             if(typeof ctx.loadCb === 'function'){
               ctx.loadCb(errors);
             }
          }catch(e){
             console.log('cell.Cell.resumeLoad(): error thrown calling Load Callback for "'+ctx.cell.name+'" Cell',e);
          }
          delete ctx.loadCb;
          
          // Render template if there were requests while loading Cell  
          if(ctx.cell.template){
             
             // Render styling
             if(ctx.cell.styling){
                renderCSS(ctx.cell.name, ctx.cell.styling);
             }
             
             ctx.renderRequests.forEach(function(req){
                try{
                   __render(ctx.cell,
                            ctx,
                            req.domNodes, 
                            req.replaceNodes,
                            req.data,
                            req.cb,
                            req.id);
                }catch(e){
                   console.log('cell.Cell.resumeLoad(): error thrown rendering "'+ctx.cell.name+'" Cell',req,e.stack);
                }
             });
             
             delete ctx.renderRequests;
          }
          
       };
       
   return createClass({
      'init': function(qname, loadCb){
         var _this = this,
             _template, _styling,
             _loadCbs = loadCb ? [loadCb] : [],
             _loadCbFun = function(errors){
                   _loadCbs.forEach(function(cb){
                      try{
                         cb(_this,errors);
                      }catch(e){
                         console.log(e);
                      }
                   });
               },
             _ctx = {
                   cell:_this,
                   renderedInstances: 0,
                   controllerSrc : null,
                   status: 'loading',
                   events: EventSource(),
                   delegator: Delegator({
                      // Let CellInstance default the value.
                      // (should use cell/config.defaultTemplateRenderer)
                      'templateRenderer' : undefined,
                      'getRenderData': function(data,returns){ returns(data); }
                   }),
                   
                   // Temporary, will be removed during load
                   renderRequests: [],
                   loadCb: _loadCbFun
                };
         
         loadCb = undefined;
         
         loadComponents(
            qname,
            // Load Controller
            function(r,u){ _ctx.controllerSrc = r; },
            // Load Template
            function(r,u){ _template = r; },
            // Load Styling
            function(r,u){ _styling = r; },
            // Load Complete
            __loadComplete.bind(_this,_ctx)
         );
         
         
         return {
            'addLoadCallback': {value: function(cb){
                _loadCbs.push(cb);
             }},
            'name'      : {enumerable:true, get:function(){return qname;}},

            'status'    : {enumerable:true, get:function(){return _ctx.status;}},
            
            'template'  : {enumerable:true, get:function(){return _template;}},

            'styling'   : {enumerable:true, get:function(){return _styling;}},
            
            'render'    : {value:function(domNodes, replaceNodes, data, cb, id){
               if(_ctx.status === 'loaded' && _ctx.renderRequests === undefined){
                  __render(_this, _ctx, domNodes, replaceNodes, data, cb, id);
               }else{
                  _ctx.renderRequests.push({
                     'domNodes': domNodes,
                     'replaceNodes' : replaceNodes,
                     'data' : data,
                     'cb' : cb,
                     'id' : id
                  });
               }
            }}
         };
      }
   });
});
require.def('cell/cell-require-plugin',
   ['cell/Cell'], 
   function(Cell){
      var _this = {
            prefix : "cell",
   
            /**
             * This callback is prefix-specific, only gets called for this
             * prefix
             */
            require : function(name, deps, callback, context) {
               // No-op, require never gets these text items, they are always
               // a dependency, see load for the action.
            },
   
            /**
             * Called when a new context is defined. Use this to store
             * context-specific info on it.
             */
            newContext : function(context) {
               require.mixin(context, {
                  cells : {},
                  cellsWaiting : []
               });
            },
   
            /**
             * Called when a dependency needs to be loaded.
             */
            load : function(name, contextName, cellLoadCallback) {
               var context = require.s.contexts[contextName];

               // If cell has already been loaded
               if(context.cells[name] !== undefined){
                  context.defined[name] = context.cells[name];
                  
               // ... if not
               }else if(context.cellsWaiting[name] === undefined){
                  context.loaded[name] = false;

                  var newCell = Cell(name, function(newCell,err){
                     context.cells[name] = newCell;
                     context.loaded[name] = true;
                     require.checkLoaded(contextName);
                  });

                  context.cellsWaiting[name] 
                     = context.cellsWaiting[context.cellsWaiting.push(name) - 1];
               }
            },
   
            /**
             * Called when the dependencies of a module are checked.
             */
            checkDeps : function(name, deps, context) {
               require(deps.map(function(d){return d.fullName;}), function(){}, context.contextName);
            },
   
            /**
             * Called to determine if a module is waiting to load.
             */
            isWaiting : function(context) {
               return !!context.cellsWaiting.length;
            },
   
            /**
             * Called when all modules have been loaded.
             */
            orderDeps : function(context) {
               // Clear up state since further processing could
               // add more things to fetch.
               var i = 0, dep, tWaitAry = context.cellsWaiting;
               context.cellsWaiting = [];
               while(dep = tWaitAry[i++]){
                  context.defined[dep] = context.cells[dep];
               }
            }
         };
      require.plugin(_this);
      return {};
   }
);

var cell;
require.def('cell',['cell/cell-require-plugin','cell/config'], function(cellReqPlug,config,undefined){

   var isString = function(v){return typeof v === 'string';},
       appendPrefix = function(c){return 'cell!'+c;};

   cell = function(cellName,cellLoadCallback){
            if(cellLoadCallback && typeof cellLoadCallback === 'function'){
               var cellsToLoad = (cellName instanceof Array && cellName) || [cellName];

               if(cellsToLoad.length > 0){
                  if(!cellsToLoad.every(isString)){
                     throw new Error('cell(): only accepts cell name or array of cell names');
                  }

                  cellsToLoad = cellsToLoad.map(appendPrefix);
                  require(cellsToLoad,cellLoadCallback);
               }
            }else{
               throw new Error('cell(cell name | [cell names], callback function)');
            }
   }
   Object.defineProperty(cell,'configure',{
      enumerable: true,
      value: config.configure
   });
   return cell;
});

