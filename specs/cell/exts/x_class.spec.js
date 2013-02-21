// Generated by CoffeeScript 1.4.0

define(['../../utils/spec-utils'], function(_arg) {
  var node, waitOne;
  node = _arg.node, waitOne = _arg.waitOne;
  return function(_arg1) {
    var beforeEachRequire;
    beforeEachRequire = _arg1.beforeEachRequire;
    beforeEachRequire(['dom/class', 'cell/Model', 'cell/Ext', 'cell/exts/x_class'], function(cls, Model, Ext, x_class) {
      this.cls = cls;
      this.Model = Model;
      this.Ext = Ext;
      this.x_class = x_class;
    });
    return describe('x_class( classHash:object )', function() {
      beforeEach(function() {
        var _this = this;
        this.model = new this.Model({
          a: true,
          b: false
        });
        this.element = node('div');
        this.element.className = 'one two three';
        return this.ext = this.x_class({
          trueClass: true,
          falseClass: false,
          truthyClass: 1,
          falsyClass: void 0,
          one: false,
          two: true,
          three: false,
          truthyExpression: function() {
            return _this.model.get('a');
          },
          falsyExpression: function() {
            return _this.model.get('b');
          }
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
          expect(this.cls.has(this.element, 'trueClass')).toBe(true);
          expect(this.cls.has(this.element, 'truthyClass')).toBe(true);
          expect(this.cls.has(this.element, 'truthyExpression')).toBe(true);
          return expect(this.cls.has(this.element, 'falsyExpression')).toBe(false);
        });
        it('does NOT apply falsy classes', function() {
          expect(this.cls.has(this.element, 'falseClass')).toBe(false);
          return expect(this.cls.has(this.element, 'falsyClass')).toBe(false);
        });
        it('removes falsy classes', function() {
          expect(this.cls.has(this.element, 'one')).toBe(false);
          expect(this.cls.has(this.element, 'two')).toBe(true);
          return expect(this.cls.has(this.element, 'three')).toBe(false);
        });
        return describe("when a expression's value changes", function() {
          beforeEach(function() {
            return this.model.set('a', false);
          });
          return it('it automatically sets/unsets the class expression was bound to', function() {
            return waitOne(function() {
              expect(this.cls.has(this.element, 'truthyExpression')).toBe(false);
              return expect(this.cls.has(this.element, 'falsyExpression')).toBe(false);
            });
          });
        });
      });
    });
  };
});
