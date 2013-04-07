// Generated by CoffeeScript 1.6.2
define(['cell/Collection', 'cell/Ext', 'cell/Model', 'cell/util/spy', 'dom/data', 'dom/events', 'dom/mutate', 'util/fn', 'util/hash', 'util/type'], function(Collection, Ext, Model, _arg, data, events, mutate, fn, hash, type) {
  var EachBind, EachBindOnChange, HashQueue, View, d, noop, protoProp, suspendWatch, unwatch, watch, _, _each;

  watch = _arg.watch, unwatch = _arg.unwatch, suspendWatch = _arg.suspendWatch;
  protoProp = 'prototype';
  noop = function() {};
  d = document;
  HashQueue = function() {
    this.h = {};
  };
  HashQueue[protoProp] = {
    push: function(key, val) {
      var _base;

      ((_base = this.h)[key] || (_base[key] = [])).push(val);
    },
    shift: function(key) {
      var entry;

      if (entry = this.h[key]) {
        if (entry.lengh === 1) {
          delete this.h[key];
          return entry[0];
        } else {
          return entry.shift();
        }
      }
    }
  };
  EachBind = function(view, expr, renderer) {
    this.view = view;
    this.expr = expr;
    this.renderer = renderer;
    this.hq = new HashQueue;
    this.parent = void 0;
  };
  EachBind[protoProp].install = function(parent) {
    var expr;

    this.parent = parent;
    if (this.expr instanceof Collection) {
      expr = this.expr;
      this.view.watch((function() {
        return expr.toArray();
      }), function() {
        EachBindOnChange.call(this, this.expr);
      }, this);
    } else {
      this.view.watch(this.expr, EachBindOnChange, this);
    }
  };
  EachBindOnChange = function(value) {
    var array, i, item, key, len, newEls, newhq, temp;

    array = value instanceof Collection ? value.toArray() : value;
    newEls = [];
    newhq = new HashQueue;
    i = -1;
    len = array.length;
    while (++i < len) {
      item = array[i];
      key = hash(item);
      if (!(temp = this.hq.shift(key))) {
        temp = this.renderer.call(this.view, item, i, value);
      }
      newhq.push(key, temp);
      newEls.push(temp);
    }
    for (key in this.hq.h) {
      temp = this.hq.h[key];
      i = 0;
      len = temp.length;
      while (i < len) {
        mutate.remove(temp[i++]);
      }
    }
    this.hq = newhq;
    this.view._rcs(newEls, this.parent);
  };
  _each = function(col, renderer) {
    return new EachBind(this.view, col, renderer);
  };
  _ = function(viewOrHAML, optionsOrFirstChild) {
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
            this.watch(v, function(value) {
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
  };
  return View = Model.extend({
    constructor: function(options) {
      var cellName, cls, el, t;

      Model.call(this);
      t = this;
      t.options = options ? (t.model = options.model, t.collection = options.collection, delete options.model, delete options.collection, options) : {};
      t._ = fn.b(_, this);
      t._.view = this;
      t._.each = _each;
      t.beforeRender();
      t.el = el = t.renderEl(t._);
      cellName = t._cellName;
      el.className = (cls = el.className) ? cls + ' ' + cellName : cellName;
      data.set(el, 'cellRef', t);
      el.setAttribute('cell', cellName);
      t._rcs(t.render(t._), el);
      t.afterRender();
    },
    beforeRender: noop,
    renderEl: function() {
      return d.createElement('div');
    },
    render: noop,
    afterRender: noop,
    watch: function(expr, callback, callContext) {
      watch(this, expr, callback, callContext);
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

      if (n instanceof EachBind) {
        n.install(parent);
      } else if (type.isF(n)) {
        nodes = [];
        this.watch(n, function(renderValue) {
          var prevNodes;

          prevNodes = nodes;
          if (renderValue == null) {
            renderValue = [d.createTextNode('')];
          }
          nodes = this._rcs(renderValue, parent, prevNodes[0]);
          renderValue = 0;
          while (n = prevNodes[renderValue++]) {
            mutate.remove(n);
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
