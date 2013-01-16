define -> ({beforeEachRequire})->
  beforeEachRequire [
    'cell/Ext'
    'cell/View'
    'require'
  ], (@Ext, @View, @require)->

  describe 'modifies View.__() method signature ( viewOrSelector:[Backbone.View, String], exts...:Ext, attrHash_or_options?:Object, children...:[DOMNode, String, Number, Array, jQuery] )', ->

    beforeEach ->
      @orig__ = (spyOn @View.prototype, '__')
        .andReturn @element = {}
      @x_test1 = @Ext.extend @x_test1_func = jasmine.createSpy 'x_test1_func'
      @x_test2 = @Ext.extend @x_test2_func = jasmine.createSpy 'x_test2_func'
      runs => @require ['cell/opts/ViewExts'], (@ViewExts)=>
      waitsFor => @ViewExts
      runs =>
        @view = new @View
        @__ = @view.__

    describe '__( selector:String, exts...:Ext )', ->
      beforeEach ->
        @x_test1_options = {}
        @x_test2_options = {}
        @result = @__ '.myClass', @x_test1(@x_test1_options), @x_test2(@x_test2_options)

      it 'calls Ext.run(element) for each ext', ->
        expect(@x_test1_func).toHaveBeenCalledWith @element, @x_test1_options
        expect(@x_test2_func).toHaveBeenCalledWith @element, @x_test2_options

      it 'calls original View.__( selector )', ->
        expect(@orig__).toHaveBeenCalledWith '.myClass'
        expect(@result).toBe @element
