define -> ({beforeEachRequire})->
  beforeEachRequire ['cell/View'], (@View)->

  describe 'View( options?:object )', ->

    it 'sets @options', ->
      View = @View.extend()
      expect((new View o1 = {}).options).toBe o1
      expect((new View).options).toEqual {}
      expect((new View undefined).options).toEqual {}

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