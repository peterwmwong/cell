define ['../../utils/spec-utils'], ({waitOne})->
  ({beforeEachRequire})->

    beforeEachRequire [
      'cell/Model'
      'cell/Collection'
      'cell/util/spy'
    ], (@Model, @Collection, @spy)->
      @watch = @spy.watch

    describe '@watch( func:function, callback:function )', ->
      beforeEach ->
        @value = {}
        @callback = jasmine.createSpy 'callback'

      describe "When func does NOT access any Model or Collection", ->
        beforeEach ->
          @func = jasmine.createSpy('func').andReturn @value
          @watch @func, @callback

        it 'call callback with result of func', ->
          done = false
          runs -> setTimeout (-> done = true), 1
          waitsFor -> done
          runs ->
            expect(@func).toHaveBeenCalled()
            expect(@func.callCount).toBe 1
            expect(@callback).toHaveBeenCalledWith @value
            expect(@callback.callCount).toBe 1

      describe "When func accesses a Model's attributes()", ->
        beforeEach ->
          @model = new @Model a:1, b:{}, c:'x'
          @func = jasmine.createSpy('func').andCallFake => @model.attributes()
          @watch @func, @callback

        it 'call @callback with result of func', ->
          expect(@func.callCount).toBe 1
          expect(@callback).toHaveBeenCalledWith @model.attributes()
          expect(@callback.callCount).toBe 1

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


      describe "When func accesses a Model's attributes() and a property", ->
        beforeEach ->
          @model = new @Model a:1, b:{}, c:'x'
          @func = jasmine.createSpy('func').andCallFake =>
            @model.get 'a'
            @model.attributes()
          @watch @func, @callback

        it 'call @callback with result of func', ->
          expect(@func.callCount).toBe 1
          expect(@callback).toHaveBeenCalledWith @model.attributes()
          expect(@callback.callCount).toBe 1

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
          @watch @func, @callback

        it 'call @callback with result of func', ->
          expect(@func.callCount).toBe 1
          expect(@callback).toHaveBeenCalledWith 2
          expect(@callback.callCount).toBe 1

        describe 'when the accessed model property changes', ->
          beforeEach ->
            @func.reset()
            @callback.reset()
            @model1.set 'a', 2

          it 'calls callback with result of func', ->
            waitOne ->
              expect(@func.callCount).toBe 1
              expect(@callback).toHaveBeenCalledWith 2
              expect(@callback.callCount).toBe 1

        describe 'when the other accessed model property changes', ->
          beforeEach ->
            @func.reset()
            @callback.reset()
            @model2.set 'b', 3

          it 'calls callback with result of func', ->
            waitOne ->
              expect(@func.callCount).toBe 1
              expect(@callback).toHaveBeenCalledWith 3
              expect(@callback.callCount).toBe 1

      describe "When func accesses a Model's properties", ->
        beforeEach ->
          @model = new @Model a:1, b:{}, c:'x'

          @func = jasmine.createSpy('func').andCallFake =>
            @model.get 'c'
            @model.get 'a'

          @watch @func, @callback

        it 'call @callback with result of func', ->
          expect(@func).toHaveBeenCalled()
          expect(@func.callCount).toBe 1
          expect(@callback).toHaveBeenCalledWith 1
          expect(@callback.callCount).toBe 1

        describe 'when the accessed model property changes', ->
          beforeEach ->
            @func.reset()
            @callback.reset()
            @model.set 'a', 2

          it 'calls callback with result of func', ->
            waitOne ->
              expect(@func).toHaveBeenCalled()
              expect(@func.callCount).toBe 1
              expect(@callback).toHaveBeenCalledWith 2
              expect(@callback.callCount).toBe 1

          describe 'when another accessed model property changes', ->
            beforeEach ->
              @func.reset()
              @callback.reset()
              @model.set 'c', 'y'

            it 'calls callback with result of func', ->
              waitOne ->
                expect(@func).toHaveBeenCalled()
                expect(@func.callCount).toBe 1
                expect(@callback).toHaveBeenCalledWith 2
                expect(@callback.callCount).toBe 1

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

          @func = jasmine.createSpy('func').andCallFake => @col.at(0).get 'x'
          @watch @func, @callback
          
          @func.reset()
          @callback.reset()

        it 'calls func when an accessed a Model attribute changes in a Collection', ->
          @model1.set 'x', 'a value'
          waitOne ->
            expect(@func).toHaveBeenCalled()
            expect(@func.callCount).toBe 1
            expect(@callback).toHaveBeenCalledWith 'x val'
            expect(@callback.callCount).toBe 1


        it 'calls func when an accessed a Model attribute changes in a Collection of another Model', ->
          @model0.set 'x', 'a value'
          waitOne ->
            expect(@func).toHaveBeenCalled()
            expect(@func.callCount).toBe 1
            expect(@callback).toHaveBeenCalledWith 'a value'
            expect(@callback.callCount).toBe 1

      describe "When func accesses a Collection using filterBy() (Model attribute access is implied)", ->
        beforeEach ->
          @col = new @Collection [
            {x:'x val'}
            {y:'y val'}
          ]
          @func = jasmine.createSpy('func').andCallFake => @col.filterBy x: 'x val'
          @watch @func, @callback
          @func.reset()
          @callback.reset()

        describe "and an accessed Model attribute changes", ->
          beforeEach ->
            @col.at(1).set 'x', 'x val 2'

          it "calls callback with result of func", ->
            waitOne ->
              expect(@func).toHaveBeenCalled()
              expect(@func.callCount).toBe 1
              expect(@callback.calls[0].args[0][0]).toBe @col.at 0
              expect(@callback.callCount).toBe 1

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

              @watch @func, @callback
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
                    expect(@func).toHaveBeenCalled()
                    expect(@func.callCount).toBe 1
                    expect(@callback).toHaveBeenCalledWith 2
                    expect(@callback.callCount).toBe 1
