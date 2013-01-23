define ->
  ({beforeEachRequire})->

    # describe 'Modifies View::__.each( many:arrayOrCollection, renderer:function )', ->

    #   beforeEachRequire ['cell/View'], (View)->
    #     @__ = new View().__
    #     @items = [
    #       {name:'a'}
    #       {name:'b'}
    #       {name:'c'}
    #     ]
    #     @eachRenderer = jasmine.createSpy('eachRenderer')
    #     @eachRenderer.andCallFake (item)=> @__ 'div', item.name or item.attributes.name

    #   it 'when many is an empty array or collection', ->
    #     expect(@__.each [], @eachRenderer).toEqual []
    #     expect(@__.each (new Backbone.Collection), @eachRenderer).toEqual []
    #     expect(@eachRenderer.callCount).toEqual 0

    #   it 'when many is non-empty collection', ->
    #     collection = new Backbone.Collection @items

    #     result = @__.each collection, @eachRenderer
    #     expect(@eachRenderer.callCount).toEqual 3

    #     for item,i in @items
    #       args = @eachRenderer.calls[i].args
    #       expect(args[0] instanceof Backbone.Model).toBe true
    #       expect(args[0].attributes).toEqual item
    #       expect(args[1]).toEqual i
    #       expect(args[2]).toBe collection.models

    #     nodeHTMLEquals result[0], '<div>a</div>'
    #     nodeHTMLEquals result[1], '<div>b</div>'
    #     nodeHTMLEquals result[2], '<div>c</div>'


    # describe 'with cell/opts/ViewBindings', ->

    #   beforeEachRequire ['backbone', 'cell/opts/Backbone', 'cell/opts/ViewBindings','cell/View'], (@Backbone, OptsBackbone, ViewBindings, @View)->

    #   describe "When View.model or View.collection is present", ->

    #     beforeEach ->
    #       spyOn @View.prototype , 'updateBinds'

    #       @model = new @Backbone.Model()
    #       @viewWithModel = new @View {@model}

    #       @collection = new @Backbone.Collection()
    #       @viewWithCollection = new @View {@collection}

    #     describe "and triggers an event", ->

    #       beforeEach ->
    #         @model.trigger 'modelEvent'
    #         @collection.trigger 'collectionEvent'

    #       it "calls @updateBinds()", ->
    #         expect(@View::updateBinds.calls[0]).toEqual
    #           args: ['modelEvent']
    #           object: @viewWithModel

    #         expect(@View::updateBinds.calls[1]).toEqual
    #           args: ['collectionEvent']
    #           object: @viewWithCollection
