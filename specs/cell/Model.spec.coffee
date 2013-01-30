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