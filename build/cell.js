(function() {
  var E, bind, document, extendObj, inherits, isElement, uniqueId, window;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  E = typeof (typeof console !== "undefined" && console !== null ? console.error : void 0) === 'function' ? function(msg) {
    return console.error(msg);
  } : function() {};
  window = this;
  document = window.document || {
    createElement: function() {}
  };
  isElement = typeof HTMLElement === "object" ? function(o) {
    return o instanceof HTMLElement;
  } : function(o) {
    return typeof o === "object" && o.nodeType === 1 && typeof o.nodeName === "string";
  };
  bind = (function() {
    var fbind, slice;
    slice = Array.prototype.slice;
    if (fbind = Function.prototype.bind) {
      return function(func, obj) {
        return fbind.apply(func, [obj].concat(slice.call(arguments, 2)));
      };
    } else {
      return function(func, obj) {
        var args;
        args = slice.call(arguments, 2);
        return function() {
          return func.apply(obj, args.concat(slice.call(arguments)));
        };
      };
    }
  })();
  extendObj = function(destObj, srcObj) {
    var p;
    for (p in srcObj) {
      destObj[p] = srcObj[p];
    }
    return destObj;
  };
  uniqueId = (function() {
    var postfix;
    postfix = 0;
    return function(prefix) {
      return prefix + (postfix++);
    };
  })();
  inherits = (function() {
    var ctor;
    ctor = function() {};
    return function(parent, protoProps) {
      var child;
      child = protoProps && protoProps.hasOwnProperty('constructor') ? protoProps.constructor : function() {
        return parent.apply(this, arguments);
      };
      extendObj(child, parent);
      ctor.prototype = parent.prototype;
      child.prototype = new ctor();
      extendObj(child.prototype, protoProps);
      child.prototype.constructor = child;
      child.__super__ = parent.prototype;
      return child;
    };
  })();
  define('cell', [], function() {
    var cell, __preinstalledCells__, _ref;
        if ((_ref = window.cell) != null) {
      _ref;
    } else {
      window.cell = cell = (function() {
        var optsToProps, tmpNode;
        tmpNode = document.createElement('div');
        optsToProps = ['model', 'collection', 'class', 'id'];
        return function(options) {
          var className, n, prop, propName, renderHelper_nocheck, _i, _j, _len, _len2, _ref2;
          this.options = options != null ? options : {};
          this._cid = uniqueId('__cell_instance_');
          for (_i = 0, _len = optsToProps.length; _i < _len; _i++) {
            propName = optsToProps[_i];
            if (prop = this.options[propName]) {
              this[propName] = prop;
            }
          }
          this._parent = this.options.parent;
          this._onrender = typeof this.options.onrender === 'function' ? options.onrender : void 0;
          tmpNode.innerHTML = this.__renderOuterHTML;
          this.el = tmpNode.children[0];
          className = "";
          _ref2 = [this.__cell_name, this.el.className, this["class"]];
          for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            n = _ref2[_j];
            if (n) {
              className += className ? ' ' + n : n;
            }
          }
          this.el.className = className;
          (typeof this.id === 'string') && (this.el.id = this.id);
          renderHelper_nocheck = __bind(function(a, b) {
            var e, i, res, type, uid, _k, _len3, _ref3;
            if (a === void 0 || a === null || a === false) {
              return "";
            } else if ((type = typeof a) === 'string' || type === 'number') {
              return a;
            } else if (((_ref3 = a.prototype) != null ? _ref3.cell : void 0) === a) {
              cell = new a(extendObj(b != null ? b : {}, {
                parent: this
              }));
              return "<" + cell.__renderTagName + " id='" + cell._cid + "'></" + cell.__renderTagName + ">";
            } else if (isElement(a)) {
              this._renderQ[uid = uniqueId('__cell_render_node_')] = a;
              return "<" + a.tagName + " id='" + uid + "'></" + a.tagName + ">";
            } else if (a instanceof Array) {
              i = 0;
              res = "";
              if (typeof b !== 'function') {
                b = function(a) {
                  return a;
                };
              }
              for (_k = 0, _len3 = a.length; _k < _len3; _k++) {
                e = a[_k];
                res += renderHelper_nocheck(b(e, i++, a));
              }
              return res;
            } else {
              E('render({CType,HTMLElement,string,number},[cellOptions])');
              return "";
            }
          }, this);
          this._renderHelper = __bind(function(a, cellOpts) {
            if (this._renderQ == null) {
              return "";
            } else {
              return renderHelper_nocheck(a, cellOpts);
            }
          }, this);
          return this.update();
        };
      })();
    };
    cell.extend = (function() {
      var eventsNameRegex, extend, renderFuncNameRegex;
      renderFuncNameRegex = /render( <(\w+)([ ]+.*)*>)*/;
      eventsNameRegex = /bind( (.+))?/;
      return extend = function(protoProps, name) {
        var bindProp, child, css, cssref, desc, ebinds, el, handler, match, p, prop, propName, tag, _ref2, _ref3, _ref4;
        ebinds = [];
        for (propName in protoProps) {
          prop = protoProps[propName];
          if ((match = eventsNameRegex.exec(propName)) && typeof prop === 'object') {
            bindProp = (_ref2 = match[2]) != null ? _ref2 : 'el';
            for (desc in prop) {
              handler = prop[desc];
              if (typeof handler === 'string') {
                prop[desc] = (_ref3 = protoProps[handler]) != null ? _ref3 : this.prototype[handler];
              }
            }
            ebinds.push({
              prop: bindProp,
              desc: prop
            });
          } else if (!protoProps.__renderTagName && (match = renderFuncNameRegex.exec(propName))) {
            if (typeof (protoProps.__render = prop) !== 'function') {
              E("cell.extend expects '" + propName + "' to be a function");
              return;
            }
            tag = protoProps.__renderTagName = match[2] !== "" && match[2] || 'div';
            protoProps.__renderOuterHTML = "<" + tag + ((_ref4 = match[3]) != null ? _ref4 : "") + "></" + tag + ">";
          }
        }
        if (ebinds.length) {
          protoProps.__eventBindings = ebinds;
        }
        child = inherits(this, protoProps);
        if (!(p = child.prototype).__renderTagName) {
          return E('cell.extend([constructor:Function],prototypeMembers:Object): could not find a render function in prototypeMembers');
        } else {
          child.extend = extend;
          p.cell = child;
          if (name) {
            p.__cell_name = name;
          }
          if (typeof (css = protoProps.css) === 'string') {
            el = document.createElement('style');
            el.innerHTML = css;
          } else if (typeof (cssref = protoProps.css_href) === 'string') {
            el = document.createElement('link');
            el.href = cssref;
            el.rel = 'stylesheet';
          }
          if (el) {
            el.type = 'text/css';
            $('head')[0].appendChild(el);
          }
          return child;
        }
      };
    })();
    cell.prototype = {
      $: function(selector) {
        return $(selector, this.el);
      },
      update: function() {
        var innerHTML;
        if (!this._renderQ) {
          this._renderQ = {};
          if (typeof this.initialize === "function") {
            this.initialize();
          }
          if (typeof (innerHTML = this.__render(this._renderHelper, bind(this.__renderinnerHTML, this))) === 'string') {
            return this.__renderinnerHTML(innerHTML);
          }
        }
      },
      __delegateEvents: (function() {
        var bindablebinder, elEventRegex, elbinder, getBinders, selbinder;
        elEventRegex = /^(\w+)\s*(.*)$/;
        selbinder = function(sel, eventName, prop, handler, obj) {
          var observed;
          handler = bind(handler, obj);
          eventName = "" + eventName + "." + obj._cid;
          (observed = $(obj[prop])).delegate(sel, eventName, handler);
          return function() {
            return observed.undelegate(sel, eventName, handler);
          };
        };
        elbinder = function(eventName, prop, handler, obj) {
          var observed;
          handler = bind(handler, obj);
          (observed = $(obj[prop])).bind(eventName, handler);
          return function() {
            return observed.unbind(eventName, handler);
          };
        };
        bindablebinder = function(eventName, prop, handler, obj) {
          var observed;
          handler = bind(handler, obj);
          (observed = obj[prop]).bind(eventName, handler);
          return function() {
            return observed.unbind(eventName, handler);
          };
        };
        getBinders = function(obj, prop, bindDesc) {
          var binders, desc, eventName, handler, match, matched, observed, sel, selector, _ref2, _ref3;
          observed = obj[prop];
          binders = [];
          for (desc in bindDesc) {
            handler = bindDesc[desc];
            if (typeof desc === 'string') {
              if (observed.nodeType === 1) {
                _ref3 = (_ref2 = elEventRegex.exec(desc)) != null ? _ref2 : [], matched = _ref3[0], eventName = _ref3[1], selector = _ref3[2];
                if (match = elEventRegex.exec(desc)) {
                  binders.push((sel = match[2]) ? bind(selbinder, null, sel, eventName, prop, handler) : bind(elbinder, null, eventName, prop, handler));
                }
              } else if (typeof observed.bind === 'function') {
                binders.push(bind(bindablebinder, null, desc, prop, handler));
              }
            }
          }
          return binders;
        };
        return function() {
          var b, binderCache, ebindings, ub, _i, _j, _k, _len, _len2, _len3, _ref2, _ref3;
          if (this._unbinds) {
            _ref2 = this._unbinds;
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              ub = _ref2[_i];
              try {
                ub();
              } catch (_e) {}
            }
            delete this._unbinds;
          }
          if (ebindings = this.cell.prototype.__eventBindings) {
            delete this.cell.prototype.__eventBindings;
            binderCache = [];
            for (_j = 0, _len2 = ebindings.length; _j < _len2; _j++) {
              b = ebindings[_j];
              binderCache = binderCache.concat(getBinders(this, b.prop, b.desc));
            }
            this.cell.prototype.__binderCache = binderCache;
          }
          if (this.__binderCache) {
            this._unbinds = [];
            _ref3 = this.__binderCache;
            for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
              b = _ref3[_k];
              this._unbinds.push(b(this));
            }
          }
        };
      })(),
      __renderinnerHTML: function(innerHTML) {
        var child, pcid, _ref2;
        if (this._renderQ) {
          this.el.innerHTML = this._ie_hack_innerHTML = innerHTML;
          _ref2 = this._renderQ;
          for (pcid in _ref2) {
            child = _ref2[pcid];
            if (!child.el.innerHTML) {
              child.el.innerHTML = child._ie_hack_innerHTML;
            }
            this.$("#" + pcid).replaceWith(child.el);
            delete child._ie_hack_innerHTML;
          }
          delete this._renderQ;
          return this.__onrender();
        }
      },
      __onchildrender: function(cell) {
        if (this._renderQ) {
          return this._renderQ[cell._cid] = cell;
        } else {
          delete cell._ie_hack_innerHTML;
          return this.$("#" + cell._cid).replaceWith(cell.el);
        }
      },
      __onrender: function() {
        var _ref2;
        this.__delegateEvents();
        if ((_ref2 = this._parent) != null) {
          if (typeof _ref2.__onchildrender === "function") {
            _ref2.__onchildrender(this);
          }
        }
        try {
          return typeof this._onrender === "function" ? this._onrender(this) : void 0;
        } catch (_e) {}
      }
    };
    $(function() {
      var cellname, node, _i, _len, _ref2;
      _ref2 = $('[data-cell]');
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        node = _ref2[_i];
        if (cellname = node.getAttribute('data-cell')) {
          (function(node) {
            var baseurl, cachebust, cachebustAttr, opts;
            opts = {};
            cachebust = /(^\?cachebust)|(&cachebust)/.test(window.location.search);
            if (((cachebustAttr = node.getAttribute('data-cell-cachebust')) !== null || cachebust) && cachebustAttr !== 'false') {
              opts.urlArgs = "bust=" + (new Date().getTime());
            }
            if (baseurl = node.getAttribute('data-cell-baseurl')) {
              opts.baseUrl = baseurl;
            }
            return require(opts, ["cell!" + cellname], function(CType) {
              return $(node).append(new CType().el);
            });
          })(node);
        }
      }
    });
    return {
      /*
        Exports
        */
      __preinstalledCells__: __preinstalledCells__ = [],
      pluginBuilder: 'cell-pluginBuilder',
      load: (function() {
        var moduleNameRegex;
        moduleNameRegex = /(.*\/)?(.*)/;
        return function(name, req, load, config) {
          req([name], function(CDef) {
            var cname, found, _i, _len, _ref2;
            if (typeof CDef !== 'object') {
              E("Couldn't load " + name + " cell. cell definitions should be objects, but instead was " + (typeof CDef));
            } else {
              found = false;
              for (_i = 0, _len = __preinstalledCells__.length; _i < _len; _i++) {
                cname = __preinstalledCells__[_i];
                if (name === cname) {
                  found = true;
                }
              }
              if (!found) {
                                if ((_ref2 = CDef.css_href) != null) {
                  _ref2;
                } else {
                  CDef.css_href = req.toUrl("" + name + ".css");
                };
              }
              load(cell.extend(CDef, moduleNameRegex.exec(name)[2]));
            }
          });
        };
      })()
    };
  });
}).call(this);
