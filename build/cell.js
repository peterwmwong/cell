(function() {
  var E, bind, cell, document, exports, extendObj, inherits, isElement, uniqueId, window, _ref;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  E = (typeof (typeof console !== "undefined" && console !== null ? console.error : void 0) === 'function') && (function(msg) {
    return console.error(msg);
  }) || function() {};
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
    if ((_ref = window.cell) != null) {
    _ref;
  } else {
    window.cell = cell = (function() {
      var optsToProps, tmpNode;
      tmpNode = document.createElement('div');
      optsToProps = ['id', 'class', 'model', 'collection'];
      return function(options) {
        var className, n, p, val, _i, _j, _len, _len2, _ref2;
        this.options = options != null ? options : {};
        this._cid = uniqueId('__cell_instance_');
        for (_i = 0, _len = optsToProps.length; _i < _len; _i++) {
          p = optsToProps[_i];
          if ((val = this.options[p])) {
            this[p] = val;
          }
        }
        tmpNode.innerHTML = this.__renderOuterHTML;
        this.el = tmpNode.children[0];
        this.$el = $(this.el);
        className = "";
        _ref2 = [this.cell.prototype.name, this.el.className, this["class"]];
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          n = _ref2[_j];
          if (n) {
            className += ' ' + n;
          }
        }
        if (className !== "") {
          this.el.className = className;
        }
        (typeof this.id === 'string') && (this.el.id = this.id);
        this.update();
      };
    })();
  };
  cell.extend = (function() {
    var eventSelRegex, eventsNameRegex, renderFuncNameRegex;
    renderFuncNameRegex = /render([ ]+<(\w+)([ ]+.*)*>[ ]*)?$/;
    eventsNameRegex = /bind( (.+))?/;
    eventSelRegex = /^(\w+)(\s(.*))?$/;
    return function(protoProps, name) {
      var bindProp, binds, child, css, cssref, desc, el, handler, match, p, prop, propName, selmatch, tag, _ref2, _ref3, _ref4;
      protoProps.__eventBindings = ((_ref2 = this.prototype.__eventBindings) != null ? _ref2.slice(0) : void 0) || [];
      for (propName in protoProps) {
        prop = protoProps[propName];
        if ((match = eventsNameRegex.exec(propName)) && typeof prop === 'object') {
          bindProp = (_ref3 = match[2]) != null ? _ref3 : 'el';
          binds = [];
          for (desc in prop) {
            handler = prop[desc];
            if ((selmatch = eventSelRegex.exec(desc))) {
              binds.push({
                name: selmatch[1],
                sel: selmatch[3],
                handler: handler
              });
            }
          }
          if (binds.length) {
            protoProps.__eventBindings.push({
              prop: bindProp,
              binds: binds
            });
          }
        } else if (!protoProps.__renderTagName && (match = renderFuncNameRegex.exec(propName))) {
          if (typeof (protoProps.__render = prop) !== 'function') {
            E("cell.extend expects '" + propName + "' to be a function");
            return;
          }
          tag = protoProps.__renderTagName = match[2] !== "" && match[2] || 'div';
          protoProps.__renderOuterHTML = "<" + tag + ((_ref4 = match[3]) != null ? _ref4 : "") + "></" + tag + ">";
        }
      }
      if (typeof name === 'string') {
        protoProps.name = name;
      }
      child = inherits(this, protoProps);
      if (!(p = child.prototype).__renderTagName) {
        return E('cell.extend([constructor:Function],prototypeMembers:Object): could not find a render function in prototypeMembers');
      } else {
        child.extend = cell.extend;
        p.cell = child;
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
      if (typeof this.init === "function") {
        this.init(this.options);
      }
      if (typeof (innerHTML = this.__render(bind(this.renderHelper, this), bind(this.__renderinnerHTML, this))) === 'string') {
        this.__renderinnerHTML(innerHTML);
      }
    },
    renderHelper: function(a, b) {
      var acell, e, i, res, type, uid, _i, _len, _ref2;
      if (a === void 0 || a === null || a === false) {
        return "";
      } else if ((type = typeof a) === 'string' || type === 'number') {
        return a;
      } else if (((_ref2 = a.prototype) != null ? _ref2.cell : void 0) === a) {
        acell = new a(extendObj(b != null ? b : {}));
        this.$el.one('beforeDelegateEvents', __bind(function() {
          try {
            return this.$("#" + acell._cid).replaceWith(acell.el);
          } catch (_e) {}
        }, this));
        return "<" + acell.__renderTagName + " id='" + acell._cid + "'></" + acell.__renderTagName + ">";
      } else if (isElement(a)) {
        uid = uniqueId('__cell_render_node_');
        this.$el.one('beforeDelegateEvents', __bind(function() {
          try {
            return this.$("#" + uid).replaceWith(a);
          } catch (_e) {}
        }, this));
        return "<" + a.tagName + " id='" + uid + "'></" + a.tagName + ">";
      } else if (a instanceof Array) {
        i = 0;
        res = "";
        if (typeof b !== 'function') {
          b = function(a) {
            return a;
          };
        }
        for (_i = 0, _len = a.length; _i < _len; _i++) {
          e = a[_i];
          res += this.renderHelper(b(e, i++, a));
        }
        return res;
      } else {
        E('render({CType,HTMLElement,string,number},[cellOptions])');
        return "";
      }
    },
    __delegateEvents: function() {
      var binds, handler, name, obj, prop, sel, ub, _fn, _i, _j, _k, _len, _len2, _len3, _ref2, _ref3, _ref4, _ref5;
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
      this._unbinds = [];
      _ref3 = this.__eventBindings;
      for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
        _ref4 = _ref3[_j], prop = _ref4.prop, binds = _ref4.binds;
        if (isElement(obj = this[prop])) {
          obj = this.$(obj);
          _fn = __bind(function(obj, name, sel, handler) {
            if (typeof handler === 'string') {
              handler = this[handler];
            }
            if (typeof handler === 'function') {
              handler = bind(handler, this);
              this._unbinds.push(sel ? (obj.delegate(sel, name, handler), function() {
                obj.undelegate(sel, name, handler);
              }) : (obj.bind(name, handler), function() {
                obj.unbind(name, handler);
              }));
            }
          }, this);
          for (_k = 0, _len3 = binds.length; _k < _len3; _k++) {
            _ref5 = binds[_k], name = _ref5.name, sel = _ref5.sel, handler = _ref5.handler;
            _fn(obj, name, sel, handler);
          }
        }
      }
    },
    __renderinnerHTML: function(innerHTML) {
      this.$el.html(innerHTML).trigger('beforeDelegateEvents', this);
      this.__delegateEvents();
      this.$el.trigger('afterRender');
    }
  };
  if (typeof define === 'function' && typeof require === 'function') {
    define('cell', [], exports = {
      pluginBuilder: 'cell-pluginBuilder',
      load: (function() {
        var loadDef, moduleNameRegex;
        moduleNameRegex = /(.*\/)?(.*)/;
        loadDef = function(name, load, parentCell, def) {
          return load(parentCell.extend(def, moduleNameRegex.exec(name)[2]));
        };
        return function(name, req, load, config) {
          req([name], function(CDef) {
            var _ref2, _ref3;
            if (typeof CDef !== 'object') {
              E("Couldn't load " + name + " cell. cell definitions should be objects, but instead was " + (typeof CDef));
            } else {
              if (typeof ((_ref2 = exports.__preinstalledCells__) != null ? _ref2[name] : void 0) === 'undefined') {
                                if ((_ref3 = CDef.css_href) != null) {
                  _ref3;
                } else {
                  CDef.css_href = req.toUrl("" + name + ".css");
                };
              }
              if (typeof CDef["extends"] === 'string') {
                req(["cell!" + CDef["extends"]], function(parentCell) {
                  if (parentCell.prototype.name) {
                    CDef["class"] = "" + parentCell.prototype.name + (CDef["class"] || "");
                  }
                  loadDef(name, load, parentCell, CDef);
                });
              } else {
                loadDef(name, load, cell, CDef);
              }
            }
          });
        };
      })()
    });
    require(['cell'], function(cell) {
      require.ready(function() {
        $('[data-cell]').each(function() {
          var baseurl, cachebust, cachebustAttr, cellname, node, opts;
          node = this;
          if (cellname = node.getAttribute('data-cell')) {
            opts = {};
            cachebust = /(^\?cachebust)|(&cachebust)/.test(window.location.search);
            if (((cachebustAttr = node.getAttribute('data-cell-cachebust')) !== null || cachebust) && cachebustAttr !== 'false') {
              opts.urlArgs = "bust=" + (new Date().getTime());
            }
            if (baseurl = node.getAttribute('data-cell-baseurl')) {
              opts.baseUrl = baseurl;
            }
            require(opts, ["cell!" + cellname], function(CType) {
              $(node).append(new CType().el);
            });
          }
        });
      });
    });
  }
}).call(this);
