// Generated by CoffeeScript 1.4.0

define(['cell/View'], function(View) {
  var AttrBind, Bind, EachBind, HashQueue, IfBind, bind, hashkey, hashuid, isBind, nextuid, orig__each, orig__if, orig_constructor, orig_remove, orig_renderAttr, orig_renderChild, __;
  isBind = function(o) {
    return typeof o === 'function';
  };
  bind = function(f, o) {
    return function() {
      return f.apply(o, arguments);
    };
  };
  Bind = function(parent, getValue) {
    this.parent = parent;
    this.getValue = getValue;
  };
  Bind.prototype = {
    constructor: Bind,
    getRenderValue: function() {
      return this.value;
    },
    needRender: function() {
      var value;
      if ((value = this.getValue()) !== this.value) {
        this.value = value;
        return true;
      } else {
        return false;
      }
    },
    render: function(view, rendered) {
      var n, nodes, renderValue, _i, _j, _len, _len1, _ref, _ref1;
      renderValue = this.getRenderValue();
      if (renderValue == null) {
        renderValue = [document.createTextNode('')];
      }
      nodes = view._renderChildren(renderValue, this.parent, (_ref = this.nodes) != null ? _ref[0] : void 0);
      if (this.nodes) {
        _ref1 = this.nodes;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          n = _ref1[_i];
          this.parent.removeChild(n);
        }
      }
      this.nodes = nodes;
      if (rendered) {
        for (_j = 0, _len1 = nodes.length; _j < _len1; _j++) {
          n = nodes[_j];
          rendered.push(n);
        }
      }
    }
  };
  IfBind = function(parent, getValue, then, _else) {
    this.parent = parent;
    this.getValue = getValue;
    this.then = then;
    this["else"] = _else;
    this.getRenderValue = function() {
      if (this.value) {
        return this.then();
      } else {
        return this["else"]();
      }
    };
  };
  IfBind.prototype = Bind.prototype;
  AttrBind = function(parent, attr, getValue) {
    this.parent = parent;
    this.attr = attr;
    this.getValue = getValue;
  };
  AttrBind.prototype = {
    needRender: Bind.prototype.needRender,
    render: function() {
      this.parent.setAttribute(this.attr, this.value);
    }
  };
  hashuid = 0;
  nextuid = function() {
    return (++hashuid).toString(36);
  };
  hashkey = function(obj) {
    var objType;
    return (objType = typeof obj) + ':' + ((objType === 'object') && (obj !== null) ? obj.$$hashkey || (obj.$$hashkey = nextuid()) : obj);
  };
  HashQueue = function() {
    this.hash = {};
  };
  HashQueue.prototype = {
    push: function(key, val) {
      var entry, _base;
      entry = ((_base = this.hash)[key] || (_base[key] = []));
      entry.push(val);
    },
    shift: function(key) {
      var entry;
      if (entry = this.hash[key]) {
        if (entry.lengh === 1) {
          delete this.hash[key];
          return entry[0];
        } else {
          return entry.shift();
        }
      }
    }
  };
  EachBind = function(parent, getValue, itemRenderer) {
    this.parent = parent;
    this.getValue = getValue;
    this.itemRenderer = itemRenderer;
    this.itemhash = new HashQueue;
  };
  EachBind.prototype = {
    constructor: EachBind,
    needRender: function() {
      var change, i, value;
      value = this.getValue() || [];
      if (!(change = (!(this.value != null)) || this.value.length !== value.length)) {
        i = this.value.length;
        while (--i >= 0) {
          if (value[i] !== this.value[i]) {
            break;
          }
        }
        change = i >= 0;
      }
      if (change) {
        this.value = [].slice.call(value);
        return true;
      } else {
        return false;
      }
    },
    render: function() {
      var el, item, itemEl, items, key, newEls, newItemHash, prevItemEl, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
      newEls = [];
      newItemHash = new HashQueue;
      _ref = this.value;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        key = hashkey(item);
        if (!(prevItemEl = this.itemhash.shift(key))) {
          prevItemEl = this.itemRenderer(item);
        }
        newItemHash.push(key, prevItemEl);
        newEls.push(prevItemEl);
      }
      _ref1 = this.itemhash.hash;
      for (key in _ref1) {
        items = _ref1[key];
        for (_j = 0, _len1 = items.length; _j < _len1; _j++) {
          itemEl = items[_j];
          this.parent.removeChild(itemEl);
        }
      }
      this.itemhash = newItemHash;
      for (_k = 0, _len2 = newEls.length; _k < _len2; _k++) {
        el = newEls[_k];
        this.parent.appendChild(el);
      }
    }
  };
  __ = View.prototype.__;
  orig__if = __["if"];
  __["if"] = function(condition, thenElse) {
    if (isBind(condition)) {
      return new IfBind(void 0, condition, thenElse.then, thenElse["else"]);
    } else {
      return orig__if.call(this, condition, thenElse);
    }
  };
  orig__each = __.each;
  __.each = function(col, renderer) {
    if (isBind(col)) {
      return new EachBind(void 0, col, renderer);
    } else {
      return orig__each.call(this, col, renderer);
    }
  };
  orig_constructor = View.prototype._constructor;
  View.prototype._constructor = function() {
    var bindUpdater;
    this._binds = [];
    if ((bindUpdater = this.model || this.collection)) {
      this.listenTo(bindUpdater, 'all', this.updateBinds);
    }
    orig_constructor.call(this);
  };
  orig_renderAttr = View.prototype._renderAttr;
  View.prototype._renderAttr = function(k, v, parent) {
    if (isBind(v)) {
      this._binds.push(bind = new AttrBind(parent, k, bind(v, this)));
      bind.needRender();
      bind.render(this);
    }
  };
  orig_renderChild = View.prototype._renderChild;
  View.prototype._renderChild = function(n, parent, insertBeforeNode, rendered) {
    if (isBind(n)) {
      n = new Bind(parent, bind(n, this));
    }
    if ((n instanceof Bind) || (n instanceof EachBind)) {
      this._binds.push(n);
      n.parent = parent;
      n.needRender();
      n.render(this, rendered);
    } else {
      orig_renderChild.call(this, n, parent, insertBeforeNode, rendered);
    }
  };
  orig_remove = View.prototype.remove;
  View.prototype.remove = function() {
    this._binds = void 0;
    return orig_remove.call(this);
  };
  return View.prototype.updateBinds = function() {
    var b, change, i, _i, _len, _ref;
    i = 0;
    change = true;
    while (change && (i++ < 10)) {
      change = false;
      _ref = this._binds;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        b = _ref[_i];
        if (b.needRender()) {
          change = true;
          b.render(this);
        }
      }
    }
  };
});
