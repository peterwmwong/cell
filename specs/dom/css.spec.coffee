define [
  '../utils/spec-utils'
  '../utils/spec-matchers'
],  ({node}, matchers)->

  ({beforeEachRequire})->

    beforeEachRequire [
      'dom/css'
      'dom/api'
    ], (@css, @api)->
      @addMatchers matchers

      @parent = node 'div'
      @parent.innerHTML =
        """
        <div style="margin: 1px;"></div>
        <div></div>
        """
      [@element,@elementNoMargin] = @parent.children

    describe '@css  element:Element, style:string ) # Get ', ->

      it 'gets style', ->
        expect(@css @element, 'margin').toEqual '1px'

      it 'gets unset styles', ->
        expectation = expect @css @elementNoMargin, 'margin'
        if @api.msie <= 8
          expectation.toBe('auto')
        else
          expectation.toBeFalsy()

    describe '@css  element:Element, style:string, value:any ) # Set', ->
      beforeEach ->
        @css @element, 'margin', '2px'

      it 'sets style', ->
        expect(@parent.innerHTML.indexOf('<div style="margin: 2px;"></div>') isnt -1).toBe true

    describe '@css  element:Element, styles:string[] ) # Get Many', ->
      beforeEach ->
        @css @element, 'display', 'inline'
        @result = @css @element, ['margin','display']

      it 'gets styles', ->
        expect(@result).toEqual
          margin: '1px'
          display: 'inline'

    describe '@css  element:Element, styleValueHash:object ) # Set Many', ->
      beforeEach ->
        @css @element,
          margin: '3px'
          display: 'inline'

      it 'gets styles', ->
        expect(@parent.innerHTML.indexOf('<div style="margin: 3px; display: inline;"></div>') isnt -1).toBe true

    it 'should correctly handle dash-separated and camelCased properties', ->

      expect(@css @element, 'z-index').toBeOneOf('', 'auto')
      expect(@css @element, 'zIndex').toBeOneOf('', 'auto')

      @css @element, 'zIndex': 5

      expect(@css @element, 'z-index').toBeOneOf('5', 5)
      expect(@css @element, 'zIndex').toBeOneOf('5', 5)

      @css @element, 'z-index': 7

      expect(@css @element, 'z-index').toBeOneOf('7', 7)
      expect(@css @element, 'zIndex').toBeOneOf('7', 7)

      @css @element, 'zIndex', 5

      expect(@css @element, 'z-index').toBeOneOf('5', 5)
      expect(@css @element, 'zIndex').toBeOneOf('5', 5)

      @css @element, 'z-index', 7

      expect(@css @element, 'z-index').toBeOneOf('7', 7)
      expect(@css @element, 'zIndex').toBeOneOf('7', 7)

      expect(@css(@element,['z-index'])['z-index']).toBeOneOf('7', 7)
      expect(@css(@element,['zIndex'])['zIndex']).toBeOneOf('7', 7)
