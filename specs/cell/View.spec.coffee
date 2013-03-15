define ['../utils/spec-utils'], ({node,browserTrigger,nodeHTMLEquals,waitOne})->
  ({beforeEachRequire})->
    beforeEachRequire ['cell/View','cell/Model','cell/Collection'], (@View, @Model, @Collection)->

    describe 'View( options?:object )', ->

      it 'sets @options', ->
        View = @View.extend()
        expect((new View o1 = {}).options).toBe o1
        expect((new View).options).toEqual {}
        expect((new View undefined).options).toEqual {}

      it 'sets @model, if options.model exists', ->
        View = @View.extend()
        model= {}
        view = new View {model}
        expect(view.model).toBe model
        expect(view.options.model).toBeUndefined()

      it 'sets @collection, if options.collection exists', ->
        View = @View.extend()
        collection = {}
        view = new View {collection}
        expect(view.collection).toBe collection
        expect(view.options.collection).toBeUndefined()

      describe 'sets @el', ->

        beforeEach ->
          @el = document.createElement 'div'
          @childEl = document.createElement 'span'
          @log = []
          @NewView = @View.extend
            beforeRender: => @log.push 'beforeRender'
            renderEl: =>
              @log.push 'renderEl'
              @el
            render: (__)=>
              @log.push 'render'
              @childEl
            afterRender: =>
              @log.push 'afterRender'
          @view = new @NewView()

        it 'calls View::renderEl() to set @el', ->
          expect(@view.el).toBe @el

        it 'calls View::render() to set contents of @el', ->
          expect(@view.el.children.length).toBe 1
          expect(@view.el.children[0]).toEqual @childEl

        it 'calls functions in this order: beforeRender(), renderEl(), render() and finally afterRender()', ->
          expect(@log).toEqual [
            'beforeRender'
            'renderEl'
            'render'
            'afterRender'
          ]

    describe '@watch( expression:function, callback:function )', ->
      beforeEach ->
        @model = new @Model a: 'a val'
        @view = new @View model: @model
        @view.watch (->@model.get 'a'), @callback = jasmine.createSpy 'callback'

      it 'calls callback with value and `this` set to the view', ->
        expect(@callback).toHaveBeenCalledWith 'a val'
        expect(@callback.calls[0].object).toBe @view

      describe 'when model value is changed', ->
        beforeEach ->
          @callback.reset()
          @model.set 'a', 'a val 2'

        it 'calls callback with new value and `this` set to the view', ->
          waitOne ->
            expect(@callback).toHaveBeenCalledWith 'a val 2'
            expect(@callback.calls[0].object).toBe @view

    describe '@destroy()', ->
      beforeEach ->
        @model = new @Model a: 'a val'
        @col = new @Collection [new @Model b: 'b val']
        @TestView = @View.extend
          _cellName: 'Test'
          render: (__)-> [
            __ '.model', onclick:@onclick, (-> @model.get 'a')
            -> @collection.map (item)->
              __ '.item', (-> item.get 'b')
          ]
          onclick: jasmine.createSpy 'click'

        @view = new @TestView
          collection: @col
          model: @model

        @view.watch (-> @model.get 'a'), (@watchCallback = jasmine.createSpy 'watchCallback')
        @el = @view.el

      it 'removes @el from view', ->
        @view.destroy()
        expect(@view.el).toBeUndefined()

      it 'removes Model/Collection listeners', ->
        nodeHTMLEquals @el,
          '<div cell="Test" class="Test">'+
            '<div class="model">a val</div>'+
            '<div class="item">b val</div>'+
          '</div>'
        
        @view.destroy()
        @model.set 'a', 'a val 2'
        @col.add new @Model b: '2 b val'

        waitOne ->
          nodeHTMLEquals @el,
            '<div cell="Test" class="Test">'+
              '<div class="model">a val</div>'+
              '<div class="item">b val</div>'+
            '</div>'

      it 'removes DOM event listeners', ->
        browserTrigger @el.children[0], 'click'
        expect(@view.onclick).toHaveBeenCalled()
        @view.onclick.reset()

        @view.destroy()
        browserTrigger @el.children[0], 'click'

        expect(@view.onclick).not.toHaveBeenCalled()

      it 'removes watch listeners', ->
        @watchCallback.reset()
        @view.destroy()
        @model.set 'a', 'a val 3'
        waitOne ->
          expect(@watchCallback).not.toHaveBeenCalled()
