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
      {@bind,@unbind} = @events

    describe 'bind', ->
      it 'should bind to window on hashchange', ->
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

        @events.bind window, 'hashchange', handler
        eventFn type: 'hashchange'
        expect(handler).toHaveBeenCalled()


      it 'should bind to all events separated by space', ->
        callback = jasmine.createSpy 'callback'

        @events.bind @element, 'click keypress', callback
        @events.bind @element, 'click', callback

        browserTrigger @element, 'click'
        expect(callback).toHaveBeenCalled()
        expect(callback.callCount).toBe 2

        callback.reset()
        browserTrigger @element, 'keypress'
        expect(callback).toHaveBeenCalled()
        expect(callback.callCount).toBe(1)

      it 'should set event.target on IE', ->
        called = false
        @events.bind @element, 'click', (event)=>
          expect(event.target).toBe @element
          called = true
        browserTrigger @element, 'click'
        expect(called).toBe true

      it 'should have event.isDefaultPrevented method', ->
        @events.bind @element, 'click', (e)->
          expect(->
            expect(e.isDefaultPrevented()).toBe(false)
            e.preventDefault()
            expect(e.isDefaultPrevented()).toBe(true)
          ).not.toThrow()

        browserTrigger @element, 'click'

      describe 'mouseenter-mouseleave', ->
        beforeEach ->
          @log = ''
          @root = node 'div'
          @root.appendChild @parent = node 'p'
          @parent.appendChild @child = node 'span'
          @root.appendChild @sibling = node 'ul'

          @events.bind @parent, 'mouseenter', => @log += 'parentEnter'
          @events.bind @parent, 'mouseleave', => @log += 'parentLeave'

          @parent.mouseover = => browserTrigger @parent, 'mouseover'
          @parent.mouseout = => browserTrigger @parent, 'mouseout'

          @events.bind @child, 'mouseenter', => @log += 'childEnter'
          @events.bind @child, 'mouseleave', => @log += 'childLeave'

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


    describe 'unbind', ->

      it 'should do nothing when no listener was registered with bound', ->
        @events.unbind @element
        @events.unbind @element, 'click'
        @events.unbind @element, 'click', ->

      it 'should deregister all listeners', ->
        clickSpy = jasmine.createSpy 'click'
        mouseoverSpy = jasmine.createSpy 'mouseover'

        @bind @element, 'click', clickSpy
        @bind @element, 'mouseover', mouseoverSpy

        browserTrigger @element, 'click'
        expect(clickSpy).toHaveBeenCalledOnce()
        browserTrigger @element, 'mouseover'
        expect(mouseoverSpy).toHaveBeenCalledOnce()

        clickSpy.reset()
        mouseoverSpy.reset()

        @unbind @element

        browserTrigger @element, 'click'
        expect(clickSpy).not.toHaveBeenCalled()
        browserTrigger @element, 'mouseover'
        expect(mouseoverSpy).not.toHaveBeenCalled()

      it 'should deregister listeners for specific type', ->
        clickSpy = jasmine.createSpy('click')
        mouseoverSpy = jasmine.createSpy('mouseover')

        @bind @element, 'click', clickSpy
        @bind @element, 'mouseover', mouseoverSpy

        browserTrigger @element, 'click'
        expect(clickSpy).toHaveBeenCalledOnce()
        browserTrigger @element, 'mouseover'
        expect(mouseoverSpy).toHaveBeenCalledOnce()

        clickSpy.reset()
        mouseoverSpy.reset()

        @unbind @element, 'click'

        browserTrigger @element, 'click'
        expect(clickSpy).not.toHaveBeenCalled()
        browserTrigger @element, 'mouseover'
        expect(mouseoverSpy).toHaveBeenCalledOnce()

        mouseoverSpy.reset()

        @unbind @element, 'mouseover'
        browserTrigger @element, 'mouseover'
        expect(mouseoverSpy).not.toHaveBeenCalled()


      it 'should deregister specific listener', ->
        clickSpy1 = jasmine.createSpy('click1')
        clickSpy2 = jasmine.createSpy('click2')

        @bind @element, 'click', clickSpy1
        @bind @element, 'click', clickSpy2

        browserTrigger @element, 'click'
        expect(clickSpy1).toHaveBeenCalledOnce()
        expect(clickSpy2).toHaveBeenCalledOnce()

        clickSpy1.reset()
        clickSpy2.reset()

        @unbind @element, 'click', clickSpy1

        browserTrigger @element, 'click'
        expect(clickSpy1).not.toHaveBeenCalled()
        expect(clickSpy2).toHaveBeenCalledOnce()

        clickSpy2.reset()

        @unbind @element, 'click', clickSpy2
        browserTrigger @element, 'click'
        expect(clickSpy2).not.toHaveBeenCalled()
