(function() {
  var E, cell, document, exports, fbind, window, _bind, _ctor, _evSelRx, _extendObj, _inherits, _isNode, _modNameRx, _renderNodes, _renderParent, _selRx, _slice, _tagnameRx, _tmpNode;
  var __slice = Array.prototype.slice;
  E = (typeof (typeof console !== "undefined" && console !== null ? console.error : void 0) === 'function') && (function(msg) {
    return console.error(msg);
  }) || function() {};
  window = this;
  document = window.document || {
    createElement: function() {}
  };
  _isNode = typeof Node === 'object' ? function(o) {
    return o instanceof Node;
  } : function(o) {
    return typeof o === 'object' && typeof o.nodeType === 'number' && typeof o.nodeName === 'string';
  };
  _slice = Array.prototype.slice;
  _bind = (fbind = Function.prototype.bind) ? function(func, obj) {
    return fbind.apply(func, [obj].concat(_slice.call(arguments, 2)));
  } : function(func, obj) {
    var args;
    args = _slice.call(arguments, 2);
    return function() {
      return func.apply(obj, args.concat(_slice.call(arguments)));
    };
  };
  _extendObj = function(destObj, srcObj) {
    var p;
    for (p in srcObj) {
      destObj[p] = srcObj[p];
    }
    return destObj;
  };
  _ctor = function() {};
  _inherits = function(parent, protoProps) {
    var child;
    child = protoProps && protoProps.hasOwnProperty('constructor') ? protoProps.constructor : function() {
      return parent.apply(this, arguments);
    };
    _extendObj(child, parent);
    _ctor.prototype = parent.prototype;
    child.prototype = new _ctor();
    _extendObj(child.prototype, protoProps);
    child.prototype.constructor = child;
    child.__super__ = parent.prototype;
    return child;
  };
  _tmpNode = document.createElement('div');
  _renderNodes = function(parent, nodes) {
    var c, _ref;
    while (nodes.length > 0) {
      if ((c = nodes.shift()) != null) {
        if (_isNode(c)) {
          parent.appendChild(c);
        } else if ((_ref = typeof c) === 'string' || _ref === 'number') {
          parent.appendChild(document.createTextNode(c));
        } else if (c instanceof Array) {
          Array.prototype.unshift.apply(nodes, c);
        } else {
          E('renderNodes: unsupported child type = ' + c);
        }
      }
    }
    return parent;
  };
  _selRx = /^(\w+)?(#([\w\-]+))*(\.[\w\.\-]+)?$/;
  _tagnameRx = /^<[A-z]/;
  _evSelRx = /^([A-z]+)(\s(.*))?$/;
  _renderParent = function(a, b) {
    var el, k, m, v, _ref;
    if (typeof a === 'string') {
      if (m = _selRx.exec(a)) {
        el = document.createElement(m[1] || 'div');
        if (v = m[3]) {
          el.id = v;
        }
        if (b) {
          if ('class' in b) {
            el.className += b["class"];
            delete b["class"];
          }
          for (k in b) {
            v = b[k];
            el.setAttribute(k, v);
          }
        }
        if (v = m[4]) {
          el.className += v.replace(/\./g, ' ');
        }
        return el;
      } else if (_tagnameRx.test(a)) {
        _tmpNode.innerHTML = a;
        return _tmpNode.children[0];
      } else {
        return E("renderParent: unsupported parent string = '" + a + "'");
      }
    } else if (((_ref = a.prototype) != null ? _ref.cell : void 0) === a) {
      return (new a(b)).el;
    } else if (_isNode(a)) {
      return a;
    } else {
      return E("renderParent: unsupported parent type = " + a);
    }
  };
  window.cell = cell = function(options) {
    var id, n, nodes, t, _i, _len, _ref;
    this.options = options != null ? options : {};
    if (typeof this.init === "function") {
      this.init(this.options);
    }
    _tmpNode.innerHTML = (t = typeof this.tag) === 'string' ? this.tag : t === 'function' ? this.tag() : '<div>';
    this.$el = $(this.el = _tmpNode.children[0]);
    if (id = this.options.id) {
      this.el.id = id;
    }
    _ref = [this.cell.prototype.name, this["class"], this.options["class"]];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      n = _ref[_i];
      if (n) {
        this.el.className += ' ' + n;
      }
    }
    if (this.render) {
      if ((nodes = this.render(this.$R, _bind(this._renderChildren, this))) instanceof Array) {
        this._renderChildren(nodes);
      }
    } else {
      this._renderChildren([]);
    }
  };
  cell.prototype = {
    $R: function() {
      var a, b, children, parent;
      a = arguments[0], b = arguments[1], children = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      if (a) {
        if ((b != null ? b.constructor : void 0) !== Object) {
          children.unshift(b);
          b = void 0;
        }
        if (parent = _renderParent(a, b)) {
          return _renderNodes(parent, children);
        }
      }
    },
    $: function(selector) {
      return $(selector, this.el);
    },
    ready: function(f) {
      var _ref;
      if (this._isReady) {
        try {
          return f(this);
        } catch (_e) {}
      } else {
        return ((_ref = this._readys) != null ? _ref : this._readys = []).push(f);
      }
    },
    _renderChildren: function(nodes) {
      var r, _i, _len, _ref;
      _renderNodes(this.el, nodes);
      this._delegateEvents();
      if (typeof this.afterRender === "function") {
        this.afterRender();
      }
      this._isReady = true;
      if (this._readys) {
        _ref = this._readys;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          r = _ref[_i];
          try {
            r(this);
          } catch (_e) {}
        }
        delete this._readys;
      }
    },
    _delegateEvents: function() {
      var evSel, event, handler, m, sel, _ref;
      _ref = this.on;
      for (evSel in _ref) {
        handler = _ref[evSel];
        if ((typeof handler === 'function') && (m = _evSelRx.exec(evSel))) {
          handler = _bind(handler, this);
          if (event = m[1]) {
            if (sel = m[3]) {
              this.$el.delegate(sel, event, handler);
            } else {
              this.$el.bind(event, handler);
            }
          }
        }
      }
    }
  };
  cell.extend = function(protoProps, name) {
    var child, css, cssref, el;
    if (typeof name === 'string') {
      protoProps.name = name;
    }
    child = _inherits(this, protoProps);
    child.extend = cell.extend;
    child.prototype.cell = child;
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
  };
  if (typeof define === 'function' && typeof require === 'function') {
    _modNameRx = /(.*\/)?(.*)/;
    define('cell', [], exports = {
      pluginBuilder: 'cell-pluginBuilder',
      load: function(name, req, load, config) {
        req([name], function(CDef) {
          var m, _ref, _ref2;
          if (typeof CDef !== 'object') {
            E("Couldn't load " + name + " cell. cell definitions should be objects, but instead was " + (typeof CDef));
          } else {
            m = _modNameRx.exec(name).slice(1);
            if (typeof ((_ref = exports.__preinstalledCells__) != null ? _ref[name] : void 0) === 'undefined') {
              if ((_ref2 = CDef.css_href) == null) {
                CDef.css_href = req.toUrl("" + name + ".css");
              }
            }
            if (typeof CDef["extends"] === 'string') {
              req(["cell!" + CDef["extends"]], function(parentCell) {
                if (parentCell.prototype.name) {
                  CDef["class"] = parentCell.prototype.name + (" " + CDef["class"]) || "";
                }
                load(parentCell.extend(CDef, m[1]));
              });
            } else {
              load(cell.extend(CDef, m[1]));
            }
          }
        });
      }
    });
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
    return;
  }
}).call(this);
