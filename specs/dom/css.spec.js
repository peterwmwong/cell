// Generated by CoffeeScript 1.4.0

define(['../utils/spec-utils', '../utils/spec-matchers'], function(_arg, matchers) {
  var node;
  node = _arg.node;
  return function(_arg1) {
    var beforeEachRequire;
    beforeEachRequire = _arg1.beforeEachRequire;
    beforeEachRequire(['dom/css', 'dom/api'], function(css, api) {
      var _ref;
      this.css = css;
      this.api = api;
      this.addMatchers(matchers);
      this.parent = node('div');
      this.parent.innerHTML = "<div style=\"margin: 1px;\"></div>\n<div></div>";
      return _ref = this.parent.children, this.element = _ref[0], this.elementNoMargin = _ref[1], _ref;
    });
    describe('css( element:Element, style:string ) # Get ', function() {
      it('gets style', function() {
        return expect(this.css(this.element, 'margin')).toEqual('1px');
      });
      return it('gets unset styles', function() {
        var expectation;
        expectation = expect(this.css(this.elementNoMargin, 'margin'));
        if (this.api.msie <= 8) {
          return expectation.toBe('auto');
        } else {
          return expectation.toBeFalsy();
        }
      });
    });
    describe('css( element:Element, style:string, value:any ) # Set', function() {
      beforeEach(function() {
        return this.css(this.element, 'margin', '2px');
      });
      return it('sets style', function() {
        return expect(this.parent.innerHTML.indexOf('<div style="margin: 2px;"></div>') !== -1).toBe(true);
      });
    });
    describe('css( element:Element, styles:string[] ) # Get Many', function() {
      beforeEach(function() {
        this.css(this.element, 'display', 'inline');
        return this.result = this.css(this.element, ['margin', 'display']);
      });
      return it('gets styles', function() {
        return expect(this.result).toEqual({
          margin: '1px',
          display: 'inline'
        });
      });
    });
    describe('css( element:Element, styleValueHash:object ) # Set Many', function() {
      beforeEach(function() {
        return this.css(this.element, {
          margin: '3px',
          display: 'inline'
        });
      });
      return it('gets styles', function() {
        return expect(this.parent.innerHTML.indexOf('<div style="margin: 3px; display: inline;"></div>') !== -1).toBe(true);
      });
    });
    return it('should correctly handle dash-separated and camelCased properties', function() {
      expect(this.css(this.element, 'z-index')).toBeOneOf('', 'auto');
      expect(this.css(this.element, 'zIndex')).toBeOneOf('', 'auto');
      this.css(this.element, {
        'zIndex': 5
      });
      expect(this.css(this.element, 'z-index')).toBeOneOf('5', 5);
      expect(this.css(this.element, 'zIndex')).toBeOneOf('5', 5);
      this.css(this.element, {
        'z-index': 7
      });
      expect(this.css(this.element, 'z-index')).toBeOneOf('7', 7);
      expect(this.css(this.element, 'zIndex')).toBeOneOf('7', 7);
      this.css(this.element, 'zIndex', 5);
      expect(this.css(this.element, 'z-index')).toBeOneOf('5', 5);
      expect(this.css(this.element, 'zIndex')).toBeOneOf('5', 5);
      this.css(this.element, 'z-index', 7);
      expect(this.css(this.element, 'z-index')).toBeOneOf('7', 7);
      expect(this.css(this.element, 'zIndex')).toBeOneOf('7', 7);
      expect(this.css(this.element, ['z-index'])['z-index']).toBeOneOf('7', 7);
      return expect(this.css(this.element, ['zIndex'])['zIndex']).toBeOneOf('7', 7);
    });
  };
});