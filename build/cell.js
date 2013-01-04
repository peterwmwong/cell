// Generated by CoffeeScript 1.4.0

define(['backbone', 'jquery'], function(Backbone, $) {
  var cidMap, isArrayish, isBind, module, origCleanData, __, __each, __if;
  isArrayish = typeof Zepto === 'function' ? function(o) {
    return (_.isArray(o)) || (Zepto.fn.isPrototypeOf(o));
  } : function(o) {
    return (_.isArray(o)) || o.jquery;
  };
  isBind = _.isFunction;
  cidMap = {};
  origCleanData = $.cleanData;
  $.cleanData = function(elems, acceptData) {
    var cell, cid, elem, i;
    i = 0;
    while (elem = elems[i++]) {
      origCleanData([elem], acceptData);
      if (cid = elem.cellcid) {
        cell = cidMap[cid];
        cell.$el = void 0;
        cell.remove();
      }
    }
  };
  __ = function(viewOrHAML, optionsOrFirstChild) {
    var bind, child, children, k, m, options, parent, v, _i, _len, _ref;
    children = optionsOrFirstChild && optionsOrFirstChild.constructor === Object ? (options = optionsOrFirstChild, [].slice.call(arguments, 2)) : [].slice.call(arguments, 1);
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
          if (isBind(v)) {
            this._binds.push(bind = {
              el: parent,
              attr: k,
              func: _.bind(v, this)
            });
            this._renderBindAttr(bind);
          } else {
            parent.setAttribute(k, v);
          }
        }
      }
    } else if (viewOrHAML && viewOrHAML.prototype instanceof Backbone.View) {
      parent = (new viewOrHAML(options)).render().el;
    }
    if (parent) {
      _ref = this._renderChildren(children, []);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        parent.appendChild(child);
      }
      return parent;
    }
  };
  __if = function(condition, thenElse) {
    return [condition ? thenElse.then() : thenElse["else"]()];
  };
  __each = function(col, renderer) {
    var i, item, _i, _len, _results;
    if (col instanceof Backbone.Collection) {
      return col.map(renderer);
    } else {
      _results = [];
      for (i = _i = 0, _len = col.length; _i < _len; i = ++_i) {
        item = col[i];
        _results.push(renderer(item, i, col));
      }
      return _results;
    }
  };
  return module = {
    Cell: Backbone.View.extend({
      constructor: function() {
        var bindUpdater;
        this._binds = [];
        this.__ = _.bind(this.__, this);
        this.__["if"] = __if;
        this.__.each = __each;
        Backbone.View.apply(this, arguments);
        if ((bindUpdater = this.model || this.collection)) {
          return this.listenTo(bindUpdater, 'all', this.updateBinds);
        }
      },
      _renderBindEl: function(bind) {
        var n, newNodes, newVal, nodes, parent, target, _i, _len;
        if (((newVal = bind.func()) === bind.val) && bind.nodes) {
          return false;
        }
        newNodes = newVal != null ? this._renderChildren(newVal, []) : [document.createTextNode('')];
        nodes = bind.nodes;
        if (nodes) {
          target = nodes[0];
          parent = target.parentNode;
          for (_i = 0, _len = newNodes.length; _i < _len; _i++) {
            n = newNodes[_i];
            parent.insertBefore(n, target);
          }
          $(nodes).remove();
        }
        bind.nodes = newNodes;
        bind.val = newVal;
        return true;
      },
      _renderBindAttr: function(bind) {
        var newVal;
        if ((newVal = bind.func()) === bind.val) {
          return false;
        }
        bind.el.setAttribute(bind.attr, bind.val = newVal);
        return true;
      },
      _renderChildren: function(nodes, rendered) {
        var bind, n, _i, _j, _len, _len1, _ref;
        if (nodes == null) {
          return rendered;
        }
        if (!isArrayish(nodes)) {
          nodes = [nodes];
        }
        for (_i = 0, _len = nodes.length; _i < _len; _i++) {
          n = nodes[_i];
          if (n != null) {
            if (n.nodeType === 1) {
              rendered.push(n);
            } else if (isArrayish(n)) {
              this._renderChildren(n, rendered);
            } else if (isBind(n)) {
              bind = {
                nodes: void 0,
                val: void 0,
                func: _.bind(n, this)
              };
              this._renderBindEl(bind);
              this._binds.push(bind);
              _ref = bind.nodes;
              for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
                n = _ref[_j];
                rendered.push(n);
              }
            } else {
              rendered.push(document.createTextNode(n));
            }
          }
        }
        return rendered;
      },
      __: __,
      render: function() {
        var child, _i, _len, _ref;
        _ref = this._renderChildren(this.renderEl(this.__), []);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          this.el.appendChild(child);
        }
        this.afterRender();
        return this;
      },
      updateBinds: function() {
        var b, bindChange, change, i, _i, _j, _len, _ref;
        for (i = _i = 0; _i < 10; i = ++_i) {
          change = false;
          _ref = this._binds;
          for (_j = 0, _len = _ref.length; _j < _len; _j++) {
            b = _ref[_j];
            bindChange = b.attr ? this._renderBindAttr(b) : this._renderBindEl(b);
            change || (change = bindChange);
          }
          if (!change) {
            break;
          }
        }
      },
      remove: function() {
        delete cidMap[this.cid];
        this.el.cellcid = void 0;
        if (this.$el) {
          this.$el.remove();
        }
        this.stopListening();
        this.model = this.collection = this.el = this.$el = this.$ = void 0;
      },
      _setElement: Backbone.View.prototype.setElement,
      setElement: function(element, delegate) {
        this._setElement(element, delegate);
        cidMap[this.cid] = this;
        this.el.setAttribute('cell', this._cellName);
        this.el.cellcid = this.cid;
        return this;
      },
      renderEl: function() {},
      afterRender: function() {}
    }),
    pluginBuilder: 'cell-builder-plugin',
    load: function(name, req, load, config) {
      var el;
      if (!(module._installed || (module._installed = {}))[name]) {
        module._installed[name] = true;
        el = document.createElement('link');
        el.href = req.toUrl(name + ".css");
        el.rel = 'stylesheet';
        el.type = 'text/css';
        document.head.appendChild(el);
      }
      load(function(proto) {
        proto || (proto = {});
        proto.className = proto._cellName = /(.*\/)?(.*)$/.exec(name)[2];
        return module.Cell.extend(proto);
      });
    }
  };
});
