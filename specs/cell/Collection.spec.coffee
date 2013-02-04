define -> ({beforeEachRequire})->

  beforeEachRequire [
    'cell/Model'
    'cell/Collection'
  ], (@Model,@Collection)->

  describe '@constructor( array?:Array<Model or Object> )', ->

    describe '@constructor()', ->
      beforeEach ->
        @col = new @Collection()

      it 'creates an empty Collection', ->
        expect(@col.length()).toBe 0
        expect(@col.toArray()).toEqual []

    describe '@constructor( models:Array<Model> )', ->
      beforeEach ->
        @models = [new @Model, new @Model]
        @col = new @Collection @models

      it 'creates a Collection with models already added', ->
        expect(@col.length()).toBe 2
        expect(@col.at 0).toBe @models[0]
        expect(@col.at 1).toBe @models[1]

    describe '@constructor( models:Array<Object> )', ->
      beforeEach ->
        @objs = [{a:0},{b:1}]
        @col = new @Collection @objs

      it 'creates a Collection with newly created models using the Objects as attributes', ->
        expect(@col.length()).toBe 2
        expect(@col.at(0).attributes()).toEqual a: 0
        expect(@col.at(1).attributes()).toEqual b: 1


  describe '@readOnly()', ->
    beforeEach ->
      @models = [
        new @Model a: 0
        new @Model b: 1
        new @Model c: 2
      ]
      @col = new @Collection @models
      @col.readOnly()

    it 'if readOnly is true, @add and @remove() do nothing', ->
      expect(@col.length()).toBe 3
      @col.add d:3
      expect(@col.length()).toBe 3
      @col.remove @col.at 0
      expect(@col.length()).toBe 3

  describe '@indexOf( model:Model )', ->
    beforeEach ->
      @models = [
        new @Model a: 0
        new @Model b: 1
        new @Model c: 2
      ]
      @col = new @Collection @models

    it 'returns index if model exists in Collection, otherwise -1', ->
      expect(@col.indexOf @models[0]).toBe 0
      expect(@col.indexOf @models[1]).toBe 1
      expect(@col.indexOf @models[2]).toBe 2
      expect(@col.indexOf new @Model).toBe -1


  describe '@length()', ->
    beforeEach ->
      @col = new @Collection [
        new @Model a: 0
        new @Model b: 1
        new @Model c: 2
      ]

    it 'returns the number of models in Collection', ->
      expect(@col.length()).toBe 3

  describe '@at( index:number )', ->
    beforeEach ->
      @models = [
        new @Model a: 0
        new @Model b: 1
        new @Model c: 2
      ]
      @col = new @Collection @models

    it 'returns the Model at index', ->
      for model, i in @models
        expect(@col.at i).toBe @models[i]
      expect(@col.at -1).toBeUndefined()
      expect(@col.at 3).toBeUndefined()


  describe '@toArray()', ->
    beforeEach ->
      @models = [
        new @Model a: 0
        new @Model b: 1
        new @Model c: 2
      ]
      @col = new @Collection @models

    it 'returns an Array of all the Models in the Collection', ->
      result = @col.toArray()
      expect(result).toEqual @models

      result.pop()
      expect(@col.length()).toBe 3

  describe '@each( func:function, thisObject?:any )', ->
    beforeEach ->
      @models = [
        new @Model a: 0
        new @Model b: 1
        new @Model c: 2
      ]
      @col = new @Collection @models

    describe '@each()', ->
      it 'does nothing, when func not specified', ->
        expect(=> @col.each()).not.toThrow()

    describe '@each( func:function )', ->
      it 'calls func with (model, index, Collection) for each Model in the collection', ->
        result = @col.each func = jasmine.createSpy 'func'
        
        expect(result).toBeUndefined()
        expect(func.callCount).toBe 3
        for model,i in @models
          expect(func.calls[i].args).toEqual [model, i, @col]

      describe 'when func returns false', ->
        it 'returns early by not calling func for the rest of the models', ->
          func = jasmine.createSpy('func').andCallFake (model,i,collection)-> i is 0
          result = @col.each func

          expect(result).toBeUndefined()
          expect(func.callCount).toBe 2
          expect(func.calls[0].args).toEqual [@models[0], 0, @col]
          expect(func.calls[1].args).toEqual [@models[1], 1, @col]

    describe '@each( func:function, thisObject:any )', ->
      it 'calls func with (model, index, Collection) for each Model in the collection, with `this` bound to thisObject', ->
        result = @col.each (func = jasmine.createSpy 'func'), thisObject = {}

        expect(result).toBeUndefined()
        expect(func.callCount).toBe 3
        for model,i in @models
          expect(func.calls[i].args).toEqual [model, i, @col]
          expect(func.calls[i].object).toBe thisObject


  describe '@map( func:function, thisObject?:any )', ->
    beforeEach ->
      @models = [
        new @Model a: 0
        new @Model b: 1
        new @Model c: 2
      ]
      @col = new @Collection @models

    describe '@map()', ->
      it 'does nothing, when func not specified', ->
        expect(=> @col.map()).not.toThrow()

    describe '@map( func:function )', ->
      it 'calls func with (model, index, Collection) for each Model in the collection', ->
        result = @col.map func = jasmine.createSpy('func').andCallFake (model,i,collection)-> i*100

        expect(result).toEqual [0,100,200]
        expect(func.callCount).toBe 3
        for model,i in @models
          expect(func.calls[i].args).toEqual [model, i, @col]

    describe '@map( func:function, thisObject:any )', ->
      it 'calls func with (model, index, Collection) for each Model in the collection, with `this` bound to thisObject', ->
        func = jasmine.createSpy('func').andCallFake (model,i,collection)-> i*100
        thisObject = {}
        result = @col.map func, thisObject
        
        expect(result).toEqual [0,100,200]
        expect(func.callCount).toBe 3
        for model,i in @models
          expect(func.calls[i].args).toEqual [model, i, @col]
          expect(func.calls[i].object).toBe thisObject


  describe '@reduce( func:function, initialValue:any, thisObject?:any )', ->
    beforeEach ->
      @models = [
        new @Model a: 0
        new @Model a: 3
        new @Model a: 7
      ]
      @col = new @Collection @models

    describe '@reduce()', ->
      it 'does nothing, when func not specified', ->
        expect(=> @col.reduce()).not.toThrow()

    describe '@reduce( initialValue:any, func:function )', ->
      it 'calls func with (model, index, Collection) for each Model in the collection', ->
        func = jasmine.createSpy('func').andCallFake (cur,model,i,collection)-> cur + model.get 'a'
        initialValue = 100
        result = @col.reduce initialValue, func

        expect(result).toEqual 110
        expect(func.callCount).toBe 3
        expect(func.calls[0].args).toEqual [100, @models[0], 0, @col]
        expect(func.calls[1].args).toEqual [100, @models[1], 1, @col]
        expect(func.calls[2].args).toEqual [103, @models[2], 2, @col]

    describe '@reduce( initialValue:any, func:function, thosObject:any )', ->
      it 'calls func with (model, index, Collection) for each Model in the collection', ->
        func = jasmine.createSpy('func').andCallFake (cur,model,i,collection)-> cur + model.get 'a'
        initialValue = 100
        thisObject = {}
        result = @col.reduce initialValue, func, thisObject

        expect(result).toEqual 110
        expect(func.callCount).toBe 3
        expect(func.calls[0].args).toEqual [100, @models[0], 0, @col]
        expect(func.calls[0].object).toBe thisObject
        expect(func.calls[1].args).toEqual [100, @models[1], 1, @col]
        expect(func.calls[1].object).toBe thisObject
        expect(func.calls[2].args).toEqual [103, @models[2], 2, @col]
        expect(func.calls[2].object).toBe thisObject

  describe '@add( modelOrArray:[Model or Object or Array<Model or Object>], index?:number )', ->
    beforeEach ->
      @initialModels = [
        new @Model a: 0
        new @Model b: 1
      ]
      @col = new @Collection @initialModels

    describe '@add( model:Model, index?:number )', ->
      beforeEach ->
        @model = new @Model c: 2

      it 'when index is undefined, adds model as last entry', ->
        @col.add @model
        expect(@col.at 0).toBe @initialModels[0]
        expect(@col.at 1).toBe @initialModels[1]
        expect(@col.at 2).toBe @model

      it 'when index is specified, adds model before index', ->
        @col.add @model, 1
        expect(@col.at 0).toBe @initialModels[0]
        expect(@col.at 1).toBe @model
        expect(@col.at 2).toBe @initialModels[1]

    describe '@add( model:Object )', ->
      beforeEach ->
        @modelObj = c: 2

      it 'when index is undefined, adds model as last entry', ->
        @col.add @modelObj
        expect(@col.at 0).toBe @initialModels[0]
        expect(@col.at 1).toBe @initialModels[1]

        @model = @col.at 2
        expect(@model instanceof @Model).toBe true
        expect(@model.attributes()).toEqual c: 2

      it 'when index is specified, adds model before index', ->
        @col.add @modelObj, 1
        expect(@col.at 0).toBe @initialModels[0]

        @model = @col.at 1
        expect(@model instanceof @Model).toBe true
        expect(@model.attributes()).toEqual c: 2

        expect(@col.at 2).toBe @initialModels[1]

    describe '@add( model:Array<Model>, index?:number )', ->
      beforeEach ->
        @models = [
          new @Model c: 2
          new @Model c: 3
        ]

      it 'when index is undefined, adds model as last entry', ->
        @col.add @models
        expect(@col.at 0).toBe @initialModels[0]
        expect(@col.at 1).toBe @initialModels[1]
        expect(@col.at 2).toBe @models[0]
        expect(@col.at 3).toBe @models[1]

      it 'when index is specified, adds model before index', ->
        @col.add @models, 1
        expect(@col.at 0).toBe @initialModels[0]
        expect(@col.at 1).toBe @models[0]
        expect(@col.at 2).toBe @models[1]
        expect(@col.at 3).toBe @initialModels[1]

    describe '@add( model:Array<Object>, index?:number )', ->

      beforeEach ->
        @modelObjs = [{c: 2},{d:3}]

      it 'when index is undefined, adds model as last entry', ->
        @col.add @modelObjs
        expect(@col.at 0).toBe @initialModels[0]
        expect(@col.at 1).toBe @initialModels[1]

        i = 2
        for obj in @modelObjs
          @model = @col.at i++
          expect(@model instanceof @Model).toBe true
          expect(@model.attributes()).toEqual obj

      it 'when index is undefined, adds model as last entry', ->
        @col.add @modelObjs, 1
        expect(@col.at 0).toBe @initialModels[0]

        i = 1
        for obj in @modelObjs
          @model = @col.at i++
          expect(@model instanceof @Model).toBe true
          expect(@model.attributes()).toEqual obj

        expect(@col.at 3).toBe @initialModels[1]

  describe '@remove( modelOrArray:[Model or Array<Model>] )', ->
    beforeEach ->
      @initialModels = [
        new @Model a: 0
        new @Model b: 1
        new @Model c: 2
      ]
      @col = new @Collection @initialModels

    describe '@remove( model:Model )', ->
      beforeEach ->
        @col.remove @initialModels[1]

      it 'removes Model', ->
        expect(@col.length()).toBe 2
        expect(@col.at 0).toBe @initialModels[0]
        expect(@col.at 1).toBe @initialModels[2]

      it 'if model is NOT part of collection, it does nothing', ->
        @col.remove new @Model a: 0
        expect(@col.length()).toBe 2
        expect(@col.at 0).toBe @initialModels[0]
        expect(@col.at 1).toBe @initialModels[2]

      it 'if collection is empty, does nothing', ->
        @emptyCol = new @Collection
        @emptyCol.remove new @Model a: 0
        expect(@emptyCol.length()).toBe 0

    describe '@remove( array:Array<Model> )', ->
      beforeEach ->
        @col.remove [
          @initialModels[2]
          (new @Model a: 0)
          @initialModels[0]
        ]

      it 'removes all models in array that are part of the collection', ->
        expect(@col.length()).toBe 1
        expect(@col.at 0).toBe @initialModels[1]

      it 'if collection is empty, does nothing', ->
        @emptyCol = new @Collection
        @emptyCol.remove [
          new @Model a: 0
          new @Model b: 1
        ]
        expect(@emptyCol.length()).toBe 0
