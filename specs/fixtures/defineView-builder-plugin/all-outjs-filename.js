/**
 * almond 0.2.4 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */

var requirejs,require,define;(function(e){function t(e,t){return g.call(e,t)}function n(e,t){var n,i,r,o,u,l,s,c,f,a,d=t&&t.split("/"),h=p.map,v=h&&h["*"]||{};if(e&&"."===e.charAt(0))if(t){for(d=d.slice(0,d.length-1),e=d.concat(e.split("/")),c=0;e.length>c;c+=1)if(a=e[c],"."===a)e.splice(c,1),c-=1;else if(".."===a){if(1===c&&(".."===e[2]||".."===e[0]))break;c>0&&(e.splice(c-1,2),c-=2)}e=e.join("/")}else 0===e.indexOf("./")&&(e=e.substring(2));if((d||v)&&h){for(n=e.split("/"),c=n.length;c>0;c-=1){if(i=n.slice(0,c).join("/"),d)for(f=d.length;f>0;f-=1)if(r=h[d.slice(0,f).join("/")],r&&(r=r[i])){o=r,u=c;break}if(o)break;!l&&v&&v[i]&&(l=v[i],s=c)}!o&&l&&(o=l,u=s),o&&(n.splice(0,u,o),e=n.join("/"))}return e}function i(t,n){return function(){return f.apply(e,y.call(arguments,0).concat([t,n]))}}function r(e){return function(t){return n(t,e)}}function o(e){return function(t){h[e]=t}}function u(n){if(t(v,n)){var i=v[n];delete v[n],m[n]=!0,c.apply(e,i)}if(!t(h,n)&&!t(m,n))throw Error("No "+n);return h[n]}function l(e){var t,n=e?e.indexOf("!"):-1;return n>-1&&(t=e.substring(0,n),e=e.substring(n+1,e.length)),[t,e]}function s(e){return function(){return p&&p.config&&p.config[e]||{}}}var c,f,a,d,h={},v={},p={},m={},g=Object.prototype.hasOwnProperty,y=[].slice;a=function(e,t){var i,o=l(e),s=o[0];return e=o[1],s&&(s=n(s,t),i=u(s),e||(e=t)),s?e=i&&i.normalize?i.normalize(e,r(t)):n(e,t):(e=n(e,t),o=l(e),s=o[0],e=o[1],s&&(i=u(s))),{f:s?s+"!"+e:e,n:e,pr:s,p:i}},d={require:function(e){return i(e)},exports:function(e){var t=h[e];return t!==void 0?t:h[e]={}},module:function(e){return{id:e,uri:"",exports:h[e],config:s(e)}}},c=function(n,r,l,s){var c,f,p,g,y,_,w=[];if(s=s||n,"function"==typeof l){for(r=!r.length&&l.length?["require","exports","module"]:r,y=0;r.length>y;y+=1)if(g=a(r[y],s),f=g.f,"require"===f)w[y]=d.require(n);else if("exports"===f)w[y]=d.exports(n),_=!0;else if("module"===f)c=w[y]=d.module(n);else if(t(h,f)||t(v,f)||t(m,f))w[y]=u(f);else{if(!g.p)throw Error(n+" missing "+f);g.p.load(g.n,i(s,!0),o(f),{}),w[y]=h[f]}p=l.apply(h[n],w),n&&(c&&c.exports!==e&&c.exports!==h[n]?h[n]=c.exports:p===e&&_||(h[n]=p))}else n&&(h[n]=l)},requirejs=require=f=function(t,n,i,r,o){return"string"==typeof t?d[t]?d[t](n):u(a(t,n).f):(t.splice||(p=t,n.splice?(t=n,n=i,i=null):t=e),n=n||function(){},"function"==typeof i&&(i=r,r=o),r?c(e,t,n,i):setTimeout(function(){c(e,t,n,i)},4),f)},f.config=function(e){return p=e,f},define=function(e,n,i){n.splice||(i=n,n=[]),t(h,e)||t(v,e)||(v[e]=[e,n,i])},define.amd={jQuery:!0}})(),define("../../../src/almond",function(){}),define("cell/defineView",["cell/View"],function(e){var t;return t=window.__installedViews||{},{pluginBuilder:"cell/defineView-builder-plugin",load:function(n,i,r){var o;t[n]||(t=!0,o=document.createElement("link"),o.href=i.toUrl(n+".css"),o.rel="stylesheet",o.type="text/css",(document.head||document.getElementsByTagName("head")[0]).appendChild(o)),r(function(t){return t||(t={}),t.className=t._cellName=/(.*\/)?(.*)$/.exec(n)[2],e.extend(t)})}}}),define("util/type",{isA:Array.isArray||function(e){return e instanceof Array},isS:function(e){return"string"==typeof e},isF:function(e){return"function"==typeof e}}),define("util/fn",{b:function(e,t){return function(){return e.apply(t,arguments)}},b0:function(e,t){return function(){return e.call(t)}},b1:function(e,t){return function(n){return e.call(t,n)}},b2:function(e,t){return function(n,i){return e.call(t,n,i)}}}),define("dom/data",[],function(){var e,t,n;return n=1,e={},t="dom-"+(new Date).getTime(),{get:function(i,r){var o,u,l;return l=null==r,(o=i[t])?u=e[o]:l&&(e[i[t]=n++]=u={}),u?l?u:u[r]:void 0},set:function(i,r,o){var u,l;(u=i[t])?e[u][r]=o:(e[i[t]=n++]=l={},l[r]=o)},remove:function(n,i){var r,o;(r=n[t])&&(o=e[r])&&(null!=i?delete o[i]:(o.handle&&o.handle.destroy&&o.handle.destroy(),delete e[r],n[t]=void 0))}}}),define("util/ev",{rm:function(e,t,n){var i,r,o;for(r=-1,o="number"==typeof n;i=e[++r];)(o?i[n]===t:i[0]===t&&i[1]===n)&&e.splice(r--,1)}}),define("dom/browser",{msie:+(/msie (\d+)/.exec(navigator.userAgent.toLowerCase())||[])[1]}),define("dom/events",["util/ev","dom/browser","dom/data"],function(e,t,n){var i,r,o,u,l,s;return r=window.document.addEventListener?function(e,t,n){e.addEventListener(t,n,!1)}:function(e,t,n){e.attachEvent("on"+t,n)},s=window.document.removeEventListener?function(e,t,n){e.removeEventListener(t,n,!1)}:function(e,t,n){e.detachEvent("on"+t,n)},u=function(){i(this.elem,this.events)},o=function(e,n){var i;return i=function(i,r){var o,u,l,s,c;if(i.preventDefault||(i.preventDefault=function(){i.returnValue=!1}),i.stopPropagation||(i.stopPropagation=function(){i.cancelBubble=!0}),i.target||(i.target=i.srcElement||document),null==i.defaultPrevented&&(l=i.preventDefault,i.preventDefault=function(){i.defaultPrevented=!0,l.call(i)},i.defaultPrevented=!1),i.isDefaultPrevented=function(){return i.defaultPrevented},o=n[r||i.type])for(s=0,c=o.length;c>s;s++)u=o[s],u[0].call(u[1]||e,i);8>=t.msie?(i.preventDefault=null,i.stopPropagation=null,i.isDefaultPrevented=null):(delete i.preventDefault,delete i.stopPropagation,delete i.isDefaultPrevented)},i.elem=e,i.events=n,i.destroy=u,i},i=function(e,t){var n;for(n in t)s(e,n,t[n]),delete t[n]},{on:l=function(e,t,i,u){var s,c,f,a;(f=n.get(e,"events"))||n.set(e,"events",f={}),(a=n.get(e,"handle"))||n.set(e,"handle",a=o(e,f)),(c=f[t])||("mouseenter"===t||"mouseleave"===t?(s=0,f.mouseenter=[],f.mouseleave=[],l(e,"mouseover",function(e){return s++,1===s?a(e,"mouseenter"):void 0}),l(e,"mouseout",function(e){return s--,0===s?a(e,"mouseleave"):void 0})):(r(e,t,a),f[t]=[]),c=f[t]),c.push([i,u])},off:function(t,r,o){var u;(u=n.get(t,"events"))&&(null!=r?null!=o?e.rm(u[r],o,0):(s(t,r,u[r]),delete u[r]):i(t,u))}}}),define("dom/mutate",["dom/data"],function(e){var t;return t=function(n){var i,r,o;for(e.remove(n),i=n.children,o=i.length,r=-1;o>++r;)t(i[r])},{remove:function(e){var n;t(e),(n=e.parentNode)&&n.removeChild(e)}}}),define("util/extend",[],function(){var e,t;return e="constructor",t="prototype",function(n){var i,r,o,u,l,s,c;if(o=this,i=function(){return this instanceof i?(o.apply(this,arguments),l&&l.apply(this,arguments),this):i.apply(new r,arguments)},i.extend=o.extend,u=function(){},u[t]=o[t],r=function(){},s=r[t]=i[t]=new u,n){l=n[e];for(c in n)s[c]=n[c];l&&(s[e]=l)}return i}});var __slice=[].slice;define("cell/Events",["util/type","util/extend","util/ev"],function(e,t,n){var i,r;return r=function(e,t,n){for(var i;i=e.pop();)i[0].apply(i[1],[t].concat(n))},i=function(){this._e={all:[]}},i.extend=t,i.prototype={constructor:i,on:function(t,n,i){var r;return this._e&&e.isS(t)&&e.isF(n)?(((r=this._e)[t]||(r[t]=[])).push([n,i]),!0):void 0},off:function(e,t,i){var r,o;if(this._e){if(o=null!=e?{type:this._e[e]}:this._e,null!=t)null==i&&(i=0);else{if(null==i)return;t=i,i=1}for(e in o)(r=o[e])&&n.rm(r,t,i)}},trigger:function(){var e,t;t=arguments[0],e=arguments.length>=2?__slice.call(arguments,1):[],this._e&&r(this._e.all.concat(this._e[t]||[]),t,e)},destroy:function(){var e;(e=this._e)&&(delete this._e,r(e.all.concat(e.destroy||[]),"destroy",this))}},i}),define("util/hash",[],function(){var e;return e=0,function(t){var n;return"object"==(n=typeof t)&&null!==t?t.$$hashkey||(t.$$hashkey=""+ ++e):n+":"+t}}),define("util/defer",["dom/browser"],function(e){var t,n,i;return window.setImmediate?setImmediate:9>e.msie?setTimeout:(t=0,i={},n=function(e){i[e=e.data]&&(i[e](),delete i[e])},window.attachEvent?attachEvent("onmessage",n):window.addEventListener("message",n),function(e){var n;i[n=t++]=e,postMessage(n,"*")})}),define("cell/util/spy",["util/hash","util/fn","util/type","util/defer"],function(e,t,n,i){var r,o,u,l,s,c,f,a,d;return s=[],f=l=!1,r=function(t,n){var i;l.l[i=n+(t.$$hashkey||e(t))]||(l.s+=i,l.l[i]={o:t,e:n})},o={},a={},d=function(){var e,t;f=!1,e=o,o={};for(t in e)u(e[t])},c=function(){o[e(this)]=this,f||(f=!0,i(d))},{_eam:u=function(e){var t,n,i,r;if(s.push(l),l={s:"",l:t={},c:{}},r=e.e(),l.s!==e.s){if(i=e.l)for(n in i)t[n]?delete t[n]:i[n].o.off(i[n].e,void 0,e);for(n in t)t[n].o.on(t[n].e,c,e);e.s=l.s,e.l=t}l=s.pop(),e.f(r)},addCol:function(){l&&(l.c[this.$$hashkey||e(this)]=!0,r(this,"add"),r(this,"remove"))},addModel:function(t){var n;l&&r((n=this.collection)&&l.c[n.$$hashkey||e(n)]?n:this,t?"change:"+t:"all")},suspendWatch:function(e){var t;t=l,l=!1;try{e()}catch(n){}l=t},unwatch:function(t){var n,i,r;if(r=a[t=e(t)])for(delete a[t],i=0;n=r[i++];)for(t in n.l)n.l[t].o.off(void 0,void 0,n)},watch:function(i,r,o,l){var s,c;return l||(l=i),n.isF(r)?((a[c=e(i)]||(a[c]=[])).push(s={e:t.b0(r,i),f:t.b1(o,l)}),u(s),s):(o.call(l,r),void 0)}}}),define("cell/Model",["util/type","cell/Events","cell/util/spy"],function(e,t,n){var i;return i=t.extend({constructor:function(e){this._a=e||{}},attributes:function(){var e,t;if(this._a){this._s(),t={};for(e in this._a)t[e]=this._a[e];return t}},get:function(e){return this._a?(this._s(e),this._a[e]):void 0},set:function(t,n){var i,r,o;return this._a&&e.isS(t)&&this._a[t]!==n?(o=this._a[t],this.trigger(r="change:"+t,this,this._a[t]=n,o),(i=this.collection)&&i.trigger(r,this,n,o),!0):void 0},onChangeAndDo:function(e,t,n){this._a&&this.on("change:"+e,t,n)&&t("initial:"+e,this,this.get(e))},destroy:function(){this._a&&(t.prototype.destroy.call(this),this.collection&&this.collection.remove([this]),delete this._a)},_s:n.addModel})}),define("cell/Ext",["util/extend","cell/util/spy"],function(e,t){var n;return n=function(e){this.options=null!=e?e:{}},n.prototype.watch=function(e,n){t.watch(this.view,e,n,this)},n.prototype.run=function(e,t){this.view=t,this.el=e,this.render()},n.extend=e,n}),define("cell/View",["util/type","util/fn","dom/data","dom/events","dom/mutate","cell/Model","cell/Ext","cell/util/spy"],function(e,t,n,i,r,o,u,l){var s,c,f,a,d,h,v,p,m,g;return f=e.isA,a=e.isF,d=e.isS,g=l.watch,m=l.unwatch,p=l.suspendWatch,v="prototype",h=function(){},c=document,s=o.extend({constructor:function(e){var i,r,o,u;u=this,u.options=e?(u.model=e.model,u.collection=e.collection,delete e.model,delete e.collection,e):{},u.__=t.b(s[v].__,u),u.beforeRender(),u.el=o=u.renderEl(u.__),i=u._cellName,o.className=(r=o.className)?r+" "+i:i,n.set(o,"cellRef",u),o.setAttribute("cell",i),u._rcs(u.render(u.__),o),u.afterRender()},beforeRender:h,renderEl:function(){return c.createElement("div")},render:h,afterRender:h,watch:function(e,t){g(this,e,t)},__:function(e){var t,n,r,o,l,f,a,h,m,y,_;for(t=[].slice.call(arguments,1),o=-1,f=t.length;f>++o&&t[o]instanceof u;);if(r=t.splice(0,o),m=t.length&&t[0]&&t[0].constructor===Object?t.shift():{},d(e)){if(a=/^(\w+)?(#([\w\-]+))?(\.[\w\.\-]+)?$/.exec(e)){y=c.createElement(a[1]||"div"),a[3]&&y.setAttribute("id",a[3]),a[4]&&(n=a[4].slice(1).replace(/\./g," "),m["class"]=m["class"]?n+(" "+m["class"]):n);for(l in m)_=m[l],(h=/^on(\w+)/.exec(l))?i.on(y,h[1],_,this):g(this,_,function(e){return function(t){"innerHTML"===e?y.innerHTML=t:y.setAttribute(e,t)}}(l))}}else e&&e[v]instanceof s&&p(function(){return y=new e(m).el});if(y){for(this._rcs(t,y),o=r.length;o--;)r[o].run(y,this);return y}},destroy:function(){this.el&&(o[v].destroy.call(this),m(this),r.remove(this.el),delete this.el)},_rc:function(e,t,n,i){var r,o;a(e)?(r=[],g(this,e,function(n){var i;for(i=r,null==n&&(n=[c.createTextNode("")]),r=this._rcs(n,t,i[0]),n=0;e=i[n++];)t.removeChild(e)})):1===(o=e.nodeType)||3===o?i.push(t.insertBefore(e,n)):f(e)?this._rcs(e,t,n,i):i.push(t.insertBefore(c.createTextNode(e),n))},_rcs:function(e,t,n,i){var r,o,u;if(null==n&&(n=null),null==i&&(i=[]),null==e)return i;for(f(e)||(e=[e]),o=0,u=e.length;u>o;o++)r=e[o],null!=r&&this._rc(r,t,n,i);return i}})}),define("dir/MockNested",["require","cell/defineView!"],function(e){return e("cell/defineView!")({render:function(){return["MockNested"]}})}),window.__installedViews={"dir/MockNested":1,Mock:1},define("Mock",["require","dir/MockNested","cell/defineView!"],function(e){var t;return t=e("dir/MockNested"),e("cell/defineView!")({render:function(e){return["Mock: ",e(t)]}})}),define("App",["require","./Mock"],function(e){var t;return t=e("./Mock"),document.body.appendChild((new t).el)}),require("App");