define -> ({beforeEachRequire})->
  beforeEachRequire ['cell/Ext'], (@Ext)->

  describe 'Ext.extend(func:function)', ->
    beforeEach ->
      @NewExt = @Ext.extend @func = jasmine.createSpy 'extend func'

    it 'returns an Ext class', ->
      expect((new @NewExt) instanceof @Ext).toBe true

    describe '@constructor( options )', ->
      beforeEach ->
        @newext = @NewExt @options = {}

      it 'can be called without new', ->
        expect(@NewExt() instanceof @Ext).toBe true

      it 'sets @options', ->
        expect(@newext.options).toBe @options

      describe '@run( element )', ->
        beforeEach ->
          @newext.run @element = {}

        it 'calls func( element, @options, @getValue ), with this set properly', ->
          expect(@func.callCount).toBe 1
          expect(@func).toHaveBeenCalledWith @element, @options, @newext.getValue
          expect(@func.calls[0].object).toBe @newext

      describe '@getValue( value:any, callback:function )', ->
        beforeEach ->
          @callback = jasmine.createSpy 'callback'

        describe 'when value is a function', ->
          beforeEach ->
            @value = {}
            @newext.getValue (=>@value), @callback

          it 'calls callback( value() )', ->
            expect(@callback).toHaveBeenCalledWith @value


        for nonFunc in [0,undefined,null,'test string',{}] then do(nonFunc)->
          describe "when value is NOT a function (#{nonFunc} : #{typeof nonFunc})", ->
            beforeEach ->
              @newext.getValue nonFunc, @callback

            it 'calls callback( value )', ->
              expect(@callback).toHaveBeenCalledWith nonFunc
