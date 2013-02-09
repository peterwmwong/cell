define ['../../utils/spec-utils'], ({node})->
  ({beforeEachRequire})->
    beforeEachRequire [
      'cell/Ext'
      'cell/View'
      'require'
    ], (@Ext, @View, @require)->

    describe 'modifies View.__() method signature ( viewOrSelector:[View, String], exts...:Ext, attrHash_or_options?:Object, children...:[DOMElement, String, Number, Array, jQuery] )', ->
      beforeEach ->
        @x_test1 = @Ext.extend func: @x_test1_func = jasmine.createSpy 'x_test1_func'
        @x_test2 = @Ext.extend func: @x_test2_func = jasmine.createSpy 'x_test2_func'
        @view = new @View
        @__ = @view.__

      describe '__( selector:String, exts...:Ext )', ->
        beforeEach ->
          @result = @__ '.myClass',
            @x_test1_instance = @x_test1(@x_test1_options = {})
            @x_test2_instance = @x_test2(@x_test2_options = {})

        it 'calls Ext.run(element) for each ext', ->
          expect(@x_test1_func).toHaveBeenCalledWith @result, @x_test1_options, @x_test1_instance.getValue, @view
          expect(@x_test1_func.callCount).toBe 1
          expect(@x_test2_func).toHaveBeenCalledWith @result, @x_test2_options, @x_test2_instance.getValue, @view
          expect(@x_test2_func.callCount).toBe 1


      describe '__( selector:String, exts...:Ext, attrHash_or_options:Object )', ->
        beforeEach ->
          @result = @__ '.myClass',
            @x_test1_instance = @x_test1(@x_test1_options = {})
            @x_test2_instance = @x_test2(@x_test2_options = {})
            @options = a: 1

        it 'calls Ext.run(element) for each ext', ->
          expect(@x_test1_func).toHaveBeenCalledWith @result, @x_test1_options, @x_test1_instance.getValue, @view
          expect(@x_test1_func.callCount).toBe 1
          expect(@x_test2_func).toHaveBeenCalledWith @result, @x_test2_options, @x_test2_instance.getValue, @view
          expect(@x_test2_func.callCount).toBe 1


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
          expect(@x_test1_func).toHaveBeenCalledWith @result, @x_test1_options, @x_test1_instance.getValue, @view
          expect(@x_test1_func.callCount).toBe 1
          expect(@x_test2_func).toHaveBeenCalledWith @result, @x_test2_options, @x_test2_instance.getValue, @view
          expect(@x_test2_func.callCount).toBe 1


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
          expect(@x_test1_func).toHaveBeenCalledWith @result, @x_test1_options, @x_test1_instance.getValue, @view
          expect(@x_test1_func.callCount).toBe 1
          expect(@x_test2_func).toHaveBeenCalledWith @result, @x_test2_options, @x_test2_instance.getValue, @view
          expect(@x_test2_func.callCount).toBe 1
