/**
 * almond 0.2.4 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */

var requirejs,require,define;(function(e){function t(e,t){return m.call(e,t)}function n(e,t){var n,i,r,o,l,s,c,u,f,a,h=t&&t.split("/"),d=p.map,v=d&&d["*"]||{};if(e&&"."===e.charAt(0))if(t){for(h=h.slice(0,h.length-1),e=h.concat(e.split("/")),u=0;e.length>u;u+=1)if(a=e[u],"."===a)e.splice(u,1),u-=1;else if(".."===a){if(1===u&&(".."===e[2]||".."===e[0]))break;u>0&&(e.splice(u-1,2),u-=2)}e=e.join("/")}else 0===e.indexOf("./")&&(e=e.substring(2));if((h||v)&&d){for(n=e.split("/"),u=n.length;u>0;u-=1){if(i=n.slice(0,u).join("/"),h)for(f=h.length;f>0;f-=1)if(r=d[h.slice(0,f).join("/")],r&&(r=r[i])){o=r,l=u;break}if(o)break;!s&&v&&v[i]&&(s=v[i],c=u)}!o&&s&&(o=s,l=c),o&&(n.splice(0,l,o),e=n.join("/"))}return e}function i(t,n){return function(){return f.apply(e,y.call(arguments,0).concat([t,n]))}}function r(e){return function(t){return n(t,e)}}function o(e){return function(t){d[e]=t}}function l(n){if(t(v,n)){var i=v[n];delete v[n],g[n]=!0,u.apply(e,i)}if(!t(d,n)&&!t(g,n))throw Error("No "+n);return d[n]}function s(e){var t,n=e?e.indexOf("!"):-1;return n>-1&&(t=e.substring(0,n),e=e.substring(n+1,e.length)),[t,e]}function c(e){return function(){return p&&p.config&&p.config[e]||{}}}var u,f,a,h,d={},v={},p={},g={},m=Object.prototype.hasOwnProperty,y=[].slice;a=function(e,t){var i,o=s(e),c=o[0];return e=o[1],c&&(c=n(c,t),i=l(c),e||(e=t)),c?e=i&&i.normalize?i.normalize(e,r(t)):n(e,t):(e=n(e,t),o=s(e),c=o[0],e=o[1],c&&(i=l(c))),{f:c?c+"!"+e:e,n:e,pr:c,p:i}},h={require:function(e){return i(e)},exports:function(e){var t=d[e];return t!==void 0?t:d[e]={}},module:function(e){return{id:e,uri:"",exports:d[e],config:c(e)}}},u=function(n,r,s,c){var u,f,p,m,y,_,w=[];if(c=c||n,"function"==typeof s){for(r=!r.length&&s.length?["require","exports","module"]:r,y=0;r.length>y;y+=1)if(m=a(r[y],c),f=m.f,"require"===f)w[y]=h.require(n);else if("exports"===f)w[y]=h.exports(n),_=!0;else if("module"===f)u=w[y]=h.module(n);else if(t(d,f)||t(v,f)||t(g,f))w[y]=l(f);else{if(!m.p)throw Error(n+" missing "+f);m.p.load(m.n,i(c,!0),o(f),{}),w[y]=d[f]}p=s.apply(d[n],w),n&&(u&&u.exports!==e&&u.exports!==d[n]?d[n]=u.exports:p===e&&_||(d[n]=p))}else n&&(d[n]=s)},requirejs=require=f=function(t,n,i,r,o){return"string"==typeof t?h[t]?h[t](n):l(a(t,n).f):(t.splice||(p=t,n.splice?(t=n,n=i,i=null):t=e),n=n||function(){},"function"==typeof i&&(i=r,r=o),r?u(e,t,n,i):setTimeout(function(){u(e,t,n,i)},4),f)},f.config=function(e){return p=e,f},define=function(e,n,i){n.splice||(i=n,n=[]),t(d,e)||t(v,e)||(v[e]=[e,n,i])},define.amd={jQuery:!0}})(),define("../../../src/almond",function(){}),define("cell/defineView",["cell/View"],function(e){var t;return t=window.__installedViews||{},{pluginBuilder:"cell/defineView-builder-plugin",load:function(n,i,r){var o;t[n]||(t=!0,o=document.createElement("link"),o.href=i.toUrl(n+".css"),o.rel="stylesheet",o.type="text/css",(document.head||document.getElementsByTagName("head")[0]).appendChild(o)),r(function(t){return t||(t={}),t.className=t._cellName=/(.*\/)?(.*)$/.exec(n)[2],e.extend(t)})}}}),define("cell/util/hash",[],function(){var e;return e=0,function(t){var n;return"object"==(n=typeof t)&&null!==t?t.$$hashkey||(t.$$hashkey=""+ ++e):n+":"+t}}),define("cell/util/type",{isA:Array.isArray||function(e){return e instanceof Array},isS:function(e){return"string"==typeof e},isF:function(e){return"function"==typeof e}}),define("cell/util/extend",[],function(){var e,t;return e="constructor",t="prototype",function(n){var i,r,o,l,s,c,u;if(o=this,i=function(){return this instanceof i?((s||o).apply(this,arguments),this):i.apply(new r,arguments)},i.extend=o.extend,l=function(){},l[t]=o[t],r=function(){},c=r[t]=i[t]=new l,n){n.hasOwnProperty(e)&&(s=n[e]);for(u in n)c[u]=n[u];s&&(c[e]=s)}return i}}),define("cell/util/ev",{rm:function(e,t,n){var i,r,o;for(r=-1,o="number"==typeof n;i=e[++r];)(o?i[n]===t:i[0]===t&&i[1]===n)&&e.splice(r--,1)}});var __slice=[].slice;define("cell/Events",["cell/util/hash","cell/util/type","cell/util/extend","cell/util/ev"],function(e,t,n,i){var r,o;return o=function(e,t,n){for(var i;i=e.pop();)i[0].apply(i[1],[t].concat(n))},r=function(){e(this),this._e={all:[]}},r.extend=n,r.prototype={constructor:r,on:function(e,n,i){var r;return this._e&&t.isS(e)&&t.isF(n)?(((r=this._e)[e]||(r[e]=[])).push([n,i]),!0):void 0},off:function(e,t,n){var r,o;if(this._e){if(o=null!=e?{type:this._e[e]}:this._e,null!=t)null==n&&(n=0);else{if(null==n)return;t=n,n=1}for(e in o)(r=o[e])&&i.rm(r,t,n)}},trigger:function(){var e,t;t=arguments[0],e=arguments.length>=2?__slice.call(arguments,1):[],this._e&&o(this._e.all.concat(this._e[t]||[]),t,e)},destroy:function(){var e;(e=this._e)&&(delete this._e,o(e.all.concat(e.destroy||[]),"destroy",this))}},r}),define("cell/util/fn",{b:function(e,t){return function(){return e.apply(t,arguments)}},b0:function(e,t){return function(){return e.call(t)}},b1:function(e,t){return function(n){return e.call(t,n)}},b2:function(e,t){return function(n,i){return e.call(t,n,i)}}}),define("cell/dom/browser",{msie:+(/msie (\d+)/.exec(navigator.userAgent.toLowerCase())||[])[1]}),define("cell/util/defer",["cell/dom/browser"],function(e){var t,n,i;return window.setImmediate?setImmediate:9>e.msie?setTimeout:(t=0,i={},n=function(e){i[e=e.data]&&(i[e](),delete i[e])},window.attachEvent?attachEvent("onmessage",n):window.addEventListener("message",n),function(e){var n;i[n=t++]=e,postMessage(n,"*")})}),define("cell/util/spy",["cell/util/hash","cell/util/fn","cell/util/type","cell/util/defer"],function(e,t,n,i){var r,o,l,s,c,u,f,a,h,d;return s=[],u=!1,f=a=void 0,o={},h={},d=function(){var e,t;u=!1,e=o,o={};for(t in e)l(e[t])},c=function(){o[this.$$hashkey||e(this)]=this,u||(u=!0,i(d))},r=function(){this.sig="",this.log={},this.col={}},{_eam:l=function(e){var t,n,i;if(n=a,f=e.scope,a=new r,i=e.e(),a.sig!==f.sig){for(t in f.log)a.log[t]?delete a.log[t]:f.log[t].o.off(f.log[t].e,void 0,e);for(t in a.log)a.log[t].o.on(a.log[t].e,c,e);e.scope=a}a=n,e.f(i)},addCol:function(){var e;a&&!a.col[e=this.$$hashkey]&&(a.sig+=e,a.col[e]=!0,f.col[e]||(a.log["add"+e]={o:this,e:"add"},a.log["remove"+e]={o:this,e:"remove"}))},addModel:function(e){var t,n,i;a&&(t=e+((i=this.collection)&&a.col[n=i.$$hashkey]?n:(i=this,this.$$hashkey)),a.log[t]||(a.sig+=t,a.log[t]={o:i,e:e}))},suspendWatch:function(e){var t;t=a,a=void 0;try{e()}catch(n){}a=t},unwatch:function(t){var n,i,r;if(r=h[t=e(t)])for(delete h[t],i=0;n=r[i++];)for(t in n.scope.log)n.scope.log[t].o.off(void 0,void 0,n)},watch:function(i,o,s,c){var u,f;return c||(c=i),n.isF(o)?((h[f=e(i)]||(h[f]=[])).push(u={e:t.b0(o,i),f:t.b1(s,c),scope:new r}),l(u),u):(s.call(c,o),void 0)}}}),define("cell/Model",["cell/util/type","cell/Events","cell/util/spy"],function(e,t,n){var i;return i=t.extend({constructor:function(e){t.call(this),this._a=e||{},this.collection=void 0},attributes:function(){var e,t;this._s("all"),t={};for(e in this._a)t[e]=this._a[e];return t},get:function(e){return this._s("change:"+e),this._a[e]},set:function(t,n){var i,r,o;return e.isS(t)&&this._a[t]!==n?(o=this._a[t],this.trigger(r="change:"+t,this,this._a[t]=n,o),(i=this.collection)&&i.trigger(r,this,n,o),!0):void 0},destroy:function(){t.prototype.destroy.call(this),this.collection&&this.collection.remove([this]),delete this._a,this.destroy=this.attributes=this.get=this.set=function(){}},_s:n.addModel})}),define("cell/Collection",["cell/Events","cell/util/type","cell/Model","cell/util/spy"],function(e,t,n,i){var r,o;return o=function(e,t,n){return Function.call(void 0,"f","c","d","if(this._i){this._s();if(f==null)return;"+("var i=-1,t=this,l=t.length(),e"+(t||"")+";")+"while(++i<l){"+"e=t._i[i];"+e+("}"+(n||"")+"}"))},r=e.extend({constructor:function(t){e.call(this),this._i=[],this.add(t)},model:n,at:function(e){return this._i?(this._s(),this._i[e]):void 0},length:function(){return this._i?(this._s(),this._i.length):void 0},indexOf:Array.prototype.indexOf?function(e){return this._i?(this._s(),this._i.indexOf(e)):void 0}:o("if(e===f){return i}","","return -1"),toArray:function(){return this._i?(this._s(),this._i.slice()):void 0},each:o("if(f.call(c,e,i,t)===!1)i=l"),map:o("r.push(f.call(c,e,i,t))",",r=[]","return r"),reduce:o("f=c.call(d,f,e,i,t)","","return f"),filterBy:o('for(k in f)if((v=f[k])==null||v===(x=e.get(k))||(typeof v=="function"&&v(x)))r.push(e)',",k,v,x,r=[]","return r"),pipe:function(e){var n,i,o,l;if(this._i){for(n=this,o=0,l=e.length;l>o;o++)i=e[o],t.isA(n=i.run(n))&&(n=new r(n));return n}},add:function(e,n){var i,r;if(this._i&&e){for(e=t.isA(e)?e.slice():[e],i=-1,r=e.length,null==n&&(n=this.length());r>++i;)this._i.splice(n++,0,e[i]=this._toM(e[i]));this.trigger("add",e,this,n-r)}},remove:function(e){var n,i,r,o,l,s;if(this._i&&e){for(t.isA(e)||(e=[e]),n=-1,o=e.length,s=[],r=[];o>++n;)l=e[n],(i=this.indexOf(l))>-1&&(delete l.collection,s.push(l),r.push(i),this._i.splice(i,1));r.length&&this.trigger("remove",s,this,r)}},destroy:function(){this._i&&(e.prototype.destroy.call(this),delete this._i)},_toM:function(e){return e=e instanceof this.model?e:new n(e),e.collection=this,e},_s:i.addCol})}),define("cell/Ext",["cell/util/extend","cell/util/spy"],function(e,t){var n;return n=function(e){this.options=null!=e?e:{}},n.prototype.watch=function(e,n){t.watch(this.view,e,n,this)},n.prototype.run=function(e,t){this.view=t,this.el=e,this.render()},n.extend=e,n}),define("cell/dom/data",[],function(){var e,t,n;return n=1,e={},t="dom-"+(new Date).getTime(),{get:function(i,r){var o,l,s;return s=null==r,(o=i[t])?l=e[o]:s&&(e[i[t]=n++]=l={}),l?s?l:l[r]:void 0},set:function(i,r,o){var l,s;(l=i[t])?e[l][r]=o:(e[i[t]=n++]=s={},s[r]=o)},remove:function(n,i){var r,o;(r=n[t])&&(o=e[r])&&(null!=i?delete o[i]:(o.handle&&o.handle.destroy&&o.handle.destroy(),delete e[r],n[t]=void 0))}}}),define("cell/dom/events",["cell/util/ev","cell/dom/browser","cell/dom/data"],function(e,t,n){var i,r,o,l,s,c;return r=window.document.addEventListener?function(e,t,n){e.addEventListener(t,n,!1)}:function(e,t,n){e.attachEvent("on"+t,n)},c=window.document.removeEventListener?function(e,t,n){e.removeEventListener(t,n,!1)}:function(e,t,n){e.detachEvent("on"+t,n)},l=function(){i(this.elem,this.events)},o=function(e,n){var i;return i=function(i,r){var o,l,s,c,u;if(i.preventDefault||(i.preventDefault=function(){i.returnValue=!1}),i.stopPropagation||(i.stopPropagation=function(){i.cancelBubble=!0}),i.target||(i.target=i.srcElement||document),null==i.defaultPrevented&&(s=i.preventDefault,i.preventDefault=function(){i.defaultPrevented=!0,s.call(i)},i.defaultPrevented=!1),i.isDefaultPrevented=function(){return i.defaultPrevented},o=n[r||i.type])for(c=0,u=o.length;u>c;c++)l=o[c],l[0].call(l[1]||e,i);8>=t.msie?(i.preventDefault=null,i.stopPropagation=null,i.isDefaultPrevented=null):(delete i.preventDefault,delete i.stopPropagation,delete i.isDefaultPrevented)},i.elem=e,i.events=n,i.destroy=l,i},i=function(e,t){var n;for(n in t)c(e,n,t[n]),delete t[n]},{on:s=function(e,t,i,l){var c,u,f,a;(f=n.get(e,"events"))||n.set(e,"events",f={}),(a=n.get(e,"handle"))||n.set(e,"handle",a=o(e,f)),(u=f[t])||("mouseenter"===t||"mouseleave"===t?(c=0,f.mouseenter=[],f.mouseleave=[],s(e,"mouseover",function(e){return c++,1===c?a(e,"mouseenter"):void 0}),s(e,"mouseout",function(e){return c--,0===c?a(e,"mouseleave"):void 0})):(r(e,t,a),f[t]=[]),u=f[t]),u.push([i,l])},off:function(t,r,o){var l;(l=n.get(t,"events"))&&(null!=r?null!=o?e.rm(l[r],o,0):(c(t,r,l[r]),delete l[r]):i(t,l))}}}),define("cell/dom/mutate",["cell/dom/data"],function(e){var t;return t=function(n){var i,r,o;if(3!==n.nodeType)for(e.remove(n),i=n.children,o=i.length,r=-1;o>++r;)t(i[r])},{remove:function(e){var n;t(e),(n=e.parentNode)&&n.removeChild(e)}}}),define("cell/View",["cell/Collection","cell/Ext","cell/Model","cell/util/spy","cell/dom/data","cell/dom/events","cell/dom/mutate","cell/util/fn","cell/util/hash","cell/util/type"],function(e,t,n,i,r,o,l,s,c,u){var f,a,h,d,v,p,g,m,y,_,w,x,b;return w=i.watch,_=i.unwatch,y=i.suspendWatch,g="prototype",p=function(){},v=document,m=function(e){var t,n,i;for(t=0,n=e.length;n>t;)i=e[t++],u.isA(i)?m(i):l.remove(i)},h=function(){this.h={}},h[g]={push:function(e,t){var n;((n=this.h)[e]||(n[e]=[])).push(t)},shift:function(e){var t;return(t=this.h[e])?1===t.lengh?(delete this.h[e],t[0]):t.shift():void 0}},f=function(e,t,n){this.view=e,this.expr=t,this.renderer=n,this.hq=new h,this.parent=void 0},f[g].install=function(t){var n;this.parent=t,this.expr instanceof e?(n=this.expr,this.view.watch(function(){return n.toArray()},function(){a.call(this,this.expr)},this)):this.view.watch(this.expr,a,this)},a=function(t){var n,i,r,o,l,s;for(n=t instanceof e?t.toArray():t,s=new h,i=-1,l=n.length;l>++i;)r=n[i],o=c(r),s.push(o,this.view._rcs(this.hq.shift(o)||this.renderer.call(this.view,r,i,t),this.parent));for(o in this.hq.h)m(this.hq.h[o]);this.hq=s},b=function(e,t){return e?new f(this.view,e,t):void 0},x=function(e){var n,i,r,l,s,c,f,a,h,p,m;for(n=[].slice.call(arguments,1),l=-1,c=n.length;c>++l&&n[l]instanceof t;);if(r=n.splice(0,l),h=n.length&&n[0]&&n[0].constructor===Object?n.shift():{},u.isS(e)){if(f=/^(\w+)?(#([\w\-]+))?(\.[\w\.\-]+)?$/.exec(e)){p=v.createElement(f[1]||"div"),f[3]&&p.setAttribute("id",f[3]),f[4]&&(i=f[4].slice(1).replace(/\./g," "),h["class"]=h["class"]?i+(" "+h["class"]):i);for(s in h)m=h[s],(a=/^on(\w+)/.exec(s))?o.on(p,a[1],m,this):this.watch(m,function(e){"innerHTML"===this.k?p.innerHTML=e:p.setAttribute(this.k,e)},{k:s})}}else e&&e[g]instanceof d&&y(function(){return p=new e(h).el});if(p){for(this._rcs(n,p),l=r.length;l--;)r[l].run(p,this);return p}},d=n.extend({constructor:function(e){var t,i,o,l;n.call(this),l=this,l.options=e?(l.model=e.model,l.collection=e.collection,delete e.model,delete e.collection,e):{},l._=s.b(x,this),l._.view=this,l._.map=b,l.beforeRender(),l.el=o=l.renderEl(l._),t=l._cellName,o.className=(i=o.className)?i+" "+t:t,r.set(o,"cellRef",l),o.setAttribute("cell",t),l._rcs(l.render(l._),o),l.afterRender()},beforeRender:p,renderEl:function(){return v.createElement("div")},render:p,afterRender:p,watch:function(e,t,n){w(this,e,t,n)},destroy:function(){this.el&&(n[g].destroy.call(this),_(this),l.remove(this.el),delete this.el)},_rc:function(e,t,n,i){var r,o;e instanceof f?e.install(t):u.isF(e)?(r=[],this.watch(e,function(e){var n;(null==e||0===e.length)&&(e=[v.createTextNode("")]),n=r.slice(),r.length=0,this._rcs(e,t,n[0],r),m(n)}),i.push(r)):1===(o=e.nodeType)||3===o?i.push(t.insertBefore(e,n)):u.isA(e)?this._rcs(e,t,n,i):i.push(t.insertBefore(v.createTextNode(e),n))},_rcs:function(e,t,n,i){var r,o,l;for(null==n&&(n=null),null==i&&(i=[]),u.isA(e)||(e=[e]),o=0,l=e.length;l>o;o++)r=e[o],null!=r&&this._rc(r,t,n,i);return i}})}),define("dir/MockNested",["require","cell/defineView!"],function(e){return e("cell/defineView!")({render:function(){return["MockNested"]}})}),window.__installedViews={"dir/MockNested":1,Mock:1},define("Mock",["require","dir/MockNested","cell/defineView!"],function(e){var t;return t=e("dir/MockNested"),e("cell/defineView!")({render:function(e){return["Mock: ",e(t)]}})}),define("App",["require","./Mock"],function(e){var t;return t=e("./Mock"),document.body.appendChild((new t).el)}),require("App");