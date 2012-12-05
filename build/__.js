// Generated by CoffeeScript 1.4.0
var __slice = [].slice;

define(['cell', 'underscore', 'backbone'], function(_arg, _, Backbone) {
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
    var children, el, haml, options, optionsOrFirstChild, parent, viewOrHAML;
    viewOrHAML = arguments[0], optionsOrFirstChild = arguments[1], children = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
    if (!viewOrHAML) {
      return;
    }
    options = _isObj(optionsOrFirstChild) ? optionsOrFirstChild : (children.push(optionsOrFirstChild), void 0);
    parent = typeof viewOrHAML === 'string' ? (haml = _parseHAML(viewOrHAML)) ? (el = document.createElement(haml.tag), haml.id ? el.setAttribute('id', haml.id) : void 0, haml.className ? el.className = haml.className : void 0, _.each(options, function(v, k) {
      if (v instanceof Bind) {
        v.bindToAttr(el, k);
      } else {
        el.setAttribute(k, v);
      }
    }), el) : void 0 : viewOrHAML.prototype instanceof Backbone.View ? (new viewOrHAML(options)).render().el : void 0;
    if (!parent) {
      throw "__(): unsupported argument " + viewOrHAML;
    }
    return _renderNodes(parent, children);
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
  Bind.prototype.bindTo = function(el) {
    this.boundEls.push(el);
    el.innerHTML = this.getResult();
  };
  Bind.prototype.bindToAttr = function(el, attr) {
    this.boundAttrs.push({
      el: el,
      attr: attr
    });
    el.setAttribute(attr, this.getResult());
  };
  Bind.prototype.getResult = function() {
    var args;
    args = _.map(this.attrs, (function(a) {
      return this[a];
    }), this.model.attributes);
    return (typeof this.transform === "function" ? this.transform.apply(this, __slice.call(args).concat([this.model])) : void 0) || args.join(' ') || '';
  };
  Bind.prototype.onChange = function() {
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
  };
  __.bindTo = function(model, attrs, transform) {
    return new Bind(model, attrs, transform);
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
