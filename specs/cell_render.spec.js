// Generated by CoffeeScript 1.4.0

define(['./spec-utils'], function(_arg) {
  var node, nodeHTMLEquals, stringify;
  nodeHTMLEquals = _arg.nodeHTMLEquals, stringify = _arg.stringify, node = _arg.node;
  return function(_arg1) {
    var beforeEachRequire;
    beforeEachRequire = _arg1.beforeEachRequire;
    beforeEachRequire(['fixtures/TestCell1', 'cell'], function(TestCell1, cell) {
      this.TestCell1 = TestCell1;
      this.cell = cell;
      return this.testCell1 = new this.TestCell1;
    });
    describe('renderEl', function() {
      var it_renders;
      it_renders = function(desc, render_el_return, expected_html_output) {
        return describe(desc, function() {
          var input_strings;
          input_strings = stringify(render_el_return, true);
          return it("[" + input_strings + "] === " + expected_html_output, function() {
            this.testCell1.renderEl = function() {
              return render_el_return;
            };
            return nodeHTMLEquals(this.testCell1.render().el, expected_html_output);
          });
        });
      };
      it('no renderEl', function() {
        return nodeHTMLEquals(this.testCell1.render().el, '<div cell="TestCell1" class="TestCell1">TestCell1 Contents</div>');
      });
      it_renders('String', 'hello world', '<div cell="TestCell1" class="TestCell1">hello world</div>');
      return it_renders('Number', 777, '<div cell="TestCell1" class="TestCell1">777</div>');
    });
    return describe('afterRender', function() {
      it('called after renderEl', function() {
        this.testCell1.renderEl = sinon.stub();
        this.testCell1.afterRender = sinon.stub();
        this.testCell1.render();
        return expect(this.testCell1.renderEl.calledBefore(this.testCell1.afterRender)).toBe(true);
      });
      return it('@el already created', function() {
        var el;
        this.testCell1.renderEl = function() {
          return 'hello world';
        };
        el = void 0;
        this.testCell1.afterRender = function() {
          return el = this.el;
        };
        this.testCell1.render();
        return nodeHTMLEquals(el, '<div cell="TestCell1" class="TestCell1">hello world</div>');
      });
    });
  };
});
