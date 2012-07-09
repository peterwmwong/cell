// Generated by CoffeeScript 1.3.1
(function() {
  var __slice = [].slice;

  define(['./spec-utils'], function(_arg) {
    var TestCell1Name, node, nodeHTMLEquals, stringify, verify_is_jQueryish;
    nodeHTMLEquals = _arg.nodeHTMLEquals, stringify = _arg.stringify, node = _arg.node;
    TestCell1Name = 'fixtures/TestCell1';
    verify_is_jQueryish = function(obj) {
      return expect(Object.getPrototypeOf(obj)).toBe($.fn);
    };
    return function(_arg1) {
      var beforeEachRequire;
      beforeEachRequire = _arg1.beforeEachRequire;
      describe('__.$()', function() {
        beforeEachRequire(['__'], function(__) {
          return this.result = __.$('p#myid.myclass.myclass2');
        });
        it('returns a jQuery-ish object', function() {
          return verify_is_jQueryish(this.result);
        });
        return it('jQuery-ish object wraps whatever is returned from __', function() {
          return nodeHTMLEquals(this.result[0], '<p class="myclass myclass2" id="myid"></p>');
        });
      });
      return describe('__()', function() {
        var invalid, it_renders, it_renders_cell, _fn, _i, _len, _ref;
        beforeEachRequire(["cell!" + TestCell1Name, '__'], function(TestCell1, __) {
          this.TestCell1 = TestCell1;
          this.__ = __;
        });
        _ref = ['', void 0, null, (function() {})];
        _fn = function(invalid) {
          return describe("" + (invalid === '' && '""' || invalid), function() {
            return it("__ " + (invalid === '' && '""' || invalid) + " === undefined", function() {
              return expect(this.__(invalid)).toBe(void 0);
            });
          });
        };
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          invalid = _ref[_i];
          _fn(invalid);
        }
        it_renders = function(desc, input_args, expected_html_output, debug) {
          return describe(desc, function() {
            var input_strings;
            input_strings = stringify(input_args, true);
            return it("__ " + input_strings + " === " + expected_html_output, function() {
              if (debug) {
                debugger;
              }
              return nodeHTMLEquals(this.__.apply(this, input_args), expected_html_output);
            });
          });
        };
        it_renders_cell = function(desc, input_args, expected_html_output, debug) {
          return describe(desc, function() {
            var input_strings;
            input_strings = stringify(input_args, true);
            return it("__ Cell, " + input_strings + " === " + expected_html_output, function() {
              if (debug) {
                debugger;
              }
              return nodeHTMLEquals(this.__.apply(this, [this.TestCell1].concat(__slice.call(input_args))), expected_html_output);
            });
          });
        };
        it_renders('Selector:<String> (tag, id, multiple classes)', ['p#myid.myclass.myclass2'], '<p class="myclass myclass2" id="myid"></p>');
        it_renders('Selector:<String>, Child:<String>', ['p#myid.myclass.myclass2', 'blargo'], '<p class="myclass myclass2" id="myid">blargo</p>');
        it_renders('Selector:<String>, Child:<Number>', ['p#myid.myclass.myclass2', 777], '<p class="myclass myclass2" id="myid">777</p>');
        it_renders('Selector:<String>, Child:<Number === 0>', ['p#myid.myclass.myclass2', 0], '<p class="myclass myclass2" id="myid">0</p>');
        it_renders('Selector:<String>, Child:<DOM Node>', ['p#myid.myclass.myclass2', node('span')], '<p class="myclass myclass2" id="myid"><span></span></p>');
        it_renders('Selector:<String>, Children:<Array of Strings>', ['p#myid.myclass.myclass2', ['one', 'two']], '<p class="myclass myclass2" id="myid">onetwo</p>');
        it_renders('Selector:<String>, Children...:<DOM Nodes, String, Number, Array, jQuery-ish object>', ['p#myid.myclass.myclass2', [node('span'), 'hello', [node('table'), 'world', 5, [node('div')]], 0, node('a'), $('<span class="result"></span><span class="jQueryObjDeux"></span>')]], '<p class="myclass myclass2" id="myid"><span></span>hello<table></table>world5<div></div>0<a></a><span class="result"></span><span class="jQueryObjDeux"></span></p>');
        it_renders('Selector:<String>, Children...:<undefined, null, Function>', ['p#myid.myclass.myclass2', [void 0, null, (function() {})]], '<p class="myclass myclass2" id="myid"></p>');
        it_renders("Selector:<String>, Attribute Map:<Object>", [
          'p#myid.myclass.myclass2', {
            "class": 'myclass3',
            'data-custom': 'myattr',
            'data-custom2': 'myattr2'
          }
        ], '<p class="myclass3 myclass myclass2" data-custom="myattr" data-custom2="myattr2" id="myid"></p>');
        it_renders("Selector:<String>, Attribute Map:<Object>, Children...:<DOM Nodes, String, Number, Array, jQuery-ish object>", [
          'p', {
            'data-custom': 'myattr',
            'data-custom2': 'myattr2'
          }, node('span'), 'hello', [node('table'), 'world', 5, [node('div')]], 0, node('a')
        ], '<p data-custom="myattr" data-custom2="myattr2"><span></span>hello<table></table>world5<div></div>0<a></a></p>');
        it_renders('Selector:<String>, Children...:<undefined, null, Function>', [
          'p', {
            'data-custom': 'myattr',
            'data-custom2': 'myattr2'
          }, void 0, null, (function() {})
        ], '<p data-custom="myattr" data-custom2="myattr2"></p>');
        it_renders_cell("cell:<cell>", [], '<div class="TestCell1">TestCell1 Contents</div>');
        it_renders_cell("cell:<cell>, options:<Object>", [
          {
            tagName: 'span'
          }
        ], '<span class="TestCell1">TestCell1 Contents</span>');
        it_renders_cell("cell:<cell>, Selector String:<String>", ['#myid.myclass.myclass2'], '<div class="TestCell1 myclass myclass2" id="myid">TestCell1 Contents</div>');
        return it_renders_cell("cell:<cell>, Selector String:<String>, options:<Object>", [
          '#myid.myclass.myclass2', {
            tagName: 'a'
          }
        ], '<a class="TestCell1 myclass myclass2" id="myid">TestCell1 Contents</a>');
      });
    };
  });

}).call(this);
