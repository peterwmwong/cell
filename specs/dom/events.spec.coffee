define [
  '../utils/spec-utils'
  '../utils/spec-matchers'
],  ({node, browserTrigger}, matchers)->

  ({beforeEachRequire})->
    beforeEachRequire [
      'dom/events'
    ], (@events)->
      @addMatchers matchers
      @element = node 'div'
      @domFixture.appendChild @element
      {@on,@off} = @events

    describe 'on( element:DOMNode, type:string, handler:function, ctx?:object)', ->
      it 'should on to window on hashchange', ->
        eventFn = undefined
        window =
          addEventListener: (type, fn)->
            expect(type).toEqual 'hashchange'
            eventFn = fn
            return

          removeEventListener: ->

          attachEvent: (type, fn)->
            expect(type).toEqual 'onhashchange'
            eventFn = fn
            return

          detachEvent: ->

        handler = jasmine.createSpy 'onHashChange'

        @events.on window, 'hashchange', handler
        eventFn type: 'hashchange'
        expect(handler).toHaveBeenCalled()

      it 'should set event.target on IE', ->
        called = false
        @events.on @element, 'click', (event)=>
          expect(event.target).toBe @element
          called = true
        browserTrigger @element, 'click'
        expect(called).toBe true

      it 'should have event.isDefaultPrevented method', ->
        @events.on @element, 'click', (e)->
          expect(->
            expect(e.isDefaultPrevented()).toBe(false)
            e.preventDefault()
            expect(e.isDefaultPrevented()).toBe(true)
          ).not.toThrow()

        browserTrigger @element, 'click'

      it 'should call handler with this set to ctx if ctx provided', ->
        @events.on @element, 'click', (@handler = jasmine.createSpy 'click'), (@ctx = {})
        browserTrigger @element, 'click'
        expect(@handler.calls[0].object).toBe @ctx


      describe 'mouseenter-mouseleave', ->
        beforeEach ->
          @log = ''
          @root = node 'div'
          @root.appendChild @parent = node 'p'
          @parent.appendChild @child = node 'span'
          @root.appendChild @sibling = node 'ul'

          @events.on @parent, 'mouseenter', => @log += 'parentEnter'
          @events.on @parent, 'mouseleave', => @log += 'parentLeave'

          @parent.mouseover = => browserTrigger @parent, 'mouseover'
          @parent.mouseout = => browserTrigger @parent, 'mouseout'

          @events.on @child, 'mouseenter', => @log += 'childEnter'
          @events.on @child, 'mouseleave', => @log += 'childLeave'

          @child.mouseover = => browserTrigger @child, 'mouseover'
          @child.mouseout = => browserTrigger @child, 'mouseout'

        it 'should fire mouseenter when coming from outside the browser window', ->
          @parent.mouseover()
          expect(@log).toEqual('parentEnter')

          @child.mouseover()
          expect(@log).toEqual('parentEnterchildEnter')
          @child.mouseover()
          expect(@log).toEqual('parentEnterchildEnter')

          @child.mouseout()
          expect(@log).toEqual('parentEnterchildEnter')
          @child.mouseout()
          expect(@log).toEqual('parentEnterchildEnterchildLeave')
          @parent.mouseout()
          expect(@log).toEqual('parentEnterchildEnterchildLeaveparentLeave')


    describe 'off', ->

      it 'should do nothing when no listener was registered with bound', ->
        @events.off @element
        @events.off @element, 'click'
        @events.off @element, 'click', ->

      it 'should deregister all listeners', ->
        clickSpy = jasmine.createSpy 'click'
        mouseoverSpy = jasmine.createSpy 'mouseover'

        @on @element, 'click', clickSpy
        @on @element, 'mouseover', mouseoverSpy

        browserTrigger @element, 'click'
        expect(clickSpy).toHaveBeenCalledOnce()
        browserTrigger @element, 'mouseover'
        expect(mouseoverSpy).toHaveBeenCalledOnce()

        clickSpy.reset()
        mouseoverSpy.reset()

        @off @element

        browserTrigger @element, 'click'
        expect(clickSpy).not.toHaveBeenCalled()
        browserTrigger @element, 'mouseover'
        expect(mouseoverSpy).not.toHaveBeenCalled()

      it 'should deregister listeners for specific type', ->
        clickSpy = jasmine.createSpy('click')
        mouseoverSpy = jasmine.createSpy('mouseover')

        @on @element, 'click', clickSpy
        @on @element, 'mouseover', mouseoverSpy

        browserTrigger @element, 'click'
        expect(clickSpy).toHaveBeenCalledOnce()
        browserTrigger @element, 'mouseover'
        expect(mouseoverSpy).toHaveBeenCalledOnce()

        clickSpy.reset()
        mouseoverSpy.reset()

        @off @element, 'click'

        browserTrigger @element, 'click'
        expect(clickSpy).not.toHaveBeenCalled()
        browserTrigger @element, 'mouseover'
        expect(mouseoverSpy).toHaveBeenCalledOnce()

        mouseoverSpy.reset()

        @off @element, 'mouseover'
        browserTrigger @element, 'mouseover'
        expect(mouseoverSpy).not.toHaveBeenCalled()


      it 'should deregister a specific listener', ->
        clickSpy1 = jasmine.createSpy('click1')
        clickSpy2 = jasmine.createSpy('click2')

        @on @element, 'click', clickSpy1
        @on @element, 'click', clickSpy2

        browserTrigger @element, 'click'
        expect(clickSpy1).toHaveBeenCalledOnce()
        expect(clickSpy2).toHaveBeenCalledOnce()

        clickSpy1.reset()
        clickSpy2.reset()

        @off @element, 'click', clickSpy1

        browserTrigger @element, 'click'
        expect(clickSpy1).not.toHaveBeenCalled()
        expect(clickSpy2).toHaveBeenCalledOnce()

        clickSpy2.reset()

        @off @element, 'click', clickSpy2
        browserTrigger @element, 'click'
        expect(clickSpy2).not.toHaveBeenCalled()
