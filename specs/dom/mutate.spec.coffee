define [
  'spec-utils'
  'spec-matchers'
],  ({node,browserTrigger}, matchers)->
  ({beforeEachRequire})->

    beforeEachRequire [
      'cell/dom/mutate'
      'cell/dom/events'
    ], (@mutate, @events)->
      @addMatchers matchers
      @element = node 'div'

    describe 'data cleanup', ->
      beforeEach ->
        @element.innerHTML = '<span></span>'
        @span = @element.children[0]

      it 'should remove event listeners on element removal', ->
        log = []
        @events.on @span, 'click', -> log.push 'click'
        browserTrigger @span, 'click'
        expect(log).toEqual ['click']

        @mutate.remove @element
        log = []

        browserTrigger @span, 'click'
        expect(log).toEqual []
