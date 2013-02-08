// Generated by CoffeeScript 1.4.0

define(['../utils/spec-utils'], function(_arg) {
  var browserTrigger, node;
  node = _arg.node, browserTrigger = _arg.browserTrigger;
  return function(_arg1) {
    var beforeEachRequire;
    beforeEachRequire = _arg1.beforeEachRequire;
    beforeEachRequire(['cell/View'], function(View) {
      this.View = View;
    });
    return describe('View( options?:object )', function() {
      it('sets @options', function() {
        var View, o1;
        View = this.View.extend();
        expect((new View(o1 = {})).options).toBe(o1);
        expect((new View).options).toEqual({});
        return expect((new View(void 0)).options).toEqual({});
      });
      it('sets @model, if options.model exists', function() {
        var View, model, view;
        View = this.View.extend();
        model = {};
        view = new View({
          model: model
        });
        expect(view.model).toBe(model);
        return expect(view.options.model).toBeUndefined();
      });
      it('sets @collection, if options.collection exists', function() {
        var View, collection, view;
        View = this.View.extend();
        collection = {};
        view = new View({
          collection: collection
        });
        expect(view.collection).toBe(collection);
        return expect(view.options.collection).toBeUndefined();
      });
      return describe('sets @el', function() {
        beforeEach(function() {
          var _this = this;
          this.el = document.createElement('div');
          this.childEl = document.createElement('span');
          this.log = [];
          this.NewView = this.View.extend({
            beforeRender: function() {
              return _this.log.push('beforeRender');
            },
            renderEl: function() {
              _this.log.push('renderEl');
              return _this.el;
            },
            render: function(__) {
              _this.log.push('render');
              return _this.childEl;
            },
            afterRender: function() {
              return _this.log.push('afterRender');
            }
          });
          return this.view = new this.NewView();
        });
        it('calls View::renderEl() to set @el', function() {
          return expect(this.view.el).toBe(this.el);
        });
        it('calls View::render() to set contents of @el', function() {
          expect(this.view.el.children.length).toBe(1);
          return expect(this.view.el.children[0]).toEqual(this.childEl);
        });
        return it('calls functions in this order: beforeRender(), renderEl(), render() and finally afterRender()', function() {
          return expect(this.log).toEqual(['beforeRender', 'renderEl', 'render', 'afterRender']);
        });
      });
    });
  };
});
