// Generated by CoffeeScript 1.6.2
define(function() {
  return function(_arg) {
    var NON_STRINGS, beforeEachRequire;

    beforeEachRequire = _arg.beforeEachRequire;
    NON_STRINGS = [void 0, null, 5, (function() {}), [], {}];
    beforeEachRequire(['cell/Model', 'cell/Collection', 'cell/Events'], function(Model, Collection, Events) {
      this.Model = Model;
      this.Collection = Collection;
      this.Events = Events;
    });
    describe('@destroy()', function() {
      beforeEach(function() {
        this.model = new this.Model({
          a: 'a val',
          b: 'b val',
          c: 'c val'
        });
        this.col = new this.Collection([this.model]);
        this.col.on('remove', (this.remove = jasmine.createSpy('remove')));
        spyOn(this.Events.prototype, 'destroy');
        return this.model.destroy();
      });
      it('removes all attributes', function() {
        var k, _i, _len, _ref, _results;

        _ref = ['a', 'b', 'c'];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          k = _ref[_i];
          _results.push(expect(this.model.get(k)).toBeUndefined());
        }
        return _results;
      });
      it('removes all listeners', function() {
        return expect(this.Events.prototype.destroy).toHaveBeenCalled();
      });
      return it('removes itself from owning collection', function() {
        expect(this.remove).toHaveBeenCalled();
        expect(this.col.length()).toBe(0);
        return expect(this.model.collection).toBeUndefined();
      });
    });
    describe('@constructor(initial_hash)', function() {
      describe('when initial_hash is NOT undefined', function() {
        beforeEach(function() {
          return this.model = new this.Model({
            a: 'a val',
            b: 'b val',
            c: 'c val'
          });
        });
        return it('current attributes are same as initial_hash', function() {
          var k, v, _ref, _results;

          _ref = {
            a: 'a val',
            b: 'b val',
            c: 'c val'
          };
          _results = [];
          for (k in _ref) {
            v = _ref[k];
            _results.push(expect(this.model.get(k)).toBe(v));
          }
          return _results;
        });
      });
      return describe('when initial_hash is undefined', function() {
        beforeEach(function() {
          return this.model = new this.Model();
        });
        return it('current attributes are same as initial_hash', function() {
          return expect(this.model._a).toEqual({});
        });
      });
    });
    describe('@attributes()', function() {
      beforeEach(function() {
        return this.model = new this.Model({
          a: 'a val',
          b: 'b val',
          c: 'c val'
        });
      });
      return it('returns a copied object of all attributes', function() {
        var attrs;

        attrs = this.model.attributes();
        expect(attrs).toEqual({
          a: 'a val',
          b: 'b val',
          c: 'c val'
        });
        attrs.a = 'a val 2';
        return expect(this.model.get('a')).toBe('a val');
      });
    });
    describe('@get(key)', function() {
      beforeEach(function() {
        return this.model = new this.Model({
          a: 'a val',
          b: 'b val',
          c: 'c val'
        });
      });
      describe('when key is not already set', function() {
        return it('returns undefined', function() {
          return expect(this.model.get('z')).toBe(void 0);
        });
      });
      describe('when key is set', function() {
        return it('returns value of key', function() {
          return expect(this.model.get('a')).toBe('a val');
        });
      });
      return describe('when key is invalid (non-string)', function() {
        return it('returns undefined', function() {
          var key, _i, _len, _results;

          _results = [];
          for (_i = 0, _len = NON_STRINGS.length; _i < _len; _i++) {
            key = NON_STRINGS[_i];
            _results.push(expect(this.model.get(key)).toBe(void 0));
          }
          return _results;
        });
      });
    });
    return describe('@set(key,value)', function() {
      beforeEach(function() {
        return this.model = new this.Model({
          a: 'a val',
          b: 'b val',
          c: 'c val'
        });
      });
      describe('when model is contained in another Model or Collection', function() {
        beforeEach(function() {
          var _this = this;

          this.resetCallbacks = function() {
            _this.collectionCallback.reset();
            _this.modelInAModelCallback.reset();
            _this.modelParentCallback.reset();
            _this.modelDeeplyNestedCallback.reset();
          };
          this.collectionCallback = jasmine.createSpy('collectionCallback');
          this.collection = new this.Collection([this.model]);
          this.collection.on('all', this.collectionCallback);
          this.modelInAModel = new this.Model;
          this.modelInAModelCallback = jasmine.createSpy('modelInAModelCallback');
          this.modelInAModel.on('all', this.modelInAModelCallback);
          this.modelParentCallback = jasmine.createSpy('modelParentCallback');
          this.modelParent = new this.Model({
            key: this.modelInAModel
          });
          this.modelParent.on('all', this.modelParentCallback);
          this.modelDeeplyNestedCallback = jasmine.createSpy('modelDeeplyNestedCallback');
          this.modelDeeplyNested = new this.Model;
          this.modelDeeplyNested.on('all', this.modelDeeplyNestedCallback);
          return this.modelInAModel.set('deeplyNested', this.modelDeeplyNested);
        });
        return it('propagates events to ancestors', function() {
          this.resetCallbacks();
          this.model.set('a', 'a val 1');
          expect(this.collectionCallback).toHaveBeenCalled();
          expect(this.modelInAModelCallback).not.toHaveBeenCalled();
          expect(this.modelParentCallback).not.toHaveBeenCalled();
          expect(this.modelDeeplyNestedCallback).not.toHaveBeenCalled();
          this.resetCallbacks();
          this.modelInAModel.set('a', 'a val 2');
          expect(this.collectionCallback).not.toHaveBeenCalled();
          expect(this.modelInAModelCallback).toHaveBeenCalled();
          expect(this.modelParentCallback).toHaveBeenCalled();
          expect(this.modelDeeplyNestedCallback).not.toHaveBeenCalled();
          this.resetCallbacks();
          this.modelDeeplyNested.set('a', 'a val 3');
          expect(this.collectionCallback).not.toHaveBeenCalled();
          expect(this.modelInAModelCallback).toHaveBeenCalled();
          expect(this.modelParentCallback).toHaveBeenCalled();
          return expect(this.modelDeeplyNestedCallback).toHaveBeenCalled();
        });
      });
      describe('when overwriting with a different value', function() {
        beforeEach(function() {
          this.model.on('change:b', (this.on_change_spy = jasmine.createSpy('change:b')));
          return this.model.set('b', 'new b value');
        });
        it('sets the new value', function() {
          return expect(this.model.get('b')).toBe('new b value');
        });
        return it('fires one "change:b" event', function() {
          expect(this.on_change_spy.argsForCall.length).toBe(1);
          return expect(this.on_change_spy).toHaveBeenCalledWith('change:b', this.model, 'new b value', 'b val');
        });
      });
      describe('when overwriting with the same value', function() {
        beforeEach(function() {
          this.model.on('change:b', (this.on_change_spy = jasmine.createSpy('change:b')));
          return this.model.set('b', 'b val');
        });
        it('value continues to be the same', function() {
          return expect(this.model.get('b')).toBe('b val');
        });
        return it('does NOT fire a "change:b" event', function() {
          return expect(this.on_change_spy).not.toHaveBeenCalled();
        });
      });
      return describe('when key is invalid (non-string)', function() {
        var key, _i, _len, _results;

        _results = [];
        for (_i = 0, _len = NON_STRINGS.length; _i < _len; _i++) {
          key = NON_STRINGS[_i];
          _results.push((function(key) {
            beforeEach(function() {
              this.model.on('change:a', (this.on_change_spy_a = jasmine.createSpy('change:a')));
              this.model.on('change:b', (this.on_change_spy_b = jasmine.createSpy('change:b')));
              this.model.on('change:c', (this.on_change_spy_c = jasmine.createSpy('change:c')));
              return this.model.set(key, 'blah');
            });
            it('no values are changed', function() {
              expect(this.model.get('a')).toBe('a val');
              expect(this.model.get('b')).toBe('b val');
              return expect(this.model.get('c')).toBe('c val');
            });
            return it('no change events were fired', function() {
              expect(this.on_change_spy_a).not.toHaveBeenCalled();
              expect(this.on_change_spy_b).not.toHaveBeenCalled();
              return expect(this.on_change_spy_c).not.toHaveBeenCalled();
            });
          })(key));
        }
        return _results;
      });
    });
  };
});

/*
//@ sourceMappingURL=Model.spec.map
*/
