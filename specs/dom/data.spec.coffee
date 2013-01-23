define [
  '../utils/spec-utils'
  '../utils/spec-matchers'
],  ({node}, matchers)->

  ({beforeEachRequire})->

    beforeEachRequire [
      'dom/data'
      'dom/api'
    ], (@data, @api)->
      @addMatchers matchers
      @element = node 'div'

    describe 'data.set( element:DOMElement, key:string, value:any ) and data.get( element:DOMElement, key:string )', ->
      it 'should get and set and remove data', ->
        expect(@data.get @element, 'prop').toBeUndefined()

        @data.set @element, 'prop', 'value'
        expect(@data.get @element, 'prop').toBe 'value'

        @data.remove @element, 'prop'
        expect(@data.get @element, 'prop').toBeUndefined()

    it 'data.get( element:DOMElement )', ->
      expect(@data.get @element).toEqual {}

      @data.set @element, 'foo', 'bar'
      expect(@data.get @element).toEqual
        foo: 'bar'

      @data.get(@element).baz = 'xxx'
      expect(@data.get @element).toEqual
        foo: 'bar',
        baz: 'xxx'

    describe 'data cleanup', ->
      beforeEach ->
        @element.innerHTML = '<span></span>'
        @span = @element.children[0]
        @data.set @element, 'name', 'divy'

      it 'should remove data on element removal', ->
        @data.remove @element
        expect(@data.get @element, 'name').toBeUndefined()

      # it('should remove event listeners on element removal', function() {
      #   var div = dom('<div><span>text</span></div>'),
      #     span = div.find('span'),
      #     log = '';
      #   span.bind('click', function() {
      #     log += 'click;'
      #   });
      #   browserTrigger(span);
      #   expect(log).toEqual('click;');
      #   span.remove();
      #   log = '';
      #   browserTrigger(span);
      #   expect(log).toEqual('');
