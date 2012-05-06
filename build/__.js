// Generated by CoffeeScript 1.3.1
var __slice = [].slice;

define(['cell'], function(_arg) {
  var Cell, E, __, _isObj, _parseHAML, _renderNodes;
  Cell = _arg.Cell;
  E = typeof (typeof console !== "undefined" && console !== null ? console.error : void 0) === 'function' ? (function() {
    var msg;
    msg = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return console.error.apply(console, msg);
  }) : function() {};
  _isObj = function(o) {
    return (o != null ? o.constructor : void 0) === Object;
  };
  _renderNodes = function(parent, nodes) {
    var c, _ref;
    while (nodes.length > 0) {
      if ((c = nodes.shift()) != null) {
        if (_.isElement(c)) {
          parent.appendChild(c);
        } else if (c.jquery) {
          c.appendTo(parent);
        } else if ((_ref = typeof c) === 'string' || _ref === 'number') {
          parent.appendChild(document.createTextNode(c));
        } else if (_.isArray(c)) {
          Array.prototype.unshift.apply(nodes, c);
        } else {
          E("__: unsupported render child", c);
        }
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
    var a, b, c, cell_options, children, el, haml, k, parent, v;
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
              if (!_isObj(b)) {
                children.unshift(b);
              } else {
                for (k in b) {
                  v = b[k];
                  if (k !== 'class') {
                    el.setAttribute(k, v);
                  } else {
                    el.className += v;
                  }
                }
              }
            }
            if (haml.className) {
              el.className += el.className ? " " + haml.className : haml.className;
            }
            return el;
          } else {
            return E("__(): unsupported argument '" + a + "'");
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
          return E("__(): unsupported argument " + a);
        }
      })();
      return parent && _renderNodes(parent, children);
    }
  };
  __.$ = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return $(__.apply(null, args));
  };
  return __;
});
