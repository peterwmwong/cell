define ['../utils/spec-utils'], ({nodeHTMLEquals,stringify,node,browserTrigger})->

  ({beforeEachRequire})->

    beforeEachRequire ['util/extend'], (@extend)->

    describe 'Parent.extend( prototypeProps:object )', ->
      beforeEach ->
        @Parent = jasmine.createSpy 'parent constructor'
        @Parent::a = {}
        @Parent::b = {}
        @Parent.extend = @extend

      describe 'prototypeProps is undefined', ->
        beforeEach ->
          @Child = @Parent.extend()
          @child = new @Child()

        it 'creates an instanceof Parent', ->
          expect(@Child.prototype instanceof @Parent).toBe true
          expect(@Parent).toHaveBeenCalled()
          expect(@Parent.callCount).toBe 1
          expect(@child instanceof @Parent).toBe true
          expect(@child.a).toBe @Parent::a
          expect(@child.b).toBe @Parent::b

        it 'adds extend method', ->
          expect(@Child.extend).toBe @extend

      describe 'prototypeProps is an object hash', ->
        beforeEach ->
          @Child = @Parent.extend
            constructor: @constr = jasmine.createSpy('constructor')
            b: @child_b = {}
            c: @child_c = {}
          @child = new @Child 1, 2, 3

        it 'creates an instanceof Parent', ->
          expect(@Child.prototype instanceof @Parent).toBe true
          expect(@constr).toHaveBeenCalledWith 1, 2, 3
          expect(@Parent).toHaveBeenCalledWith 1, 2, 3
          expect(@Parent.callCount).toBe 1
          expect(@child instanceof @Parent).toBe true

        it 'adds extend method', ->
          expect(@Child.extend).toBe @extend

        it 'copies over properties from prototypeProps', ->
          expect(@Child::a).toBe @Parent::a
          expect(@Child::b).toBe @child_b
          expect(@Child::c).toBe @child_c
          expect(@child.constructor).toBe @constr
          expect(@child.b).toBe @child_b
          expect(@child.c).toBe @child_c
