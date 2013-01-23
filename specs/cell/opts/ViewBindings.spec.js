// Generated by CoffeeScript 1.4.0

define(['../../utils/spec-utils'], function(_arg) {
  var browserTrigger, node, nodeHTMLEquals, stringify;
  nodeHTMLEquals = _arg.nodeHTMLEquals, stringify = _arg.stringify, node = _arg.node, browserTrigger = _arg.browserTrigger;
  return function(_arg1) {
    var beforeEachRequire;
    beforeEachRequire = _arg1.beforeEachRequire;
    describe('@updateBinds()', function() {
      beforeEachRequire(['cell/opts/ViewBindings', 'cell/View'], function(ViewBindings, View) {
        this.View = View;
      });
      describe("Given multiple binds, when a bind updates due to another bind's update", function() {
        beforeEach(function() {
          this.view = new this.View();
          this.view.count = -1;
          this.__ = this.view.__;
          this.bind1 = jasmine.createSpy('bind1').andCallFake(function() {
            if (this.count === 0) {
              ++this.count;
            }
            return this.count;
          });
          this.oneEl = this.__('.one', this.bind1);
          this.bind2 = jasmine.createSpy('bind2').andCallFake(function() {
            if (this.count === 1) {
              ++this.count;
            }
            return this.count;
          });
          this.twoEl = this.__('.two', this.bind2);
          this.bind1.reset();
          this.bind2.reset();
          this.view.count = 0;
          return this.view.updateBinds();
        });
        return it('Calls binds 3 times (1 - updateBinds(), 2 - bind1 changed, 3 - bind2 changed)', function() {
          expect(this.bind1.callCount).toBe(3);
          expect(this.bind2.callCount).toBe(3);
          expect(this.oneEl.innerHTML).toBe('2');
          return expect(this.twoEl.innerHTML).toBe('2');
        });
      });
      return describe("when a bind continues to update", function() {
        beforeEach(function() {
          this.view = new this.View();
          this.view.count = -1;
          this.__ = this.view.__;
          this.bind1 = jasmine.createSpy('bind1').andCallFake(function() {
            return ++this.count;
          });
          this.oneEl = this.__('.one', this.bind1);
          this.bind1.reset();
          this.view.count = 0;
          return this.view.updateBinds();
        });
        return it('max out after 10 tries', function() {
          expect(this.bind1.callCount).toBe(10);
          expect(this.view.count).toBe(10);
          return expect(this.oneEl.innerHTML).toBe('10');
        });
      });
    });
    return describe('Passing Bindings (functions) to __', function() {
      beforeEachRequire(['cell/opts/ViewBindings', 'cell/View'], function(ViewBindings, View) {
        this.View = View;
        this.view = new this.View();
        this.view.test = 'test val';
        return this.__ = this.view.__;
      });
      describe('when a bind is passed as the condition to __.each(collection, renderer:function)', function() {
        return describe('when renderer returns an array of nodes', function() {
          beforeEach(function() {
            var _this = this;
            this.collection = [1, 2, 3];
            this.CellWithEach = this.View.extend({
              _cellName: 'test',
              render: function(__) {
                return [
                  __('.parent', __.each((function() {
                    return _this.collection;
                  }), function(item) {
                    return __(".item" + item);
                  }))
                ];
              }
            });
            return this.view = new this.CellWithEach();
          });
          it('renders initially correctly', function() {
            return nodeHTMLEquals(this.view.el, '<div cell="test" class="test"><div class="parent"><div class="item1"></div><div class="item2"></div><div class="item3"></div></div></div>');
          });
          return describe('when collection changes and updateBinds() is called', function() {
            beforeEach(function() {
              this.collection = [4, 1, 3];
              this.item1 = this.view.el.children[0].children[0];
              this.item3 = this.view.el.children[0].children[2];
              return this.view.updateBinds();
            });
            it('renders after change correctly', function() {
              return nodeHTMLEquals(this.view.el, '<div cell="test" class="test"><div class="parent"><div class="item4"></div><div class="item1"></div><div class="item3"></div></div></div>');
            });
            return it("doesn't rerender previous items", function() {
              expect(this.view.el.children[0].children[1]).toBe(this.item1);
              return expect(this.view.el.children[0].children[2]).toBe(this.item3);
            });
          });
        });
      });
      describe('when a bind is passed as the condition to __.if(condition, {then:function, else:function})', function() {
        describe('when then and else return array of nodes', function() {
          beforeEach(function() {
            var _this = this;
            this.condition = true;
            this.CellWithIf = this.View.extend({
              _cellName: 'test',
              render: function(__) {
                return [
                  __('.parent', __["if"]((function() {
                    return _this.condition;
                  }), {
                    then: function() {
                      return [__('.then1'), __('.then2')];
                    },
                    "else": function() {
                      return [__('.else1'), __('.else2')];
                    }
                  }))
                ];
              }
            });
            return this.view = new this.CellWithIf();
          });
          it('renders initially correctly', function() {
            return nodeHTMLEquals(this.view.el, '<div cell="test" class="test"><div class="parent"><div class="then1"></div><div class="then2"></div></div></div>');
          });
          return it('renders after change correctly', function() {
            this.condition = false;
            this.view.updateBinds();
            return nodeHTMLEquals(this.view.el, '<div cell="test" class="test"><div class="parent"><div class="else1"></div><div class="else2"></div></div></div>');
          });
        });
        return describe('when then and else return a node', function() {
          beforeEach(function() {
            var _this = this;
            this.condition = true;
            this.CellWithIf = this.View.extend({
              _cellName: 'test',
              render: function(__) {
                return [
                  __('.parent', __["if"]((function() {
                    return _this.condition;
                  }), {
                    then: function() {
                      return __('.then');
                    },
                    "else": function() {
                      return __('.else');
                    }
                  }))
                ];
              }
            });
            return this.view = new this.CellWithIf();
          });
          it('renders initially correctly', function() {
            return nodeHTMLEquals(this.view.el, '<div cell="test" class="test"><div class="parent"><div class="then"></div></div></div>');
          });
          return it('renders after change correctly', function() {
            this.condition = false;
            this.view.updateBinds();
            return nodeHTMLEquals(this.view.el, '<div cell="test" class="test"><div class="parent"><div class="else"></div></div></div>');
          });
        });
      });
      describe('when a bind is passed as an attribute', function() {
        beforeEach(function() {
          return this.node = this.__('.bound', {
            'data-custom': function() {
              return this.test;
            }
          });
        });
        it("sets bindings's value to the element's attribute", function() {
          return expect(this.node.getAttribute('data-custom')).toBe('test val');
        });
        return describe("when the bindings's value changes and @updateBinds() is called", function() {
          beforeEach(function() {
            this.view.test = 'test val2';
            return this.view.updateBinds();
          });
          return it("automatically sets the element's attribute to the new binding's value", function() {
            return expect(this.node.getAttribute('data-custom')).toBe('test val2');
          });
        });
      });
      describe("when the attribute is a on* event handler", function() {
        return it("doesn't think it's a bind", function() {
          this.node = this.__('.bound', {
            onclick: this.clickHandler = jasmine.createSpy('click')
          });
          expect(this.clickHandler).not.toHaveBeenCalled();
          browserTrigger(this.node, 'click');
          return expect(this.clickHandler).toHaveBeenCalled();
        });
      });
      return describe("when a bind is passed as a child", function() {
        var describe_render_reference;
        describe_render_reference = function(_arg2) {
          var expected_child_html, expected_child_html_after, ref_value, ref_value_after, value_type;
          value_type = _arg2.value_type, ref_value = _arg2.ref_value, ref_value_after = _arg2.ref_value_after, expected_child_html = _arg2.expected_child_html, expected_child_html_after = _arg2.expected_child_html_after;
          return describe("when the bindings's value is of type " + value_type, function() {
            beforeEach(function() {
              this.view.test = ref_value;
              return this.node = this.__('.parent', 'BEFORE', function() {
                return this.test;
              }, 'AFTER');
            });
            it("child is rendered correctly", function() {
              return nodeHTMLEquals(this.node, "<div class=\"parent\">BEFORE" + expected_child_html + "AFTER</div>");
            });
            return describe("when the bindings's value changes and @updateBinds() is called", function() {
              beforeEach(function() {
                this.view.test = ref_value_after;
                return this.view.updateBinds();
              });
              return it("automatically rerenders child correctly", function() {
                return nodeHTMLEquals(this.node, "<div class=\"parent\">BEFORE" + expected_child_html_after + "AFTER</div>");
              });
            });
          });
        };
        describe("when the bindings's value is undefined", function() {
          beforeEach(function() {
            this.view.test = void 0;
            return this.node = this.__('.parent', 'BEFORE', function() {
              return this.test;
            }, 'AFTER');
          });
          it("child is rendered correctly", function() {
            return nodeHTMLEquals(this.node, "<div class=\"parent\">BEFOREAFTER</div>");
          });
          return describe("when the bindings's value changes and @updateBinds() is called", function() {
            beforeEach(function() {
              this.view.test = 'something';
              return this.view.updateBinds();
            });
            return it("automatically rerenders child correctly", function() {
              return nodeHTMLEquals(this.node, "<div class=\"parent\">BEFOREsomethingAFTER</div>");
            });
          });
        });
        describe_render_reference({
          value_type: 'DOMNode',
          ref_value: node('a'),
          ref_value_after: node('b'),
          expected_child_html: '<a></a>',
          expected_child_html_after: '<b></b>'
        });
        describe_render_reference({
          value_type: 'String',
          ref_value: 'Hello World!',
          ref_value_after: 'Goodbye!',
          expected_child_html: 'Hello World!',
          expected_child_html_after: 'Goodbye!'
        });
        describe_render_reference({
          value_type: 'Number',
          ref_value: 0,
          ref_value_after: 1,
          expected_child_html: '0',
          expected_child_html_after: '1'
        });
        return describe_render_reference({
          value_type: 'Array',
          ref_value: ['Hello World!', 0],
          ref_value_after: ['Goodbye!', 1],
          expected_child_html: 'Hello World!0',
          expected_child_html_after: 'Goodbye!1'
        });
      });
    });
  };
});
