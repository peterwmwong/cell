// Generated by CoffeeScript 1.4.0

define(['util/hash', 'util/type', 'util/fn', 'dom/data', 'dom/events', 'dom/mutate', 'cell/Model', 'cell/Collection', 'cell/Ext', 'cell/util/spy'], function(hash, _arg, fn, data, events, mutate, Model, Collection, Ext, _arg1) {
  var Bind, EachBind, HashQueue, IfBind, View, constrProp, d, isA, isF, isS, noop, protoProp, removeChildren, render, setElAttribute, unwatch, watch, __;
  isA = _arg.isA, isF = _arg.isF, isS = _arg.isS;
  watch = _arg1.watch, unwatch = _arg1.unwatch;
  protoProp = 'prototype';
  constrProp = 'constructor';
  noop = function() {};
  d = document;
  removeChildren = function(parent, children) {
    var node;
    while ((node = children.pop())) {
      parent.removeChild(node);
    }
  };
  render = function(parent, view, renderValue, prevNodes) {
    var newNodes;
    if (renderValue == null) {
      renderValue = [d.createTextNode('')];
    }
    newNodes = view._rcs(renderValue, parent, prevNodes[0]);
    removeChildren(parent, prevNodes);
    return newNodes;
  };
  Bind = function(view, expr) {
    this.r = function(parent) {
      var nodes;
      nodes = [];
      watch(hash(view), fn.b0(expr, view), function(renderValue) {
        nodes = render(parent, view, renderValue, nodes);
      });
    };
  };
  IfBind = function(view, cond, thnElse) {
    this.r = function(parent) {
      var nodes;
      nodes = [];
      watch(hash(view), fn.b0(cond, view), function(condValue) {
        nodes = render(parent, view, view.__["if"](condValue, thnElse), nodes);
      });
    };
  };
  HashQueue = function() {
    this.h = {};
  };
  HashQueue[protoProp] = {
    push: function(key, val) {
      var entry, _base;
      entry = ((_base = this.h)[key] || (_base[key] = []));
      entry.push(val);
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
  EachBind = function(view, expr, itemRenderer) {
    var itemhash;
    itemhash = new HashQueue;
    this.r = function(parent) {
      watch(hash(view), fn.b0(expr, view), function(value) {
        var i, item, key, len, newEls, newItemHash, prevItemEl;
        newEls = [];
        newItemHash = new HashQueue;
        i = 0;
        len = value.length;
        while (i < len) {
          if (!(prevItemEl = itemhash.shift(key = hash(item = value[i++])))) {
            prevItemEl = itemRenderer[protoProp] instanceof View ? new itemRenderer({
              model: item
            }).el : itemRenderer.call(view, item);
          }
          newItemHash.push(key, prevItemEl);
          newEls.push(prevItemEl);
        }
        for (key in itemhash.h) {
          removeChildren(parent, itemhash.h[key]);
        }
        itemhash = newItemHash;
        i = 0;
        len = newEls.length;
        while (i < len) {
          parent.appendChild(newEls[i++]);
        }
      });
    };
  };
  EachBind[protoProp][constrProp] = IfBind[protoProp][constrProp] = Bind;
  setElAttribute = function(el, key, value) {
    if (key === 'innerHTML') {
      el.innerHTML = value;
    } else {
      el.setAttribute(key, value);
    }
  };
  __ = function(viewOrHAML, optionsOrFirstChild) {
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
    options = children.length && children[0][constrProp] === Object ? children.shift() : {};
    if (isS(viewOrHAML)) {
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
            if (isF(v)) {
              watch(hash(this), fn.b0(v, this), (function(k) {
                return function(value) {
                  setElAttribute(parent, k, value);
                };
              })(k));
            } else {
              setElAttribute(parent, k, v);
            }
          }
        }
      }
    } else if (viewOrHAML && viewOrHAML[protoProp] instanceof View) {
      parent = new viewOrHAML(options).el;
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
  __["if"] = function(condition, thenElse) {
    var _ref;
    if (isF(condition)) {
      return new IfBind(this.view, condition, thenElse);
    } else {
      return (_ref = thenElse[condition ? 'then' : 'else']) != null ? _ref.call(this.view) : void 0;
    }
  };
  __.each = function(col, renderer) {
    var i, len, results;
    if (col) {
      if (col instanceof Collection) {
        col = fn.b0(col.toArray, col);
      }
      if (isF(col)) {
        return new EachBind(this.view, col, renderer);
      } else {
        len = col.length;
        i = -1;
        results = [];
        while (++i < len) {
          results.push((renderer[protoProp] instanceof View ? new renderer({
            model: col[i]
          }).el : renderer.call(this.view, col[i], i, col)));
        }
        return results;
      }
    }
  };
  return View = Model.extend({
    constructor: function(options) {
      var cellName, cls, el, t, _;
      t = this;
      t.options = options ? (t.model = options.model, t.collection = options.collection, delete options.model, delete options.collection, options) : {};
      __ = View[protoProp].__;
      _ = t.__ = fn.b(__, t);
      _["if"] = __["if"];
      _.each = __.each;
      _.view = t;
      t.beforeRender();
      t.el = el = t.renderEl(_);
      cellName = t._cellName;
      el.className = (cls = el.className) ? cls + ' ' + cellName : cellName;
      data.set(el, 'cellRef', t);
      el.setAttribute('cell', cellName);
      t._rcs(t.render(this.__), el);
      t.afterRender();
    },
    beforeRender: noop,
    renderEl: function() {
      return d.createElement('div');
    },
    render: noop,
    afterRender: noop,
    watch: function(expr, callback) {
      watch(hash(this), fn.b0(expr, this), fn.b1(callback, this));
    },
    __: __,
    destroy: function() {
      if (this.el) {
        Model[protoProp].destroy.call(this);
        unwatch(hash(this));
        mutate.remove(this.el);
        delete this.el;
      }
    },
    _rc: function(n, parent, insertBeforeNode, rendered) {
      var _ref;
      if (isF(n)) {
        n = new Bind(this, n);
      }
      if (n[constrProp] === Bind) {
        n.r(parent);
      } else if ((_ref = n.nodeType) === 1 || _ref === 3) {
        rendered.push(parent.insertBefore(n, insertBeforeNode));
      } else if (isA(n)) {
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
      if (!isA(nodes)) {
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
