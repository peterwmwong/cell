// Generated by CoffeeScript 1.4.0
var __slice = [].slice;

define(['../utils/spec-utils'], function(_arg) {
  var node, nodeHTMLEquals, stringify;
  nodeHTMLEquals = _arg.nodeHTMLEquals, stringify = _arg.stringify, node = _arg.node;
  return function(_arg1) {
    var beforeEachRequire;
    beforeEachRequire = _arg1.beforeEachRequire;
    describe('__( viewOrSelector:[View, String], attrHash_or_options?:Object, children...:[DOMNode, String, Number, Array] )', function() {
      var empty, it_renders, it_renders_views, _fn, _i, _len, _ref;
      beforeEachRequire(["fixtures/TestCell1", 'cell/View'], function(TestCell1, View) {
        this.TestCell1 = TestCell1;
        return this.__ = new View().__;
      });
      it_renders = function(desc, input_args, expected_html_output, debug) {
        return describe("__( " + desc + " )", function() {
          var input_strings;
          input_strings = stringify(input_args, true);
          return it("__( " + input_strings + " ) === " + expected_html_output, function() {
            if (debug) {
              debugger;
            }
            return nodeHTMLEquals(this.__.apply(this, input_args), expected_html_output);
          });
        });
      };
      it_renders_views = function(desc, input_args, expected_html_output, debug) {
        return describe("__( " + desc + " )", function() {
          var input_strings;
          input_strings = stringify(input_args, true);
          return it("__( View, " + input_strings + " ) === " + expected_html_output, function() {
            if (debug) {
              debugger;
            }
            return nodeHTMLEquals(this.__.apply(this, [this.TestCell1].concat(__slice.call(input_args))), expected_html_output);
          });
        });
      };
      describe("__( function )", function() {
        return it("__( function ) === undefined", function() {
          return expect(this.__(function() {})).toBe(void 0);
        });
      });
      _ref = [void 0, null];
      _fn = function(empty) {
        var empty_str;
        empty_str = "" + (empty === '' && '""' || empty);
        return describe("__( " + empty_str + " )", function() {
          return it("__( " + empty_str + " ) === undefined", function() {
            return expect(this.__(empty)).toBe(void 0);
          });
        });
      };
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        empty = _ref[_i];
        _fn(empty);
      }
      it_renders('empty string', [''], '<div></div>');
      it_renders('selector:String(tag, id, multiple classes)', ['p#myid.myclass.myclass2'], '<p class="myclass myclass2" id="myid"></p>');
      it_renders('selector:String, child:String', ['p#myid.myclass.myclass2', 'blargo'], '<p class="myclass myclass2" id="myid">blargo</p>');
      it_renders("selector:String, child:String('<')", ['p#myid.myclass.myclass2', '<'], '<p class="myclass myclass2" id="myid"><</p>');
      it_renders('selector:String, child:Number', ['p#myid.myclass.myclass2', 777], '<p class="myclass myclass2" id="myid">777</p>');
      it_renders('selector:String, child:Number(0)', ['p#myid.myclass.myclass2', 0], '<p class="myclass myclass2" id="myid">0</p>');
      it_renders('selector:String, child:DOMNode', ['p#myid.myclass.myclass2', node('span')], '<p class="myclass myclass2" id="myid"><span></span></p>');
      (function() {
        var mock_date;
        mock_date = new Date();
        return it_renders('selector:String, child:Date', ['p#myid.myclass.myclass2', mock_date], '<p class="myclass myclass2" id="myid">' + mock_date.toString() + '</p>');
      })();
      it_renders('selector:String, children:String[]', ['p#myid.myclass.myclass2', ['one', 'two', 'three']], '<p class="myclass myclass2" id="myid">onetwothree</p>');
      it_renders('selector:String, children:String...', ['p#myid.myclass.myclass2', 'one', 'two', 'three'], '<p class="myclass myclass2" id="myid">onetwothree</p>');
      it_renders('selector:String, children...:[DOM Nodes, String, Number, Array]', ['p#myid.myclass.myclass2', [node('span'), 'hello', [node('table'), 'world', 5, [node('div')]], 0, node('a')]], '<p class="myclass myclass2" id="myid"><span></span>hello<table></table>world5<div></div>0<a></a></p>');
      it_renders('selector:String, children...:[undefined, null]', ['p#myid.myclass.myclass2', [void 0, null]], '<p class="myclass myclass2" id="myid"></p>');
      it_renders("selector:String, attrHash:Object", [
        'p#myid.myclass.myclass2', {
          "class": 'myclass3',
          'data-custom': 'myattr',
          'data-custom2': 'myattr2'
        }
      ], '<p class="myclass3" data-custom="myattr" data-custom2="myattr2" id="myid"></p>');
      it_renders("selector:String, attrHash:Object, children...:[DOM Nodes, String, Number, Array, jQuery]", [
        'p', {
          'data-custom': 'myattr',
          'data-custom2': 'myattr2'
        }, node('span'), 'hello', [node('table'), 'world', 5, [node('div')]], 0, node('a')
      ], '<p data-custom="myattr" data-custom2="myattr2"><span></span>hello<table></table>world5<div></div>0<a></a></p>');
      it_renders('selector:String, children...:[undefined, null]', [
        'p', {
          'data-custom': 'myattr',
          'data-custom2': 'myattr2'
        }, void 0, null
      ], '<p data-custom="myattr" data-custom2="myattr2"></p>');
      return it_renders_views("view:View", [], '<div cell="TestCell1" class="TestCell1">TestCell1 Contents</div>', true);
    });
    describe('__.if( condition:truthy, {then:function, else:function} )', function() {
      beforeEachRequire(['cell/View'], function(View) {
        return this.__ = new View().__;
      });
      describe('when only then is provided', function() {
        beforeEach(function() {
          var _this = this;
          this.thenNode = node('div');
          return this.thenElse = {
            then: function() {
              return _this.thenNode;
            }
          };
        });
        it('when condition is truthy, renders then', function() {
          return expect(this.__["if"](true, this.thenElse)).toEqual(this.thenNode);
        });
        return it('when condition is falsy, renders undefined', function() {
          return expect(this.__["if"](false, this.thenElse)).toEqual(void 0);
        });
      });
      describe('when only else is provided', function() {
        beforeEach(function() {
          var _this = this;
          this.elseNode = node('div');
          return this.thenElse = {
            "else": function() {
              return _this.elseNode;
            }
          };
        });
        it('when condition is truthy, renders undefined', function() {
          return expect(this.__["if"](true, this.thenElse)).toEqual(void 0);
        });
        return it('when condition is falsy, renders undefined', function() {
          return expect(this.__["if"](false, this.thenElse)).toEqual(this.elseNode);
        });
      });
      describe('when then and else are provided', function() {
        beforeEach(function() {
          var _this = this;
          this.thenNode = node('div');
          this.elseNode = node('span');
          return this.thenElse = {
            then: function() {
              return _this.thenNode;
            },
            "else": function() {
              return _this.elseNode;
            }
          };
        });
        it('when condition is truthy, renders then', function() {
          var truthy, _i, _len, _ref, _results;
          _ref = [true, 1, '1', [], {}];
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            truthy = _ref[_i];
            _results.push(expect(this.__["if"](truthy, this.thenElse)).toEqual(this.thenNode));
          }
          return _results;
        });
        return it('when condition is falsy, renders else', function() {
          var falsy, _i, _len, _ref, _results;
          _ref = [false, 0, '', void 0, null];
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            falsy = _ref[_i];
            _results.push(expect(this.__["if"](falsy, this.thenElse)).toEqual(this.elseNode));
          }
          return _results;
        });
      });
      return describe('when then/else returns an array of nodes', function() {
        beforeEach(function() {
          var _this = this;
          this.thenNode1 = node('div');
          this.thenNode2 = node('div');
          return this.thenElse = {
            then: function() {
              return [_this.thenNode1, _this.thenNode2];
            }
          };
        });
        return it('when condition is truthy, renders then', function() {
          return expect(this.__["if"](true, this.thenElse)).toEqual([this.thenNode1, this.thenNode2]);
        });
      });
    });
    return describe('__.each( many:arrayOrCollection, renderer:function )', function() {
      beforeEachRequire(['cell/View'], function(View) {
        var _this = this;
        this.__ = new View().__;
        this.items = [
          {
            name: 'a'
          }, {
            name: 'b'
          }, {
            name: 'c'
          }
        ];
        this.eachRenderer = jasmine.createSpy('eachRenderer');
        return this.eachRenderer.andCallFake(function(item) {
          return _this.__('div', item.name || item.attributes.name);
        });
      });
      return it('when many is non-empty array', function() {
        var i, item, result, _i, _len, _ref;
        result = this.__.each(this.items, this.eachRenderer);
        expect(this.eachRenderer.callCount).toEqual(3);
        _ref = this.items;
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          item = _ref[i];
          expect(this.eachRenderer.calls[i].args).toEqual([item, i, this.items]);
        }
        nodeHTMLEquals(result[0], '<div>a</div>');
        nodeHTMLEquals(result[1], '<div>b</div>');
        return nodeHTMLEquals(result[2], '<div>c</div>');
      });
    });
  };
});