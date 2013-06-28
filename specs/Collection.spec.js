// Generated by CoffeeScript 1.6.3
define(function() {
  return function(_arg) {
    var beforeEachRequire;
    beforeEachRequire = _arg.beforeEachRequire;
    beforeEachRequire(['cell/Model', 'cell/Collection', 'cell/Events'], function(Model, Collection, Events) {
      this.Model = Model;
      this.Collection = Collection;
      this.Events = Events;
    });
    describe('When @model is set with a custom Model type, creates custom Model on...', function() {
      beforeEach(function() {
        this.MyModel = this.Model.extend();
        return this.MyCollection = this.Collection.extend({
          Model: this.MyModel
        });
      });
      it('@add()', function() {
        this.col = new this.MyCollection;
        this.col.add([{}]);
        return expect(this.col.at(0) instanceof this.MyModel).toBe(true);
      });
      return it('@constructor()', function() {
        this.col = new this.MyCollection([{}]);
        return expect(this.col.at(0) instanceof this.MyModel).toBe(true);
      });
    });
    describe('@destroy()', function() {
      beforeEach(function() {
        this.col = new this.Collection([
          {
            a: 'a val'
          }, {
            b: 'b val'
          }, {
            c: 'c val'
          }
        ]);
        spyOn(this.Events.prototype, 'destroy');
        return this.col.destroy();
      });
      it('removes all Models', function() {
        return expect(this.col.length()).toBeUndefined();
      });
      return it('removes all listeners', function() {
        return expect(this.Events.prototype.destroy).toHaveBeenCalled();
      });
    });
    describe('@constructor( array?:Array<Model or Object> )', function() {
      describe('@constructor()', function() {
        beforeEach(function() {
          return this.col = new this.Collection();
        });
        return it('creates an empty Collection', function() {
          expect(this.col.length()).toBe(0);
          return expect(this.col.toArray()).toEqual([]);
        });
      });
      describe('@constructor( models:Array<Model> )', function() {
        beforeEach(function() {
          this.models = [new this.Model, new this.Model];
          return this.col = new this.Collection(this.models);
        });
        return it('creates a Collection with models already added', function() {
          expect(this.col.length()).toBe(2);
          expect(this.col.at(0)).toBe(this.models[0]);
          expect(this.col.at(1)).toBe(this.models[1]);
          expect(this.col.at(0).parent()).toBe(this.col);
          return expect(this.col.at(1).parent()).toBe(this.col);
        });
      });
      return describe('@constructor( models:Array<Object> )', function() {
        beforeEach(function() {
          this.objs = [
            {
              a: 0
            }, {
              b: 1
            }
          ];
          return this.col = new this.Collection(this.objs);
        });
        return it('creates a Collection with newly created models using the Objects as attributes', function() {
          expect(this.col.length()).toBe(2);
          expect(this.col.at(0).attributes()).toEqual({
            a: 0
          });
          expect(this.col.at(1).attributes()).toEqual({
            b: 1
          });
          expect(this.col.at(0).parent()).toBe(this.col);
          return expect(this.col.at(1).parent()).toBe(this.col);
        });
      });
    });
    describe('@filterBy( modelDesc:object )', function() {
      beforeEach(function() {
        this.models = [
          new this.Model({
            a: 0
          }), new this.Model({
            a: 1
          }), new this.Model({
            a: 2
          }), new this.Model({
            a: 3
          }), new this.Model({
            a: 4
          })
        ];
        return this.col = new this.Collection(this.models);
      });
      it("only includes models who's attributes strictly equal to modelDesc", function() {
        this.result = this.col.filterBy({
          a: 2
        });
        expect(this.result.length).toBe(1);
        return expect(this.result[0]).toEqual(this.models[2]);
      });
      return it("if a modelDesc's attribute is function, matches on the truthy return of function", function() {
        this.result = this.col.filterBy({
          a: function(a) {
            return a % 2;
          }
        });
        expect(this.result.length).toBe(2);
        expect(this.result[0]).toEqual(this.models[1]);
        return expect(this.result[1]).toEqual(this.models[3]);
      });
    });
    describe('@pipe( pipes:Array<Pipe> )', function() {
      beforeEach(function() {
        var pipe1, pipe2,
          _this = this;
        this.models = [
          new this.Model({
            a: 0
          }), new this.Model({
            a: 1
          }), new this.Model({
            a: 2
          }), new this.Model({
            a: 3
          }), new this.Model({
            a: 4
          })
        ];
        this.col = new this.Collection(this.models);
        pipe1 = {
          run: function(input) {
            return input.reduce([], function(c, m) {
              if (m.get('a') % 2) {
                c.push(m);
              }
              return c;
            });
          }
        };
        pipe2 = {
          run: function(input) {
            return input.map(function(m) {
              return {
                b: m.get('a') * 100
              };
            });
          }
        };
        return this.result = this.col.pipe([pipe1, pipe2]);
      });
      return it('returns index if model exists in Collection, otherwise -1', function() {
        expect(this.result instanceof this.Collection).toBe(true);
        expect(this.result.length()).toBe(2);
        expect(this.result.at(0).attributes()).toEqual({
          b: 100
        });
        return expect(this.result.at(1).attributes()).toEqual({
          b: 300
        });
      });
    });
    describe('@indexOf( model:Model )', function() {
      beforeEach(function() {
        this.models = [
          new this.Model({
            a: 0
          }), new this.Model({
            b: 1
          }), new this.Model({
            c: 2
          })
        ];
        return this.col = new this.Collection(this.models);
      });
      return it('returns index if model exists in Collection, otherwise -1', function() {
        expect(this.col.indexOf(this.models[0])).toBe(0);
        expect(this.col.indexOf(this.models[1])).toBe(1);
        expect(this.col.indexOf(this.models[2])).toBe(2);
        return expect(this.col.indexOf(new this.Model)).toBe(-1);
      });
    });
    describe('@length()', function() {
      beforeEach(function() {
        return this.col = new this.Collection([
          new this.Model({
            a: 0
          }), new this.Model({
            b: 1
          }), new this.Model({
            c: 2
          })
        ]);
      });
      return it('returns the number of models in Collection', function() {
        return expect(this.col.length()).toBe(3);
      });
    });
    describe('@at( index:number )', function() {
      beforeEach(function() {
        this.models = [
          new this.Model({
            a: 0
          }), new this.Model({
            b: 1
          }), new this.Model({
            c: 2
          })
        ];
        return this.col = new this.Collection(this.models);
      });
      return it('returns the Model at index', function() {
        var i, model, _i, _len, _ref;
        _ref = this.models;
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          model = _ref[i];
          expect(this.col.at(i)).toBe(this.models[i]);
        }
        expect(this.col.at(-1)).toBeUndefined();
        return expect(this.col.at(3)).toBeUndefined();
      });
    });
    describe('@toArray()', function() {
      beforeEach(function() {
        this.models = [
          new this.Model({
            a: 0
          }), new this.Model({
            b: 1
          }), new this.Model({
            c: 2
          })
        ];
        return this.col = new this.Collection(this.models);
      });
      return it('returns an Array of all the Models in the Collection', function() {
        var result;
        result = this.col.toArray();
        expect(result).toEqual(this.models);
        result.pop();
        return expect(this.col.length()).toBe(3);
      });
    });
    describe('@each( func:function, thisObject?:any )', function() {
      beforeEach(function() {
        this.models = [
          new this.Model({
            a: 0
          }), new this.Model({
            b: 1
          }), new this.Model({
            c: 2
          })
        ];
        return this.col = new this.Collection(this.models);
      });
      describe('@each()', function() {
        return it('does nothing, when func not specified', function() {
          var _this = this;
          return expect(function() {
            return _this.col.each();
          }).not.toThrow();
        });
      });
      describe('@each( func:function )', function() {
        it('calls func with (model, index, Collection) for each Model in the collection', function() {
          var func, i, model, result, _i, _len, _ref, _results;
          result = this.col.each(func = jasmine.createSpy('func'));
          expect(result).toBeUndefined();
          expect(func.callCount).toBe(3);
          _ref = this.models;
          _results = [];
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            model = _ref[i];
            _results.push(expect(func.calls[i].args).toEqual([model, i, this.col]));
          }
          return _results;
        });
        return describe('when func returns false', function() {
          return it('returns early by not calling func for the rest of the models', function() {
            var func, result;
            func = jasmine.createSpy('func').andCallFake(function(model, i, collection) {
              return i === 0;
            });
            result = this.col.each(func);
            expect(result).toBeUndefined();
            expect(func.callCount).toBe(2);
            expect(func.calls[0].args).toEqual([this.models[0], 0, this.col]);
            return expect(func.calls[1].args).toEqual([this.models[1], 1, this.col]);
          });
        });
      });
      return describe('@each( func:function, thisObject:any )', function() {
        return it('calls func with (model, index, Collection) for each Model in the collection, with `this` bound to thisObject', function() {
          var func, i, model, result, thisObject, _i, _len, _ref, _results;
          result = this.col.each((func = jasmine.createSpy('func')), thisObject = {});
          expect(result).toBeUndefined();
          expect(func.callCount).toBe(3);
          _ref = this.models;
          _results = [];
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            model = _ref[i];
            expect(func.calls[i].args).toEqual([model, i, this.col]);
            _results.push(expect(func.calls[i].object).toBe(thisObject));
          }
          return _results;
        });
      });
    });
    describe('@map( func:function, thisObject?:any )', function() {
      beforeEach(function() {
        this.models = [
          new this.Model({
            a: 0
          }), new this.Model({
            b: 1
          }), new this.Model({
            c: 2
          })
        ];
        return this.col = new this.Collection(this.models);
      });
      describe('@map()', function() {
        return it('does nothing, when func not specified', function() {
          var _this = this;
          return expect(function() {
            return _this.col.map();
          }).not.toThrow();
        });
      });
      describe('@map( func:function )', function() {
        return it('calls func with (model, index, Collection) for each Model in the collection', function() {
          var func, i, model, result, _i, _len, _ref, _results;
          result = this.col.map(func = jasmine.createSpy('func').andCallFake(function(model, i, collection) {
            return i * 100;
          }));
          expect(result).toEqual([0, 100, 200]);
          expect(func.callCount).toBe(3);
          _ref = this.models;
          _results = [];
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            model = _ref[i];
            _results.push(expect(func.calls[i].args).toEqual([model, i, this.col]));
          }
          return _results;
        });
      });
      return describe('@map( func:function, thisObject:any )', function() {
        return it('calls func with (model, index, Collection) for each Model in the collection, with `this` bound to thisObject', function() {
          var func, i, model, result, thisObject, _i, _len, _ref, _results;
          func = jasmine.createSpy('func').andCallFake(function(model, i, collection) {
            return i * 100;
          });
          thisObject = {};
          result = this.col.map(func, thisObject);
          expect(result).toEqual([0, 100, 200]);
          expect(func.callCount).toBe(3);
          _ref = this.models;
          _results = [];
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            model = _ref[i];
            expect(func.calls[i].args).toEqual([model, i, this.col]);
            _results.push(expect(func.calls[i].object).toBe(thisObject));
          }
          return _results;
        });
      });
    });
    describe('@reduce( initialValue:any, func:function, thisObject?:any )', function() {
      beforeEach(function() {
        this.models = [
          new this.Model({
            a: 0
          }), new this.Model({
            a: 3
          }), new this.Model({
            a: 7
          })
        ];
        return this.col = new this.Collection(this.models);
      });
      describe('@reduce()', function() {
        return it('does nothing, when func not specified', function() {
          var _this = this;
          return expect(function() {
            return _this.col.reduce();
          }).not.toThrow();
        });
      });
      describe('@reduce( initialValue:any, func:function )', function() {
        return it('calls func with (model, index, Collection) for each Model in the collection', function() {
          var func, initialValue, result;
          func = jasmine.createSpy('func').andCallFake(function(cur, model, i, collection) {
            return cur + model.get('a');
          });
          initialValue = 100;
          result = this.col.reduce(initialValue, func);
          expect(result).toEqual(110);
          expect(func.callCount).toBe(3);
          expect(func.calls[0].args).toEqual([100, this.models[0], 0, this.col]);
          expect(func.calls[1].args).toEqual([100, this.models[1], 1, this.col]);
          return expect(func.calls[2].args).toEqual([103, this.models[2], 2, this.col]);
        });
      });
      return describe('@reduce( initialValue:any, func:function, thosObject:any )', function() {
        return it('calls func with (model, index, Collection) for each Model in the collection', function() {
          var func, initialValue, result, thisObject;
          func = jasmine.createSpy('func').andCallFake(function(cur, model, i, collection) {
            return cur + model.get('a');
          });
          initialValue = 100;
          thisObject = {};
          result = this.col.reduce(initialValue, func, thisObject);
          expect(result).toEqual(110);
          expect(func.callCount).toBe(3);
          expect(func.calls[0].args).toEqual([100, this.models[0], 0, this.col]);
          expect(func.calls[0].object).toBe(thisObject);
          expect(func.calls[1].args).toEqual([100, this.models[1], 1, this.col]);
          expect(func.calls[1].object).toBe(thisObject);
          expect(func.calls[2].args).toEqual([103, this.models[2], 2, this.col]);
          return expect(func.calls[2].object).toBe(thisObject);
        });
      });
    });
    describe('@add( modelOrArray:[Model or Object or Array<Model or Object>], index?:number )', function() {
      beforeEach(function() {
        this.initialModels = [
          new this.Model({
            a: 0
          }), new this.Model({
            b: 1
          })
        ];
        this.col = new this.Collection(this.initialModels);
        this.allEvents = jasmine.createSpy('all');
        return this.col.on('all', this.allEvents);
      });
      describe('@add( model:Model, index?:number )', function() {
        beforeEach(function() {
          return this.model = new this.Model({
            c: 2
          });
        });
        it('when index is undefined, adds model as last entry', function() {
          this.col.add(this.model);
          expect(this.col.at(0)).toBe(this.initialModels[0]);
          expect(this.col.at(1)).toBe(this.initialModels[1]);
          expect(this.col.at(2)).toBe(this.model);
          expect(this.col.at(2).parent()).toBe(this.col);
          expect(this.allEvents.callCount).toBe(2);
          expect(this.allEvents.calls[1].args[0]).toBe('add');
          expect(this.allEvents.calls[1].args[1]).toEqual([this.model]);
          expect(this.allEvents.calls[1].args[2]).toBe(this.col);
          return expect(this.allEvents.calls[1].args[3]).toBe(2);
        });
        return it('when index is specified, adds model before index', function() {
          this.col.add(this.model, 1);
          expect(this.col.at(0)).toBe(this.initialModels[0]);
          expect(this.col.at(1)).toBe(this.model);
          expect(this.col.at(1).parent()).toBe(this.col);
          expect(this.col.at(2)).toBe(this.initialModels[1]);
          expect(this.allEvents.callCount).toBe(2);
          expect(this.allEvents.calls[1].args[0]).toBe('add');
          expect(this.allEvents.calls[1].args[1]).toEqual([this.model]);
          expect(this.allEvents.calls[1].args[2]).toBe(this.col);
          return expect(this.allEvents.calls[1].args[3]).toBe(1);
        });
      });
      describe('@add( model:Object )', function() {
        beforeEach(function() {
          return this.modelObj = {
            c: 2
          };
        });
        it('when index is undefined, adds model as last entry', function() {
          this.col.add(this.modelObj);
          expect(this.col.at(0)).toBe(this.initialModels[0]);
          expect(this.col.at(1)).toBe(this.initialModels[1]);
          this.model = this.col.at(2);
          expect(this.model instanceof this.Model).toBe(true);
          expect(this.model.attributes()).toEqual({
            c: 2
          });
          expect(this.model.parent()).toBe(this.col);
          expect(this.allEvents.callCount).toBe(2);
          expect(this.allEvents.calls[1].args[0]).toBe('add');
          expect(this.allEvents.calls[1].args[1]).toEqual([this.model]);
          expect(this.allEvents.calls[1].args[2]).toBe(this.col);
          return expect(this.allEvents.calls[1].args[3]).toBe(2);
        });
        return it('when index is specified, adds model before index', function() {
          this.col.add(this.modelObj, 1);
          expect(this.col.at(0)).toBe(this.initialModels[0]);
          this.model = this.col.at(1);
          expect(this.model instanceof this.Model).toBe(true);
          expect(this.model.attributes()).toEqual({
            c: 2
          });
          expect(this.model.parent()).toBe(this.col);
          expect(this.col.at(2)).toBe(this.initialModels[1]);
          expect(this.allEvents.callCount).toBe(2);
          expect(this.allEvents.calls[1].args[0]).toBe('add');
          expect(this.allEvents.calls[1].args[1]).toEqual([this.model]);
          expect(this.allEvents.calls[1].args[2]).toBe(this.col);
          return expect(this.allEvents.calls[1].args[3]).toBe(1);
        });
      });
      describe('@add( model:Array<Model>, index?:number )', function() {
        beforeEach(function() {
          return this.models = [
            new this.Model({
              c: 2
            }), new this.Model({
              c: 3
            })
          ];
        });
        it('when index is undefined, adds model as last entry', function() {
          this.col.add(this.models);
          expect(this.col.at(0)).toBe(this.initialModels[0]);
          expect(this.col.at(1)).toBe(this.initialModels[1]);
          expect(this.col.at(2)).toBe(this.models[0]);
          expect(this.col.at(2).parent()).toBe(this.col);
          expect(this.col.at(3)).toBe(this.models[1]);
          expect(this.col.at(3).parent()).toBe(this.col);
          expect(this.allEvents.callCount).toBe(3);
          expect(this.allEvents.calls[2].args[0]).toBe('add');
          expect(this.allEvents.calls[2].args[1]).toEqual(this.models);
          expect(this.allEvents.calls[2].args[2]).toBe(this.col);
          return expect(this.allEvents.calls[2].args[3]).toBe(2);
        });
        return it('when index is specified, adds model before index', function() {
          this.col.add(this.models, 1);
          expect(this.col.at(0)).toBe(this.initialModels[0]);
          expect(this.col.at(1)).toBe(this.models[0]);
          expect(this.col.at(1).parent()).toBe(this.col);
          expect(this.col.at(2)).toBe(this.models[1]);
          expect(this.col.at(2).parent()).toBe(this.col);
          expect(this.col.at(3)).toBe(this.initialModels[1]);
          expect(this.allEvents.callCount).toBe(3);
          expect(this.allEvents.calls[2].args[0]).toBe('add');
          expect(this.allEvents.calls[2].args[1]).toEqual(this.models);
          expect(this.allEvents.calls[2].args[2]).toBe(this.col);
          return expect(this.allEvents.calls[2].args[3]).toBe(1);
        });
      });
      return describe('@add( model:Array<Object>, index?:number )', function() {
        beforeEach(function() {
          return this.modelObjs = [
            {
              c: 2
            }, {
              d: 3
            }
          ];
        });
        it('when index is undefined, adds model as last entry', function() {
          var i, obj, _i, _len, _ref;
          this.col.add(this.modelObjs);
          expect(this.col.at(0)).toBe(this.initialModels[0]);
          expect(this.col.at(1)).toBe(this.initialModels[1]);
          i = 2;
          _ref = this.modelObjs;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            obj = _ref[_i];
            this.model = this.col.at(i++);
            expect(this.model instanceof this.Model).toBe(true);
            expect(this.model.attributes()).toEqual(obj);
            expect(this.model.parent()).toBe(this.col);
          }
          expect(this.allEvents.callCount).toBe(3);
          expect(this.allEvents.calls[2].args[0]).toBe('add');
          expect(this.allEvents.calls[2].args[1]).toEqual([this.col.at(2), this.col.at(3)]);
          expect(this.allEvents.calls[2].args[2]).toBe(this.col);
          return expect(this.allEvents.calls[2].args[3]).toBe(2);
        });
        return it('when index is the last index', function() {
          var i, obj, _i, _len, _ref;
          this.col.add(this.modelObjs, 1);
          expect(this.col.at(0)).toBe(this.initialModels[0]);
          i = 1;
          _ref = this.modelObjs;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            obj = _ref[_i];
            this.model = this.col.at(i++);
            expect(this.model instanceof this.Model).toBe(true);
            expect(this.model.attributes()).toEqual(obj);
            expect(this.model.parent()).toBe(this.col);
          }
          expect(this.col.at(3)).toBe(this.initialModels[1]);
          expect(this.allEvents.callCount).toBe(3);
          expect(this.allEvents.calls[2].args[0]).toBe('add');
          expect(this.allEvents.calls[2].args[1]).toEqual([this.col.at(1), this.col.at(2)]);
          expect(this.allEvents.calls[2].args[2]).toBe(this.col);
          return expect(this.allEvents.calls[2].args[3]).toBe(1);
        });
      });
    });
    return describe('@remove( modelOrArray:[Model or Array<Model>] )', function() {
      beforeEach(function() {
        this.initialModels = [
          new this.Model({
            a: 0
          }), new this.Model({
            b: 1
          }), new this.Model({
            c: 2
          })
        ];
        this.col = new this.Collection(this.initialModels);
        this.allEvents = jasmine.createSpy('all');
        return this.col.on('all', this.allEvents);
      });
      describe('@remove( model:Model )', function() {
        beforeEach(function() {
          return this.col.remove(this.initialModels[1]);
        });
        it('removes Model', function() {
          expect(this.initialModels[1].parent()).toBeUndefined();
          expect(this.col.length()).toBe(2);
          expect(this.col.at(0)).toBe(this.initialModels[0]);
          expect(this.col.at(1)).toBe(this.initialModels[2]);
          expect(this.allEvents.callCount).toBe(1);
          expect(this.allEvents.calls[0].args[0]).toBe('remove');
          expect(this.allEvents.calls[0].args[1]).toEqual([this.initialModels[1]]);
          expect(this.allEvents.calls[0].args[2]).toBe(this.col);
          return expect(this.allEvents.calls[0].args[3]).toEqual([1]);
        });
        it('if model is NOT part of collection, it does nothing', function() {
          this.allEvents.reset();
          this.col.remove(new this.Model({
            a: 0
          }));
          expect(this.col.length()).toBe(2);
          expect(this.col.at(0)).toBe(this.initialModels[0]);
          expect(this.col.at(1)).toBe(this.initialModels[2]);
          expect(this.allEvents.callCount).toBe(0);
          this.col2 = this.Collection([new this.Model]);
          this.col.remove(this.col2.at(0));
          expect(this.col.length()).toBe(2);
          expect(this.col2.length()).toBe(1);
          return expect(this.col2.at(0).parent()).toBe(this.col2);
        });
        return it('if collection is empty, does nothing', function() {
          this.allEvents.reset();
          this.emptyCol = new this.Collection;
          this.emptyCol.remove(new this.Model({
            a: 0
          }));
          expect(this.emptyCol.length()).toBe(0);
          return expect(this.allEvents.callCount).toBe(0);
        });
      });
      describe('@remove( array:Array<Model> )', function() {
        beforeEach(function() {
          this.allEvents.reset();
          return this.col.remove([
            this.initialModels[2], new this.Model({
              a: 0
            }), this.initialModels[0]
          ]);
        });
        it('removes all models in array that are part of the collection', function() {
          expect(this.col.length()).toBe(1);
          expect(this.col.at(0)).toBe(this.initialModels[1]);
          expect(this.initialModels[0].parent()).toBeUndefined();
          expect(this.initialModels[2].parent()).toBeUndefined();
          expect(this.allEvents.callCount).toBe(1);
          expect(this.allEvents.calls[0].args[0]).toBe('remove');
          expect(this.allEvents.calls[0].args[1]).toEqual([this.initialModels[2], this.initialModels[0]]);
          expect(this.allEvents.calls[0].args[2]).toBe(this.col);
          return expect(this.allEvents.calls[0].args[3]).toEqual([2, 0]);
        });
        return it('if collection is empty, does nothing', function() {
          this.emptyCol = new this.Collection;
          this.allEvents.reset();
          this.emptyCol.remove([
            new this.Model({
              a: 0
            }), new this.Model({
              b: 1
            })
          ]);
          expect(this.emptyCol.length()).toBe(0);
          return expect(this.allEvents.callCount).toBe(0);
        });
      });
      return describe('add and remove events propagate to ancestors', function() {
        beforeEach(function() {
          var k, _i, _len, _ref, _results,
            _this = this;
          this.colAAA = new this.Collection();
          this.colAA = new this.Collection({
            a: this.colAAA
          });
          this.colA = new this.Collection({
            a: this.colAA
          });
          this.modelParent = new this.Model({
            col: this.colA
          });
          this.resetCallbacks = function() {
            _this.colAAACallback.reset();
            _this.colAACallback.reset();
            _this.colACallback.reset();
            _this.modelParentCallback.reset();
          };
          _ref = ['colAAA', 'colAA', 'colA', 'modelParent'];
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            k = _ref[_i];
            _results.push(this[k].on("all", this["" + k + "Callback"] = jasmine.createSpy("" + k + "Callback")));
          }
          return _results;
        });
        return it('propagates events to ancestors', function() {
          this.resetCallbacks();
          this.colAAA.add({});
          expect(this.colAAACallback).toHaveBeenCalled();
          expect(this.colAACallback).toHaveBeenCalled();
          expect(this.colACallback).toHaveBeenCalled();
          expect(this.modelParentCallback).toHaveBeenCalled();
          this.resetCallbacks();
          this.colAA.add({});
          expect(this.colAAACallback).not.toHaveBeenCalled();
          expect(this.colAACallback).toHaveBeenCalled();
          expect(this.colACallback).toHaveBeenCalled();
          expect(this.modelParentCallback).toHaveBeenCalled();
          this.resetCallbacks();
          this.colA.add({});
          expect(this.colAAACallback).not.toHaveBeenCalled();
          expect(this.colAACallback).not.toHaveBeenCalled();
          expect(this.colACallback).toHaveBeenCalled();
          expect(this.modelParentCallback).toHaveBeenCalled();
          this.resetCallbacks();
          this.modelParent.set('a', 'a value');
          expect(this.colAAACallback).not.toHaveBeenCalled();
          expect(this.colAACallback).not.toHaveBeenCalled();
          expect(this.colACallback).not.toHaveBeenCalled();
          return expect(this.modelParentCallback).toHaveBeenCalled();
        });
      });
    });
  };
});

/*
//@ sourceMappingURL=Collection.spec.map
*/