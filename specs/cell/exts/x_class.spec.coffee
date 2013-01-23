define ['../../utils/spec-utils'], ({node})-> ({beforeEachRequire})->
  beforeEachRequire [
    'dom/class'
    'cell/Ext'
    'cell/exts/x_class'
  ], (@cls, @Ext, @x_class)->

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
        expect(@cls.has @element, 'trueClass').toBe true
        expect(@cls.has @element, 'truthyClass').toBe true

      it 'does NOT apply falsy classes', ->
        expect(@cls.has @element, 'falseClass').toBe false
        expect(@cls.has @element, 'falsyClass').toBe false

      it 'removes falsy classes', ->
        expect(@cls.has @element, 'one').toBe false
        expect(@cls.has @element, 'two').toBe true
        expect(@cls.has @element, 'three').toBe false

