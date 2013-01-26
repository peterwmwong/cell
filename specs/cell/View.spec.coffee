define ['../utils/spec-utils'], ({node,browserTrigger})->
  ({beforeEachRequire})->
    beforeEachRequire ['cell/View'], (@View)->

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

      describe 'sets @el', ->

        beforeEach ->
          @el = document.createElement 'div'
          @childEl = document.createElement 'span'
          @log = []
          @NewView = @View.extend
            beforeRender: => @log.push 'beforeRender'
            render_el: =>
              @log.push 'render_el'
              @el
            render: (__)=>
              @log.push 'render'
              @childEl
            afterRender: =>
              @log.push 'afterRender'
          @view = new @NewView()

        it 'calls View::render_el() to set @el', ->
          expect(@view.el).toBe @el

        it 'calls View::render() to set contents of @el', ->
          expect(@view.el.children.length).toBe 1
          expect(@view.el.children[0]).toEqual @childEl

        it 'calls functions in this order: beforeRender(), render_el(), render() and finally afterRender()', ->
          expect(@log).toEqual [
            'beforeRender'
            'render_el'
            'render'
            'afterRender'
          ]

    describe '@remove()', ->
      beforeEach ->
        @clickHandler = jasmine.createSpy 'click'
        View = @View.extend
          render: (__)=> [
            __ '.clickable', onclick: @clickHandler
          ]
        @parent = node 'div'
        @view = new View
        @parent.appendChild @view.el

      it 'removes event handlers', ->
        clickable = @view.el.children[0]
        browserTrigger clickable, 'click'
        expect(@clickHandler).toHaveBeenCalled()

        @clickHandler.reset()
        @view.remove()

        browserTrigger clickable, 'click'
        expect(@clickHandler).not.toHaveBeenCalled()

      it 'removes @el from parent', ->
        @view.remove()
        expect(@parent.children.length).toBe 0

      it 'removes @el itself', ->
        @view.remove()
        expect(@view.el).toBeUndefined()
