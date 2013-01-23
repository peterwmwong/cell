// Generated by CoffeeScript 1.4.0

define(['../utils/spec-utils', '../utils/spec-matchers'], function(_arg, matchers) {
  var node;
  node = _arg.node;
  return function(_arg1) {
    var beforeEachRequire;
    beforeEachRequire = _arg1.beforeEachRequire;
    beforeEachRequire(['dom/data', 'dom/api'], function(data, api) {
      this.data = data;
      this.api = api;
      this.addMatchers(matchers);
      return this.element = node('div');
    });
    describe('data.set( element:DOMElement, key:string, value:any ) and data.get( element:DOMElement, key:string )', function() {
      return it('should get and set and remove data', function() {
        expect(this.data.get(this.element, 'prop')).toBeUndefined();
        this.data.set(this.element, 'prop', 'value');
        expect(this.data.get(this.element, 'prop')).toBe('value');
        this.data.remove(this.element, 'prop');
        return expect(this.data.get(this.element, 'prop')).toBeUndefined();
      });
    });
    it('data.get( element:DOMElement )', function() {
      expect(this.data.get(this.element)).toEqual({});
      this.data.set(this.element, 'foo', 'bar');
      expect(this.data.get(this.element)).toEqual({
        foo: 'bar'
      });
      this.data.get(this.element).baz = 'xxx';
      return expect(this.data.get(this.element)).toEqual({
        foo: 'bar',
        baz: 'xxx'
      });
    });
    return describe('data cleanup', function() {
      beforeEach(function() {
        this.element.innerHTML = '<span></span>';
        this.span = this.element.children[0];
        return this.data.set(this.element, 'name', 'divy');
      });
      return it('should remove data on element removal', function() {
        this.data.remove(this.element);
        return expect(this.data.get(this.element, 'name')).toBeUndefined();
      });
    });
  };
});
