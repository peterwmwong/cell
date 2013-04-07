// Generated by CoffeeScript 1.6.2
define(['../utils/spec-utils'], function(_arg) {
  var browserTrigger, node, nodeHTMLEquals, waitOne;

  node = _arg.node, browserTrigger = _arg.browserTrigger, nodeHTMLEquals = _arg.nodeHTMLEquals, waitOne = _arg.waitOne;
  return function(_arg1) {
    var beforeEachRequire;

    beforeEachRequire = _arg1.beforeEachRequire;
    beforeEachRequire(['cell/View', 'cell/Model', 'cell/Collection'], function(View, Model, Collection) {
      this.View = View;
      this.Model = Model;
      this.Collection = Collection;
    });
    describe('View( options?:object )', function() {
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
            render: function(_) {
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
    describe('@watch( expression:function, callback:function )', function() {
      beforeEach(function() {
        this.model = new this.Model({
          a: 'a val'
        });
        this.view = new this.View({
          model: this.model
        });
        return this.view.watch((function() {
          return this.model.get('a');
        }), this.callback = jasmine.createSpy('callback'));
      });
      it('calls callback with value and `this` set to the view', function() {
        expect(this.callback).toHaveBeenCalledWith('a val');
        return expect(this.callback.calls[0].object).toBe(this.view);
      });
      return describe('when model value is changed', function() {
        beforeEach(function() {
          this.callback.reset();
          return this.model.set('a', 'a val 2');
        });
        return it('calls callback with new value and `this` set to the view', function() {
          return waitOne(function() {
            expect(this.callback).toHaveBeenCalledWith('a val 2');
            return expect(this.callback.calls[0].object).toBe(this.view);
          });
        });
      });
    });
    return describe('@destroy()', function() {
      beforeEach(function() {
        this.model = new this.Model({
          a: 'a val'
        });
        this.col = new this.Collection([
          new this.Model({
            b: 'b val'
          })
        ]);
        this.TestView = this.View.extend({
          _cellName: 'Test',
          render: function(_) {
            return [
              _('.model', {
                onclick: this.onclick
              }, (function() {
                return this.model.get('a');
              })), _.each(this.collection, function(item) {
                return _('.item', (function() {
                  return item.get('b');
                }));
              })
            ];
          },
          onclick: jasmine.createSpy('click')
        });
        this.view = new this.TestView({
          collection: this.col,
          model: this.model
        });
        this.view.watch((function() {
          return this.model.get('a');
        }), (this.watchCallback = jasmine.createSpy('watchCallback')));
        return this.el = this.view.el;
      });
      it('removes @el from view', function() {
        this.view.destroy();
        return expect(this.view.el).toBeUndefined();
      });
      it('removes Model/Collection listeners', function() {
        nodeHTMLEquals(this.el, '<div cell="Test" class="Test">' + '<div class="model">a val</div>' + '<div class="item">b val</div>' + '</div>');
        this.view.destroy();
        this.model.set('a', 'a val 2');
        this.col.add(new this.Model({
          b: '2 b val'
        }));
        return waitOne(function() {
          return nodeHTMLEquals(this.el, '<div cell="Test" class="Test">' + '<div class="model">a val</div>' + '<div class="item">b val</div>' + '</div>');
        });
      });
      it('removes DOM event listeners', function() {
        browserTrigger(this.el.children[0], 'click');
        expect(this.view.onclick).toHaveBeenCalled();
        this.view.onclick.reset();
        this.view.destroy();
        browserTrigger(this.el.children[0], 'click');
        return expect(this.view.onclick).not.toHaveBeenCalled();
      });
      return it('removes watch listeners', function() {
        this.watchCallback.reset();
        this.view.destroy();
        this.model.set('a', 'a val 3');
        return waitOne(function() {
          return expect(this.watchCallback).not.toHaveBeenCalled();
        });
      });
    });
  };
});

/*
//@ sourceMappingURL=View.spec.map
*/
