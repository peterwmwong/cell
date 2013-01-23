// Generated by CoffeeScript 1.4.0

define(['dom/mutate', 'dom/data', 'dom/events'], function(mutate, data, events) {
  var View, isArray, key, value, __, _ref;
  isArray = Array.isArray || function(o) {
    return Object.prototype.toString.call(o) === "[object Array]";
  };
  __ = function(viewOrHAML, optionsOrFirstChild) {
    var children, k, m, match, options, parent, v;
    children = [].slice.call(arguments, optionsOrFirstChild && optionsOrFirstChild.constructor === Object ? (options = optionsOrFirstChild, 2) : 1);
    if (typeof viewOrHAML === 'string') {
      if (m = /^(\w+)?(#([\w\-]+))*(\.[\w\.\-]+)?$/.exec(viewOrHAML)) {
        parent = document.createElement(m[1] || 'div');
        if (m[3]) {
          parent.setAttribute('id', m[3]);
        }
        if (m[4]) {
          parent.className = m[4].slice(1).replace(/\./g, ' ');
        }
        for (k in options) {
          v = options[k];
          if (match = /^on(\w+)/.exec(k)) {
            events.bind(parent, match[1], v);
          } else {
            this._renderAttr(k, v, parent);
          }
        }
      }
    } else if (viewOrHAML && viewOrHAML.prototype instanceof View) {
      parent = new viewOrHAML(options).el;
    }
    if (parent) {
      this._renderChildren(children, parent);
      return parent;
    }
  };
  __["if"] = function(condition, thenElse) {
    var _name;
    return typeof thenElse[_name = condition ? 'then' : 'else'] === "function" ? thenElse[_name]() : void 0;
  };
  __.each = function(col, renderer) {
    var i, item, _i, _len, _results;
    _results = [];
    for (i = _i = 0, _len = col.length; _i < _len; i = ++_i) {
      item = col[i];
      _results.push(renderer(item, i, col));
    }
    return _results;
  };
  View = function(options) {
    var _ref;
    this.options = options;
    if ((_ref = this.options) == null) {
      this.options = {};
    }
    this._constructor();
    this._render_el();
  };
  _ref = {
    beforeRender: function() {},
    render_el: function(__) {
      return document.createElement('div');
    },
    render: function() {},
    afterRender: function() {},
    __: __,
    remove: function() {
      mutate.remove(this.el);
      delete this.el;
    },
    _constructor: function() {
      var _this = this;
      __ = View.prototype.__;
      this.__ = function() {
        return __.apply(_this, arguments);
      };
      this.__["if"] = __["if"];
      this.__.each = __.each;
    },
    _render_el: function() {
      var cls;
      this.beforeRender();
      this.el = this.render_el(this.__);
      this.el.className = (cls = this.el.className) ? cls + ' ' + this._cellName : this._cellName;
      data.set(this.el, 'cellRef', this);
      this.el.setAttribute('cell', this._cellName);
      this._renderChildren(this.render(this.__), this.el);
      return this.afterRender();
    },
    _renderAttr: function(k, v, parent) {
      parent.setAttribute(k, v);
    },
    _renderChild: function(n, parent, insertBeforeNode, rendered) {
      var _ref;
      if ((_ref = n.nodeType) === 1 || _ref === 3) {
        rendered.push(parent.insertBefore(n, insertBeforeNode));
      } else if (isArray(n)) {
        this._renderChildren(n, parent, insertBeforeNode, rendered);
      } else {
        rendered.push(parent.insertBefore(document.createTextNode(n), insertBeforeNode));
      }
    },
    _renderChildren: function(nodes, parent, insertBeforeNode, rendered) {
      var n, _i, _len;
      if (insertBeforeNode == null) {
        insertBeforeNode = null;
      }
      if (rendered == null) {
        rendered = [];
      }
      if (nodes == null) {
        return rendered;
      }
      if (!isArray(nodes)) {
        nodes = [nodes];
      }
      for (_i = 0, _len = nodes.length; _i < _len; _i++) {
        n = nodes[_i];
        if (n != null) {
          this._renderChild(n, parent, insertBeforeNode, rendered);
        }
      }
      return rendered;
    }
  };
  for (key in _ref) {
    value = _ref[key];
    View.prototype[key] = value;
  }
  View.extend = function(proto) {
    var NewView, SuperView, Surrogate, k, v;
    SuperView = this;
    NewView = function(options) {
      SuperView.call(this, options);
    };
    NewView.extend = SuperView.extend;
    Surrogate = function() {};
    Surrogate.prototype = SuperView.prototype;
    NewView.prototype = new Surrogate();
    if (proto) {
      for (k in proto) {
        v = proto[k];
        NewView.prototype[k] = v;
      }
    }
    return NewView;
  };
  return View;
});
