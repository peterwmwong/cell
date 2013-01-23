// Generated by CoffeeScript 1.4.0
var __slice = [].slice;

define(['../../utils/spec-utils'], function(_arg) {
  var node;
  node = _arg.node;
  return function(_arg1) {
    var beforeEachRequire;
    beforeEachRequire = _arg1.beforeEachRequire;
    beforeEachRequire(['cell/Ext', 'cell/View', 'require'], function(Ext, View, require) {
      this.Ext = Ext;
      this.View = View;
      this.require = require;
    });
    return describe('modifies View.__() method signature ( viewOrSelector:[Backbone.View, String], exts...:Ext, attrHash_or_options?:Object, children...:[DOMElement, String, Number, Array, jQuery] )', function() {
      beforeEach(function() {
        var _this = this;
        this.orig__ = (spyOn(this.View.prototype, '__')).andReturn(this.element = {});
        this.x_test1 = this.Ext.extend(this.x_test1_func = jasmine.createSpy('x_test1_func'));
        this.x_test2 = this.Ext.extend(this.x_test2_func = jasmine.createSpy('x_test2_func'));
        runs(function() {
          return _this.require(['cell/opts/ViewExts'], function(ViewExts) {
            _this.ViewExts = ViewExts;
          });
        });
        waitsFor(function() {
          return _this.ViewExts;
        });
        return runs(function() {
          _this.view = new _this.View;
          return _this.__ = _this.view.__;
        });
      });
      describe('__( selector:String, exts...:Ext )', function() {
        beforeEach(function() {
          return this.result = this.__('.myClass', this.x_test1(this.x_test1_options = {}), this.x_test2(this.x_test2_options = {}));
        });
        it('calls Ext.run(element) for each ext', function() {
          expect(this.x_test1_func).toHaveBeenCalledWith(this.element, this.x_test1_options, this.Ext.prototype.getValue);
          expect(this.x_test1_func.callCount).toBe(1);
          expect(this.x_test2_func).toHaveBeenCalledWith(this.element, this.x_test2_options, this.Ext.prototype.getValue);
          return expect(this.x_test2_func.callCount).toBe(1);
        });
        return it('calls original View.__( selector )', function() {
          expect(this.orig__).toHaveBeenCalledWith('.myClass');
          expect(this.orig__.callCount).toBe(1);
          expect(this.orig__.calls[0].object).toBe(this.view);
          return expect(this.result).toBe(this.element);
        });
      });
      describe('__( selector:String, exts...:Ext, attrHash_or_options:Object )', function() {
        beforeEach(function() {
          return this.result = this.__('.myClass', this.x_test1(this.x_test1_options = {}), this.x_test2(this.x_test2_options = {}), this.options = {
            a: 1
          });
        });
        it('calls Ext.run(element) for each ext', function() {
          expect(this.x_test1_func).toHaveBeenCalledWith(this.element, this.x_test1_options, this.Ext.prototype.getValue);
          expect(this.x_test1_func.callCount).toBe(1);
          expect(this.x_test2_func).toHaveBeenCalledWith(this.element, this.x_test2_options, this.Ext.prototype.getValue);
          return expect(this.x_test2_func.callCount).toBe(1);
        });
        return it('calls original View.__( selector )', function() {
          expect(this.orig__).toHaveBeenCalledWith('.myClass', this.options);
          expect(this.orig__.callCount).toBe(1);
          expect(this.orig__.calls[0].object).toBe(this.view);
          return expect(this.result).toBe(this.element);
        });
      });
      describe('__( selector:String, exts...:Ext, attrHash_or_options:Object, children...:[DOMElement, String, Number, Array] )', function() {
        beforeEach(function() {
          return this.result = this.__.apply(this, [(this.sel_arg = '.myClass'), this.x_test1(this.x_test1_options = {}), this.x_test2(this.x_test2_options = {}), this.options = {
            a: 1
          }].concat(__slice.call((this.child_args = [node('a'), 'hello', 0, [node('b'), 'bye', 1]]))));
        });
        it('calls Ext.run(element) for each ext', function() {
          expect(this.x_test1_func).toHaveBeenCalledWith(this.element, this.x_test1_options, this.Ext.prototype.getValue);
          expect(this.x_test1_func.callCount).toBe(1);
          expect(this.x_test2_func).toHaveBeenCalledWith(this.element, this.x_test2_options, this.Ext.prototype.getValue);
          return expect(this.x_test2_func.callCount).toBe(1);
        });
        return it('calls original View.__( selector )', function() {
          var _ref;
          (_ref = expect(this.orig__)).toHaveBeenCalledWith.apply(_ref, [this.sel_arg, this.options].concat(__slice.call(this.child_args)));
          expect(this.orig__.callCount).toBe(1);
          expect(this.orig__.calls[0].object).toBe(this.view);
          return expect(this.result).toBe(this.element);
        });
      });
      return describe('__( selector:String, exts...:Ext, children...:[DOMElement, String, Number, Array] )', function() {
        beforeEach(function() {
          return this.result = this.__.apply(this, [(this.sel_arg = '.myClass'), this.x_test1(this.x_test1_options = {}), this.x_test2(this.x_test2_options = {})].concat(__slice.call((this.child_args = [node('a'), 'hello', 0, [node('b'), 'bye', 1]]))));
        });
        it('calls Ext.run(element) for each ext', function() {
          expect(this.x_test1_func).toHaveBeenCalledWith(this.element, this.x_test1_options, this.Ext.prototype.getValue);
          expect(this.x_test1_func.callCount).toBe(1);
          expect(this.x_test2_func).toHaveBeenCalledWith(this.element, this.x_test2_options, this.Ext.prototype.getValue);
          return expect(this.x_test2_func.callCount).toBe(1);
        });
        return it('calls original View.__( selector )', function() {
          var _ref;
          (_ref = expect(this.orig__)).toHaveBeenCalledWith.apply(_ref, [this.sel_arg].concat(__slice.call(this.child_args)));
          expect(this.orig__.callCount).toBe(1);
          expect(this.orig__.calls[0].object).toBe(this.view);
          return expect(this.result).toBe(this.element);
        });
      });
    });
  };
});