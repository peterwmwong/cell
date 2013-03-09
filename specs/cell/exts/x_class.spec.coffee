define ['../../utils/spec-utils'], ({node,waitOne})-> ({beforeEachRequire})->
  beforeEachRequire [
    'dom/class'
    'cell/Model'
    'cell/Ext'
    'cell/exts/x_class'
  ], (@cls, @Model, @Ext, @x_class)->

  describe 'x_class( classHash:object )', ->
    beforeEach ->
      @mockView =
        model: new @Model a: true, b: false
      @element = node 'div'
      @element.className = 'one two three'
      @ext = @x_class
        trueClass: true
        falseClass: false
        truthyClass: 1
        falsyClass: undefined
        one: false
        two: true
        three: false
        truthyExpression: -> @model.get 'a'
        falsyExpression: -> @model.get 'b'

    it 'creates an Ext', ->
      expect(@ext instanceof @Ext).toBe true

    describe '@run( element:Element )', ->
      beforeEach ->
        @ext.run @element, @mockView

      it 'applies truthy classes', ->
        expect(@cls.has @element, 'trueClass').toBe true
        expect(@cls.has @element, 'truthyClass').toBe true
        expect(@cls.has @element, 'truthyExpression').toBe true
        expect(@cls.has @element, 'falsyExpression').toBe false

      it 'does NOT apply falsy classes', ->
        expect(@cls.has @element, 'falseClass').toBe false
        expect(@cls.has @element, 'falsyClass').toBe false

      it 'removes falsy classes', ->
        expect(@cls.has @element, 'one').toBe false
        expect(@cls.has @element, 'two').toBe true
        expect(@cls.has @element, 'three').toBe false

      describe "when a expression's value changes", ->
        beforeEach ->
          @mockView.model.set 'a', false

        it 'it automatically sets/unsets the class expression was bound to', ->
          waitOne ->
            expect(@cls.has @element, 'truthyExpression').toBe false
            expect(@cls.has @element, 'falsyExpression').toBe false