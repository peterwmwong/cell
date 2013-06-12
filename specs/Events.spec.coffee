define -> ({beforeEachRequire})->

  beforeEachRequire ['cell/Events'], (@Events)->

  describe '@destroy()', ->
    beforeEach ->
      @events = new @Events
      @events.on 'custom', (@handler = jasmine.createSpy 'custom'), (@ctx = {})
      @events.on 'custom', (@handler2 = jasmine.createSpy 'custom (2)'), @ctx
      @events.on 'custom', @handler, (@ctx2 = {})
      @events.on 'custom2', (@handler2), @ctx

      @events.on 'destroy', (@destroyHandler = jasmine.createSpy 'destroy'), (@ctxDestroy = {})

      @events.destroy()
      @events.trigger 'custom'
      @events.trigger 'custom2'

    it 'should unregister all matching handlers', ->
      expect(@handler).not.toHaveBeenCalled()
      expect(@handler2).not.toHaveBeenCalled()

    it 'should trigger destroy handlers', ->
      expect(@destroyHandler.callCount).toBe 1
      expect(@destroyHandler.calls[0].object).toBe @ctxDestroy
      expect(@destroyHandler).toHaveBeenCalledWith 'destroy', @events

    describe 'calling destroy again', ->
      beforeEach ->
        @handler.reset()
        @handler2.reset()
        @destroyHandler.reset()
        @events.destroy()

      it 'should not call any handlers', ->
        expect(@destroyHandler).not.toHaveBeenCalled()
        expect(@handler).not.toHaveBeenCalled()
        expect(@handler2).not.toHaveBeenCalled()


  describe '@off( type?:string, fn?:function, ctx?:object )', ->
    beforeEach ->
      @events = new @Events
      @events.on 'custom', (@handler = jasmine.createSpy 'custom'), (@ctx = {})
      @events.on 'custom', (@handler2 = jasmine.createSpy 'custom (2)'), @ctx
      @events.on 'custom', @handler, (@ctx2 = {})
      @events.on 'custom2', (@handler2), @ctx

    describe '@off( type:string, fn:function )', ->
      beforeEach ->
        @events.off 'custom', @handler
        @events.trigger 'custom'

      it 'should unregister all matching handlers', ->
        expect(@handler).not.toHaveBeenCalled()
        expect(@handler2).toHaveBeenCalledWith 'custom'
        expect(@handler2.calls[0].object).toBe @ctx


    describe '@off( type:string, fn:function, ctx:object )', ->
      beforeEach ->
        @events.off 'custom', @handler, @ctx
        @events.trigger 'custom'
        
      it 'should unregister all matching handlers', ->
        expect(@handler.calls.length).toBe 1
        expect(@handler).toHaveBeenCalledWith 'custom'
        expect(@handler.calls[0].object).toBe @ctx2

        expect(@handler2).toHaveBeenCalledWith 'custom'
        expect(@handler2.calls[0].object).toBe @ctx

    describe '@off( type:string, undefined, ctx:object )', ->
      beforeEach ->
        @events.off 'custom', undefined, @ctx
        @events.trigger 'custom'

      it 'should unregister all matching handlers', ->
        expect(@handler.calls.length).toBe 1
        expect(@handler).toHaveBeenCalledWith 'custom'
        expect(@handler.calls[0].object).toBe @ctx2
        expect(@handler2).not.toHaveBeenCalled()

        @events.trigger 'custom2'
        expect(@handler2).toHaveBeenCalledWith 'custom2'

    describe '@off( undefined, fn:function )', ->
      beforeEach ->
        @events.off undefined, @handler2
        @events.trigger 'custom'

      it 'should unregister all matching handlers', ->
        expect(@handler.calls.length).toBe 2
        expect(@handler).toHaveBeenCalledWith 'custom'
        expect(@handler.calls[0].object).toBe @ctx2
        expect(@handler.calls[1].object).toBe @ctx
        expect(@handler2).not.toHaveBeenCalled()

        @events.trigger 'custom2'
        expect(@handler2).not.toHaveBeenCalled()

    describe '@off( undefined, fn:function, ctx:object )', ->
      beforeEach ->
        @events.off undefined, @handler, @ctx
        @events.trigger 'custom'

      it 'should unregister all matching handlers', ->
        expect(@handler.calls.length).toBe 1
        expect(@handler).toHaveBeenCalledWith 'custom'
        expect(@handler.calls[0].object).toBe @ctx2
        expect(@handler2).toHaveBeenCalledWith 'custom'

        @handler2.reset()
        @events.trigger 'custom2'
        expect(@handler2).toHaveBeenCalled()
        expect(@handler2.calls[0].object).toBe @ctx

    describe '@off( undefined, undefined, ctx:object )', ->
      beforeEach ->
        @events.off undefined, undefined, @ctx
        @events.trigger 'custom'

      it 'should unregister all matching handlers', ->
        expect(@handler.calls.length).toBe 1
        expect(@handler).toHaveBeenCalledWith 'custom'
        expect(@handler.calls[0].object).toBe @ctx2
        expect(@handler2).not.toHaveBeenCalled()

        @handler2.reset()
        @events.trigger 'custom2'
        expect(@handler2).not.toHaveBeenCalled()
      

  describe '@on(type:string, handler:function, ctx?:object)', ->
    beforeEach ->
      @events = new @Events

      @events.on 'custom', (@customHandler = jasmine.createSpy 'custom')
      @events.on 'custom with context', (@customHandlerWithContext = jasmine.createSpy 'custom with context'), @ctx = {}

    it 'registers a handler to be called upon triggering', ->
      @events.trigger 'notRight'
      expect(@customHandler).not.toHaveBeenCalled()
      expect(@customHandlerWithContext).not.toHaveBeenCalled()

      @events.trigger 'custom'
      expect(@customHandler).toHaveBeenCalledWith 'custom'
      expect(@customHandlerWithContext).not.toHaveBeenCalled()

      @customHandler.reset()
      @events.trigger 'custom with context'
      expect(@customHandler).not.toHaveBeenCalled()
      expect(@customHandlerWithContext).toHaveBeenCalledWith 'custom with context'
      expect(@customHandlerWithContext.calls[0].object).toBe @ctx

      @customHandler.reset()
      @customHandlerWithContext.reset()

    it 'when type is "all", calls handler upon any triggering', ->
      @events.on 'all', (anyHandler = jasmine.createSpy 'all'), (anyCtx = {})

      @events.trigger 'blah', (arg1 = {}), (arg2 = {}), (arg3 = {})
      expect(anyHandler).toHaveBeenCalledWith 'blah', arg1, arg2, arg3
      expect(anyHandler.calls[0].object).toBe anyCtx


  describe '@trigger(type:string, args...:any)', ->
    beforeEach ->
      @events = new @Events

      @eventsParent = new @Events
      @eventsParent.on 'custom', (@parentCustomHandler = jasmine.createSpy 'parent custom')

      @events._parent = @eventsParent
      @events.on 'custom', (@customHandler = jasmine.createSpy 'custom')

    it 'calls handler with arguments', ->
      @events.trigger 'custom'
      expect(@customHandler).toHaveBeenCalledWith 'custom'

      @customHandler.reset()
      @events.trigger 'custom', (arg1 = '1'), (arg2 = '2')
      expect(@customHandler).toHaveBeenCalledWith 'custom', arg1, arg2

    it 'calls parent handler with arguments', ->
      @events.trigger 'custom', (arg1 = '1'), (arg2 = '2')
      expect(@customHandler).toHaveBeenCalledWith 'custom', arg1, arg2
      expect(@parentCustomHandler).toHaveBeenCalledWith 'custom', arg1, arg2
