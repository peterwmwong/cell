// Generated by CoffeeScript 1.6.2
define(['util/type', 'util/fn', 'dom/data', 'dom/events', 'dom/mutate', 'cell/Model', 'cell/Ext', 'cell/util/spy'], function(type, fn, data, events, mutate, Model, Ext, _arg) {
  var View, d, noop, protoProp, suspendWatch, unwatch, watch;

  watch = _arg.watch, unwatch = _arg.unwatch, suspendWatch = _arg.suspendWatch;
  protoProp = 'prototype';
  noop = function() {};
  d = document;
  return View = Model.extend({
    constructor: function(options) {
      var cellName, cls, el, t;

      t = this;
      t.options = options ? (t.model = options.model, t.collection = options.collection, delete options.model, delete options.collection, options) : {};
      t.__ = fn.b(View[protoProp].__, t);
      t.beforeRender();
      t.el = el = t.renderEl(t.__);
      cellName = t._cellName;
      el.className = (cls = el.className) ? cls + ' ' + cellName : cellName;
      data.set(el, 'cellRef', t);
      el.setAttribute('cell', cellName);
      t._rcs(t.render(t.__), el);
      t.afterRender();
    },
    beforeRender: noop,
    renderEl: function() {
      return d.createElement('div');
    },
    render: noop,
    afterRender: noop,
    watch: function(expr, callback) {
      watch(this, expr, callback);
    },
    __: function(viewOrHAML, optionsOrFirstChild) {
      var children, classes, exts, i, k, len, m, match, options, parent, v;

      children = [].slice.call(arguments, 1);
      i = -1;
      len = children.length;
      while (++i < len) {
        if (!(children[i] instanceof Ext)) {
          break;
        }
      }
      exts = children.splice(0, i);
      options = children.length && children[0] && children[0].constructor === Object ? children.shift() : {};
      if (type.isS(viewOrHAML)) {
        if (m = /^(\w+)?(#([\w\-]+))?(\.[\w\.\-]+)?$/.exec(viewOrHAML)) {
          parent = d.createElement(m[1] || 'div');
          if (m[3]) {
            parent.setAttribute('id', m[3]);
          }
          if (m[4]) {
            classes = m[4].slice(1).replace(/\./g, ' ');
            options["class"] = options["class"] ? classes + (" " + options["class"]) : classes;
          }
          for (k in options) {
            v = options[k];
            if (match = /^on(\w+)/.exec(k)) {
              events.on(parent, match[1], v, this);
            } else {
              watch(this, v, function(value) {
                if (this.k === 'innerHTML') {
                  parent.innerHTML = value;
                } else {
                  parent.setAttribute(this.k, value);
                }
              }, {
                k: k
              });
            }
          }
        }
      } else if (viewOrHAML && viewOrHAML[protoProp] instanceof View) {
        suspendWatch(function() {
          return parent = new viewOrHAML(options).el;
        });
      }
      if (parent) {
        this._rcs(children, parent);
        i = exts.length;
        while (i--) {
          exts[i].run(parent, this);
        }
        return parent;
      }
    },
    destroy: function() {
      if (this.el) {
        Model[protoProp].destroy.call(this);
        unwatch(this);
        mutate.remove(this.el);
        delete this.el;
      }
    },
    _rc: function(n, parent, insertBeforeNode, rendered) {
      var nodes, _ref;

      if (type.isF(n)) {
        nodes = [];
        watch(this, n, function(renderValue) {
          var prevNodes;

          prevNodes = nodes;
          if (renderValue == null) {
            renderValue = [d.createTextNode('')];
          }
          nodes = this._rcs(renderValue, parent, prevNodes[0]);
          renderValue = 0;
          while (n = prevNodes[renderValue++]) {
            parent.removeChild(n);
          }
        });
      } else if ((_ref = n.nodeType) === 1 || _ref === 3) {
        rendered.push(parent.insertBefore(n, insertBeforeNode));
      } else if (type.isA(n)) {
        this._rcs(n, parent, insertBeforeNode, rendered);
      } else {
        rendered.push(parent.insertBefore(d.createTextNode(n), insertBeforeNode));
      }
    },
    _rcs: function(nodes, parent, insertBeforeNode, rendered) {
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
      if (!type.isA(nodes)) {
        nodes = [nodes];
      }
      for (_i = 0, _len = nodes.length; _i < _len; _i++) {
        n = nodes[_i];
        if (n != null) {
          this._rc(n, parent, insertBeforeNode, rendered);
        }
      }
      return rendered;
    }
  });
});

/*
//@ sourceMappingURL=View.map
*/
