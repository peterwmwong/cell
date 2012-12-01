// Generated by CoffeeScript 1.4.0
var __slice = [].slice;

define(['cell', 'underscore'], function(_arg) {
  var Bind, Cell, __, _isJQueryish, _isObj, _parseHAML, _renderNodes;
  Cell = _arg.Cell;
  _isJQueryish = typeof Zepto === 'function' ? Zepto.fn.isPrototypeOf.bind(Zepto.fn) : function(o) {
    return o.jquery;
  };
  _isObj = function(o) {
    return o && o.constructor === Object;
  };
  _renderNodes = function(parent, nodes) {
    var c;
    while ((c = nodes.pop()) != null) {
      if (_.isElement(c)) {
        parent.insertBefore(c, parent.firstChild);
      } else if (_isJQueryish(c)) {
        c.appendTo(parent);
      } else if (_.isArray(c)) {
        nodes = nodes.concat(c);
      } else if (c instanceof Bind) {
        c.bindTo(parent);
      } else {
        parent.insertBefore(document.createTextNode(c), parent.firstChild);
      }
    }
    return parent;
  };
  _parseHAML = function(haml) {
    var m, v;
    if (m = /^(\w+)?(#([\w\-]+))*(\.[\w\.\-]+)?$/.exec(haml)) {
      return {
        tag: m[1] || 'div',
        id: v = m[3],
        className: (v = m[4]) ? v.slice(1).replace(/\./g, ' ') : ''
      };
    }
  };
  __ = function() {
    var a, b, c, cell_options, children, el, haml, parent;
    a = arguments[0], b = arguments[1], children = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
    if (a) {
      if (_.isElement(b)) {
        children.unshift(b);
        b = void 0;
      }
      parent = (function() {
        if (typeof a === 'string') {
          if (haml = _parseHAML(a)) {
            el = document.createElement(haml.tag);
            if (haml.id) {
              el.setAttribute('id', haml.id);
            }
            if (b != null) {
              if ((_isObj(b)) && (!_isJQueryish(b)) && (!(b instanceof Bind))) {
                _.each(b, function(v, k) {
                  if (k === 'class') {
                    el.className += v;
                  } else {
                    if (v instanceof Bind) {
                      v.bindToAttr(el, k);
                    } else {
                      el.setAttribute(k, v);
                    }
                  }
                });
              } else {
                children.unshift(b);
              }
            }
            if (haml.className) {
              el.className += el.className ? " " + haml.className : haml.className;
            }
            return el;
          } else {
            throw "__(): unsupported argument '" + a + "'";
          }
        } else if (a.prototype instanceof Cell) {
          cell_options = typeof b === 'string' && (haml = _parseHAML(b)) ? _isObj(children[0]) ? ((c = children.shift()).id = haml.id, c.className = haml.className, c) : {
            id: haml.id,
            className: haml.className
          } : _isObj(b) ? b : void 0;
          if (cell_options) {
            cell_options.className = cell_options.className ? "" + a.prototype.className + " " + cell_options.className : a.prototype.className;
          }
          return (new a(cell_options)).render().el;
        } else if (_.isElement(a)) {
          return a;
        } else {
          throw "__(): unsupported argument " + a;
        }
      })();
      return parent && _renderNodes(parent, children);
    }
  };
  Bind = function(model, attrs, transform) {
    this.model = model;
    this.attrs = attrs;
    this.transform = transform;
    if (typeof this.attrs === 'string') {
      this.attrs = [this.attrs];
    }
    this.boundEls = [];
    this.boundAttrs = [];
    this.model.on("change:" + (this.attrs.join(' change:')), this.onChange, this);
    return this;
  };
  Bind.prototype = {
    bindTo: function(el) {
      this.boundEls.push(el);
      el.innerHTML = this.getResult();
    },
    bindToAttr: function(el, attr) {
      this.boundAttrs.push({
        el: el,
        attr: attr
      });
      el.setAttribute(attr, this.getResult());
    },
    getResult: function() {
      var args;
      args = _.map(this.attrs, (function(a) {
        return this[a];
      }), this.model.attributes).concat(this.model);
      return (this.transform && (this.transform.apply(this, args)) || (args.slice(0, -1).join(' '))) || '';
    },
    onChange: function() {
      var val;
      if (this.boundEls.length || this.boundAttrs.length) {
        val = this.getResult();
        _.each(this.boundEls, function(el) {
          el.innerHTML = val;
        });
        _.each(this.boundAttrs, function(_arg1) {
          var attr, el;
          el = _arg1.el, attr = _arg1.attr;
          el.setAttribute(attr, val);
        });
      }
    }
  };
  __.bind = function(model, attrs, transform) {
    return new Bind(model, attrs, transform);
  };
  __.$ = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return $(__.apply(null, args));
  };
  Cell.prototype.__ = __;
  Cell.prototype.render = function() {
    this.render_el && _renderNodes(this.el, [this.render_el(__, __.bind)]);
    if (typeof this.after_render === "function") {
      this.after_render();
    }
    return this;
  };
  return __;
});
