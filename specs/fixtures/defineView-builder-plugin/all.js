/**
 * almond 0.2.4 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */

var requirejs,require,define;(function(e){function t(e,t){return g.call(e,t)}function n(e,t){var n,i,r,o,l,u,s,c,f,a,d=t&&t.split("/"),h=p.map,v=h&&h["*"]||{};if(e&&"."===e.charAt(0))if(t){for(d=d.slice(0,d.length-1),e=d.concat(e.split("/")),c=0;e.length>c;c+=1)if(a=e[c],"."===a)e.splice(c,1),c-=1;else if(".."===a){if(1===c&&(".."===e[2]||".."===e[0]))break;c>0&&(e.splice(c-1,2),c-=2)}e=e.join("/")}else 0===e.indexOf("./")&&(e=e.substring(2));if((d||v)&&h){for(n=e.split("/"),c=n.length;c>0;c-=1){if(i=n.slice(0,c).join("/"),d)for(f=d.length;f>0;f-=1)if(r=h[d.slice(0,f).join("/")],r&&(r=r[i])){o=r,l=c;break}if(o)break;!u&&v&&v[i]&&(u=v[i],s=c)}!o&&u&&(o=u,l=s),o&&(n.splice(0,l,o),e=n.join("/"))}return e}function i(t,n){return function(){return f.apply(e,_.call(arguments,0).concat([t,n]))}}function r(e){return function(t){return n(t,e)}}function o(e){return function(t){h[e]=t}}function l(n){if(t(v,n)){var i=v[n];delete v[n],m[n]=!0,c.apply(e,i)}if(!t(h,n)&&!t(m,n))throw Error("No "+n);return h[n]}function u(e){var t,n=e?e.indexOf("!"):-1;return n>-1&&(t=e.substring(0,n),e=e.substring(n+1,e.length)),[t,e]}function s(e){return function(){return p&&p.config&&p.config[e]||{}}}var c,f,a,d,h={},v={},p={},m={},g=Object.prototype.hasOwnProperty,_=[].slice;a=function(e,t){var i,o=u(e),s=o[0];return e=o[1],s&&(s=n(s,t),i=l(s),e||(e=t)),s?e=i&&i.normalize?i.normalize(e,r(t)):n(e,t):(e=n(e,t),o=u(e),s=o[0],e=o[1],s&&(i=l(s))),{f:s?s+"!"+e:e,n:e,pr:s,p:i}},d={require:function(e){return i(e)},exports:function(e){var t=h[e];return t!==void 0?t:h[e]={}},module:function(e){return{id:e,uri:"",exports:h[e],config:s(e)}}},c=function(n,r,u,s){var c,f,p,g,_,y,w=[];if(s=s||n,"function"==typeof u){for(r=!r.length&&u.length?["require","exports","module"]:r,_=0;r.length>_;_+=1)if(g=a(r[_],s),f=g.f,"require"===f)w[_]=d.require(n);else if("exports"===f)w[_]=d.exports(n),y=!0;else if("module"===f)c=w[_]=d.module(n);else if(t(h,f)||t(v,f)||t(m,f))w[_]=l(f);else{if(!g.p)throw Error(n+" missing "+f);g.p.load(g.n,i(s,!0),o(f),{}),w[_]=h[f]}p=u.apply(h[n],w),n&&(c&&c.exports!==e&&c.exports!==h[n]?h[n]=c.exports:p===e&&y||(h[n]=p))}else n&&(h[n]=u)},requirejs=require=f=function(t,n,i,r,o){return"string"==typeof t?d[t]?d[t](n):l(a(t,n).f):(t.splice||(p=t,n.splice?(t=n,n=i,i=null):t=e),n=n||function(){},"function"==typeof i&&(i=r,r=o),r?c(e,t,n,i):setTimeout(function(){c(e,t,n,i)},4),f)},f.config=function(e){return p=e,f},define=function(e,n,i){n.splice||(i=n,n=[]),t(h,e)||t(v,e)||(v[e]=[e,n,i])},define.amd={jQuery:!0}})(),define("../../../src/almond",function(){}),define("cell/defineView",["cell/View"],function(e){var t;return t=window.__installedViews||{},{pluginBuilder:"cell/defineView-builder-plugin",load:function(n,i,r){var o;t[n]||(t=!0,o=document.createElement("link"),o.href=i.toUrl(n+".css"),o.rel="stylesheet",o.type="text/css",(document.head||document.getElementsByTagName("head")[0]).appendChild(o)),r(function(t){return t||(t={}),t.className=t._cellName=/(.*\/)?(.*)$/.exec(n)[2],e.extend(t)})}}}),define("util/hash",[],function(){var e;return e=0,function(t){var n;return(n=typeof t)+":"+("object"===n&&null!==t?t.$$hashkey||(t.$$hashkey=(++e).toString(36)):t)}}),define("util/type",{isA:Array.isArray||function(e){return e instanceof Array},isS:function(e){return"string"==typeof e},isF:function(e){return"function"==typeof e}}),define("util/fn",{b:function(e,t){return function(){return e.apply(t,arguments)}},b0:function(e,t){return function(){return e.call(t)}},b1:function(e,t){return function(n){return e.call(t,n)}},b2:function(e,t){return function(n,i){return e.call(t,n,i)}}}),define("dom/data",[],function(){var e,t,n;return n=1,e={},t="dom-"+(new Date).getTime(),{get:function(i,r){var o,l,u;return u=null==r,(o=i[t])?l=e[o]:u&&(e[i[t]=n++]=l={}),l?u?l:l[r]:void 0},set:function(i,r,o){var l,u;(l=i[t])?e[l][r]=o:(e[i[t]=n++]=u={},u[r]=o)},remove:function(n,i){var r,o;(r=n[t])&&(o=e[r])&&(null!=i?delete o[i]:(o.handle&&o.handle.destroy&&o.handle.destroy(),delete e[r],n[t]=void 0))}}}),define("util/ev",{rm:function(e,t,n){var i,r,o;for(r=-1,o="number"==typeof n;i=e[++r];)(o?i[n]===t:i[0]===t&&i[1]===n)&&e.splice(r--,1)}}),define("dom/browser",{msie:+(/msie (\d+)/.exec(navigator.userAgent.toLowerCase())||[])[1]}),define("dom/events",["util/ev","dom/browser","dom/data"],function(e,t,n){var i,r,o,l,u,s;return r=window.document.addEventListener?function(e,t,n){e.addEventListener(t,n,!1)}:function(e,t,n){e.attachEvent("on"+t,n)},s=window.document.removeEventListener?function(e,t,n){e.removeEventListener(t,n,!1)}:function(e,t,n){e.detachEvent("on"+t,n)},l=function(){i(this.elem,this.events)},o=function(e,n){var i;return i=function(i,r){var o,l,u,s,c;if(i.preventDefault||(i.preventDefault=function(){i.returnValue=!1}),i.stopPropagation||(i.stopPropagation=function(){i.cancelBubble=!0}),i.target||(i.target=i.srcElement||document),null==i.defaultPrevented&&(u=i.preventDefault,i.preventDefault=function(){i.defaultPrevented=!0,u.call(i)},i.defaultPrevented=!1),i.isDefaultPrevented=function(){return i.defaultPrevented},o=n[r||i.type])for(s=0,c=o.length;c>s;s++)l=o[s],l[0].call(l[1]||e,i);8>=t.msie?(i.preventDefault=null,i.stopPropagation=null,i.isDefaultPrevented=null):(delete i.preventDefault,delete i.stopPropagation,delete i.isDefaultPrevented)},i.elem=e,i.events=n,i.destroy=l,i},i=function(e,t){var n;for(n in t)s(e,n,t[n]),delete t[n]},{on:u=function(e,t,i,l){var s,c,f,a;(f=n.get(e,"events"))||n.set(e,"events",f={}),(a=n.get(e,"handle"))||n.set(e,"handle",a=o(e,f)),(c=f[t])||("mouseenter"===t||"mouseleave"===t?(s=0,f.mouseenter=[],f.mouseleave=[],u(e,"mouseover",function(e){return s++,1===s?a(e,"mouseenter"):void 0}),u(e,"mouseout",function(e){return s--,0===s?a(e,"mouseleave"):void 0})):(r(e,t,a),f[t]=[]),c=f[t]),c.push([i,l])},off:function(t,r,o){var l;(l=n.get(t,"events"))&&(null!=r?null!=o?e.rm(l[r],o,0):(s(t,r,l[r]),delete l[r]):i(t,l))}}}),define("dom/mutate",["dom/data"],function(e){var t;return t=function(n){var i,r,o;for(e.remove(n),i=n.children,o=i.length,r=-1;o>++r;)t(i[r])},{remove:function(e){var n;t(e),(n=e.parentNode)&&n.removeChild(e)}}}),define("util/extend",[],function(){var e,t;return e="constructor",t="prototype",function(n){var i,r,o,l,u,s,c;if(o=this,i=function(){return this instanceof i?(o.apply(this,arguments),u&&u.apply(this,arguments),this):i.apply(new r,arguments)},i.extend=o.extend,l=function(){},l[t]=o[t],r=function(){},s=r[t]=i[t]=new l,n){u=n[e];for(c in n)s[c]=n[c];u&&(s[e]=u)}return i}});var __slice=[].slice;define("cell/Events",["util/type","util/extend","util/ev"],function(e,t,n){var i,r;return r=function(e,t,n){for(var i;i=e.pop();)i[0].apply(i[1],[t].concat(n))},i=function(){this._e={all:[]}},i.extend=t,i.prototype={constructor:i,on:function(t,n,i){var r;return this._e&&e.isS(t)&&e.isF(n)?(((r=this._e)[t]||(r[t]=[])).push([n,i]),!0):void 0},off:function(e,t,i){var r,o;if(this._e){if(o=null!=e?{type:this._e[e]}:this._e,null!=t)null==i&&(i=0);else{if(null==i)return;t=i,i=1}for(e in o)(r=o[e])&&n.rm(r,t,i)}},trigger:function(){var e,t;t=arguments[0],e=arguments.length>=2?__slice.call(arguments,1):[],this._e&&r(this._e.all.concat(this._e[t]||[]),t,e)},destroy:function(){var e;(e=this._e)&&(delete this._e,r(e.all.concat(e.destroy||[]),"destroy",this))}},i}),define("util/defer",["dom/browser"],function(e){var t,n,i;return window.setImmediate?setImmediate:9>e.msie?setTimeout:(t=0,i={},n=function(e){i[e=e.data]&&(i[e](),delete i[e])},window.attachEvent?attachEvent("onmessage",n):window.addEventListener("message",n),function(e){var n;i[n=t++]=e,postMessage(n,"*")})}),define("cell/util/spy",["util/hash","util/fn","util/type","util/defer"],function(e,t,n,i){var r,o,l,u,s,c,f,a,d;return s=[],f=u=!1,r=function(t,n,i){u.l[i=n+(i||e(t))]||(u.l[i]={o:t,e:n})},o={},a={},d=function(){var e,t;f=!1,e=o,o={};for(t in e)l(e[t])},c=function(){o[e(this)]=this,f||(f=!0,i(d))},{_eam:l=function(e){var t,n,i,r;if(s.push(u),u={l:t={},c:{}},r=e.e(),i=e.l)for(n in i)t[n]?delete t[n]:i[n].o.off(i[n].e,void 0,e);for(n in t)t[n].o.on(t[n].e,c,e);return e.l=t,u=s.pop(),e.f(r),e},addCol:function(){var t;u&&(u.c[t=e(this)]=!0,r(this,"add",t),r(this,"remove",t))},addModel:function(t){var n;u&&r((n=this.collection)&&u.c[e(n)]?n:this,t&&"change:"+t||"all")},unwatch:function(t){var n,i,r;if(r=a[t=e(t)])for(delete a[t],i=0;n=r[i++];)for(t in n.l)n.l[t].o.off(void 0,void 0,n)},watch:function(i,r,o,u){var s,c;u||(u=i),n.isF(r)?((a[c=e(i)]||(a[c]=[])).push(s={e:t.b0(r,i),f:t.b1(o,u)}),l(s)):o.call(u,r)}}}),define("cell/Model",["util/type","cell/Events","cell/util/spy"],function(e,t,n){var i;return i=t.extend({constructor:function(e){this._a=e||{}},attributes:function(){var e,t;if(this._a){this._s(),t={};for(e in this._a)t[e]=this._a[e];return t}},get:function(e){return this._a?(this._s(e),this._a[e]):void 0},set:function(t,n){var i,r,o;return this._a&&e.isS(t)&&this._a[t]!==n?(o=this._a[t],this.trigger(r="change:"+t,this,this._a[t]=n,o),(i=this.collection)&&i.trigger(r,this,n,o),!0):void 0},onChangeAndDo:function(e,t,n){this._a&&this.on("change:"+e,t,n)&&t("initial:"+e,this,this.get(e))},destroy:function(){this._a&&(t.prototype.destroy.call(this),this.collection&&this.collection.remove([this]),delete this._a)},_s:n.addModel})}),define("cell/Collection",["cell/Events","util/type","cell/Model","cell/util/spy"],function(e,t,n,i){var r,o;return o=function(e,t,n){return Function.call(void 0,"f","c","d","if(this._i){this._s();if(f==null)return;"+("var i=-1,t=this,l=t.length(),e"+(t||"")+";")+"while(++i<l){"+"e=t._i[i];"+e+("}"+(n||"")+"}"))},r=e.extend({constructor:function(e){this._i=[],this.add(e)},model:n,at:function(e){return this._i?(this._s(),this._i[e]):void 0},length:function(){return this._i?(this._s(),this._i.length):void 0},indexOf:Array.prototype.indexOf?function(e){return this._i?(this._s(),this._i.indexOf(e)):void 0}:o("if(e===f){return i}","","return -1"),toArray:function(){return this._i?(this._s(),this._i.slice()):void 0},each:o("if(f.call(c,e,i,t)===!1)i=l"),map:o("r.push(f.call(c,e,i,t))",",r=[]","return r"),reduce:o("f=c.call(d,f,e,i,t)","","return f"),filterBy:o('for(k in f)if((v=f[k])==null||v===(x=e.get(k))||(typeof v=="function"&&v(x)))r.push(e)',",k,v,x,r=[]","return r"),pipe:function(e){var n,i,o,l;if(this._i){for(n=this,o=0,l=e.length;l>o;o++)i=e[o],t.isA(n=i.run(n))&&(n=new r(n));return n}},add:function(e,n){var i,r;if(this._i&&e){for(e=t.isA(e)?e.slice():[e],i=-1,r=e.length,null==n&&(n=this.length());r>++i;)this._i.splice(n++,0,e[i]=this._toM(e[i]));this.trigger("add",e,this,n-r)}},remove:function(e){var n,i,r,o,l,u;if(this._i&&e){for(t.isA(e)||(e=[e]),n=-1,o=e.length,u=[],r=[];o>++n;)l=e[n],(i=this.indexOf(l))>-1&&(delete l.collection,u.push(l),r.push(i),this._i.splice(i,1));r.length&&this.trigger("remove",u,this,r)}},destroy:function(){this._i&&(e.prototype.destroy.call(this),delete this._i)},_toM:function(e){return e=e instanceof this.model?e:new n(e),e.collection=this,e},_s:i.addCol})}),define("cell/Ext",["util/extend","cell/util/spy"],function(e,t){var n;return n=function(e){this.options=null!=e?e:{}},n.prototype.watch=function(e,n){t.watch(this.view,e,n,this)},n.prototype.run=function(e,t){this.view=t,this.el=e,this.render()},n.extend=e,n}),define("cell/View",["util/hash","util/type","util/fn","dom/data","dom/events","dom/mutate","cell/Model","cell/Collection","cell/Ext","cell/util/spy"],function(e,t,n,i,r,o,l,u,s,c){var f,a,d,h,v,p,m,g,_,y,w,x,b,E,k,M,A,N;return g=t.isA,_=t.isF,y=t.isS,A=c.watch,M=c.unwatch,x="prototype",p="constructor",w=function(){},m=document,b=function(e,t){for(var n;n=t.pop();)e.removeChild(n)},E=function(e,t,n,i){var r;return null==n&&(n=[m.createTextNode("")]),r=t._rcs(n,e,i[0]),b(e,i),r},f=function(e,t){this.r=function(n){var i;i=[],A(e,t,function(t){i=E(n,e,t,i)})}},h=function(e,t,n){this.r=function(i){var r;r=[],A(e,t,function(t){r=E(i,e,e.__["if"](t,n),r)})}},d=function(){this.h={}},d[x]={push:function(e,t){var n,i;n=(i=this.h)[e]||(i[e]=[]),n.push(t)},shift:function(e){var t;return(t=this.h[e])?1===t.lengh?(delete this.h[e],t[0]):t.shift():void 0}},a=function(t,n,i){var r;r=new d,this.r=function(o){A(t,n,function(n){var l,u,s,c,f,a,h;for(f=[],a=new d,l=0,c=n.length;c>l;)(h=r.shift(s=e(u=n[l++])))||(h=i[x]instanceof v?new i({model:u}).el:i.call(t,u)),a.push(s,h),f.push(h);for(s in r.h)b(o,r.h[s]);for(r=a,l=0,c=f.length;c>l;)o.appendChild(f[l++])})}},a[x][p]=h[x][p]=f,k=function(e,t,n){"innerHTML"===t?e.innerHTML=n:e.setAttribute(t,n)},N=function(e){var t,n,i,o,l,u,c,f,a,d,h;for(t=[].slice.call(arguments,1),o=-1,u=t.length;u>++o&&t[o]instanceof s;);if(i=t.splice(0,o),a=t.length&&t[0]&&t[0][p]===Object?t.shift():{},y(e)){if(c=/^(\w+)?(#([\w\-]+))?(\.[\w\.\-]+)?$/.exec(e)){d=m.createElement(c[1]||"div"),c[3]&&d.setAttribute("id",c[3]),c[4]&&(n=c[4].slice(1).replace(/\./g," "),a["class"]=a["class"]?n+(" "+a["class"]):n);for(l in a)h=a[l],(f=/^on(\w+)/.exec(l))?r.on(d,f[1],h,this):A(this,h,function(e){return function(t){k(d,e,t)}}(l))}}else e&&e[x]instanceof v&&(d=new e(a).el);if(d){for(this._rcs(t,d),o=i.length;o--;)i[o].run(d,this);return d}},N["if"]=function(e,t){var n;return _(e)?new h(this.view,e,t):null!=(n=t[e?"then":"else"])?n.call(this.view):void 0},N.each=function(e,t){var i,r,o;if(e){if(e instanceof u&&(e=n.b0(e.toArray,e)),_(e))return new a(this.view,e,t);for(r=e.length,i=-1,o=[];r>++i;)o.push(t[x]instanceof v?new t({model:e[i]}).el:t.call(this.view,e[i],i,e));return o}},v=l.extend({constructor:function(e){var t,r,o,l,u;l=this,l.options=e?(l.model=e.model,l.collection=e.collection,delete e.model,delete e.collection,e):{},N=v[x].__,u=l.__=n.b(N,l),u["if"]=N["if"],u.each=N.each,u.view=l,l.beforeRender(),l.el=o=l.renderEl(u),t=l._cellName,o.className=(r=o.className)?r+" "+t:t,i.set(o,"cellRef",l),o.setAttribute("cell",t),l._rcs(l.render(this.__),o),l.afterRender()},beforeRender:w,renderEl:function(){return m.createElement("div")},render:w,afterRender:w,watch:function(e,t){A(this,e,t)},__:N,destroy:function(){this.el&&(l[x].destroy.call(this),M(this),o.remove(this.el),delete this.el)},_rc:function(e,t,n,i){var r;_(e)&&(e=new f(this,e)),e[p]===f?e.r(t):1===(r=e.nodeType)||3===r?i.push(t.insertBefore(e,n)):g(e)?this._rcs(e,t,n,i):i.push(t.insertBefore(m.createTextNode(e),n))},_rcs:function(e,t,n,i){var r,o,l;if(null==n&&(n=null),null==i&&(i=[]),null==e)return i;for(g(e)||(e=[e]),o=0,l=e.length;l>o;o++)r=e[o],null!=r&&this._rc(r,t,n,i);return i}})}),define("dir/MockNested",["require","cell/defineView!"],function(e){return e("cell/defineView!")({render:function(){return["MockNested"]}})}),window.__installedViews={"dir/MockNested":1,Mock:1},define("Mock",["require","dir/MockNested","cell/defineView!"],function(e){var t;return t=e("dir/MockNested"),e("cell/defineView!")({render:function(e){return["Mock: ",e(t)]}})}),define("App",["require","./Mock"],function(e){var t;return t=e("./Mock"),document.body.appendChild((new t).el)}),require("App");