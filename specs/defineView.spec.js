// Generated by CoffeeScript 1.6.3
define(['jquery'], function($) {
  return function(_arg) {
    var beforeEachRequire;
    beforeEachRequire = _arg.beforeEachRequire;
    beforeEachRequire(['fixtures/TestCell1', 'cell/View'], function(TestCell1, View) {
      this.TestCell1 = TestCell1;
      this.View = View;
      return this.testCell1 = new this.TestCell1;
    });
    it('attaches <link> for stylesheet', function() {
      return expect($('link[href$="specs/fixtures/TestCell1.css"][rel=stylesheet][type="text/css"]').length).not.toBe(0);
    });
    it('exposes @View', function() {
      return expect(this.testCell1 instanceof this.View).toBe(true);
    });
    it('modifies rendering to automatically add cell attribute', function() {
      return expect(this.testCell1.el.getAttribute('cell')).toBe('TestCell1');
    });
    return it('modifies rendering to automatically add class', function() {
      return expect(this.testCell1.el.className).toBe('TestCell1');
    });
  };
});

/*
//@ sourceMappingURL=defineView.spec.map
*/