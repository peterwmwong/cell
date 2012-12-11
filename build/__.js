// Generated by CoffeeScript 1.4.0
var __slice = [].slice;

define(['cell', 'jquery', 'underscore', 'backbone', 'ref'], function(_arg, $, _, Backbone, _arg1) {
  var Cell, Reference, __, _isJQueryish, _isObj, _onReferenceChangeAttr, _onReferenceChangeChild, _parseHAML, _renderNodes;
  Cell = _arg.Cell;
  Reference = _arg1.Reference;
  _isJQueryish = typeof Zepto === 'function' ? Zepto.fn.isPrototypeOf.bind(Zepto.fn) : function(o) {
    return o.jquery;
  };
  _isObj = function(o) {
    return o && o.constructor === Object;
  };
  _onReferenceChangeChild = function(ref, val) {
    this.html(val);
  };
  _onReferenceChangeAttr = function(ref, val) {
    this.node.setAttribute(this.attr, val);
  };
  _renderNodes = function(parent, nodes) {
    var $parent, c;
    $parent = void 0;
    while ((c = nodes.pop()) != null) {
      if (_.isElement(c)) {
        parent.insertBefore(c, parent.firstChild);
      } else if (_isJQueryish(c)) {
        c.appendTo(parent);
      } else if (_.isArray(c)) {
        nodes = nodes.concat(c);
      } else if (c instanceof Reference) {
        $parent || ($parent = $(parent));
        c.onChangeAndDo(_onReferenceChangeChild, $parent);
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
        id: m[3],
        className: (v = m[4]) ? v.slice(1).replace(/\./g, ' ') : ''
      };
    }
  };
  __ = function() {
    var children, el, haml, options, optionsOrFirstChild, parent, viewOrHAML;
    viewOrHAML = arguments[0], optionsOrFirstChild = arguments[1], children = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
    if (!viewOrHAML) {
      return;
    }
    options = _isObj(optionsOrFirstChild) ? optionsOrFirstChild : (children.unshift(optionsOrFirstChild), void 0);
    parent = typeof viewOrHAML === 'string' ? (haml = _parseHAML(viewOrHAML)) ? (el = document.createElement(haml.tag), haml.id ? el.setAttribute('id', haml.id) : void 0, haml.className ? el.className = haml.className : void 0, _.each(options, function(v, k) {
      if (v instanceof Reference) {
        v.onChangeAndDo(_onReferenceChangeAttr, {
          node: el,
          attr: k
        });
      } else {
        el.setAttribute(k, v);
      }
    }), el) : void 0 : viewOrHAML.prototype instanceof Backbone.View ? (new viewOrHAML(options)).render().el : void 0;
    if (!parent) {
      throw "__(): unsupported argument " + viewOrHAML;
    }
    return _renderNodes(parent, children);
  };
  __.$ = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return $(__.apply(null, args));
  };
  Cell.prototype.__ = __;
  Cell.prototype.render = function() {
    _renderNodes(this.el, [this.renderEl(__, __.bindTo)]);
    this.afterRender();
    return this;
  };
  return __;
});
