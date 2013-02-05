// Generated by CoffeeScript 1.4.0

define(function() {
  return function(_arg) {
    var beforeEachRequire;
    beforeEachRequire = _arg.beforeEachRequire;
    beforeEachRequire(['cell/Events'], function(Events) {
      this.Events = Events;
    });
    describe('@off( type?:string, fn?:function, ctx?:object )', function() {
      beforeEach(function() {
        this.events = new this.Events;
        this.events.on('custom', (this.handler = jasmine.createSpy('custom')), (this.ctx = {}));
        this.events.on('custom', (this.handler2 = jasmine.createSpy('custom (2)')), this.ctx);
        this.events.on('custom', this.handler, (this.ctx2 = {}));
        return this.events.on('custom2', this.handler2, this.ctx);
      });
      describe('@off( type:string, fn:function )', function() {
        beforeEach(function() {
          this.events.off('custom', this.handler);
          return this.events.trigger('custom');
        });
        return it('should unregister all matching handlers', function() {
          expect(this.handler).not.toHaveBeenCalled();
          expect(this.handler2).toHaveBeenCalledWith('custom');
          return expect(this.handler2.calls[0].object).toBe(this.ctx);
        });
      });
      describe('@off( type:string, fn:function, ctx:object )', function() {
        beforeEach(function() {
          this.events.off('custom', this.handler, this.ctx);
          return this.events.trigger('custom');
        });
        return it('should unregister all matching handlers', function() {
          expect(this.handler.calls.length).toBe(1);
          expect(this.handler).toHaveBeenCalledWith('custom');
          expect(this.handler.calls[0].object).toBe(this.ctx2);
          expect(this.handler2).toHaveBeenCalledWith('custom');
          return expect(this.handler2.calls[0].object).toBe(this.ctx);
        });
      });
      describe('@off( type:string, undefined, ctx:object )', function() {
        beforeEach(function() {
          this.events.off('custom', void 0, this.ctx);
          return this.events.trigger('custom');
        });
        return it('should unregister all matching handlers', function() {
          expect(this.handler.calls.length).toBe(1);
          expect(this.handler).toHaveBeenCalledWith('custom');
          expect(this.handler.calls[0].object).toBe(this.ctx2);
          expect(this.handler2).not.toHaveBeenCalled();
          this.events.trigger('custom2');
          return expect(this.handler2).toHaveBeenCalledWith('custom2');
        });
      });
      describe('@off( undefined, fn:function )', function() {
        beforeEach(function() {
          this.events.off(void 0, this.handler2);
          return this.events.trigger('custom');
        });
        return it('should unregister all matching handlers', function() {
          expect(this.handler.calls.length).toBe(2);
          expect(this.handler).toHaveBeenCalledWith('custom');
          expect(this.handler.calls[0].object).toBe(this.ctx2);
          expect(this.handler.calls[1].object).toBe(this.ctx);
          expect(this.handler2).not.toHaveBeenCalled();
          this.events.trigger('custom2');
          return expect(this.handler2).not.toHaveBeenCalled();
        });
      });
      describe('@off( undefined, fn:function, ctx:object )', function() {
        beforeEach(function() {
          this.events.off(void 0, this.handler, this.ctx);
          return this.events.trigger('custom');
        });
        return it('should unregister all matching handlers', function() {
          expect(this.handler.calls.length).toBe(1);
          expect(this.handler).toHaveBeenCalledWith('custom');
          expect(this.handler.calls[0].object).toBe(this.ctx2);
          expect(this.handler2).toHaveBeenCalledWith('custom');
          this.handler2.reset();
          this.events.trigger('custom2');
          expect(this.handler2).toHaveBeenCalled();
          return expect(this.handler2.calls[0].object).toBe(this.ctx);
        });
      });
      return describe('@off( undefined, undefined, ctx:object )', function() {
        beforeEach(function() {
          this.events.off(void 0, void 0, this.ctx);
          return this.events.trigger('custom');
        });
        return it('should unregister all matching handlers', function() {
          expect(this.handler.calls.length).toBe(1);
          expect(this.handler).toHaveBeenCalledWith('custom');
          expect(this.handler.calls[0].object).toBe(this.ctx2);
          expect(this.handler2).not.toHaveBeenCalled();
          this.handler2.reset();
          this.events.trigger('custom2');
          return expect(this.handler2).not.toHaveBeenCalled();
        });
      });
    });
    describe('@on(type:string, handler:function, ctx?:object)', function() {
      beforeEach(function() {
        this.events = new this.Events;
        this.events.on('custom', (this.customHandler = jasmine.createSpy('custom')));
        return this.events.on('custom with context', (this.customHandlerWithContext = jasmine.createSpy('custom with context')), this.ctx = {});
      });
      it('registers a handler to be called upon triggering', function() {
        this.events.trigger('notRight');
        expect(this.customHandler).not.toHaveBeenCalled();
        expect(this.customHandlerWithContext).not.toHaveBeenCalled();
        this.events.trigger('custom');
        expect(this.customHandler).toHaveBeenCalledWith('custom');
        expect(this.customHandlerWithContext).not.toHaveBeenCalled();
        this.customHandler.reset();
        this.events.trigger('custom with context');
        expect(this.customHandler).not.toHaveBeenCalled();
        expect(this.customHandlerWithContext).toHaveBeenCalledWith('custom with context');
        expect(this.customHandlerWithContext.calls[0].object).toBe(this.ctx);
        this.customHandler.reset();
        return this.customHandlerWithContext.reset();
      });
      return it('when type is "all", calls handler upon any triggering', function() {
        var anyCtx, anyHandler, arg1, arg2, arg3;
        this.events.on('all', (anyHandler = jasmine.createSpy('all')), (anyCtx = {}));
        this.events.trigger('blah', (arg1 = {}), (arg2 = {}), (arg3 = {}));
        expect(anyHandler).toHaveBeenCalledWith('blah', arg1, arg2, arg3);
        return expect(anyHandler.calls[0].object).toBe(anyCtx);
      });
    });
    return describe('@trigger(type:string, args...:any)', function() {
      beforeEach(function() {
        this.events = new this.Events;
        return this.events.on('custom', (this.customHandler = jasmine.createSpy('custom')));
      });
      return it('calls handler with arguments', function() {
        this.events.trigger('custom');
        expect(this.customHandler).toHaveBeenCalledWith('custom');
        this.customHandler.reset();
        this.events.trigger('custom', (this.arg1 = {}), (this.arg2 = {}));
        return expect(this.customHandler).toHaveBeenCalledWith('custom', this.arg1, this.arg2);
      });
    });
  };
});
