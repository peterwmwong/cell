(function() {
  var E, cell, document, exports, window, _bind, _createDiv, _fnode, _isArray, _isNode, _modNameRx, _range, _renderNodes;
  var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

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

  _isArray = Array.isArray ? Array.isArray : (function() {
    var _push;
    _push = Array.prototype.push;
    return function(obj) {
      return obj.push === push && (obj.length != null);
    };
  })();

  _bind = Function.prototype.bind ? function(func, obj) {
    return func.bind(obj);
  } : function(func, obj) {
    return function() {
      return func.apply(obj, arguments);
    };
  };

  _createDiv = function() {
    return document.createElement('div');
  };

  _range = document.createRange();

  _fnode = function(html) {
    var node;
    node = _range.createContextualFragment(html).childNodes[0];
    return node.nodeType === 1 && node;
  };

  _renderNodes = function(parent, nodes) {
    var c, _ref;
    while (nodes.length > 0) {
      if ((c = nodes.shift()) != null) {
        if (_isNode(c)) {
          parent.appendChild(c);
        } else if ((_ref = typeof c) === 'string' || _ref === 'number') {
          parent.appendChild(document.createTextNode(c));
        } else if (_isArray(c)) {
          Array.prototype.unshift.apply(nodes, c);
        } else {
          E('renderNodes: unsupported child type = ' + c);
        }
      }
    }
    return parent;
  };

  window.cell = cell = (function() {

    function cell(options) {
      var evSel, event, handler, i, id, m, n, nodes, _len, _ref, _ref2;
      this.options = options != null ? options : {};
      if (this.options.model != null) this.model = this.options.model;
      if (typeof this.init === "function") this.init(this.options);
      this.$el = jQuery(this.el = this._tag());
      if (id = this.options.id) this.el.id = id;
      _ref = [this.cell.prototype.name, this["class"], this.options["class"]];
      for (i = 0, _len = _ref.length; i < _len; i++) {
        n = _ref[i];
        if (n) this.el.className += i && (" " + n) || n;
      }
      _renderNodes(this.el, (_isArray(nodes = typeof this.render === "function" ? this.render(this.$R) : void 0)) && nodes || []);
      _ref2 = this.on;
      for (evSel in _ref2) {
        handler = _ref2[evSel];
        if ((typeof handler === 'function') && (m = /^([A-z]+)(\s(.*))?$/.exec(evSel)) && (event = m[1])) {
          this.$el.on(event, m[3], _bind(handler, this));
        }
      }
      if (typeof this.afterRender === "function") this.afterRender();
      return;
    }

    cell.prototype.$ = function(selector) {
      return jQuery(selector, this.el);
    };

    cell.prototype.$R = function() {
      var a, b, children, el, k, m, parent, v;
      a = arguments[0], b = arguments[1], children = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      if (a) {
        if ((b != null ? b.constructor : void 0) !== Object) {
          children.unshift(b);
          b = void 0;
        }
        parent = (function() {
          if (typeof a === 'string') {
            if (m = /^(\w+)?(#([\w\-]+))*(\.[\w\.\-]+)?$/.exec(a)) {
              el = document.createElement(m[1] || 'div');
              if (v = m[3]) el.setAttribute('id', v);
              if (b) {
                if ('class' in b) {
                  el.className += b["class"];
                  b["class"] = void 0;
                }
                for (k in b) {
                  v = b[k];
                  el.setAttribute(k, v);
                }
              }
              if (v = m[4]) el.className += v.replace(/\./g, ' ');
              return el;
            } else if (/^<[A-z]/.test(a)) {
              return _fnode(a);
            } else {
              return E("renderParent: unsupported parent string = '" + a + "'");
            }
          } else if (a.prototype.cell === a) {
            return (new a(b)).el;
          } else if (_isNode(a)) {
            return a;
          } else {
            return E("renderParent: unsupported parent type = " + a);
          }
        })();
        return parent && _renderNodes(parent, children);
      }
    };

    return cell;

  })();

  cell.extend = function(protoProps) {
    var child, css, cssref, el, k, t, v;
    if (protoProps == null) protoProps = {};
    if (typeof protoProps !== 'object') {
      throw "cell.extend(): expects an object {render,init,name}";
    } else if ((protoProps.init && typeof protoProps.init !== 'function') || (protoProps.render && typeof protoProps.render !== 'function')) {
      throw "cell.extend(): expects {render,init} to be functions";
    } else {
      child = (function() {

        __extends(_Class, cell);

        function _Class() {
          _Class.__super__.constructor.apply(this, arguments);
        }

        return _Class;

      })();
      for (k in protoProps) {
        v = protoProps[k];
        child.prototype[k] = v;
      }
      child.prototype.cell = child;
      child.prototype._tag = (t = typeof protoProps.tag) === 'string' ? function() {
        return _fnode(protoProps.tag) || _createDiv();
      } : t === 'function' ? function() {
        return _fnode(this.tag()) || _createDiv();
      } : _createDiv;
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

  if (typeof define === 'function' && typeof require === 'function') {
    _modNameRx = /(.*\/)?(.*)$/;
    define('cell', [], exports = {
      pluginBuilder: 'cell-builder-plugin',
      load: function(name, req, load, config) {
        req([name], function(CDef) {
          var _ref, _ref2;
          if (typeof CDef !== 'object') {
            E("Couldn't load " + name + " cell. cell definitions should be objects, but instead was " + (typeof CDef));
          } else {
            CDef.name = _modNameRx.exec(name)[2];
            if (!(((_ref = exports.__preinstalledCells__) != null ? _ref[name] : void 0) != null)) {
              if ((_ref2 = CDef.css_href) == null) {
                CDef.css_href = req.toUrl("" + name + ".css");
              }
            }
            if (typeof CDef["extends"] === 'string') {
              req(["cell!" + CDef["extends"]], function(parentCell) {
                if (parentCell.prototype.name) {
                  CDef["class"] = parentCell.prototype.name + (" " + CDef["class"]) || "";
                }
                load(parentCell.extend(CDef));
              });
            } else {
              load(cell.extend(CDef));
            }
          }
        });
      }
    });
    jQuery(document).ready(function() {
      _range.selectNode(document.body);
      jQuery('[data-cell]').each(function() {
        var baseurl, cachebust, cachebustAttr, cellname, opts;
        var _this = this;
        if (cellname = this.getAttribute('data-cell')) {
          opts = {};
          cachebust = /(^\?cachebust)|(&cachebust)/.test(window.location.search);
          if (((cachebustAttr = this.getAttribute('data-cell-cachebust')) !== null || cachebust) && cachebustAttr !== 'false') {
            opts.urlArgs = "bust=" + (new Date().getTime());
          }
          if (baseurl = this.getAttribute('data-cell-baseurl')) {
            opts.baseUrl = baseurl;
          }
          require(opts, ["cell!" + cellname], function(CType) {
            jQuery(_this).append(new CType().el);
          });
        }
      });
    });
    return;
  }

}).call(this);
