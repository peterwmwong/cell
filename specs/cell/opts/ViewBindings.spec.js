// Generated by CoffeeScript 1.4.0

define(['../../utils/spec-utils'], function(_arg) {
  var browserTrigger, node, nodeHTMLEquals, stringify, waitOne;
  nodeHTMLEquals = _arg.nodeHTMLEquals, stringify = _arg.stringify, node = _arg.node, browserTrigger = _arg.browserTrigger, waitOne = _arg.waitOne;
  return function(_arg1) {
    var beforeEachRequire;
    beforeEachRequire = _arg1.beforeEachRequire;
    return describe('Passing Bindings (functions) to __', function() {
      beforeEachRequire(['cell/View', 'cell/Model', 'cell/Collection'], function(View, Model, Collection) {
        this.View = View;
        this.Model = Model;
        this.Collection = Collection;
        this.view = new this.View();
        this.view.set('test', 'test val');
        this.view.set('testInnerHTML', 'test innerHTML');
        return this.__ = this.view.__;
      });
      describe('__.each( collection, view:View )', function() {
        beforeEach(function() {
          var ChildView, ParentView, items;
          items = [
            {
              name: 'a'
            }, {
              name: 'b'
            }, {
              name: 'c'
            }
          ];
          ChildView = this.View.extend({
            _cellName: 'Child',
            render: function(__) {
              return this.model.name;
            }
          });
          ParentView = this.View.extend({
            _cellName: 'Parent',
            items: items,
            render: function(__) {
              return __.each((function() {
                return this.items;
              }), ChildView);
            }
          });
          return this.result = new ParentView().el;
        });
        return it('when many is non-empty array', function() {
          return nodeHTMLEquals(this.result, '<div cell="Parent" class="Parent">' + '<div cell="Child" class="Child">a</div>' + '<div cell="Child" class="Child">b</div>' + '<div cell="Child" class="Child">c</div>' + '</div>');
        });
      });
      describe('when a bind is passed as the condition to __.each(collection, renderer:function)', function() {
        return describe('when renderer returns an array of nodes', function() {
          beforeEach(function() {
            var _this = this;
            this.models = [
              new this.Model({
                a: 1
              }), new this.Model({
                a: 2
              }), new this.Model({
                a: 3
              })
            ];
            this.collection = new this.Collection(this.models);
            this.CellWithEach = this.View.extend({
              _cellName: 'test',
              eachKey: 'eachValue',
              render: function(__) {
                return [
                  __('.parent', __.each((function() {
                    return _this.collection.map(function(m) {
                      return m.get('a');
                    });
                  }), function(value) {
                    return __(".item" + value, this.eachKey);
                  }))
                ];
              }
            });
            return this.view = new this.CellWithEach();
          });
          it('renders initially correctly', function() {
            return nodeHTMLEquals(this.view.el, '<div cell="test" class="test"><div class="parent"><div class="item1">eachValue</div><div class="item2">eachValue</div><div class="item3">eachValue</div></div></div>');
          });
          return describe('when collection changes', function() {
            beforeEach(function() {
              this.item2 = this.view.el.children[0].children[1];
              this.item3 = this.view.el.children[0].children[2];
              this.collection.remove(this.collection.at(0));
              return this.collection.add(new this.Model({
                a: 4
              }));
            });
            it('renders after change correctly', function() {
              return waitOne(function() {
                return nodeHTMLEquals(this.view.el, '<div cell="test" class="test"><div class="parent"><div class="item2">eachValue</div><div class="item3">eachValue</div><div class="item4">eachValue</div></div></div>');
              });
            });
            return it("doesn't rerender previous items", function() {
              return waitOne(function() {
                expect(this.view.el.children[0].children[0]).toBe(this.item2);
                return expect(this.view.el.children[0].children[1]).toBe(this.item3);
              });
            });
          });
        });
      });
      describe('when a bind is passed as the condition to __.if(condition, {then:function, else:function})', function() {
        describe('when then and else return array of nodes', function() {
          beforeEach(function() {
            var _this = this;
            this.model = new this.Model({
              condition: true
            });
            this.CellWithIf = this.View.extend({
              _cellName: 'test',
              thenKey: 'thenValue',
              elseKey: 'elseValue',
              render: function(__) {
                return [
                  __('.parent', __["if"]((function() {
                    return _this.model.get('condition');
                  }), {
                    then: function() {
                      return [__('.then1', this.thenKey), __('.then2')];
                    },
                    "else": function() {
                      return [__('.else1', this.elseKey), __('.else2')];
                    }
                  }))
                ];
              }
            });
            return this.view = new this.CellWithIf();
          });
          it('renders initially correctly', function() {
            return nodeHTMLEquals(this.view.el, '<div cell="test" class="test"><div class="parent"><div class="then1">thenValue</div><div class="then2"></div></div></div>');
          });
          return it('renders after change correctly', function() {
            this.model.set('condition', false);
            return waitOne(function() {
              return nodeHTMLEquals(this.view.el, '<div cell="test" class="test"><div class="parent"><div class="else1">elseValue</div><div class="else2"></div></div></div>');
            });
          });
        });
        describe('when then and/or else are not specified', function() {
          beforeEach(function() {
            var _this = this;
            this.model = new this.Model({
              condition: true
            });
            this.CellWithIf = this.View.extend({
              _cellName: 'test',
              render: function(__) {
                return [
                  __('.parent', __["if"]((function() {
                    return _this.model.get('condition');
                  }), {}))
                ];
              }
            });
            return this.view = new this.CellWithIf();
          });
          return it('renders nothing', function() {
            nodeHTMLEquals(this.view.el, '<div cell="test" class="test"><div class="parent"></div></div>');
            this.model.set('condition', false);
            return nodeHTMLEquals(this.view.el, '<div cell="test" class="test"><div class="parent"></div></div>');
          });
        });
        return describe('when then and else return a node', function() {
          beforeEach(function() {
            var _this = this;
            this.model = new this.Model({
              condition: true
            });
            this.CellWithIf = this.View.extend({
              _cellName: 'test',
              render: function(__) {
                return [
                  __('.parent', __["if"]((function() {
                    return _this.model.get('condition');
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
            return waitOne(function() {
              return nodeHTMLEquals(this.view.el, '<div cell="test" class="test"><div class="parent"><div class="then"></div></div></div>');
            });
          });
          return it('renders after change correctly', function() {
            this.model.set('condition', false);
            return waitOne(function() {
              return nodeHTMLEquals(this.view.el, '<div cell="test" class="test"><div class="parent"><div class="else"></div></div></div>');
            });
          });
        });
      });
      describe('when a bind is passed as an attribute', function() {
        beforeEach(function() {
          return this.node = this.__('.bound', {
            'data-custom': (function() {
              return this.get('test');
            }),
            'non-bind': 'constant value',
            innerHTML: (function() {
              return this.get('testInnerHTML');
            })
          });
        });
        it("when innerHTML is specified as an attribute, sets the innerHTML", function() {
          return expect(this.node.innerHTML).toBe('test innerHTML');
        });
        it("sets binding's value to the element's attribute", function() {
          expect(this.node.getAttribute('data-custom')).toBe('test val');
          return expect(this.node.getAttribute('non-bind')).toBe('constant value');
        });
        return describe("when the binding's value changes and @updateBinds() is called", function() {
          beforeEach(function() {
            this.view.set('test', 'test val2');
            return this.view.set('testInnerHTML', 'test innerHTML 2');
          });
          it("automatically sets the element's attribute to the new binding's value", function() {
            return waitOne(function() {
              return expect(this.node.getAttribute('data-custom')).toBe('test val2');
            });
          });
          return it("when innerHTML is specified as an attribute, sets the innerHTML", function() {
            return waitOne(function() {
              return expect(this.node.innerHTML).toBe('test innerHTML 2');
            });
          });
        });
      });
      describe("when the attribute is a on* event handler", function() {
        return it("doesn't think it's a bind", function() {
          this.node = this.__('.bound', {
            onclick: this.clickHandler = jasmine.createSpy('click')
          });
          this.domFixture.appendChild(this.node);
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
          return describe("when the binding's value is of type " + value_type, function() {
            beforeEach(function() {
              this.view.set('test', ref_value);
              return this.node = this.__('.parent', 'BEFORE', function() {
                return this.get('test');
              }, 'AFTER');
            });
            it("child is rendered correctly", function() {
              return nodeHTMLEquals(this.node, "<div class=\"parent\">BEFORE" + expected_child_html + "AFTER</div>");
            });
            return describe("when the binding's value changes", function() {
              beforeEach(function() {
                return this.view.set('test', ref_value_after);
              });
              return it("automatically rerenders child correctly", function() {
                return waitOne(function() {
                  return nodeHTMLEquals(this.node, "<div class=\"parent\">BEFORE" + expected_child_html_after + "AFTER</div>");
                });
              });
            });
          });
        };
        describe("when the binding's value is undefined", function() {
          beforeEach(function() {
            this.view.set('test', void 0);
            return this.node = this.__('.parent', 'BEFORE', function() {
              return this.get('test');
            }, 'AFTER');
          });
          it("child is rendered correctly", function() {
            return nodeHTMLEquals(this.node, "<div class=\"parent\">BEFOREAFTER</div>");
          });
          return describe("when the binding's value changes and @updateBinds() is called", function() {
            beforeEach(function() {
              return this.view.set('test', 'something');
            });
            return it("automatically rerenders child correctly", function() {
              return waitOne(function() {
                return nodeHTMLEquals(this.node, "<div class=\"parent\">BEFOREsomethingAFTER</div>");
              });
            });
          });
        });
        describe_render_reference({
          value_type: 'DOMNode',
          ref_value: node('span'),
          ref_value_after: node('b'),
          expected_child_html: '<span></span>',
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
