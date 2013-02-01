define ['../../utils/spec-utils'], ({node})->
  ({beforeEachRequire})->
    beforeEachRequire [
      'cell/Ext'
      'cell/View'
      'require'
    ], (@Ext, @View, @require)->

    describe 'modifies View.__() method signature ( viewOrSelector:[View, String], exts...:Ext, attrHash_or_options?:Object, children...:[DOMElement, String, Number, Array, jQuery] )', ->
      beforeEach ->
        @orig__ = (spyOn @View.prototype, '__').andReturn @element = {}
        @x_test1 = @Ext.extend func: @x_test1_func = jasmine.createSpy 'x_test1_func'
        @x_test2 = @Ext.extend func: @x_test2_func = jasmine.createSpy 'x_test2_func'
        runs => @require ['cell/opts/ViewExts'], (@ViewExts)=>
        waitsFor => @ViewExts
        runs =>
          @view = new @View
          @__ = @view.__

      describe '__( selector:String, exts...:Ext )', ->
        beforeEach ->
          @result = @__ '.myClass',
            @x_test1_instance = @x_test1(@x_test1_options = {})
            @x_test2_instance = @x_test2(@x_test2_options = {})

        it 'calls Ext.run(element) for each ext', ->
          expect(@x_test1_func).toHaveBeenCalledWith @element, @x_test1_options, @x_test1_instance.getValue, @view
          expect(@x_test1_func.callCount).toBe 1
          expect(@x_test2_func).toHaveBeenCalledWith @element, @x_test2_options, @x_test2_instance.getValue, @view
          expect(@x_test2_func.callCount).toBe 1

        it 'calls original View.__( selector )', ->
          expect(@orig__).toHaveBeenCalledWith '.myClass'
          expect(@orig__.callCount).toBe 1
          expect(@orig__.calls[0].object).toBe @view
          expect(@result).toBe @element

      describe '__( selector:String, exts...:Ext, attrHash_or_options:Object )', ->
        beforeEach ->
          @result = @__ '.myClass',
            @x_test1_instance = @x_test1(@x_test1_options = {})
            @x_test2_instance = @x_test2(@x_test2_options = {})
            @options = a: 1

        it 'calls Ext.run(element) for each ext', ->
          expect(@x_test1_func).toHaveBeenCalledWith @element, @x_test1_options, @x_test1_instance.getValue, @view
          expect(@x_test1_func.callCount).toBe 1
          expect(@x_test2_func).toHaveBeenCalledWith @element, @x_test2_options, @x_test2_instance.getValue, @view
          expect(@x_test2_func.callCount).toBe 1

        it 'calls original View.__( selector )', ->
          expect(@orig__).toHaveBeenCalledWith '.myClass', @options
          expect(@orig__.callCount).toBe 1
          expect(@orig__.calls[0].object).toBe @view
          expect(@result).toBe @element

      describe '__( selector:String, exts...:Ext, attrHash_or_options:Object, children...:[DOMElement, String, Number, Array] )', ->
        beforeEach ->
          @result = @__ (@sel_arg = '.myClass'),
            @x_test1_instance = @x_test1(@x_test1_options = {})
            @x_test2_instance = @x_test2(@x_test2_options = {})
            @options = a: 1
            (@child_args = [
              node 'a'
              'hello'
              0
              [
                node 'b'
                'bye'
                1
              ]
            ])...

        it 'calls Ext.run(element) for each ext', ->
          expect(@x_test1_func).toHaveBeenCalledWith @element, @x_test1_options, @x_test1_instance.getValue, @view
          expect(@x_test1_func.callCount).toBe 1
          expect(@x_test2_func).toHaveBeenCalledWith @element, @x_test2_options, @x_test2_instance.getValue, @view
          expect(@x_test2_func.callCount).toBe 1

        it 'calls original View.__( selector )', ->
          expect(@orig__).toHaveBeenCalledWith @sel_arg, @options, @child_args...
          expect(@orig__.callCount).toBe 1
          expect(@orig__.calls[0].object).toBe @view
          expect(@result).toBe @element


      describe '__( selector:String, exts...:Ext, children...:[DOMElement, String, Number, Array] )', ->
        beforeEach ->
          @result = @__ (@sel_arg = '.myClass'),
            @x_test1_instance = @x_test1(@x_test1_options = {})
            @x_test2_instance = @x_test2(@x_test2_options = {})
            (@child_args = [
              node 'a'
              'hello'
              0
              [
                node 'b'
                'bye'
                1
              ]
            ])...

        it 'calls Ext.run(element) for each ext', ->
          expect(@x_test1_func).toHaveBeenCalledWith @element, @x_test1_options, @x_test1_instance.getValue, @view
          expect(@x_test1_func.callCount).toBe 1
          expect(@x_test2_func).toHaveBeenCalledWith @element, @x_test2_options, @x_test2_instance.getValue, @view
          expect(@x_test2_func.callCount).toBe 1

        it 'calls original View.__( selector )', ->
          expect(@orig__).toHaveBeenCalledWith @sel_arg, @child_args...
          expect(@orig__.callCount).toBe 1
          expect(@orig__.calls[0].object).toBe @view
          expect(@result).toBe @element
