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
              this.bind(evtype,handler,evdata,true);
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
                loadCb: (typeof loadCb === 'function')?loadCb.bind(undefined,_this):undefined
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
                  return context.defined[name] = context.cells[name];
                  
               // ... if not
               }else if(context.cellsWaiting[name] === undefined){
                  context.loaded[name] = false;
                  var newCell = Cell(name, function(c,err){
                     if(typeof cellLoadCallback === 'function'){
                        try{ cellLoadCallback(c,err); }
                        catch(e){}
                     }
                     context.cells[name] = newCell;
                     context.loaded[name] = true;
                     delete context.cellsWaiting[name];
                     require.checkLoaded(contextName);
                  });
                  context.cellsWaiting[name] 
                     = context.cellsWaiting[context.cellsWaiting.push(newCell) - 1];
                  
                  return newCell;
               }
               return context.cellsWaiting[name];
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
                  context.defined[dep.name] = dep;
               }
            }
         };
   
      require.plugin(_this);
      
      var throwError = function(msg){
         throw new Error(msg);
      };
      var isString = function(v){return typeof v === 'string';};
      var __exports = {};
      
      Object.defineProperty(__exports,'load',{
         value:function(cellName,cellLoadCallback){
            if(cellLoadCallback && typeof cellLoadCallback === 'function'){
               var cellsToLoad = (cellName instanceof Array && cellName) || [cellName];

               if(cellsToLoad.length > 0){
                  if(!cellsToLoad.every(isString)){
                     throwError('cell/cell-require-plugin.load(): only accepts string or array of cell names');
                  }
                  var cellsToLoadMap = cellsToLoad.reduce(function(r,c,i){r[c]=i; return r;},{}),
                      loadedCount = 0,
                      loadedCells = [],
                      loadCb = function(dep,e){
                           if(loadedCells !== null){
                              if(e){
                                 loadedCells = null;
                              }else{
                                 var index = cellsToLoadMap[dep.name];
                                 if(index !== undefined && !loadedCells[index]){
                                    loadedCells[index] = dep;
                                    if(++loadedCount == cellsToLoad.length){
                                       var cbArgs = loadedCells;
                                       loadedCells = null;
                                       cellLoadCallback.apply(null,cbArgs);
                                    }
                                 }
                              }
                           }
                        };
                  cellsToLoad.forEach(function(cellName){
                     _this.load(cellName, require.s.ctxName,loadCb);
                  });
               }
            }
         }
      });
      return __exports;
   }
);

var cell;
require.def('cell',['cell/cell-require-plugin','cell/config'], function(cellReqPlug,config,undefined){
   cell = function(cellName,loadCallback){
      if(cellName !== undefined  || cellName.length > 0){
         return cellReqPlug.load(cellName,loadCallback);
      }
      throw 'cell(): must supply a Cell Name';
   }
   Object.defineProperty(cell,'configure',{
      enumerable: true,
      value: config.configure
   });
   return cell;
});

/*
  mustache.js — Logic-less templates in JavaScript

  See http://mustache.github.com/ for more info.
*/

var Mustache = function() {
  var Renderer = function() {};

  Renderer.prototype = {
    otag: "{{",
    ctag: "}}",
    pragmas: {},
    buffer: [],
    pragmas_implemented: {
      "IMPLICIT-ITERATOR": true
    },
    context: {},

    render: function(template, context, partials, in_recursion) {
      // reset buffer & set context
      if(!in_recursion) {
        this.context = context;
        this.buffer = []; // TODO: make this non-lazy
      }

      // fail fast
      if(!this.includes("", template)) {
        if(in_recursion) {
          return template;
        } else {
          this.send(template);
          return;
        }
      }

      template = this.render_pragmas(template);
      var html = this.render_section(template, context, partials);
      if(in_recursion) {
        return this.render_tags(html, context, partials, in_recursion);
      }

      this.render_tags(html, context, partials, in_recursion);
    },

    /*
      Sends parsed lines
    */
    send: function(line) {
      if(line != "") {
        this.buffer.push(line);
      }
    },

    /*
      Looks for %PRAGMAS
    */
    render_pragmas: function(template) {
      // no pragmas
      if(!this.includes("%", template)) {
        return template;
      }

      var that = this;
      var regex = new RegExp(this.otag + "%([\\w-]+) ?([\\w]+=[\\w]+)?" +
            this.ctag);
      return template.replace(regex, function(match, pragma, options) {
        if(!that.pragmas_implemented[pragma]) {
          throw({message: 
            "This implementation of mustache doesn't understand the '" +
            pragma + "' pragma"});
        }
        that.pragmas[pragma] = {};
        if(options) {
          var opts = options.split("=");
          that.pragmas[pragma][opts[0]] = opts[1];
        }
        return "";
        // ignore unknown pragmas silently
      });
    },

    hela_partialNameRestRegex: (new RegExp('^([A-z][A-z0-9_-]*)[ ]*([\'"].*)?')),
    
    /*
      Tries to find a partial in the curent scope and render it
    */
    /*CELL MODIFIED BEGIN*/
    render_partial: function(name, context, partials) {
      name = this.trim(name);
      var c = context[name];
      var id = undefined;
      
      var results = (this.hela_partialNameRestRegex.exec(name) || name).slice(1);
      name = results[0];      
      if(results.length>1 && results[1]){
         var jsonObj = JSON.parse('{'+results[1]+'}');
         
         id = (typeof jsonObj.id === 'string'
                  && jsonObj.id);
         
         c =(typeof jsonObj.data === 'string'
               && (c = context[jsonObj.data] || {}))
               || jsonObj;
      }
      
      var p = partials.getPartial(name,c,id);
      if(!p) {
        throw({message: "unknown_partial '" + name + "'"});
      }
      if(typeof(c) != "object") {
        return this.render(p, context, partials, true);
      }
      return this.render(p, c, partials, true);
    },
    /*CELL MODIFIED END*/

    /*
      Renders inverted (^) and normal (#) sections
    */
    render_section: function(template, context, partials) {
      if(!this.includes("#", template) && !this.includes("^", template)) {
        return template;
      }

      var that = this;
      // CSW - Added "+?" so it finds the tighest bound, not the widest
      var regex = new RegExp(this.otag + "(\\^|\\#)\\s*(.+)\\s*" + this.ctag +
              "\n*([\\s\\S]+?)" + this.otag + "\\/\\s*\\2\\s*" + this.ctag +
              "\\s*", "mg");

      // for each {{#foo}}{{/foo}} section do...
      return template.replace(regex, function(match, type, name, content) {
        var value = that.find(name, context);
        if(type == "^") { // inverted section
          if(!value || that.is_array(value) && value.length === 0) {
            // false or empty list, render it
            return that.render(content, context, partials, true);
          } else {
            return "";
          }
        } else if(type == "#") { // normal section
          if(that.is_array(value)) { // Enumerable, Let's loop!
            return that.map(value, function(row) {
              return that.render(content, that.create_context(row),
                partials, true);
            }).join("");
          } else if(that.is_object(value)) { // Object, Use it as subcontext!
            return that.render(content, that.create_context(value),
              partials, true);
          } else if(typeof value === "function") {
            // higher order section
            return value.call(context, content, function(text) {
              return that.render(text, context, partials, true);
            });
          } else if(value) { // boolean section
            return that.render(content, context, partials, true);
          } else {
            return "";
          }
        }
      });
    },

    /*
      Replace {{foo}} and friends with values from our view
    */
    render_tags: function(template, context, partials, in_recursion) {
      // tit for tat
      var that = this;

      var new_regex = function() {
        return new RegExp(that.otag + "(=|!|>|\\{|%)?([^\\/#\\^]+?)\\1?" +
          that.ctag + "+", "g");
      };

      var regex = new_regex();
      var tag_replace_callback = function(match, operator, name) {
        switch(operator) {
        case "!": // ignore comments
          return "";
        case "=": // set new delimiters, rebuild the replace regexp
          that.set_delimiters(name);
          regex = new_regex();
          return "";
        case ">": // render partial
          return that.render_partial(name, context, partials);
        case "{": // the triple mustache is unescaped
          return that.find(name, context);
        default: // escape the value
          return that.escape(that.find(name, context));
        }
      };
      var lines = template.split("\n");
      for(var i = 0; i < lines.length; i++) {
        lines[i] = lines[i].replace(regex, tag_replace_callback, this);
        if(!in_recursion) {
          this.send(lines[i]);
        }
      }

      if(in_recursion) {
        return lines.join("\n");
      }
    },

    set_delimiters: function(delimiters) {
      var dels = delimiters.split(" ");
      this.otag = this.escape_regex(dels[0]);
      this.ctag = this.escape_regex(dels[1]);
    },

    escape_regex: function(text) {
      // thank you Simon Willison
      if(!arguments.callee.sRE) {
        var specials = [
          '/', '.', '*', '+', '?', '|',
          '(', ')', '[', ']', '{', '}', '\\'
        ];
        arguments.callee.sRE = new RegExp(
          '(\\' + specials.join('|\\') + ')', 'g'
        );
      }
      return text.replace(arguments.callee.sRE, '\\$1');
    },

    /*
      find `name` in current `context`. That is find me a value
      from the view object
    */
    find: function(name, context) {
      name = this.trim(name);

      // Checks whether a value is thruthy or false or 0
      function is_kinda_truthy(bool) {
        return bool === false || bool === 0 || bool;
      }

      var value;
      if(is_kinda_truthy(context[name])) {
        value = context[name];
      } else if(is_kinda_truthy(this.context[name])) {
        value = this.context[name];
      }

      if(typeof value === "function") {
        return value.apply(context);
      }
      if(value !== undefined) {
        return value;
      }
      // silently ignore unkown variables
      return "";
    },

    // Utility methods

    /* includes tag */
    includes: function(needle, haystack) {
      return haystack.indexOf(this.otag + needle) != -1;
    },

    /*
      Does away with nasty characters
    */
    escape: function(s) {
      s = String(s === null ? "" : s);
      return s.replace(/&(?!\w+;)|["<>\\]/g, function(s) {
        switch(s) {
        case "&": return "&amp;";
        case "\\": return "\\\\";
        case '"': return '\"';
        case "<": return "&lt;";
        case ">": return "&gt;";
        default: return s;
        }
      });
    },

    // by @langalex, support for arrays of strings
    create_context: function(_context) {
      if(this.is_object(_context)) {
        return _context;
      } else {
        var iterator = ".";
        if(this.pragmas["IMPLICIT-ITERATOR"]) {
          iterator = this.pragmas["IMPLICIT-ITERATOR"].iterator;
        }
        var ctx = {};
        ctx[iterator] = _context;
        return ctx;
      }
    },

    is_object: function(a) {
      return a && typeof a == "object";
    },

    is_array: function(a) {
      return Object.prototype.toString.call(a) === '[object Array]';
    },

    /*
      Gets rid of leading and trailing whitespace
    */
    trim: function(s) {
      return s.replace(/^\s*|\s*$/g, "");
    },

    /*
      Why, why, why? Because IE. Cry, cry cry.
    */
    map: function(array, fn) {
      if (typeof array.map == "function") {
        return array.map(fn);
      } else {
        var r = [];
        var l = array.length;
        for(var i = 0; i < l; i++) {
          r.push(fn(array[i]));
        }
        return r;
      }
    }
  };

  return({
    name: "mustache.js",
    version: "0.3.0-dev",

    /*
      Turns a template and view into HTML
    */
    to_html: function(template, view, partials, send_fun) {
      var renderer = new Renderer();
      if(send_fun) {
        renderer.send = send_fun;
      }
      renderer.render(template, view, partials);
      if(!send_fun) {
        return renderer.buffer.join("\n");
      }
    }
  });
}();
require.def('cell/integration/templating/mustache-template-renderer',
   ['cell/config'],
   function(config){
   var __absURLRegex = /^([A-z][A-z0-9+-.]:)|[\/]/,
       __pkgRegex = /(.*)\/.+/;
       __domParser = new DOMParser(),
       __xmlSerializer = new XMLSerializer(),
       __tmpNodeID = 0;
       __renderer = function(cell,container,data,attachCallback){
         var nested = [],
             renderedCompSrc
                =  Mustache.to_html(
                      cell.template,   
                      data,
                         
                      // Get nested cells to render
                      { 'getPartial': function(cname, ndata, id){
                            
                            // Because the nested cell may need to be loaded,
                            // render an invisible tmp DOM Node (div) to be replaced
                            // when the nested cell has been loaded.
                            var tmpNodeID = 'cellTmpNode' + __tmpNodeID++; 
                            
                            // Load nested cell
                            require(['cell!'+cname],function(NewCell){
                               if(container.node){
                                  var tmpNode = container.node.querySelectorAll('#'+tmpNodeID);
                                  
                                  // Outer cell was already been rendered
                                  if(tmpNode.length == 1){
                                     NewCell.render(tmpNode[0],true,ndata,undefined, id);
                                     
                                  // Outer cell has NOT been rendered yet,
                                  // add it to the list (nested) of cells 
                                  // to render afterwards 
                                  }else if(nested !== undefined){
                                     nested.push({cell:NewCell,data:ndata,tmpNodeID:tmpNodeID,id:id});
                                  }
                               }
                            });
                            
                            // HTML Source for tmp DOM Node 
                            return '<div id="'+tmpNodeID+'" style="display:none"> </div>';                
                      }});
         
 
         // Make sure src url's are all relative to the component resource base url
         var templateRoot = (config.resourceBasePaths.template.value || config.resourceBasePaths.all.value),
             tmpNode = document.createElement('div'),
             doc = __domParser.parseFromString(
                  '<div id="'+container.id+'" class="'+container.className+'">'+renderedCompSrc+'</div>',"text/xml"
               ),
             cellPkg = __pkgRegex.exec(cell.name);

         if(cellPkg){
            templateRoot+='/'+cellPkg[1];
         }
         
         Array.prototype.slice.call(doc.querySelectorAll('[src]')).forEach(function(node){
            var srcAttr = node.getAttribute('src');
            if(!__absURLRegex.test(srcAttr)){
               node.setAttribute('src',templateRoot+'/'+srcAttr);
            }
         });
         
         tmpNode.innerHTML = __xmlSerializer.serializeToString(doc);
         
         container.node = tmpNode.childNodes[0];

         // Tell Cell to attach the container to the document  
         attachCallback();
         
         delete tmpNode;
         
         // Render any nested cells
         nested.forEach(function(nc){
            nc.cell.render(container.node.querySelector('#'+nc.tmpNodeID),true,nc.data,nc.id);
         });
         nested = undefined;
      };
      
      return __renderer;
   }
);

// Attach renderer as default template renderer
require(['cell/config','cell/integration/templating/mustache-template-renderer'],function(config,mtr){
   config.defaultTemplateRenderer.value = mtr;
});
//
// LESS - Leaner CSS v1.0.36
// http://lesscss.org
// 
// Copyright (c) 2010, Alexis Sellier
// Licensed under the Apache 2.0 License.
//
(function (window, undefined) {
//
// Stub out `require` in the browser
//
function require(arg) {
    return window.less[arg.split('/')[1]];
};


// ecma-5.js
//
// -- kriskowal Kris Kowal Copyright (C) 2009-2010 MIT License
// -- tlrobinson Tom Robinson
// dantman Daniel Friesen

//
// Array
//
if (!Array.isArray) {
    Array.isArray = function(obj) {
        return Object.prototype.toString.call(obj) === "[object Array]" ||
               (obj instanceof Array);
    };
}
if (!Array.prototype.forEach) {
    Array.prototype.forEach =  function(block, thisObject) {
        var len = this.length >>> 0;
        for (var i = 0; i < len; i++) {
            if (i in this) {
                block.call(thisObject, this[i], i, this);
            }
        }
    };
}
if (!Array.prototype.map) {
    Array.prototype.map = function(fun /*, thisp*/) {
        var len = this.length >>> 0;
        var res = new Array(len);
        var thisp = arguments[1];

        for (var i = 0; i < len; i++) {
            if (i in this) {
                res[i] = fun.call(thisp, this[i], i, this);
            }
        }
        return res;
    };
}
if (!Array.prototype.filter) {
    Array.prototype.filter = function (block /*, thisp */) {
        var values = [];
        var thisp = arguments[1];
        for (var i = 0; i < this.length; i++) {
            if (block.call(thisp, this[i])) {
                values.push(this[i]);
            }
        }
        return values;
    };
}
if (!Array.prototype.reduce) {
    Array.prototype.reduce = function(fun /*, initial*/) {
        var len = this.length >>> 0;
        var i = 0;

        // no value to return if no initial value and an empty array
        if (len === 0 && arguments.length === 1) throw new TypeError();

        if (arguments.length >= 2) {
            var rv = arguments[1];
        } else {
            do {
                if (i in this) {
                    rv = this[i++];
                    break;
                }
                // if array contains no values, no initial value to return
                if (++i >= len) throw new TypeError();
            } while (true);
        }
        for (; i < len; i++) {
            if (i in this) {
                rv = fun.call(null, rv, this[i], i, this);
            }
        }
        return rv;
    };
}
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (value /*, fromIndex */ ) {
        var length = this.length;
        var i = arguments[1] || 0;

        if (!length)     return -1;
        if (i >= length) return -1;
        if (i < 0)       i += length;

        for (; i < length; i++) {
            if (!Object.prototype.hasOwnProperty.call(this, i)) { continue }
            if (value === this[i]) return i;
        }
        return -1;
    };
}

//
// Object
//
if (!Object.keys) {
    Object.keys = function (object) {
        var keys = [];
        for (var name in object) {
            if (Object.prototype.hasOwnProperty.call(object, name)) {
                keys.push(name);
            }
        }
        return keys;
    };
}

//
// String
//
if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return String(this).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };
}
var less, tree;

if (typeof(window) === 'undefined') {
    less = exports,
    tree = require('less/tree');
} else {
    if (typeof(window.less) === 'undefined') { window.less = {} }
    less = window.less,
    tree = window.less.tree = {};
}
//
// less.js - parser
//
//    A relatively straight-forward predictive parser.
//    There is no tokenization/lexing stage, the input is parsed
//    in one sweep.
//
//    To make the parser fast enough to run in the browser, several
//    optimization had to be made:
//
//    - Matching and slicing on a huge input is often cause of slowdowns.
//      The solution is to chunkify the input into smaller strings.
//      The chunks are stored in the `chunks` var,
//      `j` holds the current chunk index, and `current` holds
//      the index of the current chunk in relation to `input`.
//      This gives us an almost 4x speed-up.
//
//    - In many cases, we don't need to match individual tokens;
//      for example, if a value doesn't hold any variables, operations
//      or dynamic references, the parser can effectively 'skip' it,
//      treating it as a literal.
//      An example would be '1px solid #000' - which evaluates to itself,
//      we don't need to know what the individual components are.
//      The drawback, of course is that you don't get the benefits of
//      syntax-checking on the CSS. This gives us a 50% speed-up in the parser,
//      and a smaller speed-up in the code-gen.
//
//
//    Token matching is done with the `$` function, which either takes
//    a terminal string or regexp, or a non-terminal function to call.
//    It also takes care of moving all the indices forwards.
//
//
less.Parser = function Parser(env) {
    var input,       // LeSS input string
        i,           // current index in `input`
        j,           // current chunk
        temp,        // temporarily holds a chunk's state, for backtracking
        memo,        // temporarily holds `i`, when backtracking
        furthest,    // furthest index the parser has gone to
        chunks,      // chunkified input
        current,     // index of current chunk, in `input`
        parser;

    var that = this;

    // This function is called after all files
    // have been imported through `@import`.
    var finish = function () {};

    var imports = this.imports = {
        paths: env && env.paths || [],  // Search paths, when importing
        queue: [],                      // Files which haven't been imported yet
        files: {},                      // Holds the imported parse trees
        push: function (path, callback) {
            var that = this;
            this.queue.push(path);

            //
            // Import a file asynchronously
            //
            less.Parser.importer(path, this.paths, function (root) {
                that.queue.splice(that.queue.indexOf(path), 1); // Remove the path from the queue
                that.files[path] = root;                        // Store the root

                callback(root);

                if (that.queue.length === 0) { finish() }       // Call `finish` if we're done importing
            });
        }
    };

    function save()    { temp = chunks[j], memo = i, current = i }
    function restore() { chunks[j] = temp, i = memo, current = i }

    function sync() {
        if (i > current) {
            chunks[j] = chunks[j].slice(i - current);
            current = i;
        }
    }
    //
    // Parse from a token, regexp or string, and move forward if match
    //
    function $(tok) {
        var match, args, length, c, index, endIndex, k;

        //
        // Non-terminal
        //
        if (tok instanceof Function) {
            return tok.call(parser.parsers);
        //
        // Terminal
        //
        //     Either match a single character in the input,
        //     or match a regexp in the current chunk (chunk[j]).
        //
        } else if (typeof(tok) === 'string') {
            match = input.charAt(i) === tok ? tok : null;
            length = 1;
            sync ();

        //  1. We move to the next chunk, if necessary.
        //  2. Set the `lastIndex` to be relative
        //     to the current chunk, and try to match in it.
        //  3. Make sure we matched at `index`. Because we use
        //     the /g flag, the match could be anywhere in the
        //     chunk. We have to make sure it's at our previous
        //     index, which we stored in [2].
        //
        } else {
            sync ();

            if (match = tok.exec(chunks[j])) { // 3.
                length = match[0].length;
            } else {
                return null;
            }
        }

        // The match is confirmed, add the match length to `i`,
        // and consume any extra white-space characters (' ' || '\n')
        // which come after that. The reason for this is that LeSS's
        // grammar is mostly white-space insensitive.
        //
        if (match) {
            mem = i += length;
            endIndex = i + chunks[j].length - length;

            while (i < endIndex) {
                c = input.charCodeAt(i);
                if (! (c === 32 || c === 10 || c === 9)) { break }
                i++;
            }
            chunks[j] = chunks[j].slice(length + (i - mem));
            current = i;

            if (chunks[j].length === 0 && j < chunks.length - 1) { j++ }

            if(typeof(match) === 'string') {
                return match;
            } else {
                return match.length === 1 ? match[0] : match;
            }
        }
    }

    // Same as $(), but don't change the state of the parser,
    // just return the match.
    function peek(tok) {
        if (typeof(tok) === 'string') {
            return input.charAt(i) === tok;
        } else {
            if (tok.test(chunks[j])) {
                return true;
            } else {
                return false;
            }
        }
    }

    this.env = env = env || {};

    // The optimization level dictates the thoroughness of the parser,
    // the lower the number, the less nodes it will create in the tree.
    // This could matter for debugging, or if you want to access
    // the individual nodes in the tree.
    this.optimization = ('optimization' in this.env) ? this.env.optimization : 1;

    this.env.filename = this.env.filename || null;

    //
    // The Parser
    //
    return parser = {

        imports: imports,
        //
        // Parse an input string into an abstract syntax tree,
        // call `callback` when done.
        //
        parse: function (str, callback) {
            var root, start, end, zone, line, lines, buff = [], c, error = null;

            i = j = current = furthest = 0;
            chunks = [];
            input = str.replace(/\r\n/g, '\n');

            // Split the input into chunks.
            chunks = (function (chunks) {
                var j = 0,
                    skip = /[^"'`\{\}\/]+/g,
                    comment = /\/\*(?:[^*]|\*+[^\/*])*\*+\/|\/\/.*/g,
                    level = 0,
                    match,
                    chunk = chunks[0],
                    inString;

                for (var i = 0, c, cc; i < input.length; i++) {
                    skip.lastIndex = i;
                    if (match = skip.exec(input)) {
                        if (match.index === i) {
                            i += match[0].length;
                            chunk.push(match[0]);
                        }
                    }
                    c = input.charAt(i);
                    comment.lastIndex = i;

                    if (!inString && c === '/') {
                        cc = input.charAt(i + 1);
                        if (cc === '/' || cc === '*') {
                            if (match = comment.exec(input)) {
                                if (match.index === i) {
                                    i += match[0].length;
                                    chunk.push(match[0]);
                                    c = input.charAt(i);
                                }
                            }
                        }
                    }

                    if        (c === '{' && !inString) { level ++;
                        chunk.push(c);
                    } else if (c === '}' && !inString) { level --;
                        chunk.push(c);
                        chunks[++j] = chunk = [];
                    } else {
                        if (c === '"' || c === "'" || c === '`') {
                            if (! inString) {
                                inString = c;
                            } else {
                                inString = inString === c ? false : inString;
                            }
                        }
                        chunk.push(c);
                    }
                }
                if (level > 0) {
                    throw {
                        type: 'Syntax',
                        message: "Missing closing `}`",
                        filename: env.filename
                    };
                }

                return chunks.map(function (c) { return c.join('') });;
            })([[]]);

            // Start with the primary rule.
            // The whole syntax tree is held under a Ruleset node,
            // with the `root` property set to true, so no `{}` are
            // output. The callback is called when the input is parsed.
            root = new(tree.Ruleset)([], $(this.parsers.primary));
            root.root = true;

            root.toCSS = (function (evaluate) {
                var line, lines, column;

                return function (options, variables) {
                    var frames = [];

                    options = options || {};
                    //
                    // Allows setting variables with a hash, so:
                    //
                    //   `{ color: new(tree.Color)('#f01') }` will become:
                    //
                    //   new(tree.Rule)('@color',
                    //     new(tree.Value)([
                    //       new(tree.Expression)([
                    //         new(tree.Color)('#f01')
                    //       ])
                    //     ])
                    //   )
                    //
                    if (typeof(variables) === 'object' && !Array.isArray(variables)) {
                        variables = Object.keys(variables).map(function (k) {
                            var value = variables[k];

                            if (! (value instanceof tree.Value)) {
                                if (! (value instanceof tree.Expression)) {
                                    value = new(tree.Expression)([value]);
                                }
                                value = new(tree.Value)([value]);
                            }
                            return new(tree.Rule)('@' + k, value, false, 0);
                        });
                        frames = [new(tree.Ruleset)(null, variables)];
                    }

                    try {
                        var css = evaluate.call(this, { frames: frames })
                                          .toCSS([], { compress: options.compress || false });
                    } catch (e) {
                        lines = input.split('\n');
                        line = getLine(e.index);

                        for (var n = e.index, column = -1;
                                 n >= 0 && input.charAt(n) !== '\n';
                                 n--) { column++ }

                        throw {
                            type: e.type,
                            message: e.message,
                            filename: env.filename,
                            index: e.index,
                            line: typeof(line) === 'number' ? line + 1 : null,
                            callLine: e.call && (getLine(e.call) + 1),
                            callExtract: lines[getLine(e.call)],
                            stack: e.stack,
                            column: column,
                            extract: [
                                lines[line - 1],
                                lines[line],
                                lines[line + 1]
                            ]
                        };
                    }
                    if (options.compress) {
                        return css.replace(/(\s)+/g, "$1");
                    } else {
                        return css;
                    }

                    function getLine(index) {
                        return index ? (input.slice(0, index).match(/\n/g) || "").length : null;
                    }
                };
            })(root.eval);

            // If `i` is smaller than the `input.length - 1`,
            // it means the parser wasn't able to parse the whole
            // string, so we've got a parsing error.
            //
            // We try to extract a \n delimited string,
            // showing the line where the parse error occured.
            // We split it up into two parts (the part which parsed,
            // and the part which didn't), so we can color them differently.
            if (i < input.length - 1) {
                i = furthest;
                lines = input.split('\n');
                line = (input.slice(0, i).match(/\n/g) || "").length + 1;

                for (var n = i, column = -1; n >= 0 && input.charAt(n) !== '\n'; n--) { column++ }

                error = {
                    name: "ParseError",
                    message: "Syntax Error on line " + line,
                    filename: env.filename,
                    line: line,
                    column: column,
                    extract: [
                        lines[line - 2],
                        lines[line - 1],
                        lines[line]
                    ]
                };
            }

            if (this.imports.queue.length > 0) {
                finish = function () { callback(error, root) };
            } else {
                callback(error, root);
            }
        },

        //
        // Here in, the parsing rules/functions
        //
        // The basic structure of the syntax tree generated is as follows:
        //
        //   Ruleset ->  Rule -> Value -> Expression -> Entity
        //
        // Here's some LESS code:
        //
        //    .class {
        //      color: #fff;
        //      border: 1px solid #000;
        //      width: @w + 4px;
        //      > .child {...}
        //    }
        //
        // And here's what the parse tree might look like:
        //
        //     Ruleset (Selector '.class', [
        //         Rule ("color",  Value ([Expression [Color #fff]]))
        //         Rule ("border", Value ([Expression [Dimension 1px][Keyword "solid"][Color #000]]))
        //         Rule ("width",  Value ([Expression [Operation "+" [Variable "@w"][Dimension 4px]]]))
        //         Ruleset (Selector [Element '>', '.child'], [...])
        //     ])
        //
        //  In general, most rules will try to parse a token with the `$()` function, and if the return
        //  value is truly, will return a new node, of the relevant type. Sometimes, we need to check
        //  first, before parsing, that's when we use `peek()`.
        //
        parsers: {
            //
            // The `primary` rule is the *entry* and *exit* point of the parser.
            // The rules here can appear at any level of the parse tree.
            //
            // The recursive nature of the grammar is an interplay between the `block`
            // rule, which represents `{ ... }`, the `ruleset` rule, and this `primary` rule,
            // as represented by this simplified grammar:
            //
            //     primary  →  (ruleset | rule)+
            //     ruleset  →  selector+ block
            //     block    →  '{' primary '}'
            //
            // Only at one point is the primary rule not called from the
            // block rule: at the root level.
            //
            primary: function () {
                var node, root = [];

                while ((node = $(this.mixin.definition) || $(this.rule)    ||  $(this.ruleset) ||
                               $(this.mixin.call)       || $(this.comment) ||  $(this.directive))
                               || $(/^[\s\n]+/)) {
                    node && root.push(node);
                }
                return root;
            },

            // We create a Comment node for CSS comments `/* */`,
            // but keep the LeSS comments `//` silent, by just skipping
            // over them.
            comment: function () {
                var comment;

                if (input.charAt(i) !== '/') return;

                if (input.charAt(i + 1) === '/') {
                    return new(tree.Comment)($(/^\/\/.*/), true);
                } else if (comment = $(/^\/\*(?:[^*]|\*+[^\/*])*\*+\/\n?/)) {
                    return new(tree.Comment)(comment);
                }
            },

            //
            // Entities are tokens which can be found inside an Expression
            //
            entities: {
                //
                // A string, which supports escaping " and '
                //
                //     "milky way" 'he\'s the one!'
                //
                quoted: function () {
                    var str;
                    if (input.charAt(i) !== '"' && input.charAt(i) !== "'") return;

                    if (str = $(/^"((?:[^"\\\r\n]|\\.)*)"|'((?:[^'\\\r\n]|\\.)*)'/)) {
                        return new(tree.Quoted)(str[0], str[1] || str[2]);
                    }
                },

                //
                // A catch-all word, such as:
                //
                //     black border-collapse
                //
                keyword: function () {
                    var k;
                    if (k = $(/^[A-Za-z-]+/)) { return new(tree.Keyword)(k) }
                },

                //
                // A function call
                //
                //     rgb(255, 0, 255)
                //
                // We also try to catch IE's `alpha()`, but let the `alpha` parser
                // deal with the details.
                //
                // The arguments are parsed with the `entities.arguments` parser.
                //
                call: function () {
                    var name, args;

                    if (! (name = /^([\w-]+|%)\(/.exec(chunks[j]))) return;

                    name = name[1].toLowerCase();

                    if (name === 'url') { return null }
                    else                { i += name.length + 1 }

                    if (name === 'alpha') { return $(this.alpha) }

                    args = $(this.entities.arguments);

                    if (! $(')')) return;

                    if (name) { return new(tree.Call)(name, args) }
                },
                arguments: function () {
                    var args = [], arg;

                    while (arg = $(this.expression)) {
                        args.push(arg);
                        if (! $(',')) { break }
                    }
                    return args;
                },
                literal: function () {
                    return $(this.entities.dimension) ||
                           $(this.entities.color) ||
                           $(this.entities.quoted);
                },

                //
                // Parse url() tokens
                //
                // We use a specific rule for urls, because they don't really behave like
                // standard function calls. The difference is that the argument doesn't have
                // to be enclosed within a string, so it can't be parsed as an Expression.
                //
                url: function () {
                    var value;

                    if (input.charAt(i) !== 'u' || !$(/^url\(/)) return;
                    value = $(this.entities.quoted) || $(this.entities.variable) || $(/^[-\w%@$\/.&=:;#+?]+/) || "";
                    if (! $(')')) throw new(Error)("missing closing ) for url()");

                    return new(tree.URL)((value.value || value instanceof tree.Variable)
                                        ? value : new(tree.Anonymous)(value), imports.paths);
                },

                //
                // A Variable entity, such as `@fink`, in
                //
                //     width: @fink + 2px
                //
                // We use a different parser for variable definitions,
                // see `parsers.variable`.
                //
                variable: function () {
                    var name, index = i;

                    if (input.charAt(i) === '@' && (name = $(/^@[\w-]+/))) {
                        return new(tree.Variable)(name, index);
                    }
                },

                //
                // A Hexadecimal color
                //
                //     #4F3C2F
                //
                // `rgb` and `hsl` colors are parsed through the `entities.call` parser.
                //
                color: function () {
                    var rgb;

                    if (input.charAt(i) === '#' && (rgb = $(/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/))) {
                        return new(tree.Color)(rgb[1]);
                    }
                },

                //
                // A Dimension, that is, a number and a unit
                //
                //     0.5em 95%
                //
                dimension: function () {
                    var value, c = input.charCodeAt(i);
                    if ((c > 57 || c < 45) || c === 47) return;

                    if (value = $(/^(-?\d*\.?\d+)(px|%|em|pc|ex|in|deg|s|ms|pt|cm|mm|rad|grad|turn)?/)) {
                        return new(tree.Dimension)(value[1], value[2]);
                    }
                },

                //
                // JavaScript code to be evaluated
                //
                //     `window.location.href`
                //
                javascript: function () {
                    var str;

                    if (input.charAt(i) !== '`') { return }

                    if (str = $(/^`([^`]*)`/)) {
                        return new(tree.JavaScript)(str[1], i);
                    }
                }
            },

            //
            // The variable part of a variable definition. Used in the `rule` parser
            //
            //     @fink:
            //
            variable: function () {
                var name;

                if (input.charAt(i) === '@' && (name = $(/^(@[\w-]+)\s*:/))) { return name[1] }
            },

            //
            // A font size/line-height shorthand
            //
            //     small/12px
            //
            // We need to peek first, or we'll match on keywords and dimensions
            //
            shorthand: function () {
                var a, b;

                if (! peek(/^[@\w.%-]+\/[@\w.-]+/)) return;

                if ((a = $(this.entity)) && $('/') && (b = $(this.entity))) {
                    return new(tree.Shorthand)(a, b);
                }
            },

            //
            // Mixins
            //
            mixin: {
                //
                // A Mixin call, with an optional argument list
                //
                //     #mixins > .square(#fff);
                //     .rounded(4px, black);
                //     .button;
                //
                // The `while` loop is there because mixins can be
                // namespaced, but we only support the child and descendant
                // selector for now.
                //
                call: function () {
                    var elements = [], e, c, args, index = i, s = input.charAt(i);

                    if (s !== '.' && s !== '#') { return }

                    while (e = $(/^[#.][\w-]+/)) {
                        elements.push(new(tree.Element)(c, e));
                        c = $('>');
                    }
                    $('(') && (args = $(this.entities.arguments)) && $(')');

                    if (elements.length > 0 && ($(';') || peek('}'))) {
                        return new(tree.mixin.Call)(elements, args, index);
                    }
                },

                //
                // A Mixin definition, with a list of parameters
                //
                //     .rounded (@radius: 2px, @color) {
                //        ...
                //     }
                //
                // Until we have a finer grained state-machine, we have to
                // do a look-ahead, to make sure we don't have a mixin call.
                // See the `rule` function for more information.
                //
                // We start by matching `.rounded (`, and then proceed on to
                // the argument list, which has optional default values.
                // We store the parameters in `params`, with a `value` key,
                // if there is a value, such as in the case of `@radius`.
                //
                // Once we've got our params list, and a closing `)`, we parse
                // the `{...}` block.
                //
                definition: function () {
                    var name, params = [], match, ruleset, param, value;

                    if ((input.charAt(i) !== '.' && input.charAt(i) !== '#') ||
                        peek(/^[^{]*(;|})/)) return;

                    if (match = $(/^([#.][\w-]+)\s*\(/)) {
                        name = match[1];

                        while (param = $(this.entities.variable) || $(this.entities.literal)
                                                                 || $(this.entities.keyword)) {
                            // Variable
                            if (param instanceof tree.Variable) {
                                if ($(':')) {
                                    if (value = $(this.expression)) {
                                        params.push({ name: param.name, value: value });
                                    } else {
                                        throw new(Error)("Expected value");
                                    }
                                } else {
                                    params.push({ name: param.name });
                                }
                            } else {
                                params.push({ value: param });
                            }
                            if (! $(',')) { break }
                        }
                        if (! $(')')) throw new(Error)("Expected )");

                        ruleset = $(this.block);

                        if (ruleset) {
                            return new(tree.mixin.Definition)(name, params, ruleset);
                        }
                    }
                }
            },

            //
            // Entities are the smallest recognized token,
            // and can be found inside a rule's value.
            //
            entity: function () {
                return $(this.entities.literal) || $(this.entities.variable) || $(this.entities.url) ||
                       $(this.entities.call)    || $(this.entities.keyword)  || $(this.entities.javascript);
            },

            //
            // A Rule terminator. Note that we use `peek()` to check for '}',
            // because the `block` rule will be expecting it, but we still need to make sure
            // it's there, if ';' was ommitted.
            //
            end: function () {
                return $(';') || peek('}');
            },

            //
            // IE's alpha function
            //
            //     alpha(opacity=88)
            //
            alpha: function () {
                var value;

                if (! $(/^opacity=/i)) return;
                if (value = $(/^\d+/) || $(this.entities.variable)) {
                    if (! $(')')) throw new(Error)("missing closing ) for alpha()");
                    return new(tree.Alpha)(value);
                }
            },

            //
            // A Selector Element
            //
            //     div
            //     + h1
            //     #socks
            //     input[type="text"]
            //
            // Elements are the building blocks for Selectors,
            // they are made out of a `Combinator` (see combinator rule),
            // and an element name, such as a tag a class, or `*`.
            //
            element: function () {
                var e, t;

                c = $(this.combinator);
                e = $(/^[.#:]?[\w-]+/) || $('*') || $(this.attribute) || $(/^\([^)@]+\)/);

                if (e) { return new(tree.Element)(c, e) }
            },

            //
            // Combinators combine elements together, in a Selector.
            //
            // Because our parser isn't white-space sensitive, special care
            // has to be taken, when parsing the descendant combinator, ` `,
            // as it's an empty space. We have to check the previous character
            // in the input, to see if it's a ` ` character. More info on how
            // we deal with this in *combinator.js*.
            //
            combinator: function () {
                var match, c = input.charAt(i);

                if (c === '>' || c === '&' || c === '+' || c === '~') {
                    i++;
                    while (input.charAt(i) === ' ') { i++ }
                    return new(tree.Combinator)(c);
                } else if (c === ':' && input.charAt(i + 1) === ':') {
                    i += 2;
                    while (input.charAt(i) === ' ') { i++ }
                    return new(tree.Combinator)('::');
                } else if (input.charAt(i - 1) === ' ') {
                    return new(tree.Combinator)(" ");
                } else {
                    return new(tree.Combinator)(null);
                }
            },

            //
            // A CSS Selector
            //
            //     .class > div + h1
            //     li a:hover
            //
            // Selectors are made out of one or more Elements, see above.
            //
            selector: function () {
                var sel, e, elements = [], c, match;

                while (e = $(this.element)) {
                    c = input.charAt(i);
                    elements.push(e)
                    if (c === '{' || c === '}' || c === ';' || c === ',') { break }
                }

                if (elements.length > 0) { return new(tree.Selector)(elements) }
            },
            tag: function () {
                return $(/^[a-zA-Z][a-zA-Z-]*[0-9]?/) || $('*');
            },
            attribute: function () {
                var attr = '', key, val, op;

                if (! $('[')) return;

                if (key = $(/^[a-zA-Z-]+/) || $(this.entities.quoted)) {
                    if ((op = $(/^[|~*$^]?=/)) &&
                        (val = $(this.entities.quoted) || $(/^[\w-]+/))) {
                        attr = [key, op, val.toCSS ? val.toCSS() : val].join('');
                    } else { attr = key }
                }

                if (! $(']')) return;

                if (attr) { return "[" + attr + "]" }
            },

            //
            // The `block` rule is used by `ruleset` and `mixin.definition`.
            // It's a wrapper around the `primary` rule, with added `{}`.
            //
            block: function () {
                var content;

                if ($('{') && (content = $(this.primary)) && $('}')) {
                    return content;
                }
            },

            //
            // div, .class, body > p {...}
            //
            ruleset: function () {
                var selectors = [], s, rules, match;
                save();

                if (match = /^([.#: \w-]+)[\s\n]*\{/.exec(chunks[j])) {
                    i += match[0].length - 1;
                    selectors = [new(tree.Selector)([new(tree.Element)(null, match[1])])];
                } else {
                    while (s = $(this.selector)) {
                        selectors.push(s);
                        if (! $(',')) { break }
                    }
                    if (s) $(this.comment);
                }

                if (selectors.length > 0 && (rules = $(this.block))) {
                    return new(tree.Ruleset)(selectors, rules);
                } else {
                    // Backtrack
                    furthest = i;
                    restore();
                }
            },
            rule: function () {
                var value, c = input.charAt(i), important;
                save();

                if (c === '.' || c === '#' || c === '&') { return }

                if (name = $(this.variable) || $(this.property)) {
                    if ((name.charAt(0) != '@') && (match = /^([^@+\/'"*`(;{}-]*);/.exec(chunks[j]))) {
                        i += match[0].length - 1;
                        value = new(tree.Anonymous)(match[1]);
                    } else if (name === "font") {
                        value = $(this.font);
                    } else {
                        value = $(this.value);
                    }
                    important = $(this.important);

                    if (value && $(this.end)) {
                        return new(tree.Rule)(name, value, important, memo);
                    } else {
                        furthest = i;
                        restore();
                    }
                }
            },

            //
            // An @import directive
            //
            //     @import "lib";
            //
            // Depending on our environemnt, importing is done differently:
            // In the browser, it's an XHR request, in Node, it would be a
            // file-system operation. The function used for importing is
            // stored in `import`, which we pass to the Import constructor.
            //
            "import": function () {
                var path;
                if ($(/^@import\s+/) &&
                    (path = $(this.entities.quoted) || $(this.entities.url)) &&
                    $(';')) {
                    return new(tree.Import)(path, imports);
                }
            },

            //
            // A CSS Directive
            //
            //     @charset "utf-8";
            //
            directive: function () {
                var name, value, rules, types;

                if (input.charAt(i) !== '@') return;

                if (value = $(this['import'])) {
                    return value;
                } else if (name = $(/^@media|@page/)) {
                    types = $(/^[^{]+/).trim();
                    if (rules = $(this.block)) {
                        return new(tree.Directive)(name + " " + types, rules);
                    }
                } else if (name = $(/^@[-a-z]+/)) {
                    if (name === '@font-face') {
                        if (rules = $(this.block)) {
                            return new(tree.Directive)(name, rules);
                        }
                    } else if ((value = $(this.entity)) && $(';')) {
                        return new(tree.Directive)(name, value);
                    }
                }
            },
            font: function () {
                var value = [], expression = [], weight, shorthand, font, e;

                while (e = $(this.shorthand) || $(this.entity)) {
                    expression.push(e);
                }
                value.push(new(tree.Expression)(expression));

                if ($(',')) {
                    while (e = $(this.expression)) {
                        value.push(e);
                        if (! $(',')) { break }
                    }
                }
                return new(tree.Value)(value);
            },

            //
            // A Value is a comma-delimited list of Expressions
            //
            //     font-family: Baskerville, Georgia, serif;
            //
            // In a Rule, a Value represents everything after the `:`,
            // and before the `;`.
            //
            value: function () {
                var e, expressions = [], important;

                while (e = $(this.expression)) {
                    expressions.push(e);
                    if (! $(',')) { break }
                }

                if (expressions.length > 0) {
                    return new(tree.Value)(expressions);
                }
            },
            important: function () {
                if (input.charAt(i) === '!') {
                    return $(/^! *important/);
                }
            },
            sub: function () {
                var e;

                if ($('(') && (e = $(this.expression)) && $(')')) {
                    return e;
                }
            },
            multiplication: function () {
                var m, a, op, operation;
                if (m = $(this.operand)) {
                    while ((op = ($('/') || $('*'))) && (a = $(this.operand))) {
                        operation = new(tree.Operation)(op, [operation || m, a]);
                    }
                    return operation || m;
                }
            },
            addition: function () {
                var m, a, op, operation;
                if (m = $(this.multiplication)) {
                    while ((op = $(/^[-+]\s+/) || (input.charAt(i - 1) != ' ' && ($('+') || $('-')))) &&
                           (a = $(this.multiplication))) {
                        operation = new(tree.Operation)(op, [operation || m, a]);
                    }
                    return operation || m;
                }
            },

            //
            // An operand is anything that can be part of an operation,
            // such as a Color, or a Variable
            //
            operand: function () {
                return $(this.sub) || $(this.entities.dimension) ||
                       $(this.entities.color) || $(this.entities.variable) ||
                       $(this.entities.call);
            },

            //
            // Expressions either represent mathematical operations,
            // or white-space delimited Entities.
            //
            //     1px solid black
            //     @var * 2
            //
            expression: function () {
                var e, delim, entities = [], d;

                while (e = $(this.addition) || $(this.entity)) {
                    entities.push(e);
                }
                if (entities.length > 0) {
                    return new(tree.Expression)(entities);
                }
            },
            property: function () {
                var name;

                if (name = $(/^(\*?-?[-a-z_0-9]+)\s*:/)) {
                    return name[1];
                }
            }
        }
    };
};

if (typeof(window) !== 'undefined') {
    //
    // Used by `@import` directives
    //
    less.Parser.importer = function (path, paths, callback) {
        if (path.charAt(0) !== '/' && paths.length > 0) {
            path = paths[0] + path;
        }
        // We pass `true` as 3rd argument, to force the reload of the import.
        // This is so we can get the syntax tree as opposed to just the CSS output,
        // as we need this to evaluate the current stylesheet.
        loadStyleSheet({ href: path, title: path }, callback, true);
    };
}

(function (tree) {

tree.functions = {
    rgb: function (r, g, b) {
        return this.rgba(r, g, b, 1.0);
    },
    rgba: function (r, g, b, a) {
        var rgb = [r, g, b].map(function (c) { return number(c) }),
            a = number(a);
        return new(tree.Color)(rgb, a);
    },
    hsl: function (h, s, l) {
        return this.hsla(h, s, l, 1.0);
    },
    hsla: function (h, s, l, a) {
        h = (number(h) % 360) / 360;
        s = number(s); l = number(l); a = number(a);

        var m2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
        var m1 = l * 2 - m2;

        return this.rgba(hue(h + 1/3) * 255,
                         hue(h)       * 255,
                         hue(h - 1/3) * 255,
                         a);

        function hue(h) {
            h = h < 0 ? h + 1 : (h > 1 ? h - 1 : h);
            if      (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
            else if (h * 2 < 1) return m2;
            else if (h * 3 < 2) return m1 + (m2 - m1) * (2/3 - h) * 6;
            else                return m1;
        }
    },
    hue: function (color) {
        return new(tree.Dimension)(Math.round(color.toHSL().h));
    },
    saturation: function (color) {
        return new(tree.Dimension)(Math.round(color.toHSL().s * 100), '%');
    },
    lightness: function (color) {
        return new(tree.Dimension)(Math.round(color.toHSL().l * 100), '%');
    },
    alpha: function (color) {
        return new(tree.Dimension)(color.toHSL().a);
    },
    saturate: function (color, amount) {
        var hsl = color.toHSL();

        hsl.s += amount.value / 100;
        hsl.s = clamp(hsl.s);
        return hsla(hsl);
    },
    desaturate: function (color, amount) {
        var hsl = color.toHSL();

        hsl.s -= amount.value / 100;
        hsl.s = clamp(hsl.s);
        return hsla(hsl);
    },
    lighten: function (color, amount) {
        var hsl = color.toHSL();

        hsl.l += amount.value / 100;
        hsl.l = clamp(hsl.l);
        return hsla(hsl);
    },
    darken: function (color, amount) {
        var hsl = color.toHSL();

        hsl.l -= amount.value / 100;
        hsl.l = clamp(hsl.l);
        return hsla(hsl);
    },
    spin: function (color, amount) {
        var hsl = color.toHSL();
        var hue = (hsl.h + amount.value) % 360;

        hsl.h = hue < 0 ? 360 + hue : hue;

        return hsla(hsl);
    },
    greyscale: function (color) {
        return this.desaturate(color, new(tree.Dimension)(100));
    },
    e: function (str) {
        return new(tree.Anonymous)(str instanceof tree.JavaScript ? str.evaluated : str);
    },
    '%': function (quoted /* arg, arg, ...*/) {
        var args = Array.prototype.slice.call(arguments, 1),
            str = quoted.value;

        for (var i = 0; i < args.length; i++) {
            str = str.replace(/%s/,    args[i].value)
                     .replace(/%[da]/, args[i].toCSS());
        }
        str = str.replace(/%%/g, '%');
        return new(tree.Quoted)('"' + str + '"', str);
    }
};

function hsla(hsla) {
    return tree.functions.hsla(hsla.h, hsla.s, hsla.l, hsla.a);
}

function number(n) {
    if (n instanceof tree.Dimension) {
        return parseFloat(n.unit == '%' ? n.value / 100 : n.value);
    } else if (typeof(n) === 'number') {
        return n;
    } else {
        throw {
            error: "RuntimeError",
            message: "color functions take numbers as parameters"
        };
    }
}

function clamp(val) {
    return Math.min(1, Math.max(0, val));
}

})(require('less/tree'));
(function (tree) {

tree.Alpha = function (val) {
    this.value = val;
};
tree.Alpha.prototype = {
    toCSS: function () {
        return "alpha(opacity=" +
               (this.value.toCSS ? this.value.toCSS() : this.value) + ")";
    },
    eval: function () { return this }
};

})(require('less/tree'));
(function (tree) {

tree.Anonymous = function (string) {
    this.value = string.value || string;
};
tree.Anonymous.prototype = {
    toCSS: function () {
        return this.value;
    },
    eval: function () { return this }
};

})(require('less/tree'));
(function (tree) {

//
// A function call node.
//
tree.Call = function (name, args) {
    this.name = name;
    this.args = args;
};
tree.Call.prototype = {
    //
    // When evaluating a function call,
    // we either find the function in `tree.functions` [1],
    // in which case we call it, passing the  evaluated arguments,
    // or we simply print it out as it appeared originally [2].
    //
    // The *functions.js* file contains the built-in functions.
    //
    // The reason why we evaluate the arguments, is in the case where
    // we try to pass a variable to a function, like: `saturate(@color)`.
    // The function should receive the value, not the variable.
    //
    eval: function (env) {
        var args = this.args.map(function (a) { return a.eval(env) });

        if (this.name in tree.functions) { // 1.
            return tree.functions[this.name].apply(tree.functions, args);
        } else { // 2.
            return new(tree.Anonymous)(this.name +
                   "(" + args.map(function (a) { return a.toCSS() }).join(', ') + ")");
        }
    },

    toCSS: function (env) {
        return this.eval(env).toCSS();
    }
};

})(require('less/tree'));
(function (tree) {
//
// RGB Colors - #ff0014, #eee
//
tree.Color = function (rgb, a) {
    //
    // The end goal here, is to parse the arguments
    // into an integer triplet, such as `128, 255, 0`
    //
    // This facilitates operations and conversions.
    //
    if (Array.isArray(rgb)) {
        this.rgb = rgb;
    } else if (rgb.length == 6) {
        this.rgb = rgb.match(/.{2}/g).map(function (c) {
            return parseInt(c, 16);
        });
    } else {
        this.rgb = rgb.split('').map(function (c) {
            return parseInt(c + c, 16);
        });
    }
    this.alpha = typeof(a) === 'number' ? a : 1;
};
tree.Color.prototype = {
    eval: function () { return this },

    //
    // If we have some transparency, the only way to represent it
    // is via `rgba`. Otherwise, we use the hex representation,
    // which has better compatibility with older browsers.
    // Values are capped between `0` and `255`, rounded and zero-padded.
    //
    toCSS: function () {
        if (this.alpha < 1.0) {
            return "rgba(" + this.rgb.map(function (c) {
                return Math.round(c);
            }).concat(this.alpha).join(', ') + ")";
        } else {
            return '#' + this.rgb.map(function (i) {
                i = Math.round(i);
                i = (i > 255 ? 255 : (i < 0 ? 0 : i)).toString(16);
                return i.length === 1 ? '0' + i : i;
            }).join('');
        }
    },

    //
    // Operations have to be done per-channel, if not,
    // channels will spill onto each other. Once we have
    // our result, in the form of an integer triplet,
    // we create a new Color node to hold the result.
    //
    operate: function (op, other) {
        var result = [];

        if (! (other instanceof tree.Color)) {
            other = other.toColor();
        }

        for (var c = 0; c < 3; c++) {
            result[c] = tree.operate(op, this.rgb[c], other.rgb[c]);
        }
        return new(tree.Color)(result);
    },

    toHSL: function () {
        var r = this.rgb[0] / 255,
            g = this.rgb[1] / 255,
            b = this.rgb[2] / 255,
            a = this.alpha;

        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2, d = max - min;

        if (max === min) {
            h = s = 0;
        } else {
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2;               break;
                case b: h = (r - g) / d + 4;               break;
            }
            h /= 6;
        }
        return { h: h * 360, s: s, l: l, a: a };
    }
};


})(require('less/tree'));
(function (tree) {

tree.Comment = function (value, silent) {
    this.value = value;
    this.silent = !!silent;
};
tree.Comment.prototype = {
    toCSS: function (env) {
        return env.compress ? '' : this.value;
    },
    eval: function () { return this }
};

})(require('less/tree'));
(function (tree) {

//
// A number with a unit
//
tree.Dimension = function (value, unit) {
    this.value = parseFloat(value);
    this.unit = unit || null;
};

tree.Dimension.prototype = {
    eval: function () { return this },
    toColor: function () {
        return new(tree.Color)([this.value, this.value, this.value]);
    },
    toCSS: function () {
        var css = this.value + this.unit;
        return css;
    },

    // In an operation between two Dimensions,
    // we default to the first Dimension's unit,
    // so `1px + 2em` will yield `3px`.
    // In the future, we could implement some unit
    // conversions such that `100cm + 10mm` would yield
    // `101cm`.
    operate: function (op, other) {
        return new(tree.Dimension)
                  (tree.operate(op, this.value, other.value),
                  this.unit || other.unit);
    }
};

})(require('less/tree'));
(function (tree) {

tree.Directive = function (name, value) {
    this.name = name;
    if (Array.isArray(value)) {
        this.ruleset = new(tree.Ruleset)([], value);
    } else {
        this.value = value;
    }
};
tree.Directive.prototype = {
    toCSS: function (ctx, env) {
        if (this.ruleset) {
            this.ruleset.root = true;
            return this.name + (env.compress ? '{' : ' {\n  ') +
                   this.ruleset.toCSS(ctx, env).trim().replace(/\n/g, '\n  ') +
                               (env.compress ? '}': '\n}\n');
        } else {
            return this.name + ' ' + this.value.toCSS() + ';\n';
        }
    },
    eval: function (env) {
        env.frames.unshift(this);
        this.ruleset = this.ruleset && this.ruleset.eval(env);
        env.frames.shift();
        return this;
    },
    variable: function (name) { return tree.Ruleset.prototype.variable.call(this.ruleset, name) },
    find: function () { return tree.Ruleset.prototype.find.apply(this.ruleset, arguments) },
    rulesets: function () { return tree.Ruleset.prototype.rulesets.apply(this.ruleset) }
};

})(require('less/tree'));
(function (tree) {

tree.Element = function (combinator, value) {
    this.combinator = combinator instanceof tree.Combinator ?
                      combinator : new(tree.Combinator)(combinator);
    this.value = value.trim();
};
tree.Element.prototype.toCSS = function (env) {
    return this.combinator.toCSS(env || {}) + this.value;
};

tree.Combinator = function (value) {
    if (value === ' ') {
        this.value = ' ';
    } else {
        this.value = value ? value.trim() : "";
    }
};
tree.Combinator.prototype.toCSS = function (env) {
    return {
        ''  : '',
        ' ' : ' ',
        '&' : '',
        ':' : ' :',
        '::': '::',
        '+' : env.compress ? '+' : ' + ',
        '~' : env.compress ? '~' : ' ~ ',
        '>' : env.compress ? '>' : ' > '
    }[this.value];
};

})(require('less/tree'));
(function (tree) {

tree.Expression = function (value) { this.value = value };
tree.Expression.prototype = {
    eval: function (env) {
        if (this.value.length > 1) {
            return new(tree.Expression)(this.value.map(function (e) {
                return e.eval(env);
            }));
        } else {
            return this.value[0].eval(env);
        }
    },
    toCSS: function (env) {
        return this.value.map(function (e) {
            return e.toCSS(env);
        }).join(' ');
    }
};

})(require('less/tree'));
(function (tree) {
//
// CSS @import node
//
// The general strategy here is that we don't want to wait
// for the parsing to be completed, before we start importing
// the file. That's because in the context of a browser,
// most of the time will be spent waiting for the server to respond.
//
// On creation, we push the import path to our import queue, though
// `import,push`, we also pass it a callback, which it'll call once
// the file has been fetched, and parsed.
//
tree.Import = function (path, imports) {
    var that = this;

    this._path = path;

    // The '.less' extension is optional
    if (path instanceof tree.Quoted) {
        this.path = /\.(le?|c)ss$/.test(path.value) ? path.value : path.value + '.less';
    } else {
        this.path = path.value.value || path.value;
    }

    this.css = /css$/.test(this.path);

    // Only pre-compile .less files
    if (! this.css) {
        imports.push(this.path, function (root) {
            if (! root) {
                throw new(Error)("Error parsing " + that.path);
            }
            that.root = root;
        });
    }
};

//
// The actual import node doesn't return anything, when converted to CSS.
// The reason is that it's used at the evaluation stage, so that the rules
// it imports can be treated like any other rules.
//
// In `eval`, we make sure all Import nodes get evaluated, recursively, so
// we end up with a flat structure, which can easily be imported in the parent
// ruleset.
//
tree.Import.prototype = {
    toCSS: function () {
        if (this.css) {
            return "@import " + this._path.toCSS() + ';\n';
        } else {
            return "";
        }
    },
    eval: function (env) {
        var ruleset;

        if (this.css) {
            return this;
        } else {
            ruleset = new(tree.Ruleset)(null, this.root.rules.slice(0));

            for (var i = 0; i < ruleset.rules.length; i++) {
                if (ruleset.rules[i] instanceof tree.Import) {
                    Array.prototype
                         .splice
                         .apply(ruleset.rules,
                                [i, 1].concat(ruleset.rules[i].eval(env)));
                }
            }
            return ruleset.rules;
        }
    }
};

})(require('less/tree'));
(function (tree) {

tree.JavaScript = function (string, index) {
    this.expression = string;
    this.index = index;
};
tree.JavaScript.prototype = {
    toCSS: function () {
        return JSON.stringify(this.evaluated);
    },
    eval: function (env) {
        var result,
            expression = new(Function)('return (' + this.expression + ')'),
            context = {};

        for (var k in env.frames[0].variables()) {
            context[k.slice(1)] = {
                value: env.frames[0].variables()[k].value,
                toJS: function () {
                    return this.value.eval(env).toCSS();
                }
            };
        }

        try {
            this.evaluated = expression.call(context);
        } catch (e) {
            throw { message: "JavaScript evaluation error: '" + e.name + ': ' + e.message + "'" ,
                    index: this.index };
        }
        return this;
    }
};

})(require('less/tree'));

(function (tree) {

tree.Keyword = function (value) { this.value = value };
tree.Keyword.prototype = {
    eval: function () { return this },
    toCSS: function () { return this.value }
};

})(require('less/tree'));
(function (tree) {

tree.mixin = {};
tree.mixin.Call = function (elements, args, index) {
    this.selector = new(tree.Selector)(elements);
    this.arguments = args;
    this.index = index;
};
tree.mixin.Call.prototype = {
    eval: function (env) {
        var mixins, rules = [], match = false;

        for (var i = 0; i < env.frames.length; i++) {
            if ((mixins = env.frames[i].find(this.selector)).length > 0) {
                for (var m = 0; m < mixins.length; m++) {
                    if (mixins[m].match(this.arguments, env)) {
                        try {
                            Array.prototype.push.apply(
                                  rules, mixins[m].eval(env, this.arguments).rules);
                            match = true;
                        } catch (e) {
                            throw { message: e.message, index: e.index, stack: e.stack, call: this.index };
                        }
                    }
                }
                if (match) {
                    return rules;
                } else {
                    throw { message: 'No matching definition was found for `' +
                                      this.selector.toCSS().trim() + '('      +
                                      this.arguments.map(function (a) {
                                          return a.toCSS();
                                      }).join(', ') + ")`",
                            index:   this.index };
                }
            }
        }
        throw { message: this.selector.toCSS().trim() + " is undefined",
                index: this.index };
    }
};

tree.mixin.Definition = function (name, params, rules) {
    this.name = name;
    this.selectors = [new(tree.Selector)([new(tree.Element)(null, name)])];
    this.params = params;
    this.arity = params.length;
    this.rules = rules;
    this._lookups = {};
    this.required = params.reduce(function (count, p) {
        if (p.name && !p.value) { return count + 1 }
        else                    { return count }
    }, 0);
    this.parent = tree.Ruleset.prototype;
    this.frames = [];
};
tree.mixin.Definition.prototype = {
    toCSS:     function () { return "" },
    variable:  function (name) { return this.parent.variable.call(this, name) },
    variables: function ()     { return this.parent.variables.call(this) },
    find:      function ()     { return this.parent.find.apply(this, arguments) },
    rulesets:  function ()     { return this.parent.rulesets.apply(this) },

    eval: function (env, args) {
        var frame = new(tree.Ruleset)(null, []), context;

        for (var i = 0, val; i < this.params.length; i++) {
            if (this.params[i].name) {
                if (val = (args && args[i]) || this.params[i].value) {
                    frame.rules.unshift(new(tree.Rule)(this.params[i].name, val.eval(env)));
                } else {
                    throw { message: "wrong number of arguments for " + this.name +
                            ' (' + args.length + ' for ' + this.arity + ')' };
                }
            }
        }
        return new(tree.Ruleset)(null, this.rules.slice(0)).eval({
            frames: [this, frame].concat(this.frames, env.frames)
        });
    },
    match: function (args, env) {
        var argsLength = (args && args.length) || 0, len;

        if (argsLength < this.required) { return false }

        len = Math.min(argsLength, this.arity);

        for (var i = 0; i < len; i++) {
            if (!this.params[i].name) {
                if (args[i].eval(env).toCSS() != this.params[i].value.eval(env).toCSS()) {
                    return false;
                }
            }
        }
        return true;
    }
};

})(require('less/tree'));
(function (tree) {

tree.Operation = function (op, operands) {
    this.op = op.trim();
    this.operands = operands;
};
tree.Operation.prototype.eval = function (env) {
    var a = this.operands[0].eval(env),
        b = this.operands[1].eval(env),
        temp;

    if (a instanceof tree.Dimension && b instanceof tree.Color) {
        if (this.op === '*' || this.op === '+') {
            temp = b, b = a, a = temp;
        } else {
            throw { name: "OperationError",
                    message: "Can't substract or divide a color from a number" };
        }
    }
    return a.operate(this.op, b);
};

tree.operate = function (op, a, b) {
    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return a / b;
    }
};

})(require('less/tree'));
(function (tree) {

tree.Quoted = function (str, content) {
    this.value = content || '';
    this.quote = str.charAt(0);
};
tree.Quoted.prototype = {
    toCSS: function () {
        return this.quote + this.value + this.quote;
    },
    eval: function () {
        return this;
    }
};

})(require('less/tree'));
(function (tree) {

tree.Rule = function (name, value, important, index) {
    this.name = name;
    this.value = (value instanceof tree.Value) ? value : new(tree.Value)([value]);
    this.important = important ? ' ' + important.trim() : '';
    this.index = index;

    if (name.charAt(0) === '@') {
        this.variable = true;
    } else { this.variable = false }
};
tree.Rule.prototype.toCSS = function (env) {
    if (this.variable) { return "" }
    else {
        return this.name + (env.compress ? ':' : ': ') +
               this.value.toCSS(env) +
               this.important + ";";
    }
};

tree.Rule.prototype.eval = function (context) {
    return new(tree.Rule)(this.name, this.value.eval(context), this.important, this.index);
};

tree.Shorthand = function (a, b) {
    this.a = a;
    this.b = b;
};

tree.Shorthand.prototype = {
    toCSS: function (env) {
        return this.a.toCSS(env) + "/" + this.b.toCSS(env);
    },
    eval: function () { return this }
};

})(require('less/tree'));
(function (tree) {

tree.Ruleset = function (selectors, rules) {
    this.selectors = selectors;
    this.rules = rules;
    this._lookups = {};
};
tree.Ruleset.prototype = {
    eval: function (env) {
        var ruleset = new(tree.Ruleset)(this.selectors, this.rules.slice(0));

        ruleset.root = this.root;

        // push the current ruleset to the frames stack
        env.frames.unshift(ruleset);

        // Evaluate imports
        if (ruleset.root) {
            for (var i = 0; i < ruleset.rules.length; i++) {
                if (ruleset.rules[i] instanceof tree.Import) {
                    Array.prototype.splice
                         .apply(ruleset.rules, [i, 1].concat(ruleset.rules[i].eval(env)));
                }
            }
        }

        // Store the frames around mixin definitions,
        // so they can be evaluated like closures when the time comes.
        for (var i = 0; i < ruleset.rules.length; i++) {
            if (ruleset.rules[i] instanceof tree.mixin.Definition) {
                ruleset.rules[i].frames = env.frames.slice(0);
            }
        }

        // Evaluate mixin calls.
        for (var i = 0; i < ruleset.rules.length; i++) {
            if (ruleset.rules[i] instanceof tree.mixin.Call) {
                Array.prototype.splice
                     .apply(ruleset.rules, [i, 1].concat(ruleset.rules[i].eval(env)));
            }
        }

        // Evaluate everything else
        for (var i = 0, rule; i < ruleset.rules.length; i++) {
            rule = ruleset.rules[i];

            if (! (rule instanceof tree.mixin.Definition)) {
                ruleset.rules[i] = rule.eval ? rule.eval(env) : rule;
            }
        }

        // Pop the stack
        env.frames.shift();

        return ruleset;
    },
    match: function (args) {
        return !args || args.length === 0;
    },
    variables: function () {
        if (this._variables) { return this._variables }
        else {
            return this._variables = this.rules.reduce(function (hash, r) {
                if (r instanceof tree.Rule && r.variable === true) {
                    hash[r.name] = r;
                }
                return hash;
            }, {});
        }
    },
    variable: function (name) {
        return this.variables()[name];
    },
    rulesets: function () {
        if (this._rulesets) { return this._rulesets }
        else {
            return this._rulesets = this.rules.filter(function (r) {
                return (r instanceof tree.Ruleset) || (r instanceof tree.mixin.Definition);
            });
        }
    },
    find: function (selector, self) {
        self = self || this;
        var rules = [], rule, match,
            key = selector.toCSS();

        if (key in this._lookups) { return this._lookups[key] }

        this.rulesets().forEach(function (rule) {
            if (rule !== self) {
                for (var j = 0; j < rule.selectors.length; j++) {
                    if (match = selector.match(rule.selectors[j])) {
                        if (selector.elements.length > 1) {
                            Array.prototype.push.apply(rules, rule.find(
                                new(tree.Selector)(selector.elements.slice(1)), self));
                        } else {
                            rules.push(rule);
                        }
                        break;
                    }
                }
            }
        });
        return this._lookups[key] = rules;
    },
    //
    // Entry point for code generation
    //
    //     `context` holds an array of arrays.
    //
    toCSS: function (context, env) {
        var css = [],      // The CSS output
            rules = [],    // node.Rule instances
            rulesets = [], // node.Ruleset instances
            paths = [],    // Current selectors
            selector,      // The fully rendered selector
            rule;

        if (! this.root) {
            if (context.length === 0) {
                paths = this.selectors.map(function (s) { return [s] });
            } else {
                for (var s = 0; s < this.selectors.length; s++) {
                    for (var c = 0; c < context.length; c++) {
                        paths.push(context[c].concat([this.selectors[s]]));
                    }
                }
            }
        }

        // Compile rules and rulesets
        for (var i = 0; i < this.rules.length; i++) {
            rule = this.rules[i];

            if (rule.rules || (rule instanceof tree.Directive)) {
                rulesets.push(rule.toCSS(paths, env));
            } else if (rule instanceof tree.Comment) {
                if (!rule.silent) {
                    if (this.root) {
                        rulesets.push(rule.toCSS(env));
                    } else {
                        rules.push(rule.toCSS(env));
                    }
                }
            } else {
                if (rule.toCSS && !rule.variable) {
                    rules.push(rule.toCSS(env));
                } else if (rule.value && !rule.variable) {
                    rules.push(rule.value.toString());
                }
            }
        } 

        rulesets = rulesets.join('');

        // If this is the root node, we don't render
        // a selector, or {}.
        // Otherwise, only output if this ruleset has rules.
        if (this.root) {
            css.push(rules.join(env.compress ? '' : '\n'));
        } else {
            if (rules.length > 0) {
                selector = paths.map(function (p) {
                    return p.map(function (s) {
                        return s.toCSS(env);
                    }).join('').trim();
                }).join(env.compress ? ',' : (paths.length > 3 ? ',\n' : ', '));
                css.push(selector,
                        (env.compress ? '{' : ' {\n  ') +
                        rules.join(env.compress ? '' : '\n  ') +
                        (env.compress ? '}' : '\n}\n'));
            }
        }
        css.push(rulesets);

        return css.join('') + (env.compress ? '\n' : '');
    }
};
})(require('less/tree'));
(function (tree) {

tree.Selector = function (elements) {
    this.elements = elements;
    if (this.elements[0].combinator.value === "") {
        this.elements[0].combinator.value = ' ';
    }
};
tree.Selector.prototype.match = function (other) {
    if (this.elements[0].value === other.elements[0].value) {
        return true;
    } else {
        return false;
    }
};
tree.Selector.prototype.toCSS = function (env) {
    if (this._css) { return this._css }

    return this._css = this.elements.map(function (e) {
        if (typeof(e) === 'string') {
            return ' ' + e.trim();
        } else {
            return e.toCSS(env);
        }
    }).join('');
};

})(require('less/tree'));
(function (tree) {

tree.URL = function (val, paths) {
    // Add the base path if the URL is relative and we are in the browser
    if (!/^(?:https?:\/|file:\/)?\//.test(val.value) && paths.length > 0 && typeof(window) !== 'undefined') {
        val.value = paths[0] + (val.value.charAt(0) === '/' ? val.value.slice(1) : val.value);
    }
    this.value = val;
    this.paths = paths;
};
tree.URL.prototype = {
    toCSS: function () {
        return "url(" + this.value.toCSS() + ")";
    },
    eval: function (ctx) {
        return new(tree.URL)(this.value.eval(ctx), this.paths);
    }
};

})(require('less/tree'));
(function (tree) {

tree.Value = function (value) {
    this.value = value;
    this.is = 'value';
};
tree.Value.prototype = {
    eval: function (env) {
        if (this.value.length === 1) {
            return this.value[0].eval(env);
        } else {
            return new(tree.Value)(this.value.map(function (v) {
                return v.eval(env);
            }));
        }
    },
    toCSS: function (env) {
        return this.value.map(function (e) {
            return e.toCSS(env);
        }).join(env.compress ? ',' : ', ');
    }
};

})(require('less/tree'));
(function (tree) {

tree.Variable = function (name, index) { this.name = name, this.index = index };
tree.Variable.prototype = {
    eval: function (env) {
        var variable, v, name = this.name;

        if (variable = tree.find(env.frames, function (frame) {
            if (v = frame.variable(name)) {
                return v.value.eval(env);
            }
        })) { return variable }
        else {
            throw { message: "variable " + this.name + " is undefined",
                    index: this.index };
        }
    }
};

})(require('less/tree'));
require('less/tree').find = function (obj, fun) {
    for (var i = 0, r; i < obj.length; i++) {
        if (r = fun.call(obj, obj[i])) { return r }
    }
    return null;
};
//
// browser.js - client-side engine
//

var isFileProtocol = (location.protocol === 'file:'    ||
                      location.protocol === 'chrome:'  ||
                      location.protocol === 'resource:');

less.env = less.env || (location.hostname == '127.0.0.1' ||
                        location.hostname == '0.0.0.0'   ||
                        location.hostname == 'localhost' ||
                        location.port.length > 0         ||
                        isFileProtocol                   ? 'development'
                                                         : 'production');

// Load styles asynchronously (default: false)
//
// This is set to `false` by default, so that the body
// doesn't start loading before the stylesheets are parsed.
// Setting this to `true` can result in flickering.
//
less.async = false;

// Interval between watch polls
less.poll = less.poll || (isFileProtocol ? 1000 : 1500);

//
// Watch mode
//
less.watch   = function () { return this.watchMode = true };
less.unwatch = function () { return this.watchMode = false };

if (less.env === 'development') {
    less.optimization = 0;

    if (/!watch/.test(location.hash)) {
        less.watch();
    }
    less.watchTimer = setInterval(function () {
        if (less.watchMode) {
            loadStyleSheets(function (root, sheet, env) {
                if (root) {
                    createCSS(root.toCSS(), sheet, env.lastModified);
                }
            });
        }
    }, less.poll);
} else {
    less.optimization = 3;
}

var cache;

try {
    cache = (typeof(window.localStorage) === 'undefined') ? null : window.localStorage;
} catch (_) {
    cache = null;
}

//
// Get all <link> tags with the 'rel' attribute set to "stylesheet/less"
//
var links = document.getElementsByTagName('link');
var typePattern = /^text\/(x-)?less$/;

less.sheets = [];

for (var i = 0; i < links.length; i++) {
    if (links[i].rel === 'stylesheet/less' || (links[i].rel.match(/stylesheet/) &&
       (links[i].type.match(typePattern)))) {
        less.sheets.push(links[i]);
    }
}


less.refresh = function (reload) {
    var startTime = endTime = new(Date);

    loadStyleSheets(function (root, sheet, env) {
        if (env.local) {
            log("loading " + sheet.href + " from cache.");
        } else {
            log("parsed " + sheet.href + " successfully.");
            createCSS(root.toCSS(), sheet, env.lastModified);
        }
        log("css for " + sheet.href + " generated in " + (new(Date) - endTime) + 'ms');
        (env.remaining === 0) && log("css generated in " + (new(Date) - startTime) + 'ms');
        endTime = new(Date);
    }, reload);

    loadStyles();
};
less.refreshStyles = loadStyles;

less.refresh(less.env === 'development');

function loadStyles() {
    var styles = document.getElementsByTagName('style');
    for (var i = 0; i < styles.length; i++) {
        if (styles[i].type.match(typePattern)) {
            new(less.Parser)().parse(styles[i].innerHTML || '', function (e, tree) {
                styles[i].type      = 'text/css';
                styles[i].innerHTML = tree.toCSS();
            });
        }
    }
}

function loadStyleSheets(callback, reload) {
    for (var i = 0; i < less.sheets.length; i++) {
        loadStyleSheet(less.sheets[i], callback, reload, less.sheets.length - (i + 1));
    }
}

function loadStyleSheet(sheet, callback, reload, remaining) {
    var url       = window.location.href;
    var href      = sheet.href.replace(/\?.*$/, '');
    var css       = cache && cache.getItem(href);
    var timestamp = cache && cache.getItem(href + ':timestamp');
    var styles    = { css: css, timestamp: timestamp };

    // Stylesheets in IE don't always return the full path
    if (! /^(https?|file):/.test(href)) {
        href = url.slice(0, url.lastIndexOf('/') + 1) + href;
    }

    xhr(sheet.href, function (data, lastModified) {
        if (!reload && styles &&
           (new(Date)(lastModified).valueOf() ===
            new(Date)(styles.timestamp).valueOf())) {
            // Use local copy
            createCSS(styles.css, sheet);
            callback(null, sheet, { local: true, remaining: remaining });
        } else {
            // Use remote copy (re-parse)
            try {
                new(less.Parser)({
                    optimization: less.optimization,
                    paths: [href.replace(/[\w\.-]+$/, '')]
                }).parse(data, function (e, root) {
                    if (e) { return error(e, href) }
                    try {
                        callback(root, sheet, { local: false, lastModified: lastModified, remaining: remaining });
                        removeNode(document.getElementById('less-error-message:' + extractId(href)));
                    } catch (e) {
                        error(e, href);
                    }
                });
            } catch (e) {
                error(e, href);
            }
        }
    }, function (status, url) {
        throw new(Error)("Couldn't load " + url + " (" + status + ")");
    });
}

function extractId(href) {
    return href.replace(/^[a-z]+:\/\/?[^\/]+/, '' )  // Remove protocol & domain
               .replace(/^\//,                 '' )  // Remove root /
               .replace(/\?.*$/,               '' )  // Remove query
               .replace(/\.[^\.\/]+$/,         '' )  // Remove file extension
               .replace(/[^\.\w-]+/g,          '-')  // Replace illegal characters
               .replace(/\./g,                 ':'); // Replace dots with colons(for valid id)
}

function createCSS(styles, sheet, lastModified) {
    var css;

    // Strip the query-string
    var href = sheet.href ? sheet.href.replace(/\?.*$/, '') : '';

    // If there is no title set, use the filename, minus the extension
    var id = 'less:' + (sheet.title || extractId(href));

    // If the stylesheet doesn't exist, create a new node
    if ((css = document.getElementById(id)) === null) {
        css = document.createElement('style');
        css.type = 'text/css';
        css.media = sheet.media || 'screen';
        css.id = id;
        document.getElementsByTagName('head')[0].appendChild(css);
    }

    if (css.styleSheet) { // IE
        try {
            css.styleSheet.cssText = styles;
        } catch (e) {
            throw new(Error)("Couldn't reassign styleSheet.cssText.");
        }
    } else {
        (function (node) {
            if (css.childNodes.length > 0) {
                if (css.firstChild.nodeValue !== node.nodeValue) {
                    css.replaceChild(node, css.firstChild);
                }
            } else {
                css.appendChild(node);
            }
        })(document.createTextNode(styles));
    }

    // Don't update the local store if the file wasn't modified
    if (lastModified && cache) {
        log('saving ' + href + ' to cache.');
        cache.setItem(href, styles);
        cache.setItem(href + ':timestamp', lastModified);
    }
}

function xhr(url, callback, errback) {
    var xhr = getXMLHttpRequest();
    var async = isFileProtocol ? false : less.async;

    if (typeof(xhr.overrideMimeType) === 'function') {
        xhr.overrideMimeType('text/css');
    }
    xhr.open('GET', url, async);
    xhr.send(null);

    if (isFileProtocol) {
        if (xhr.status === 0) {
            callback(xhr.responseText);
        } else {
            errback(xhr.status, url);
        }
    } else if (async) {
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                handleResponse(xhr, callback, errback);
            }
        };
    } else {
        handleResponse(xhr, callback, errback);
    }

    function handleResponse(xhr, callback, errback) {
        if (xhr.status >= 200 && xhr.status < 300) {
            callback(xhr.responseText,
                     xhr.getResponseHeader("Last-Modified"));
        } else if (typeof(errback) === 'function') {
            errback(xhr.status, url);
        }
    }
}

function getXMLHttpRequest() {
    if (window.XMLHttpRequest) {
        return new(XMLHttpRequest);
    } else {
        try {
            return new(ActiveXObject)("MSXML2.XMLHTTP.3.0");
        } catch (e) {
            log("browser doesn't support AJAX.");
            return null;
        }
    }
}

function removeNode(node) {
    return node && node.parentNode.removeChild(node);
}

function log(str) {
    if (less.env == 'development' && typeof(console) !== "undefined") { console.log('less: ' + str) }
}

function error(e, href) {
    var id = 'less-error-message:' + extractId(href);

    var template = ['<ul>',
                        '<li><label>[-1]</label><pre class="ctx">{0}</pre></li>',
                        '<li><label>[0]</label><pre>{current}</pre></li>',
                        '<li><label>[1]</label><pre class="ctx">{2}</pre></li>',
                    '</ul>'].join('\n');

    var elem = document.createElement('div'), timer, content;

    elem.id        = id;
    elem.className = "less-error-message";

    content = '<h3>'  + (e.message || 'There is an error in your .less file') +
              '</h3>' + '<p><a href="' + href   + '">' + href + "</a> ";

    if (e.extract) {
        content += 'on line ' + e.line + ', column ' + (e.column + 1) + ':</p>' +
            template.replace(/\[(-?\d)\]/g, function (_, i) {
                return (parseInt(e.line) + parseInt(i)) || '';
            }).replace(/\{(\d)\}/g, function (_, i) {
                return e.extract[parseInt(i)] || '';
            }).replace(/\{current\}/, e.extract[1].slice(0, e.column) + '<span class="error">' +
                                      e.extract[1].slice(e.column)    + '</span>');
    }
    elem.innerHTML = content;

    // CSS for error messages
    createCSS([
        '.less-error-message ul, .less-error-message li {',
            'list-style-type: none;',
            'margin-right: 15px;',
            'padding: 4px 0;',
            'margin: 0;',
        '}',
        '.less-error-message label {',
            'font-size: 12px;',
            'margin-right: 15px;',
            'padding: 4px 0;',
            'color: #cc7777;',
        '}',
        '.less-error-message pre {',
            'color: #ee4444;',
            'padding: 4px 0;',
            'margin: 0;',
            'display: inline-block;',
        '}',
        '.less-error-message pre.ctx {',
            'color: #dd4444;',
        '}',
        '.less-error-message h3 {',
            'font-size: 20px;',
            'font-weight: bold;',
            'padding: 15px 0 5px 0;',
            'margin: 0;',
        '}',
        '.less-error-message a {',
            'color: #10a',
        '}',
        '.less-error-message .error {',
            'color: red;',
            'font-weight: bold;',
            'padding-bottom: 2px;',
            'border-bottom: 1px dashed red;',
        '}'
    ].join('\n'), { title: 'error-message' });

    elem.style.cssText = [
        "font-family: Arial, sans-serif",
        "border: 1px solid #e00",
        "background-color: #eee",
        "border-radius: 5px",
        "-webkit-border-radius: 5px",
        "-moz-border-radius: 5px",
        "color: #e00",
        "padding: 15px",
        "margin-bottom: 15px"
    ].join(';');

    if (less.env == 'development') {
        timer = setInterval(function () {
            if (document.body) {
                if (document.getElementById(id)) {
                    document.body.replaceChild(elem, document.getElementById(id));
                } else {
                    document.body.insertBefore(elem, document.body.firstChild);
                }
                clearInterval(timer);
            }
        }, 10);
    }
}

})(window);

require.def('cell/integration/styling/less-style-renderer',
   ['cell/config'],
   function(config){
      var _renderer = function(styling, returnCSS){
         var cbps = config.resourceBasePaths;
         window.less.Parser({
            'paths': [ cbps.styling.value || cbps.all.value ]
         }).parse(
            styling,
            function(err, root){
               returnCSS(root.toCSS(),err);
            }
         );
      }
      return _renderer;
   }
);

// Attach renderer as default style renderer
require(['cell/config','cell/integration/styling/less-style-renderer'],function(config,mtr){
   config.defaultStyleRenderer.value = mtr;
});
