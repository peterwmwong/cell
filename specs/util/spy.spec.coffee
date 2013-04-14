define ['spec-utils'], ({waitOne})->
  ({beforeEachRequire})->

    beforeEachRequire [
      'cell/Model'
      'cell/Collection'
      'cell/util/spy'
    ], (@Model, @Collection, @spy)->
      @watch = @spy.watch
      @unwatch = @spy.unwatch
      @suspendWatch = @spy.suspendWatch


    describe '@suspendWatch( func:function )', ->
      beforeEach ->
        @model = new @Model before:1, during:2, after:3
        @watch 'key1',
          @func = jasmine.createSpy('func').andCallFake =>
            @model.get 'before'
            @suspendWatch => @model.get 'during'
            @model.get 'after'
            return
          @callback = jasmine.createSpy 'callback'

        @func.reset()
        @callback.reset()

      it 'when models that are accessed BEFORE are recorded', ->
        @model.set 'before', 2
        waitOne ->
          expect(@callback.callCount).toBe 1
          expect(@func.callCount).toBe 1


      it 'when models that are accessed DURING are NOT recorded', ->
        @model.set 'during', 3
        waitOne ->
          expect(@callback.callCount).toBe 0
          expect(@func.callCount).toBe 0


      it 'when models that are accessed AFTER are recorded', ->
        @model.set 'after', 4
        waitOne ->
          expect(@callback.callCount).toBe 1
          expect(@func.callCount).toBe 1

    describe '@unwatch( context:any )', ->
      beforeEach ->

        @model = new @Model a:1, b:{}, c:'x'
        @callback = jasmine.createSpy('callback')
        @func = jasmine.createSpy('func').andCallFake => @model.attributes()

        @callback2 = jasmine.createSpy 'callback'
        @func2 = jasmine.createSpy('func').andCallFake => @model.attributes()

        @context = 'key1'
        @watch @context, @func, @callback
        @watch 'key2', @func2, @callback2

        @callback.reset()
        @func.reset()
        @callback2.reset()
        @func2.reset()

      it 'removes all watched expressions registered under key', ->
        @unwatch @context
        @model.set 'a', 2
        waitOne ->
          expect(@callback).not.toHaveBeenCalled()
          expect(@func).not.toHaveBeenCalled()
          expect(@callback2).toHaveBeenCalled()
          expect(@func2).toHaveBeenCalled()

      it 'removes all watched expressions registered ONLY under key', ->
        @unwatch 'key2'
        @model.set 'a', 2
        waitOne ->
          expect(@callback).toHaveBeenCalled()
          expect(@func).toHaveBeenCalled()
          expect(@callback2).not.toHaveBeenCalled()
          expect(@func2).not.toHaveBeenCalled()

      it 'does nothing if key has no watches', ->
        @unwatch 'bogus key'
        @model.set 'a', 2
        waitOne ->
          expect(@callback).toHaveBeenCalled()
          expect(@func).toHaveBeenCalled()
          expect(@callback2).toHaveBeenCalled()
          expect(@func2).toHaveBeenCalled()

    describe '@watch( context:any, func:function, callback:function, callContext?:any )', ->
      beforeEach ->
        @context = {}
        @value = {}
        @callback = jasmine.createSpy 'callback'
      
      describe "when callContext is specified", ->

        beforeEach ->
          @callContext = {}
          @model = new @Model a:1, b:{}, c:'x'
          @func = jasmine.createSpy('func').andCallFake => @model.attributes()
          @watch @context, @func, @callback, @callContext

        it 'calls callback with result of func with callContext as `this`', ->
          expect(@func.callCount).toBe 1
          expect(@func.calls[0].object).toBe @context
          expect(@callback).toHaveBeenCalledWith @model.attributes()
          expect(@callback.callCount).toBe 1
          expect(@callback.calls[0].object).toBe @callContext

        describe 'when the accessed model property changes', ->
          beforeEach ->
            @func.reset()
            @callback.reset()
            @model.set 'a', 2

          it 'calls callback with result of func', ->
            waitOne ->
              expect(@func.callCount).toBe 1
              expect(@func.calls[0].object).toBe @context
              expect(@callback).toHaveBeenCalledWith @model.attributes()
              expect(@callback.callCount).toBe 1
              expect(@callback.calls[0].object).toBe @callContext

      describe "Nested watches", ->
        beforeEach ->
          @model = new @Model a:1, b:'b', c:'c'
          @callback2 = jasmine.createSpy 'callback2'
          @callback3 = jasmine.createSpy 'callback3'
          @watch @context,
            =>
              a = @model.get 'a'
              @watch @context,
                =>
                  b = @model.get 'b'
                  @watch @context, (=> @model.get 'c'), @callback3
                  b
                @callback2
              a
            @callback

          @callback.reset()
          @callback2.reset()
          @callback3.reset()

        it "calls callback when accessed Model's change", ->
          @model.set 'a', 2
          waitOne ->
            expect(@callback).toHaveBeenCalledWith 2

        it "calls nested watch callback when accessed Model's change", ->
          @model.set 'b', 'b2'
          waitOne ->
            expect(@callback).not.toHaveBeenCalled()
            expect(@callback2).toHaveBeenCalledWith 'b2'

        it "calls a doubly-nested watch callback when accessed Model's change", ->
          @model.set 'c', 'c2'
          waitOne ->
            expect(@callback).not.toHaveBeenCalled()
            expect(@callback2).not.toHaveBeenCalled()
            expect(@callback3).toHaveBeenCalledWith 'c2'

      describe "When func does NOT access any Model or Collection", ->
        beforeEach ->
          @func = jasmine.createSpy('func').andReturn @value
          @watch @context, @func, @callback

        it 'call callback with result of func', ->
          done = false
          runs -> setTimeout (-> done = true), 1
          waitsFor -> done
          runs ->
            expect(@func.callCount).toBe 1
            expect(@func.calls[0].object).toBe @context
            expect(@callback).toHaveBeenCalledWith @value
            expect(@callback.callCount).toBe 1
            expect(@callback.calls[0].object).toBe @context

      describe "When func's accesses Model's differently from call to call", ->
        beforeEach ->
          @model = new @Model a:1, b:'b', c:'c'
          @model2 = new @Model x:777
          @func = jasmine.createSpy('func').andCallFake =>
            if 1 is @model.get 'a'
              @model.get 'b'
              @model2.get 'x'
            else
              @model.get 'c'

          @watch @context, @func, @callback
          @func.reset()
          @callback.reset()

        it "doesn't call callback when non-relevant model attributes change", ->
          @model.set 'c', 'c2'
          waitOne ->
            expect(@callback).not.toHaveBeenCalled()

        describe 'when a change causes func to access different Model attributes', ->
          beforeEach ->
            @callback.reset()
            @model.set 'a', 2
            waitOne ->

          it 'does not register listeners to already monitored events', ->
            expect(@model._e['change:a'].length).toBe 1

          it 'calls callback', ->
            expect(@callback).toHaveBeenCalledWith 'c'

          describe 'when a no longer accessed model attribute changes', ->
            beforeEach ->
              @callback.reset()
              @model.set 'b', 'b2'

            it 'does NOT call callback', ->
              waitOne ->
                expect(@callback).not.toHaveBeenCalled()


          describe 'when the newly accessed model attribute changes', ->
            beforeEach ->
              @callback.reset()
              @model.set 'c', 'c3'

            it 'calls callback', ->
              waitOne ->
                expect(@callback).toHaveBeenCalledWith 'c3'


      describe "When func accesses a Model's attributes()", ->
        beforeEach ->
          @model = new @Model a:1, b:{}, c:'x'
          @func = jasmine.createSpy('func').andCallFake => @model.attributes()
          @watch @context, @func, @callback

        it 'call @callback with result of func', ->
          expect(@func.callCount).toBe 1
          expect(@func.calls[0].object).toBe @context
          expect(@callback).toHaveBeenCalledWith @model.attributes()
          expect(@callback.callCount).toBe 1
          expect(@callback.calls[0].object).toBe @context

        describe 'when the accessed model property changes', ->
          beforeEach ->
            @func.reset()
            @callback.reset()
            @model.set 'a', 2

          it 'calls callback with result of func', ->
            waitOne ->
              expect(@func.callCount).toBe 1
              expect(@func.calls[0].object).toBe @context
              expect(@callback).toHaveBeenCalledWith @model.attributes()
              expect(@callback.callCount).toBe 1
              expect(@callback.calls[0].object).toBe @context


      describe "When func accesses a Model's attributes() and a property", ->
        beforeEach ->
          @model = new @Model a:1, b:{}, c:'x'
          @func = jasmine.createSpy('func').andCallFake =>
            @model.get 'a'
            @model.attributes()
          @watch @context, @func, @callback

        it 'call @callback with result of func', ->
          expect(@func.callCount).toBe 1
          expect(@func.calls[0].object).toBe @context
          expect(@callback).toHaveBeenCalledWith @model.attributes()
          expect(@callback.callCount).toBe 1
          expect(@callback.calls[0].object).toBe @context

        describe 'when the accessed model property changes', ->
          beforeEach ->
            @func.reset()
            @callback.reset()
            @model.set 'a', 2

          it 'calls callback with result of func', ->
            waitOne ->
              expect(@func.callCount).toBe 1
              expect(@callback).toHaveBeenCalledWith @model.attributes()
              expect(@callback.callCount).toBe 1


      describe "When func accesses multiple Models", ->
        beforeEach ->
          @model1 = new @Model a:1
          @model2 = new @Model b:2
          @func = jasmine.createSpy('func').andCallFake =>
            @model1.get 'a'
            @model2.get 'b'
          @watch @context, @func, @callback

        it 'call @callback with result of func', ->
          expect(@func.callCount).toBe 1
          expect(@func.calls[0].object).toBe @context
          expect(@callback).toHaveBeenCalledWith 2
          expect(@callback.callCount).toBe 1
          expect(@callback.calls[0].object).toBe @context

        describe 'when the accessed model property changes', ->
          beforeEach ->
            @func.reset()
            @callback.reset()
            @model1.set 'a', 2

          it 'calls callback with result of func', ->
            waitOne ->
              expect(@func.callCount).toBe 1
              expect(@func.calls[0].object).toBe @context
              expect(@callback).toHaveBeenCalledWith 2
              expect(@callback.callCount).toBe 1
              expect(@callback.calls[0].object).toBe @context

        describe 'when the other accessed model property changes', ->
          beforeEach ->
            @func.reset()
            @callback.reset()
            @model2.set 'b', 3

          it 'calls callback with result of func', ->
            waitOne ->
              expect(@func.callCount).toBe 1
              expect(@func.calls[0].object).toBe @context
              expect(@callback).toHaveBeenCalledWith 3
              expect(@callback.callCount).toBe 1
              expect(@callback.calls[0].object).toBe @context

      describe "When func accesses a Model's properties", ->
        beforeEach ->
          @model = new @Model a:1, b:{}, c:'x'

          @func = jasmine.createSpy('func').andCallFake =>
            @model.get 'c'
            @model.get 'a'

          @watch @context, @func, @callback

        it 'call @callback with result of func', ->
          expect(@func.callCount).toBe 1
          expect(@func.calls[0].object).toBe @context
          expect(@callback).toHaveBeenCalledWith 1
          expect(@callback.callCount).toBe 1
          expect(@callback.calls[0].object).toBe @context

        describe 'when the accessed model property changes', ->
          beforeEach ->
            @func.reset()
            @callback.reset()
            @model.set 'a', 2

          it 'calls callback with result of func', ->
            waitOne ->
              expect(@func.callCount).toBe 1
              expect(@func.calls[0].object).toBe @context
              expect(@callback).toHaveBeenCalledWith 2
              expect(@callback.callCount).toBe 1
              expect(@callback.calls[0].object).toBe @context

          describe 'when another accessed model property changes', ->
            beforeEach ->
              @func.reset()
              @callback.reset()
              @model.set 'c', 'y'

            it 'calls callback with result of func', ->
              waitOne ->
                expect(@func.callCount).toBe 1
                expect(@func.calls[0].object).toBe @context
                expect(@callback).toHaveBeenCalledWith 2
                expect(@callback.callCount).toBe 1
                expect(@callback.calls[0].object).toBe @context

        describe 'when another model property changes or other non-relevant events occur', ->
          beforeEach ->
            @func.reset()
            @callback.reset()
            @model.set 'b', 2
            @model.trigger 'bogus'

          it 'calls callback with result of func', ->
            expect(@func).not.toHaveBeenCalled()
            expect(@callback).not.toHaveBeenCalled()


      describe "When func accesses a Model part of a Collection", ->
        beforeEach ->
          @col = new @Collection [
            {x:'x val'}
            {y:'y val'}
          ]
          @model0 = @col.at 0
          @model1 = @col.at 1

          @func = jasmine.createSpy('func').andCallFake =>
            @col.at(0).get 'x'
          @watch @context, @func, @callback
          @func.reset()
          @callback.reset()

        it 'calls func when an accessed Model attribute changes in a Collection', ->
          @model1.set 'x', 'a value'
          waitOne ->
            expect(@func.callCount).toBe 1
            expect(@func.calls[0].object).toBe @context
            expect(@callback).toHaveBeenCalledWith 'x val'
            expect(@callback.callCount).toBe 1
            expect(@callback.calls[0].object).toBe @context


        it 'calls func when an accessed Model attribute changes in a Collection of another Model', ->
          @model0.set 'x', 'a value'
          waitOne ->
            expect(@func.callCount).toBe 1
            expect(@func.calls[0].object).toBe @context
            expect(@callback).toHaveBeenCalledWith 'a value'
            expect(@callback.callCount).toBe 1
            expect(@callback.calls[0].object).toBe @context

      describe "When func accesses a Collection using filterBy() (Model attribute access is implied)", ->
        beforeEach ->
          @col = new @Collection [
            {x:'x val'}
            {y:'y val'}
          ]
          @func = jasmine.createSpy('func').andCallFake => @col.filterBy x: 'x val'
          @watch @context, @func, @callback
          @func.reset()
          @callback.reset()

        describe "and an accessed Model attribute changes", ->
          beforeEach ->
            @col.at(1).set 'x', 'x val 2'

          it "calls callback with result of func", ->
            waitOne ->
              expect(@func.callCount).toBe 1
              expect(@func.calls[0].object).toBe @context
              expect(@callback.calls[0].args[0][0]).toBe @col.at 0
              expect(@callback.callCount).toBe 1
              expect(@callback.calls[0].object).toBe @context

      describe "When func accesses a Collection", ->
        beforeEach ->
          @col = new @Collection [
            {x:'x val'}
            {y:'y val'}
          ]

        methodAccess =
          at: -> @col.at 0
          length: -> @col.length()
          indexOf: -> @col.indexOf {}
          toArray: -> @col.toArray()
          each: -> @col.each ->
          map: -> @col.map ->
          filterBy: -> @col.filterBy a: 1
          reduce: -> @col.reduce 0, ->

        for methodName, access of methodAccess then do(methodName,access)->
          describe "by calling #{methodName}()", ->
            beforeEach ->
              result = 1
              @func = jasmine.createSpy('func').andCallFake =>
                access.call @
                result++

              @watch @context, @func, @callback
              @callback.reset()
              @func.reset()

            changes =
              'a model was added': -> @col.add x:'another x val'
              'a model was removed': -> @col.remove @col.at 0

            for changeDesc,changeFunc of changes then do(changeDesc,changeFunc)->

              describe "when the collection changes because #{changeDesc}", ->
                beforeEach ->
                  changeFunc.call @

                it 'calls callback with result of func', ->
                  waitOne ->
                    expect(@func.callCount).toBe 1
                    expect(@func.calls[0].object).toBe @context
                    expect(@callback).toHaveBeenCalledWith 2
                    expect(@callback.callCount).toBe 1
                    expect(@callback.calls[0].object).toBe @context

        describe 'and access changes', ->
          beforeEach ->
            @watch @context,
              =>if @col.length() is 2
                  @col.add z:'z val'
                else
                  @col.at(0).get 'x'
              @callback

          describe 'collection changes', ->
            beforeEach ->
              @col.add a:'a val'
              waitOne ->
                @callback.reset()
                @col.add b:'b val'

            it 'calls callback', ->
              waitOne ->
                expect(@callback).toHaveBeenCalled()

        describe 'and Models contained in the Collection', ->
          
          beforeEach ->
            @watch @context,
              =>
                @col.at(0).get 'x'
                @col.each (model)-> model.get 'x'
                @col.map (model)-> model.get 'x'
                @col.filterBy x: 'some value'
                @col.reduce 0, (sum, model)-> model.get 'x'
              @callback
            @callback.reset()

          it 'should not add any listeners to the model', ->
            expect(@col.at(0)._e['change:x']).toBeUndefined()
            expect(@col.at(1)._e['change:x']).toBeUndefined()

        describe 'using filterBy()', ->

          describe 'when filtering by a property with any value (ex. filterBy({a:null}) )', ->

            beforeEach ->
              @watch @context, (=> @col.filterBy x:null), @callback
              @callback.reset()

            describe 'when model changes', ->
              beforeEach ->
                @col.at(0).set 'x', 'new value'

              it 'does NOT call callback', ->
                waitOne ->
                  expect(@callback).not.toHaveBeenCalled()


          describe 'when filtering by a property', ->

            beforeEach ->
              @watch @context, (=> @col.filterBy x:'bogus'), @callback
              @callback.reset()

            describe 'when model changes', ->
              beforeEach ->
                @col.at(0).set 'x', 'bogus'

              it 'calls callback', ->
                waitOne ->
                  expect(@callback).toHaveBeenCalledWith [@col.at 0]


