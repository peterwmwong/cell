// Generated by CoffeeScript 1.4.0

define(['utils', 'dom/mutate', 'dom/data', 'dom/events'], function(utils, mutate, data, events) {
  var View, isArray, noop, __;
  noop = function() {};
  isArray = Array.isArray || function(o) {
    return Object.prototype.toString.call(o) === "[object Array]";
  };
  __ = function(viewOrHAML, optionsOrFirstChild) {
    var children, k, m, match, options, parent, v;
    children = [].slice.call(arguments, optionsOrFirstChild && optionsOrFirstChild.constructor === Object ? (options = optionsOrFirstChild, 2) : 1);
    if (typeof viewOrHAML === 'string') {
      if (m = /^(\w+)?(#([\w\-]+))?(\.[\w\.\-]+)?$/.exec(viewOrHAML)) {
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
            v.viewHandler = true;
            events.on(parent, match[1], v, this);
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
    this.options = options != null ? options : {};
    this.model = this.options.model;
    delete this.options.model;
    this._constructor();
    this._render_el();
  };
  View.prototype = {
    beforeRender: noop,
    render_el: function(__) {
      return document.createElement('div');
    },
    render: noop,
    afterRender: noop,
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
      this.afterRender();
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
  View.extend = utils.extend;
  return View;
});
