/**
 * almond 0.2.3 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */

var requirejs,require,define;(function(e){function n(e,n){return g.call(e,n)}function t(e,n){var t,r,i,o,u,l,c,f,s,d,a=n&&n.split("/"),p=h.map,v=p&&p["*"]||{};if(e&&"."===e.charAt(0))if(n){for(a=a.slice(0,a.length-1),e=a.concat(e.split("/")),f=0;e.length>f;f+=1)if(d=e[f],"."===d)e.splice(f,1),f-=1;else if(".."===d){if(1===f&&(".."===e[2]||".."===e[0]))break;f>0&&(e.splice(f-1,2),f-=2)}e=e.join("/")}else 0===e.indexOf("./")&&(e=e.substring(2));if((a||v)&&p){for(t=e.split("/"),f=t.length;f>0;f-=1){if(r=t.slice(0,f).join("/"),a)for(s=a.length;s>0;s-=1)if(i=p[a.slice(0,s).join("/")],i&&(i=i[r])){o=i,u=f;break}if(o)break;!l&&v&&v[r]&&(l=v[r],c=f)}!o&&l&&(o=l,u=c),o&&(t.splice(0,u,o),e=t.join("/"))}return e}function r(n,t){return function(){return s.apply(e,_.call(arguments,0).concat([n,t]))}}function i(e){return function(n){return t(n,e)}}function o(e){return function(n){p[e]=n}}function u(t){if(n(v,t)){var r=v[t];delete v[t],m[t]=!0,f.apply(e,r)}if(!n(p,t)&&!n(m,t))throw Error("No "+t);return p[t]}function l(e){var n,t=e?e.indexOf("!"):-1;return t>-1&&(n=e.substring(0,t),e=e.substring(t+1,e.length)),[n,e]}function c(e){return function(){return h&&h.config&&h.config[e]||{}}}var f,s,d,a,p={},v={},h={},m={},g=Object.prototype.hasOwnProperty,_=[].slice;d=function(e,n){var r,o=l(e),c=o[0];return e=o[1],c&&(c=t(c,n),r=u(c),e||(e=n)),c?e=r&&r.normalize?r.normalize(e,i(n)):t(e,n):(e=t(e,n),o=l(e),c=o[0],e=o[1],c&&(r=u(c))),{f:c?c+"!"+e:e,n:e,pr:c,p:r}},a={require:function(e){return r(e)},exports:function(e){var n=p[e];return n!==void 0?n:p[e]={}},module:function(e){return{id:e,uri:"",exports:p[e],config:c(e)}}},f=function(t,i,l,c){var f,s,h,g,_,y,w=[];if(c=c||t,"function"==typeof l){for(i=!i.length&&l.length?["require","exports","module"]:i,_=0;i.length>_;_+=1)if(g=d(i[_],c),s=g.f,"require"===s)w[_]=a.require(t);else if("exports"===s)w[_]=a.exports(t),y=!0;else if("module"===s)f=w[_]=a.module(t);else if(n(p,s)||n(v,s)||n(m,s))w[_]=u(s);else{if(!g.p)throw Error(t+" missing "+s);g.p.load(g.n,r(c,!0),o(s),{}),w[_]=p[s]}h=l.apply(p[t],w),t&&(f&&f.exports!==e&&f.exports!==p[t]?p[t]=f.exports:h===e&&y||(p[t]=h))}else t&&(p[t]=l)},requirejs=require=s=function(n,t,r,i,o){return"string"==typeof n?a[n]?a[n](t):u(d(n,t).f):(n.splice||(h=n,t.splice?(n=t,t=r,r=null):n=e),t=t||function(){},"function"==typeof r&&(r=i,i=o),i?f(e,n,t,r):setTimeout(function(){f(e,n,t,r)},15),s)},s.config=function(e){return h=e,s},define=function(e,t,r){t.splice||(r=t,t=[]),n(p,e)||n(v,e)||(v[e]=[e,t,r])},define.amd={jQuery:!0}})(),define("../../../src/almond",function(){}),define("cell/defineView",["cell/View"],function(e){var n;return n=window.__installedViews||{},{pluginBuilder:"cell/defineView-builder-plugin",load:function(t,r,i){var o;n[t]||(n=!0,o=document.createElement("link"),o.href=r.toUrl(t+".css"),o.rel="stylesheet",o.type="text/css",document.head.appendChild(o)),i(function(n){return n||(n={}),n.className=n._cellName=/(.*\/)?(.*)$/.exec(t)[2],e.extend(n)})}}}),define("dom/data",[],function(){var e,n,t;return t=1,e={},n="dom-"+(new Date).getTime(),{get:function(r,i){var o,u,l;return l=!(null!=i),(o=r[n])?u=e[o]:l&&(e[r[n]=t++]=u={}),u?l?u:u[i]:void 0},set:function(r,i,o){var u,l;(u=r[n])?e[u][i]=o:(e[r[n]=t++]=l={},l[i]=o)},remove:function(t,r){var i,o;(i=t[n])&&(o=e[i])&&(null!=r?delete o[r]:(o.handle&&o.handle.destroy&&o.handle.destroy(),delete e[i],t[n]=void 0))}}}),define("dom/mutate",["dom/data"],function(e){var n;return n=function(t){var r,i,o,u,l;for(e.remove(t),u=t.children,l=[],i=0,o=u.length;o>i;i++)r=u[i],l.push(n(r));return l},{remove:function(e){var t;return n(e),(t=e.parentNode)?t.removeChild(e):void 0}}}),define("dom/browser",{msie:Number((/msie (\d+)/.exec(navigator.userAgent.toLowerCase())||[])[1])}),define("dom/events",["dom/browser","dom/data"],function(e,n){var t,r,i,o,u,l,c;return l=Array.prototype.indexOf?function(e,n){return e.indexOf(n)}:function(e,n){var t,r;for(r=0;t=e[r++];)if(t===n)return r-1;return-1},i=function(e,n){e.splice(l(e,n),1)},r=window.document.addEventListener?function(e,n,t){e.addEventListener(n,t,!1)}:function(e,n,t){e.attachEvent("on"+n,t)},c=window.document.removeEventListener?function(e,n,t){e.removeEventListener(n,t,!1)}:function(e,n,t){e.detachEvent("on"+n,t)},u=function(n,r){var i;return i=function(t,i){var o,u,l,c,f;if(t.preventDefault||(t.preventDefault=function(){t.returnValue=!1}),t.stopPropagation||(t.stopPropagation=function(){t.cancelBubble=!0}),t.target||(t.target=t.srcElement||document),null==t.defaultPrevented&&(l=t.preventDefault,t.preventDefault=function(){t.defaultPrevented=!0,l.call(t)},t.defaultPrevented=!1),t.isDefaultPrevented=function(){return t.defaultPrevented},o=r[i||t.type])for(c=0,f=o.length;f>c;c++)u=o[c],u.call(n,t);return 8>=e.msie?(t.preventDefault=null,t.stopPropagation=null,t.isDefaultPrevented=null):(delete t.preventDefault,delete t.stopPropagation,delete t.isDefaultPrevented)},i.elem=n,i.destroy=function(){return t(n,r)},i},t=function(e,n){var t;for(t in n)c(e,t,n[t]),delete n[t]},{bind:o=function(e,t,i){var l,c,f,s,d,a,p;for((f=n.get(e,"events"))||n.set(e,"events",f={}),(s=n.get(e,"handle"))||n.set(e,"handle",s=u(e,f)),p=t.split(" "),d=0,a=p.length;a>d;d++)t=p[d],(c=f[t])||("mouseenter"===t||"mouseleave"===t?(l=0,f.mouseenter=[],f.mouseleave=[],o(e,"mouseover",function(e){return l++,1===l?s(e,"mouseenter"):void 0}),o(e,"mouseout",function(e){return l--,0===l?s(e,"mouseleave"):void 0})):(r(e,t,s),f[t]=[]),c=f[t]),c.push(i)},unbind:function(e,r,o){var u,l;l=n.get(e,"handle"),u=n.get(e,"events"),l&&(null!=r?null!=o?i(u[r],o):(c(e,r,u[r]),delete u[r]):t(e,u))}}}),define("cell/View",["dom/mutate","dom/data","dom/events"],function(e,n,t){var r,i,o;return i=Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)},o=function(e,n){var i,o,u,l,c,f,s;if(i=[].slice.call(arguments,n&&n.constructor===Object?(c=n,2):1),"string"==typeof e){if(u=/^(\w+)?(#([\w\-]+))?(\.[\w\.\-]+)?$/.exec(e)){f=document.createElement(u[1]||"div"),u[3]&&f.setAttribute("id",u[3]),u[4]&&(f.className=u[4].slice(1).replace(/\./g," "));for(o in c)s=c[o],(l=/^on(\w+)/.exec(o))?t.bind(f,l[1],s):this._renderAttr(o,s,f)}}else e&&e.prototype instanceof r&&(f=new e(c).el);return f?(this._renderChildren(i,f),f):void 0},o["if"]=function(e,n){var t;return"function"==typeof n[t=e?"then":"else"]?n[t]():void 0},o.each=function(e,n){var t,r,i,o,u;for(u=[],t=i=0,o=e.length;o>i;t=++i)r=e[t],u.push(n(r,t,e));return u},r=function(e){var n;this.options=e,null==(n=this.options)&&(this.options={}),this._constructor(),this._render_el()},r.prototype={beforeRender:function(){},render_el:function(){return document.createElement("div")},render:function(){},afterRender:function(){},__:o,remove:function(){e.remove(this.el),delete this.el},_constructor:function(){var e=this;o=r.prototype.__,this.__=function(){return o.apply(e,arguments)},this.__["if"]=o["if"],this.__.each=o.each},_render_el:function(){var e;return this.beforeRender(),this.el=this.render_el(this.__),this.el.className=(e=this.el.className)?e+" "+this._cellName:this._cellName,n.set(this.el,"cellRef",this),this.el.setAttribute("cell",this._cellName),this._renderChildren(this.render(this.__),this.el),this.afterRender()},_renderAttr:function(e,n,t){t.setAttribute(e,n)},_renderChild:function(e,n,t,r){var o;1===(o=e.nodeType)||3===o?r.push(n.insertBefore(e,t)):i(e)?this._renderChildren(e,n,t,r):r.push(n.insertBefore(document.createTextNode(e),t))},_renderChildren:function(e,n,t,r){var o,u,l;if(null==t&&(t=null),null==r&&(r=[]),null==e)return r;for(i(e)||(e=[e]),u=0,l=e.length;l>u;u++)o=e[u],null!=o&&this._renderChild(o,n,t,r);return r}},r.extend=function(e){var n,t,r,i,o;if(t=this,n=function(e){t.call(this,e)},n.extend=t.extend,r=function(){},r.prototype=t.prototype,n.prototype=new r,e)for(i in e)o=e[i],n.prototype[i]=o;return n},r}),define("dir/MockNested",["require","cell/defineView!"],function(e){return e("cell/defineView!")({render:function(){return["MockNested"]}})}),window.__installedViews={"dir/MockNested":1,Mock:1},define("Mock",["require","dir/MockNested","cell/defineView!"],function(e){var n;return n=e("dir/MockNested"),e("cell/defineView!")({render:function(e){return["Mock: ",e(n)]}})}),define("App",["require","./Mock"],function(e){var n;return n=e("./Mock"),document.body.appendChild((new n).el)}),require("App");