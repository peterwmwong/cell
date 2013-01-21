define ['../../utils/spec-utils'], ({node})-> ({beforeEachRequire})->
  beforeEachRequire [
    'dom/class'
    'cell/Ext'
    'cell/exts/x_class'
  ], ({@hasClass}, @Ext, @x_class)->

  describe 'x_class( classHash:object )', ->
    beforeEach ->
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

    it 'creates an Ext', ->
      expect(@ext instanceof @Ext).toBe true

    describe '@run( element:Element )', ->
      beforeEach ->
        @ext.run @element

      it 'applies truthy classes', ->
        expect(@hasClass @element, 'trueClass').toBe true
        expect(@hasClass @element, 'truthyClass').toBe true

      it 'does NOT apply falsy classes', ->
        expect(@hasClass @element, 'falseClass').toBe false
        expect(@hasClass @element, 'falsyClass').toBe false

      it 'removes falsy classes', ->
        expect(@hasClass @element, 'one').toBe false
        expect(@hasClass @element, 'two').toBe true
        expect(@hasClass @element, 'three').toBe false

