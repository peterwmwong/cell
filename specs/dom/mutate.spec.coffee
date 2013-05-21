define [
  'spec-utils'
  'spec-matchers'
],  ({node,browserTrigger}, matchers)->
  ({beforeEachRequire})->

    beforeEachRequire [
      'cell/dom/mutate'
      'cell/dom/events'
      'cell/View'
    ], (@mutate, @events, @View)->
      @addMatchers matchers
      @parentElement = node 'div'
      @element = node 'div'
      @parentElement.appendChild @element
      @CustomView = @View.extend()

    describe '@remove( element:DOMElement )', ->

      it "removes element from it's parent element", ->
        expect(@parentElement.children.length).toBe 1
        @mutate.remove @element
        expect(@parentElement.children.length).toBe 0

      describe 'When element is associated with a View', ->
        beforeEach ->
          @customView = new @CustomView()
          spyOn @customView, 'destroy'

        it 'calls View.destroy()', ->
          expect(@customView.destroy).not.toHaveBeenCalled()
          @mutate.remove @customView.el
          expect(@customView.destroy).toHaveBeenCalled()


      describe 'When element has a child element associated with a View', ->
        beforeEach ->
          @customView = new @CustomView()
          spyOn @customView, 'destroy'
          @element.appendChild @customView.el

        it 'calls View.destroy()', ->
          expect(@customView.destroy).not.toHaveBeenCalled()
          @mutate.remove @element
          expect(@customView.destroy).toHaveBeenCalled()


      describe 'When element has an event listener', ->
        beforeEach ->
          @events.on @element, 'click', @clickHandler = jasmine.createSpy 'click'

        it 'should remove event listeners', ->
          expect(@clickHandler).not.toHaveBeenCalled()

          @mutate.remove @element
          browserTrigger @element, 'click'
          expect(@clickHandler).not.toHaveBeenCalled()


      describe 'When element has a child element that has event listener', ->
        beforeEach ->
          @childElement = node 'span'
          @element.appendChild @childElement
          @events.on @childElement, 'click', @clickHandler = jasmine.createSpy 'click'

        it 'should remove event listeners', ->
          expect(@clickHandler).not.toHaveBeenCalled()

          @mutate.remove @element
          browserTrigger @childElement, 'click'
          expect(@clickHandler).not.toHaveBeenCalled()