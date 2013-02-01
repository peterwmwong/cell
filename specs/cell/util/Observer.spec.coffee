define ->
  ({beforeEachRequire})->

    beforeEachRequire [
      'cell/Model'
      'cell/Collection'
      'cell/util/Observer'
    ], (@Model, @Collection, @Observer)->
      @watch = @Observer.watch

    describe '@watch( func:function, callback:function )', ->
      beforeEach ->
        @value = {}
        @callback = jasmine.createSpy 'callback'
        
      describe "When func does NOT access any Model or Collection", ->
        beforeEach ->
          @func = jasmine.createSpy('func').andReturn @value
          @watch @func, @callback

        it 'call callback with result of func', ->
          expect(@func).toHaveBeenCalled()
          expect(@func.callCount).toBe 1
          expect(@callback).toHaveBeenCalledWith @value
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

      # describe "When func accesses a Collection", ->
      #   beforeEach ->
      #     @collection = new @Collection x:'x val'

      #   it 'call @callback with result of func', ->
      #     expect(@func).toHaveBeenCalled()
      #     expect(@func.callCount).toBe 1
      #     expect(@callback).toHaveBeenCalledWith 1
      #     expect(@callback.callCount).toBe 1

      #   methodAccess =
      #     length: -> @collection.length()
      #     at: -> @collection.at 0
      #     filter: -> @collection.filter x:'x val'

      #   for methodName, access of methodAccess then do(methodName,access)->
      #     describe "by calling #{methodName}()", ->
      #       beforeEach ->
      #         result = 1
      #         @func = jasmine.createSpy('func').andCallThrough =>
      #           access.call @
      #           result++

      #         @watch @func, @callback

      #       changes =
      #         'a model was added': -> @collection.add x:'another x val'
      #         'a model was removed': -> @collection.remove @collection.at 0
      #         'a contained model changed': -> @collection.at(0).set 'x', 'new x val'

      #       for changeDesc, changeFunc of changes then do(changeDesc,changeFunc)->

      #         describe "when the collection changes because #{changeDesc}", ->
      #           beforeEach ->
      #             changeFunc.call @

      #           it 'calls callback with result of func', ->
      #             expect(@func).toHaveBeenCalled()
      #             expect(@func.callCount).toBe 1
      #             expect(@callback).toHaveBeenCalledWith 2
      #             expect(@callback.callCount).toBe 1
