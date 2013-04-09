define -> ({beforeEachRequire})->

  NON_STRINGS = [
    undefined
    null
    5
    (->)
    []
    {}
  ]

  beforeEachRequire ['cell/Model', 'cell/Collection', 'cell/Events'], (@Model, @Collection, @Events)->


  describe '@destroy()', ->
    beforeEach ->
      @model = new @Model
        a: 'a val'
        b: 'b val'
        c: 'c val'
      @col = new @Collection [@model]
      @col.on 'remove', (@remove = jasmine.createSpy 'remove')
      spyOn @Events.prototype, 'destroy'
      @model.destroy()

    it 'removes all attributes', ->
      expect(@model.get k).toBeUndefined() for k in ['a', 'b', 'c']

    it 'removes all listeners', ->
      expect(@Events::destroy).toHaveBeenCalled()

    it 'removes itself from owning collection', ->
      expect(@remove).toHaveBeenCalled()
      expect(@col.length()).toBe 0
      expect(@model.collection).toBeUndefined()

  describe '@constructor(initial_hash)', ->

    describe 'when initial_hash is NOT undefined', ->
      beforeEach ->
        @model = new @Model
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

  describe '@attributes()', ->
    beforeEach ->
      @model = new @Model
        a: 'a val'
        b: 'b val'
        c: 'c val'

    it 'returns a copied object of all attributes', ->
      attrs = @model.attributes()
      expect(attrs).toEqual
        a: 'a val'
        b: 'b val'
        c: 'c val'

      attrs.a = 'a val 2'
      expect(@model.get 'a').toBe 'a val'


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

    describe 'when model is contained in another Model or Collection', ->
      beforeEach ->
        @resetCallbacks = =>
          @collectionCallback.reset()
          @modelInAModelCallback.reset()
          @modelParentCallback.reset()
          @modelDeeplyNestedCallback.reset()
          return

        @collectionCallback = jasmine.createSpy 'collectionCallback'
        @collection = new @Collection [@model]
        @collection.on 'all', @collectionCallback

        @modelInAModel = new @Model
        @modelInAModelCallback = jasmine.createSpy 'modelInAModelCallback'
        @modelInAModel.on 'all', @modelInAModelCallback

        @modelParentCallback = jasmine.createSpy 'modelParentCallback'
        @modelParent = new @Model key: @modelInAModel
        @modelParent.on 'all', @modelParentCallback

        @modelDeeplyNestedCallback = jasmine.createSpy 'modelDeeplyNestedCallback'
        @modelDeeplyNested = new @Model
        @modelDeeplyNested.on 'all', @modelDeeplyNestedCallback
        @modelInAModel.set 'deeplyNested', @modelDeeplyNested

      it 'propagates events to ancestors', ->
        @resetCallbacks()

        @model.set 'a', 'a val 1'
        expect(@collectionCallback).toHaveBeenCalled()
        expect(@modelInAModelCallback).not.toHaveBeenCalled()
        expect(@modelParentCallback).not.toHaveBeenCalled()
        expect(@modelDeeplyNestedCallback).not.toHaveBeenCalled()

        @resetCallbacks()

        @modelInAModel.set 'a', 'a val 2'
        expect(@collectionCallback).not.toHaveBeenCalled()
        expect(@modelInAModelCallback).toHaveBeenCalled()
        expect(@modelParentCallback).toHaveBeenCalled()
        expect(@modelDeeplyNestedCallback).not.toHaveBeenCalled()

        @resetCallbacks()

        @modelDeeplyNested.set 'a', 'a val 3'
        expect(@collectionCallback).not.toHaveBeenCalled()
        expect(@modelInAModelCallback).toHaveBeenCalled()
        expect(@modelParentCallback).toHaveBeenCalled()
        expect(@modelDeeplyNestedCallback).toHaveBeenCalled()


    describe 'when overwriting with a different value', ->

      beforeEach ->
        @model.on 'change:b', (@on_change_spy = jasmine.createSpy 'change:b')
        @model.set 'b', 'new b value'

      it 'sets the new value', ->
        expect(@model.get 'b').toBe 'new b value'

      it 'fires one "change:b" event', ->
        expect(@on_change_spy.argsForCall.length).toBe 1
        expect(@on_change_spy).toHaveBeenCalledWith 'change:b', @model, 'new b value', 'b val'


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
