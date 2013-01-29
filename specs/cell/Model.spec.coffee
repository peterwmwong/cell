define -> ({beforeEachRequire})->

  NON_STRINGS = [
    undefined
    null
    5
    (->)
    []
    {}
  ]

  beforeEachRequire ['cell/Model'], (@Model)->

  describe '@constructor(initial_hash)', ->

    describe 'when initial_hash is NOT undefined', ->
      beforeEach ->
        @model =
          new @Model
            a: 'a val'
            b: 'b val'
            c: 'c val'

      it 'current attributes are same as initial_hash', ->
        expect(@model.get k).toBe(v) for k,v of {
          a: 'a val'
          b: 'b val'
          c: 'c val'
        }

    describe 'when initial_hash is undefined', ->
      beforeEach ->
        @model = new @Model()

      it 'current attributes are same as initial_hash', ->
        expect(@model._a).toEqual({})

  describe '@get(key)', ->
    beforeEach ->
      @model = new @Model
        a: 'a val'
        b: 'b val'
        c: 'c val'

    describe 'when key is not already set', ->
      it 'returns undefined',->
        expect(@model.get 'z').toBe undefined

    describe 'when key is set', ->
      it 'returns value of key',->
        expect(@model.get 'a').toBe 'a val'
          

    describe 'when key is invalid (non-string)', ->

      it 'returns undefined', ->
        for key in NON_STRINGS
          expect(@model.get key).toBe undefined

  describe '@set(key,value)', ->
    beforeEach ->
      @model = new @Model
        a: 'a val'
        b: 'b val'
        c: 'c val'

    describe 'when overwriting with a different value', ->

      beforeEach ->
        @model.on 'change:b', (@on_change_spy = jasmine.createSpy 'change:b')
        @model.set 'b', 'new b value'

      it 'sets the new value', ->
        expect(@model.get 'b').toBe 'new b value'

      it 'fires one "change:b" event', ->
        expect(@on_change_spy.argsForCall.length).toBe 1
        expect(@on_change_spy).toHaveBeenCalledWith 'change:b', 'new b value', 'b val'


    describe 'when overwriting with the same value', ->
      beforeEach ->
        @model.on 'change:b', (@on_change_spy = jasmine.createSpy 'change:b')
        @model.set 'b', 'b val'

      it 'value continues to be the same', ->
        expect(@model.get 'b').toBe 'b val'

      it 'does NOT fire a "change:b" event', ->
        expect(@on_change_spy).not.toHaveBeenCalled()

    describe 'when key is invalid (non-string)', ->

      for key in NON_STRINGS then do(key)->
        beforeEach ->
          @model.on 'change:a', (@on_change_spy_a = jasmine.createSpy 'change:a')
          @model.on 'change:b', (@on_change_spy_b = jasmine.createSpy 'change:b')
          @model.on 'change:c', (@on_change_spy_c = jasmine.createSpy 'change:c')
          @model.set key, 'blah'

        it 'no values are changed', ->
          expect(@model.get 'a').toBe 'a val'
          expect(@model.get 'b').toBe 'b val'
          expect(@model.get 'c').toBe 'c val'

        it 'no change events were fired', ->
          expect(@on_change_spy_a).not.toHaveBeenCalled()
          expect(@on_change_spy_b).not.toHaveBeenCalled()
          expect(@on_change_spy_c).not.toHaveBeenCalled()

  describe '@off( type?:string, fn?:function, ctx?:object )', ->
    beforeEach ->
      @model = new @Model a: 'a val'
      @model.on 'custom', (@handler = jasmine.createSpy 'custom'), (@ctx = {})
      @model.on 'custom', (@handler2 = jasmine.createSpy 'custom (2)'), @ctx
      @model.on 'custom', @handler, (@ctx2 = {})
      @model.on 'custom2', (@handler2), @ctx

    describe '@off( type:string, fn:function )', ->
      beforeEach ->
        @model.off 'custom', @handler
        @model.trigger 'custom'

      it 'should unregister all matching handlers', ->
        expect(@handler).not.toHaveBeenCalled()
        expect(@handler2).toHaveBeenCalledWith 'custom'
        expect(@handler2.calls[0].object).toBe @ctx


    describe '@off( type:string, fn:function, ctx:object )', ->
      beforeEach ->
        @model.off 'custom', @handler, @ctx
        @model.trigger 'custom'
        
      it 'should unregister all matching handlers', ->
        expect(@handler.calls.length).toBe 1
        expect(@handler).toHaveBeenCalledWith 'custom'
        expect(@handler.calls[0].object).toBe @ctx2

        expect(@handler2).toHaveBeenCalledWith 'custom'
        expect(@handler2.calls[0].object).toBe @ctx

    describe '@off( type:string, undefined, ctx:object )', ->
      beforeEach ->
        @model.off 'custom', undefined, @ctx
        @model.trigger 'custom'

      it 'should unregister all matching handlers', ->
        expect(@handler.calls.length).toBe 1
        expect(@handler).toHaveBeenCalledWith 'custom'
        expect(@handler.calls[0].object).toBe @ctx2
        expect(@handler2).not.toHaveBeenCalled()

        @model.trigger 'custom2'
        expect(@handler2).toHaveBeenCalledWith 'custom2'

    describe '@off( undefined, fn:function )', ->
      beforeEach ->
        @model.off undefined, @handler2
        @model.trigger 'custom'

      it 'should unregister all matching handlers', ->
        expect(@handler.calls.length).toBe 2
        expect(@handler).toHaveBeenCalledWith 'custom'
        expect(@handler.calls[0].object).toBe @ctx2
        expect(@handler.calls[1].object).toBe @ctx
        expect(@handler2).not.toHaveBeenCalled()

        @model.trigger 'custom2'
        expect(@handler2).not.toHaveBeenCalled()

    describe '@off( undefined, fn:function, ctx:object )', ->
      beforeEach ->
        @model.off undefined, @handler, @ctx
        @model.trigger 'custom'

      it 'should unregister all matching handlers', ->
        expect(@handler.calls.length).toBe 1
        expect(@handler).toHaveBeenCalledWith 'custom'
        expect(@handler.calls[0].object).toBe @ctx2
        expect(@handler2).toHaveBeenCalledWith 'custom'

        @handler2.reset()
        @model.trigger 'custom2'
        expect(@handler2).toHaveBeenCalled()
        expect(@handler2.calls[0].object).toBe @ctx

    describe '@off( undefined, undefined, ctx:object )', ->
      beforeEach ->
        @model.off undefined, undefined, @ctx
        @model.trigger 'custom'

      it 'should unregister all matching handlers', ->
        expect(@handler.calls.length).toBe 1
        expect(@handler).toHaveBeenCalledWith 'custom'
        expect(@handler.calls[0].object).toBe @ctx2
        expect(@handler2).not.toHaveBeenCalled()

        @handler2.reset()
        @model.trigger 'custom2'
        expect(@handler2).not.toHaveBeenCalled()
      

  describe '@on(type:string, handler:function, ctx?:object)', ->
    beforeEach ->
      @model = new @Model a: 'a val'

      @model.on 'custom', (@customHandler = jasmine.createSpy 'custom')
      @model.on 'custom with context', (@customHandlerWithContext = jasmine.createSpy 'custom with context'), @ctx = {}

    it 'registers a handler to be called upon triggering', ->
      @model.trigger 'notRight'
      @model.set 'a', 'a val 2'
      expect(@customHandler).not.toHaveBeenCalled()
      expect(@customHandlerWithContext).not.toHaveBeenCalled()

      @model.trigger 'custom'
      expect(@customHandler).toHaveBeenCalledWith 'custom'
      expect(@customHandlerWithContext).not.toHaveBeenCalled()

      @customHandler.reset()
      @model.trigger 'custom with context'
      expect(@customHandler).not.toHaveBeenCalled()
      expect(@customHandlerWithContext).toHaveBeenCalledWith 'custom with context'
      expect(@customHandlerWithContext.calls[0].object).toBe @ctx

      @customHandler.reset()
      @customHandlerWithContext.reset()

    it 'when type is "any", calls handler upon any triggering', ->
      @model.on 'any', (anyHandler = jasmine.createSpy 'any'), (anyCtx = {})

      @model.trigger 'blah', (arg1 = {}), (arg2 = {}), (arg3 = {})
      expect(anyHandler).toHaveBeenCalledWith 'blah', arg1, arg2, arg3
      expect(anyHandler.calls[0].object).toBe anyCtx

      anyHandler.reset()
      @model.set 'a', 'a val 2'
      expect(anyHandler).toHaveBeenCalledWith 'change:a', 'a val 2', 'a val'
      expect(anyHandler.calls[0].object).toBe anyCtx


  describe '@trigger(type:string, args...:any)', ->
    beforeEach ->
      @model = new @Model a: 'a val'
      @model.on 'custom', (@customHandler = jasmine.createSpy 'custom')

    it 'calls handler with arguments', ->
      @model.trigger 'custom'
      expect(@customHandler).toHaveBeenCalledWith 'custom'

      @customHandler.reset()
      @model.trigger 'custom', (@arg1 = {}), (@arg2 = {})
      expect(@customHandler).toHaveBeenCalledWith 'custom', @arg1, @arg2


  describe '@onChangeAndDo(propertyName:string, change_handler:function)', ->
    beforeEach ->
      @model = new @Model
        a: 'a val'
        b: 'b val'
        c: 'c val'

    it 'calls change_handler with current value of key', ->
      @model.onChangeAndDo 'a', (change_handler = jasmine.createSpy 'change_handler')
      expect(change_handler.argsForCall.length).toBe 1
      expect(change_handler).toHaveBeenCalledWith 'initial:a', 'a val'

    it 'calls change_handler when key is changed', ->
      @model.onChangeAndDo 'a', (change_handler = jasmine.createSpy 'change_handler')
      change_handler.reset()
      @model.set 'a', 'a new val'
      expect(change_handler.argsForCall.length).toBe 1
      expect(change_handler).toHaveBeenCalledWith 'change:a', 'a new val', 'a val'