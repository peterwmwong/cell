// Generated by CoffeeScript 1.4.0

define(['../../utils/spec-utils'], function(_arg) {
  var node;
  node = _arg.node;
  return function(_arg1) {
    var beforeEachRequire;
    beforeEachRequire = _arg1.beforeEachRequire;
    beforeEachRequire(['dom/class', 'cell/Ext', 'cell/exts/x_class'], function(_arg2, Ext, x_class) {
      this.hasClass = _arg2.hasClass;
      this.Ext = Ext;
      this.x_class = x_class;
    });
    return describe('x_class( classHash:object )', function() {
      beforeEach(function() {
        this.element = node('div');
        this.element.className = 'one two three';
        return this.ext = this.x_class({
          trueClass: true,
          falseClass: false,
          truthyClass: 1,
          falsyClass: void 0,
          one: false,
          two: true,
          three: false
        });
      });
      it('creates an Ext', function() {
        return expect(this.ext instanceof this.Ext).toBe(true);
      });
      return describe('@run( element:Element )', function() {
        beforeEach(function() {
          return this.ext.run(this.element);
        });
        it('applies truthy classes', function() {
          expect(this.hasClass(this.element, 'trueClass')).toBe(true);
          return expect(this.hasClass(this.element, 'truthyClass')).toBe(true);
        });
        it('does NOT apply falsy classes', function() {
          expect(this.hasClass(this.element, 'falseClass')).toBe(false);
          return expect(this.hasClass(this.element, 'falsyClass')).toBe(false);
        });
        return it('removes falsy classes', function() {
          expect(this.hasClass(this.element, 'one')).toBe(false);
          expect(this.hasClass(this.element, 'two')).toBe(true);
          return expect(this.hasClass(this.element, 'three')).toBe(false);
        });
      });
    });
  };
});
