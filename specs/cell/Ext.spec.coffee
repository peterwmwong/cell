define ['../utils/spec-utils'], ({waitOne})-> ({beforeEachRequire})->
  beforeEachRequire [
    'cell/Ext'
    'cell/Model'
  ], (@Ext, @Model)->

  describe 'Ext.extend({render:function})', ->
    beforeEach ->
      @NewExt = @Ext.extend render: ->

    it 'returns an Ext class', ->
      expect((new @NewExt) instanceof @Ext).toBe true

    describe '@constructor( options )', ->
      beforeEach ->
        @newext = @NewExt @options = {}

      it 'can be called without new', ->
        expect(@NewExt() instanceof @Ext).toBe true

      it 'sets @options', ->
        expect(@newext.options).toBe @options

      describe '@run( element, view ) # Called by the View when rendering', ->
        beforeEach ->
          element = {}
          view = {}

          spyOn(@newext, 'render').andCallFake ->
            expect(@el).toBe element
            expect(@view).toBe view

          @newext.run element, view

        it 'calls render(), with `this` set properly', ->
          expect(@newext.render.callCount).toBe 1
          expect(@newext.render).toHaveBeenCalledWith()
          expect(@newext.render.calls[0].object).toBe @newext

      describe '@watch( value:any, callback:function )', ->
        beforeEach ->
          @callback = jasmine.createSpy 'callback'

        for nonFunc in [0,undefined,null,'test string',{}] then do(nonFunc)->
          describe "when value is NOT a function (#{nonFunc} : #{typeof nonFunc})", ->
            beforeEach ->
              @newext.watch nonFunc, @callback

            it 'calls callback( value )', ->
              expect(@callback).toHaveBeenCalledWith nonFunc

        describe 'when value is a function', ->
          beforeEach ->
            @watchedModel = new @Model a: 5
            @watchedFunc = jasmine.createSpy('watchedFunc').andCallFake => @watchedModel.get 'a'
            @newext.watch @watchedFunc, @callback

          it 'calls callback with what is returned from calling value', ->
            expect(@watchedFunc.callCount).toBe 1
            expect(@watchedFunc.calls[0].object).toBe @newext

            expect(@callback.callCount).toBe 1
            expect(@callback).toHaveBeenCalledWith 5
            expect(@callback.calls[0].object).toBe @newext

          describe 'when watched value function changes (accessed Model/Collection changes)', ->
            beforeEach ->
              @watchedFunc.reset()
              @callback.reset()
              @watchedModel.set 'a', 6

            it 'calls callback again with what is returned from calling value again', ->
              waitOne ->
                expect(@watchedFunc.callCount).toBe 1
                expect(@watchedFunc.calls[0].object).toBe @newext

                expect(@callback.callCount).toBe 1
                expect(@callback).toHaveBeenCalledWith 6
                expect(@callback.calls[0].object).toBe @newext
