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
      @CustomView = @View.extend _cellName:'CustomView'

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


      describe 'When element has child elements associated with a View', ->
        beforeEach ->
          @customView = new @CustomView()
          @customView2 = new @CustomView()
          @customView.destroy = @destroySpy = jasmine.createSpy('destroy').andCallFake @CustomView::destroy
          @customView2.destroy = @destroySpy2 = jasmine.createSpy('destroy2').andCallFake @CustomView::destroy
          @element.appendChild @customView.el
          @element.appendChild @customView2.el

        it 'calls View.destroy()', ->
          expect(@destroySpy).not.toHaveBeenCalled()
          expect(@destroySpy2).not.toHaveBeenCalled()
          @mutate.remove @element
          expect(@destroySpy).toHaveBeenCalled()
          expect(@destroySpy2).toHaveBeenCalled()


      describe 'When element has children with event listeners', ->
        beforeEach ->
          @child1 = node 'div'
          @events.on @child1, 'click', @child1ClickHandler = jasmine.createSpy 'child1ClickHandler'
          @child2 = node 'div'
          @events.on @child2, 'click', @child2ClickHandler = jasmine.createSpy 'child2ClickHandler'
          @element.appendChild @child1
          @element.appendChild @child2
          @element.appendChild node 'div'

        it 'should remove event listeners from children', ->
          expect(@child1ClickHandler).not.toHaveBeenCalled()
          expect(@child2ClickHandler).not.toHaveBeenCalled()

          @mutate.remove @element
          browserTrigger @child1, 'click'
          browserTrigger @child2, 'click'

          expect(@child1ClickHandler).not.toHaveBeenCalled()
          expect(@child2ClickHandler).not.toHaveBeenCalled()


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