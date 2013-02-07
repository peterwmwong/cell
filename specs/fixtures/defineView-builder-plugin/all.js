/**
 * almond 0.2.3 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */

var requirejs,require,define;(function(e){function t(e,t){return g.call(e,t)}function n(e,t){var n,i,r,o,l,u,s,c,f,a,d=t&&t.split("/"),h=v.map,p=h&&h["*"]||{};if(e&&"."===e.charAt(0))if(t){for(d=d.slice(0,d.length-1),e=d.concat(e.split("/")),c=0;e.length>c;c+=1)if(a=e[c],"."===a)e.splice(c,1),c-=1;else if(".."===a){if(1===c&&(".."===e[2]||".."===e[0]))break;c>0&&(e.splice(c-1,2),c-=2)}e=e.join("/")}else 0===e.indexOf("./")&&(e=e.substring(2));if((d||p)&&h){for(n=e.split("/"),c=n.length;c>0;c-=1){if(i=n.slice(0,c).join("/"),d)for(f=d.length;f>0;f-=1)if(r=h[d.slice(0,f).join("/")],r&&(r=r[i])){o=r,l=c;break}if(o)break;!u&&p&&p[i]&&(u=p[i],s=c)}!o&&u&&(o=u,l=s),o&&(n.splice(0,l,o),e=n.join("/"))}return e}function i(t,n){return function(){return f.apply(e,_.call(arguments,0).concat([t,n]))}}function r(e){return function(t){return n(t,e)}}function o(e){return function(t){h[e]=t}}function l(n){if(t(p,n)){var i=p[n];delete p[n],m[n]=!0,c.apply(e,i)}if(!t(h,n)&&!t(m,n))throw Error("No "+n);return h[n]}function u(e){var t,n=e?e.indexOf("!"):-1;return n>-1&&(t=e.substring(0,n),e=e.substring(n+1,e.length)),[t,e]}function s(e){return function(){return v&&v.config&&v.config[e]||{}}}var c,f,a,d,h={},p={},v={},m={},g=Object.prototype.hasOwnProperty,_=[].slice;a=function(e,t){var i,o=u(e),s=o[0];return e=o[1],s&&(s=n(s,t),i=l(s),e||(e=t)),s?e=i&&i.normalize?i.normalize(e,r(t)):n(e,t):(e=n(e,t),o=u(e),s=o[0],e=o[1],s&&(i=l(s))),{f:s?s+"!"+e:e,n:e,pr:s,p:i}},d={require:function(e){return i(e)},exports:function(e){var t=h[e];return t!==void 0?t:h[e]={}},module:function(e){return{id:e,uri:"",exports:h[e],config:s(e)}}},c=function(n,r,u,s){var c,f,v,g,_,y,w=[];if(s=s||n,"function"==typeof u){for(r=!r.length&&u.length?["require","exports","module"]:r,_=0;r.length>_;_+=1)if(g=a(r[_],s),f=g.f,"require"===f)w[_]=d.require(n);else if("exports"===f)w[_]=d.exports(n),y=!0;else if("module"===f)c=w[_]=d.module(n);else if(t(h,f)||t(p,f)||t(m,f))w[_]=l(f);else{if(!g.p)throw Error(n+" missing "+f);g.p.load(g.n,i(s,!0),o(f),{}),w[_]=h[f]}v=u.apply(h[n],w),n&&(c&&c.exports!==e&&c.exports!==h[n]?h[n]=c.exports:v===e&&y||(h[n]=v))}else n&&(h[n]=u)},requirejs=require=f=function(t,n,i,r,o){return"string"==typeof t?d[t]?d[t](n):l(a(t,n).f):(t.splice||(v=t,n.splice?(t=n,n=i,i=null):t=e),n=n||function(){},"function"==typeof i&&(i=r,r=o),r?c(e,t,n,i):setTimeout(function(){c(e,t,n,i)},15),f)},f.config=function(e){return v=e,f},define=function(e,n,i){n.splice||(i=n,n=[]),t(h,e)||t(p,e)||(p[e]=[e,n,i])},define.amd={jQuery:!0}})(),define("../../../src/almond",function(){}),define("cell/defineView",["cell/View"],function(e){var t;return t=window.__installedViews||{},{pluginBuilder:"cell/defineView-builder-plugin",load:function(n,i,r){var o;t[n]||(t=!0,o=document.createElement("link"),o.href=i.toUrl(n+".css"),o.rel="stylesheet",o.type="text/css",document.head.appendChild(o)),r(function(t){return t||(t={}),t.className=t._cellName=/(.*\/)?(.*)$/.exec(n)[2],e.extend(t)})}}}),define("util/hash",[],function(){var e;return e=0,function(t){var n;return(n=typeof t)+":"+("object"===n&&null!==t?t.$$hashkey||(t.$$hashkey=(++e).toString(36)):t)}}),define("util/type",{isA:Array.isArray||function(e){return e instanceof Array},isS:function(e){return"string"==typeof e},isF:function(e){return"function"==typeof e}}),define("dom/data",[],function(){var e,t,n;return n=1,e={},t="dom-"+(new Date).getTime(),{get:function(i,r){var o,l,u;return u=!(null!=r),(o=i[t])?l=e[o]:u&&(e[i[t]=n++]=l={}),l?u?l:l[r]:void 0},set:function(i,r,o){var l,u;(l=i[t])?e[l][r]=o:(e[i[t]=n++]=u={},u[r]=o)},remove:function(n,i){var r,o;(r=n[t])&&(o=e[r])&&(null!=i?delete o[i]:(o.handle&&o.handle.destroy&&o.handle.destroy(),delete e[r],n[t]=void 0))}}}),define("util/ev",{rm:function(e,t,n){var i,r,o;for(r=-1,o="number"==typeof n;i=e[++r];)(o?i[n]===t:i[0]===t&&i[1]===n)&&e.splice(r--,1)}}),define("dom/browser",{msie:Number((/msie (\d+)/.exec(navigator.userAgent.toLowerCase())||[])[1])}),define("dom/events",["util/ev","dom/browser","dom/data"],function(e,t,n){var i,r,o,l,u,s;return r=window.document.addEventListener?function(e,t,n){e.addEventListener(t,n,!1)}:function(e,t,n){e.attachEvent("on"+t,n)},s=window.document.removeEventListener?function(e,t,n){e.removeEventListener(t,n,!1)}:function(e,t,n){e.detachEvent("on"+t,n)},l=function(){i(this.elem,this.events)},o=function(e,n){var i;return i=function(i,r){var o,l,u,s,c;if(i.preventDefault||(i.preventDefault=function(){i.returnValue=!1}),i.stopPropagation||(i.stopPropagation=function(){i.cancelBubble=!0}),i.target||(i.target=i.srcElement||document),null==i.defaultPrevented&&(u=i.preventDefault,i.preventDefault=function(){i.defaultPrevented=!0,u.call(i)},i.defaultPrevented=!1),i.isDefaultPrevented=function(){return i.defaultPrevented},o=n[r||i.type])for(s=0,c=o.length;c>s;s++)l=o[s],l[0].call(l[1]||e,i);8>=t.msie?(i.preventDefault=null,i.stopPropagation=null,i.isDefaultPrevented=null):(delete i.preventDefault,delete i.stopPropagation,delete i.isDefaultPrevented)},i.elem=e,i.events=n,i.destroy=l,i},i=function(e,t){var n;for(n in t)s(e,n,t[n]),delete t[n]},{on:u=function(e,t,i,l){var s,c,f,a;(f=n.get(e,"events"))||n.set(e,"events",f={}),(a=n.get(e,"handle"))||n.set(e,"handle",a=o(e,f)),(c=f[t])||("mouseenter"===t||"mouseleave"===t?(s=0,f.mouseenter=[],f.mouseleave=[],u(e,"mouseover",function(e){return s++,1===s?a(e,"mouseenter"):void 0}),u(e,"mouseout",function(e){return s--,0===s?a(e,"mouseleave"):void 0})):(r(e,t,a),f[t]=[]),c=f[t]),c.push([i,l])},off:function(t,r,o){var l;(l=n.get(t,"events"))&&(null!=r?null!=o?e.rm(l[r],o,0):(s(t,r,l[r]),delete l[r]):i(t,l))}}}),define("util/extend",[],function(){return function(e){var t,n,i,r;if(n=this,t=function(i){return this instanceof t?(n.call(this,i),e&&e.constructor&&e.constructor.call(this,i),void 0):new t(i)},t.extend=n.extend,i=function(){},i.prototype=n.prototype,t.prototype=new i,e)for(r in e)t.prototype[r]=e[r];return t}});var __slice=[].slice;define("cell/Events",["util/type","util/extend","util/ev"],function(e,t,n){var i;return i=function(){this._e={all:[]}},i.extend=t,i.prototype={constructor:i,on:function(t,n,i){var r;return e.isS(t)&&e.isF(n)?(((r=this._e)[t]||(r[t]=[])).push([n,i]),!0):void 0},off:function(e,t,i){var r,o;if(o=null!=e?{type:this._e[e]}:this._e,null!=t)null==i&&(i=0);else{if(null==i)return;t=i,i=1}for(e in o)(r=o[e])&&n.rm(r,t,i)},trigger:function(){var e,t,n,i,r;if(n=arguments[0],t=arguments.length>=2?__slice.call(arguments,1):[],e=this._e.all.concat(this._e[n]||[]),r=e.length)for(;r--;)i=e[r],i[0].apply(i[1],[n].concat(t))}},i}),define("cell/util/spy",["util/hash"],function(e){var t;return t=!1,{addCol:function(){t&&(t.c[e(this)]=this)},addModel:function(n){var i,r,o,l,u;if(t){u={m:this,d:this.collection};for(o in u)l=u[o],l&&((i=t[o][r=e(l)])||(i=t[o][r]={m:l,p:{}}),i.p[n]=1)}},watch:function(e,n){var i,r,o,l,u,s,c,f,a,d,h,p;t={m:{},c:{},d:{}};try{a=e()}catch(v){}i=t,t=!1,o=!1,s=function(){o||(o=!0,setTimeout(function(){o=!1;try{n(e())}catch(t){}},0))},h={0:i.m,1:i.d};for(d in h){l=h[d];for(d in l)if(u=l[d],(f=u.p)[void 0])u.m.on("all",s);else for(c in f)u.m.on("change:"+c,s)}p=i.c;for(d in p)r=p[d],r.on("add",s),r.on("remove",s);n(a)}}}),define("cell/Model",["util/type","cell/Events","cell/util/spy"],function(e,t,n){var i;return i=t.extend({constructor:function(e){this._a=e||{}},attributes:function(){var e,t;this._s(),t={};for(e in this._a)t[e]=this._a[e];return t},get:function(e){return this._s(e),this._a[e]},set:function(t,n){var i,r,o;return e.isS(t)&&this._a[t]!==n?(o=this._a[t],this.trigger(r="change:"+t,this,this._a[t]=n,o),(i=this.collection)&&i.trigger(r,this,n,o),!0):void 0},onChangeAndDo:function(e,t,n){this.on("change:"+e,t,n)&&t("initial:"+e,this,this.get(e))},_s:n.addModel})}),define("cell/Collection",["cell/Events","util/type","cell/Model","cell/util/spy"],function(e,t,n,i){var r,o;return o=function(e,t,n){return Function.call(void 0,"f","c","d","this._s();if(f==null)return;"+("var i=-1,t=this,l=t.length(),e"+(t||"")+";")+"while(++i<l){"+"e=t._i[i];"+e+"}"+(n||""))},r=e.extend({constructor:function(e){this._i=[],this.add(e)},model:n,at:function(e){return this._s(),this._i[e]},length:function(){return this._s(),this._i.length},indexOf:Array.prototype.indexOf?function(e){return this._s(),this._i.indexOf(e)}:o("if(e===f){return i}","","return -1"),toArray:function(){return this._s(),this._i.slice()},each:o("if(f.call(c,e,i,t)===!1)i=l"),map:o("r.push(f.call(c,e,i,t))",",r=[]","return r"),reduce:o("f=c.call(d,f,e,i,t)","","return f"),filterBy:o('for(k in f)if((v=f[k])==null||v===(x=e.get(k))||(typeof v=="function"&&v(x)))r.push(e)',",k,v,x,r=[]","return r"),pipe:function(e){var n,i,o,l;for(n=this,o=0,l=e.length;l>o;o++)i=e[o],t.isA(n=i.run(n))&&(n=new r(n));return n},add:function(e,n){var i,r;if(e){for(e=t.isA(e)?e.slice():[e],i=-1,r=e.length,null==n&&(n=this.length());r>++i;)this._i.splice(n++,0,e[i]=this._toM(e[i]));this.trigger("add",e,this,n-r)}},remove:function(e){var n,i,r,o,l,u;if(e){for(t.isA(e)||(e=[e]),n=-1,o=e.length,u=[],r=[];o>++n;)l=e[n],(i=this.indexOf(l))>-1&&(delete l.collection,u.push(l),r.push(i),this._i.splice(i,1));r.length&&this.trigger("remove",u,this,r)}},_toM:function(e){return e=e instanceof this.model?e:new n(e),e.collection=this,e},_s:i.addCol})}),define("cell/View",["util/hash","util/type","dom/data","dom/events","cell/Model","cell/Collection","cell/util/spy"],function(e,t,n,i,r,o,l){var u,s,c,f,a,d,h,p,v,m,g,_,y;return p=t.isA,v=t.isF,_=l.watch,d=function(e,t){return function(){return e.call(t)}},m=function(){},h=document,g=function(e,t,n,i){var r,o,l;for(null==n&&(n=[h.createTextNode("")]),l=t._renderChildren(n,e,i[0]),r=-1,o=i.length;o>++r;)e.removeChild(i[r]);return l},u=function(e,t){this.r=function(n){var i;i=[],_(d(t,e),function(t){i=g(n,e,t,i)})}},f=function(e,t,n){this.r=function(i){var r;r=[],_(d(t,e),function(t){r=g(i,e,e.__["if"](t,n),r)})}},c=function(){this.h={}},c.prototype={push:function(e,t){var n,i;n=(i=this.h)[e]||(i[e]=[]),n.push(t)},shift:function(e){var t;return(t=this.h[e])?1===t.lengh?(delete this.h[e],t[0]):t.shift():void 0}},s=function(t,n,i){var r;r=new c,this.r=function(o){_(d(n,t),function(t){var n,l,u,s,f,d,h,p,v;for(d=[],h=new c,n=-1,f=t.length;f>++n;)(p=r.shift(s=e(l=t[n])))||(p=i.prototype instanceof a?new i({model:l}).el:i(l)),h.push(s,p),d.push(p);v=r.h;for(s in v)for(u=v[s],n=-1,f=u.length;f>++n;)o.removeChild(u[n]);for(r=h,n=-1,f=d.length;f>++n;)o.appendChild(d[n])})}},s.prototype.constructor=f.prototype.constructor=u,y=function(e,t){var n,r,o,l,u,s,c;if(n=[].slice.call(arguments,t&&t.constructor===Object?(u=t,2):1),"string"==typeof e){if(o=/^(\w+)?(#([\w\-]+))?(\.[\w\.\-]+)?$/.exec(e)){s=h.createElement(o[1]||"div"),o[3]&&s.setAttribute("id",o[3]),o[4]&&(s.className=o[4].slice(1).replace(/\./g," "));for(r in u)c=u[r],(l=/^on(\w+)/.exec(r))?i.on(s,l[1],c,this):this._renderAttr(r,c,s)}}else e&&e.prototype instanceof a&&(s=new e(u).el);return s?(this._renderChildren(n,s),s):void 0},y["if"]=function(e,t){var n;return v(e)?new f(this.view,e,t):null!=(n=t[e?"then":"else"])?n.call(this.view):void 0},y.each=function(e,t){var n,i,r,l;if(e){if(e instanceof o&&(n=e,e=function(){return n.toArray()}),v(e))return new s(this.view,e,t);for(r=e.length,i=-1,l=[];r>++i;)l.push(t.prototype instanceof a?new t({model:e[i]}).el:t(e[i],i,e));return l}},a=r.extend({constructor:function(e){var t,n=this;this.options=null!=e?e:{},this.model=this.options.model,delete this.options.model,this.collection=this.options.collection,delete this.options.collection,y=a.prototype.__,t=this.__=function(){return y.apply(n,arguments)},t["if"]=y["if"],t.each=y.each,t.view=this,this._render_el()},beforeRender:m,render_el:function(){return h.createElement("div")},render:m,afterRender:m,__:y,_render_el:function(){var e;this.beforeRender(),this.el=this.render_el(this.__),this.el.className=(e=this.el.className)?e+" "+this._cellName:this._cellName,n.set(this.el,"cellRef",this),this.el.setAttribute("cell",this._cellName),this._renderChildren(this.render(this.__),this.el),this.afterRender()},_renderAttr:function(e,t,n){v(t)?_(d(t,this),function(t){n.setAttribute(e,t)}):n.setAttribute(e,t)},_renderChild:function(e,t,n,i){var r;v(e)&&(e=new u(this,e)),e.constructor===u?e.r(t):1===(r=e.nodeType)||3===r?i.push(t.insertBefore(e,n)):p(e)?this._renderChildren(e,t,n,i):i.push(t.insertBefore(h.createTextNode(e),n))},_renderChildren:function(e,t,n,i){var r,o,l;if(null==n&&(n=null),null==i&&(i=[]),null==e)return i;for(p(e)||(e=[e]),o=0,l=e.length;l>o;o++)r=e[o],null!=r&&this._renderChild(r,t,n,i);return i}})}),define("dir/MockNested",["require","cell/defineView!"],function(e){return e("cell/defineView!")({render:function(){return["MockNested"]}})}),window.__installedViews={"dir/MockNested":1,Mock:1},define("Mock",["require","dir/MockNested","cell/defineView!"],function(e){var t;return t=e("dir/MockNested"),e("cell/defineView!")({render:function(e){return["Mock: ",e(t)]}})}),define("App",["require","./Mock"],function(e){var t;return t=e("./Mock"),document.body.appendChild((new t).el)}),require("App");