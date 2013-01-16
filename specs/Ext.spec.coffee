define -> ({beforeEachRequire})->
  beforeEachRequire ['cell/Ext'], (@Ext)->

  describe 'Ext.extend(func:function)', ->
    beforeEach ->
      @NewExt = @Ext.extend @func = jasmine.createSpy 'extend func'

    it 'returns an Ext class', ->
      expect((new @NewExt) instanceof @Ext).toBe true

    describe '@constructor(options)', ->
      beforeEach ->
        @newext = @NewExt @options = {}

      it 'can be called without new', ->
        expect(@NewExt() instanceof @Ext).toBe true

      it 'sets @options', ->
        expect(@newext.options).toBe @options

      describe '@run(element)', ->
        beforeEach ->
          @newext.run @element = {}

        it 'calls func(element, options), with this set properly', ->
          expect(@func.callCount).toBe 1
          expect(@func).toHaveBeenCalledWith @element, @options
          expect(@func.calls[0].object).toBe @newext