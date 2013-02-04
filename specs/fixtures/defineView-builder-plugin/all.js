/**
 * almond 0.2.3 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */

var requirejs,require,define;(function(e){function t(e,t){return g.call(e,t)}function n(e,t){var n,r,i,o,u,l,s,c,f,a,d=t&&t.split("/"),h=v.map,p=h&&h["*"]||{};if(e&&"."===e.charAt(0))if(t){for(d=d.slice(0,d.length-1),e=d.concat(e.split("/")),c=0;e.length>c;c+=1)if(a=e[c],"."===a)e.splice(c,1),c-=1;else if(".."===a){if(1===c&&(".."===e[2]||".."===e[0]))break;c>0&&(e.splice(c-1,2),c-=2)}e=e.join("/")}else 0===e.indexOf("./")&&(e=e.substring(2));if((d||p)&&h){for(n=e.split("/"),c=n.length;c>0;c-=1){if(r=n.slice(0,c).join("/"),d)for(f=d.length;f>0;f-=1)if(i=h[d.slice(0,f).join("/")],i&&(i=i[r])){o=i,u=c;break}if(o)break;!l&&p&&p[r]&&(l=p[r],s=c)}!o&&l&&(o=l,u=s),o&&(n.splice(0,u,o),e=n.join("/"))}return e}function r(t,n){return function(){return f.apply(e,_.call(arguments,0).concat([t,n]))}}function i(e){return function(t){return n(t,e)}}function o(e){return function(t){h[e]=t}}function u(n){if(t(p,n)){var r=p[n];delete p[n],m[n]=!0,c.apply(e,r)}if(!t(h,n)&&!t(m,n))throw Error("No "+n);return h[n]}function l(e){var t,n=e?e.indexOf("!"):-1;return n>-1&&(t=e.substring(0,n),e=e.substring(n+1,e.length)),[t,e]}function s(e){return function(){return v&&v.config&&v.config[e]||{}}}var c,f,a,d,h={},p={},v={},m={},g=Object.prototype.hasOwnProperty,_=[].slice;a=function(e,t){var r,o=l(e),s=o[0];return e=o[1],s&&(s=n(s,t),r=u(s),e||(e=t)),s?e=r&&r.normalize?r.normalize(e,i(t)):n(e,t):(e=n(e,t),o=l(e),s=o[0],e=o[1],s&&(r=u(s))),{f:s?s+"!"+e:e,n:e,pr:s,p:r}},d={require:function(e){return r(e)},exports:function(e){var t=h[e];return t!==void 0?t:h[e]={}},module:function(e){return{id:e,uri:"",exports:h[e],config:s(e)}}},c=function(n,i,l,s){var c,f,v,g,_,y,w=[];if(s=s||n,"function"==typeof l){for(i=!i.length&&l.length?["require","exports","module"]:i,_=0;i.length>_;_+=1)if(g=a(i[_],s),f=g.f,"require"===f)w[_]=d.require(n);else if("exports"===f)w[_]=d.exports(n),y=!0;else if("module"===f)c=w[_]=d.module(n);else if(t(h,f)||t(p,f)||t(m,f))w[_]=u(f);else{if(!g.p)throw Error(n+" missing "+f);g.p.load(g.n,r(s,!0),o(f),{}),w[_]=h[f]}v=l.apply(h[n],w),n&&(c&&c.exports!==e&&c.exports!==h[n]?h[n]=c.exports:v===e&&y||(h[n]=v))}else n&&(h[n]=l)},requirejs=require=f=function(t,n,r,i,o){return"string"==typeof t?d[t]?d[t](n):u(a(t,n).f):(t.splice||(v=t,n.splice?(t=n,n=r,r=null):t=e),n=n||function(){},"function"==typeof r&&(r=i,i=o),i?c(e,t,n,r):setTimeout(function(){c(e,t,n,r)},15),f)},f.config=function(e){return v=e,f},define=function(e,n,r){n.splice||(r=n,n=[]),t(h,e)||t(p,e)||(p[e]=[e,n,r])},define.amd={jQuery:!0}})(),define("../../../src/almond",function(){}),define("cell/defineView",["cell/View"],function(e){var t;return t=window.__installedViews||{},{pluginBuilder:"cell/defineView-builder-plugin",load:function(n,r,i){var o;t[n]||(t=!0,o=document.createElement("link"),o.href=r.toUrl(n+".css"),o.rel="stylesheet",o.type="text/css",document.head.appendChild(o)),i(function(t){return t||(t={}),t.className=t._cellName=/(.*\/)?(.*)$/.exec(n)[2],e.extend(t)})}}}),define("util/type",{isA:Array.isArray||function(e){return e instanceof Array},isS:function(e){return"string"==typeof e},isF:function(e){return"function"==typeof e}}),define("dom/data",[],function(){var e,t,n;return n=1,e={},t="dom-"+(new Date).getTime(),{get:function(r,i){var o,u,l;return l=!(null!=i),(o=r[t])?u=e[o]:l&&(e[r[t]=n++]=u={}),u?l?u:u[i]:void 0},set:function(r,i,o){var u,l;(u=r[t])?e[u][i]=o:(e[r[t]=n++]=l={},l[i]=o)},remove:function(n,r){var i,o;(i=n[t])&&(o=e[i])&&(null!=r?delete o[r]:(o.handle&&o.handle.destroy&&o.handle.destroy(),delete e[i],n[t]=void 0))}}}),define("util/ev",{rm:function(e,t,n){var r,i,o;for(i=-1,o="number"==typeof n;r=e[++i];)(o?r[n]===t:r[0]===t&&r[1]===n)&&e.splice(i--,1)}}),define("dom/browser",{msie:Number((/msie (\d+)/.exec(navigator.userAgent.toLowerCase())||[])[1])}),define("dom/events",["util/ev","dom/browser","dom/data"],function(e,t,n){var r,i,o,u,l,s;return i=window.document.addEventListener?function(e,t,n){e.addEventListener(t,n,!1)}:function(e,t,n){e.attachEvent("on"+t,n)},s=window.document.removeEventListener?function(e,t,n){e.removeEventListener(t,n,!1)}:function(e,t,n){e.detachEvent("on"+t,n)},u=function(){r(this.elem,this.events)},o=function(e,r){var i;return i=function(i,o){var u,l,s,c,f,a,d,h;if(i.preventDefault||(i.preventDefault=function(){i.returnValue=!1}),i.stopPropagation||(i.stopPropagation=function(){i.cancelBubble=!0}),i.target||(i.target=i.srcElement||document),null==i.defaultPrevented&&(a=i.preventDefault,i.preventDefault=function(){i.defaultPrevented=!0,a.call(i)},i.defaultPrevented=!1),i.isDefaultPrevented=function(){return i.defaultPrevented},s=r[o||i.type]){for(f=!1,d=0,h=s.length;h>d;d++)c=s[d],f||(f=c[0].viewHandler),c[0].call(c[1]||e,i);if(f)for(l=e;l;){if(u=n.get(l,"cellRef")){"function"==typeof u.updateBinds&&u.updateBinds();break}l=l.parentNode}}8>=t.msie?(i.preventDefault=null,i.stopPropagation=null,i.isDefaultPrevented=null):(delete i.preventDefault,delete i.stopPropagation,delete i.isDefaultPrevented)},i.elem=e,i.events=r,i.destroy=u,i},r=function(e,t){var n;for(n in t)s(e,n,t[n]),delete t[n]},{on:l=function(e,t,r,u){var s,c,f,a;(f=n.get(e,"events"))||n.set(e,"events",f={}),(a=n.get(e,"handle"))||n.set(e,"handle",a=o(e,f)),(c=f[t])||("mouseenter"===t||"mouseleave"===t?(s=0,f.mouseenter=[],f.mouseleave=[],l(e,"mouseover",function(e){return s++,1===s?a(e,"mouseenter"):void 0}),l(e,"mouseout",function(e){return s--,0===s?a(e,"mouseleave"):void 0})):(i(e,t,a),f[t]=[]),c=f[t]),c.push([r,u])},off:function(t,i,o){var u,l;l=n.get(t,"handle"),u=n.get(t,"events"),l&&(null!=i?null!=o?e.rm(u[i],o,0):(s(t,i,u[i]),delete u[i]):r(t,u))}}}),define("util/hash",[],function(){var e;return e=0,function(t){var n;return(n=typeof t)+":"+("object"===n&&null!==t?t.$$hashkey||(t.$$hashkey=(++e).toString(36)):t)}}),define("util/extend",[],function(){return function(e){var t,n,r,i;if(n=this,t=function(r){return this instanceof t?(n.call(this,r),e&&e.constructor&&e.constructor.call(this,r),void 0):new t(r)},t.extend=n.extend,r=function(){},r.prototype=n.prototype,t.prototype=new r,e)for(i in e)t.prototype[i]=e[i];return t}});var __slice=[].slice;define("cell/Events",["util/type","util/extend","util/ev"],function(e,t,n){var r;return r=function(){this._e={any:[]}},r.extend=t,r.prototype={constructor:r,on:function(t,n,r){var i;return e.isS(t)&&e.isF(n)?(((i=this._e)[t]||(i[t]=[])).push([n,r]),!0):void 0},off:function(e,t,r){var i,o;if(o=null!=e?{type:this._e[e]}:this._e,null!=t)null==r&&(r=0);else{if(null==r)return;t=r,r=1}for(e in o)(i=o[e])&&n.rm(i,t,r)},trigger:function(){var e,t,n,r,i;if(n=arguments[0],t=arguments.length>=2?__slice.call(arguments,1):[],e=this._e.any.concat(this._e[n]||[]),i=e.length)for(;i--;)r=e[i],r[0].apply(r[1],[n].concat(t))}},r}),define("cell/Model",["util/hash","util/type","cell/Events"],function(e,t,n){var r,i;return i={add:function(t,n){var r,i;return this.l?((r=this.l[i=e(t)])||(r=this.l[i]={model:t,props:{}}),r.props[n]=1):void 0},start:function(){this.l={}},stop:function(){var e;return e=this.l,this.l=void 0,e}},r=n.extend({constructor:function(e){this._a=e||{}},attributes:function(){var e,t;t={};for(e in this._a)t[e]=this._a[e];return t},get:function(e){return i.add(this,e),this._a[e]},set:function(e,n){var r;return t.isS(e)&&this._a[e]!==n?(r=this._a[e],this.trigger("change:"+e,this,this._a[e]=n,r),!0):void 0},onChangeAndDo:function(e,t,n){this.on("change:"+e,t,n)&&t("initial:"+e,this,this.get(e))}}),r._spy=i,r}),define("cell/View",["util/type","dom/data","dom/events","cell/Model"],function(e,t,n,r){var i,o,u;return o=function(){},u=function(e,t){var r,o,u,l,s,c,f;if(r=[].slice.call(arguments,t&&t.constructor===Object?(s=t,2):1),"string"==typeof e){if(u=/^(\w+)?(#([\w\-]+))?(\.[\w\.\-]+)?$/.exec(e)){c=document.createElement(u[1]||"div"),u[3]&&c.setAttribute("id",u[3]),u[4]&&(c.className=u[4].slice(1).replace(/\./g," "));for(o in s)f=s[o],(l=/^on(\w+)/.exec(o))?(f.viewHandler=!0,n.on(c,l[1],f,this)):this._renderAttr(o,f,c)}}else e&&e.prototype instanceof i&&(c=new e(s).el);return c?(this._renderChildren(r,c),c):void 0},u["if"]=function(e,t){var n;return"function"==typeof t[n=e?"then":"else"]?t[n]():void 0},u.each=function(e,t){var n,r,o;if(e)for(r=e.length,n=-1,o=[];r>++n;)o.push(t.prototype instanceof i?new t({model:e[n]}).el:t(e[n],n,e));return o},i=r.extend({constructor:function(e){this.options=null!=e?e:{},this.model=this.options.model,delete this.options.model,this.collection=this.options.collection,delete this.options.collection,this._constructor(),this._render_el()},beforeRender:o,render_el:function(){return document.createElement("div")},render:o,afterRender:o,__:u,_constructor:function(){var e=this;u=i.prototype.__,this.__=function(){return u.apply(e,arguments)},this.__["if"]=u["if"],this.__.each=u.each},_render_el:function(){var e;this.beforeRender(),this.el=this.render_el(this.__),this.el.className=(e=this.el.className)?e+" "+this._cellName:this._cellName,t.set(this.el,"cellRef",this),this.el.setAttribute("cell",this._cellName),this._renderChildren(this.render(this.__),this.el),this.afterRender()},_renderAttr:function(e,t,n){n.setAttribute(e,t)},_renderChild:function(t,n,r,i){var o;1===(o=t.nodeType)||3===o?i.push(n.insertBefore(t,r)):e.isA(t)?this._renderChildren(t,n,r,i):i.push(n.insertBefore(document.createTextNode(t),r))},_renderChildren:function(t,n,r,i){var o,u,l;if(null==r&&(r=null),null==i&&(i=[]),null==t)return i;for(e.isA(t)||(t=[t]),u=0,l=t.length;l>u;u++)o=t[u],null!=o&&this._renderChild(o,n,r,i);return i}})}),define("dir/MockNested",["require","cell/defineView!"],function(e){return e("cell/defineView!")({render:function(){return["MockNested"]}})}),window.__installedViews={"dir/MockNested":1,Mock:1},define("Mock",["require","dir/MockNested","cell/defineView!"],function(e){var t;return t=e("dir/MockNested"),e("cell/defineView!")({render:function(e){return["Mock: ",e(t)]}})}),define("App",["require","./Mock"],function(e){var t;return t=e("./Mock"),document.body.appendChild((new t).el)}),require("App");