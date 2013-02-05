// Generated by CoffeeScript 1.4.0

define(['util/hash', 'util/type', 'cell/util/spy', 'cell/View', 'cell/Ext'], function(hash, _arg, _arg1, View, Ext) {
  var Bind, EachBind, HashQueue, IfBind, bind, isExpr, orig__each, orig__if, orig_renderAttr, orig_renderChild, render, watch, __;
  isExpr = _arg.isF;
  watch = _arg1.watch;
  bind = function(f, o) {
    return function() {
      return f.call(o);
    };
  };
  Ext.prototype.getValue = function(v, callback) {
    var _this = this;
    if (isExpr(v)) {
      watch(bind(v, this.view), function(value) {
        callback.call(_this, value);
      });
    } else {
      callback.call(this, v);
    }
  };
  render = function(parent, view, renderValue, prevNodes) {
    var i, len, newNodes;
    if (renderValue == null) {
      renderValue = [document.createTextNode('')];
    }
    newNodes = view._renderChildren(renderValue, parent, prevNodes[0]);
    i = -1;
    len = prevNodes.length;
    while (++i < len) {
      parent.removeChild(prevNodes[i]);
    }
    return newNodes;
  };
  Bind = function(view, expr) {
    this.r = function(parent) {
      var nodes;
      nodes = [];
      watch(bind(expr, view), function(renderValue) {
        nodes = render(parent, view, renderValue, nodes);
      });
    };
  };
  IfBind = function(view, cond, thnElse) {
    this.r = function(parent) {
      var nodes;
      nodes = [];
      watch(bind(cond, view), function(condValue) {
        nodes = render(parent, view, condValue ? typeof thnElse.then === "function" ? thnElse.then() : void 0 : typeof thnElse["else"] === "function" ? thnElse["else"]() : void 0, nodes);
      });
    };
  };
  HashQueue = function() {
    this.h = {};
  };
  HashQueue.prototype = {
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
      watch(bind(expr, view), function(value) {
        var i, item, items, key, len, newEls, newItemHash, prevItemEl, _ref;
        newEls = [];
        newItemHash = new HashQueue;
        i = -1;
        len = value.length;
        while (++i < len) {
          if (!(prevItemEl = itemhash.shift(key = hash(item = value[i])))) {
            prevItemEl = itemRenderer.prototype instanceof View ? new itemRenderer({
              model: item
            }).el : itemRenderer(item);
          }
          newItemHash.push(key, prevItemEl);
          newEls.push(prevItemEl);
        }
        _ref = itemhash.h;
        for (key in _ref) {
          items = _ref[key];
          i = -1;
          len = items.length;
          while (++i < len) {
            parent.removeChild(items[i]);
          }
        }
        itemhash = newItemHash;
        i = -1;
        len = newEls.length;
        while (++i < len) {
          parent.appendChild(newEls[i]);
        }
      });
    };
  };
  EachBind.prototype.constructor = IfBind.prototype.constructor = Bind;
  __ = View.prototype.__;
  orig__if = __["if"];
  __["if"] = function(condition, thenElse) {
    if (isExpr(condition)) {
      return new IfBind(this.view, condition, thenElse);
    } else {
      return orig__if.call(this, condition, thenElse);
    }
  };
  orig__each = __.each;
  __.each = function(col, renderer) {
    if (isExpr(col)) {
      return new EachBind(this.view, col, renderer);
    } else {
      return orig__each.call(this, col, renderer);
    }
  };
  orig_renderAttr = View.prototype._renderAttr;
  View.prototype._renderAttr = function(k, v, parent) {
    if (isExpr(v)) {
      watch(bind(v, this), function(value) {
        parent.setAttribute(k, value);
      });
    } else {
      orig_renderAttr(k, v, parent);
    }
  };
  orig_renderChild = View.prototype._renderChild;
  return View.prototype._renderChild = function(n, parent, insertBeforeNode, rendered) {
    if (isExpr(n)) {
      n = new Bind(this, n);
    }
    if (n.constructor === Bind) {
      n.r(parent);
    } else {
      orig_renderChild.call(this, n, parent, insertBeforeNode, rendered);
    }
  };
});
