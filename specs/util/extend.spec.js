// Generated by CoffeeScript 1.4.0

define(['../utils/spec-utils'], function(_arg) {
  var browserTrigger, node, nodeHTMLEquals, stringify;
  nodeHTMLEquals = _arg.nodeHTMLEquals, stringify = _arg.stringify, node = _arg.node, browserTrigger = _arg.browserTrigger;
  return function(_arg1) {
    var beforeEachRequire;
    beforeEachRequire = _arg1.beforeEachRequire;
    beforeEachRequire(['util/extend'], function(extend) {
      this.extend = extend;
    });
    return describe('Parent.extend( prototypeProps:object )', function() {
      beforeEach(function() {
        this.Parent = jasmine.createSpy('parent constructor');
        this.Parent.prototype.a = {};
        this.Parent.prototype.b = {};
        return this.Parent.extend = this.extend;
      });
      describe('prototypeProps is undefined', function() {
        beforeEach(function() {
          this.Child = this.Parent.extend();
          return this.child = new this.Child();
        });
        it('creates an instanceof Parent', function() {
          expect(this.Child.prototype instanceof this.Parent).toBe(true);
          expect(this.Parent).toHaveBeenCalled();
          expect(this.Parent.callCount).toBe(1);
          expect(this.child instanceof this.Parent).toBe(true);
          expect(this.child.a).toBe(this.Parent.prototype.a);
          return expect(this.child.b).toBe(this.Parent.prototype.b);
        });
        return it('adds extend method', function() {
          return expect(this.Child.extend).toBe(this.extend);
        });
      });
      return describe('prototypeProps is an object hash', function() {
        beforeEach(function() {
          this.Child = this.Parent.extend({
            constructor: this.constr = jasmine.createSpy('constructor'),
            b: this.child_b = {},
            c: this.child_c = {}
          });
          return this.child = new this.Child();
        });
        it('creates an instanceof Parent', function() {
          expect(this.Child.prototype instanceof this.Parent).toBe(true);
          expect(this.constr).toHaveBeenCalled();
          expect(this.Parent).toHaveBeenCalled();
          expect(this.Parent.callCount).toBe(1);
          return expect(this.child instanceof this.Parent).toBe(true);
        });
        it('adds extend method', function() {
          return expect(this.Child.extend).toBe(this.extend);
        });
        return it('copies over properties from prototypeProps', function() {
          expect(this.Child.prototype.a).toBe(this.Parent.prototype.a);
          expect(this.Child.prototype.b).toBe(this.child_b);
          expect(this.Child.prototype.c).toBe(this.child_c);
          expect(this.child.constructor).toBe(this.constr);
          expect(this.child.b).toBe(this.child_b);
          return expect(this.child.c).toBe(this.child_c);
        });
      });
    });
  };
});