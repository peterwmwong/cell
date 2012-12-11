define ['./spec-utils'], ({nodeHTMLEquals,stringify,node})->

  ({beforeEachRequire})->

    beforeEachRequire [
      'ref'
      'backbone'
    ], (@ref, @Backbone)->
      @model = new @Backbone.Model a: 7, b: 17, c: 27
      @transform = jasmine.createSpy('transform').andCallFake -> 8
      @context = {}

    describe 'Backbone.Model', ->

      describe '@ref(attrs:{string | string[]}, transform?:function( attr_vals:{string | string[]} ), context?:object )', ->

        it '@ref( {undefined | function | number | object} ) returns undefined', ->
          expect(@model.ref()).toBeUndefined()
          expect(@model.ref(undefined)).toBeUndefined()
          expect(@model.ref(null)).toBeUndefined()
          expect(@model.ref(->)).toBeUndefined()
          expect(@model.ref(5)).toBeUndefined()
          expect(@model.ref({})).toBeUndefined()

        describe "@ref( string )", ->
          beforeEach ->
            @reference = @model.ref 'a'

          it 'returns a Reference', ->
            expect(@reference instanceof @ref.Reference).toBe true
            expect(@reference.value()).toBe 7

        describe "@ref( string, transform )", ->
          beforeEach ->
            @reference = @model.ref 'a', @transform
            @value = @reference.value()

          it 'calls transform and returns reference when value() is called', ->
            expect(@reference instanceof @ref.Reference).toBe true
            expect(@transform).toHaveBeenCalledWith 7
            expect(@transform.callCount).toBe 1
            expect(@value).toBe 8


        describe '@ref( string, transform, context )', ->
          beforeEach ->
            @reference = @model.ref 'a', @transform, @context
            @value = @reference.value()

          it 'calls transform (with this set to context) and returns reference when value() is called', ->
            expect(@reference instanceof @ref.Reference).toBe true
            expect(@transform.callCount).toBe 1
            expect(@transform).toHaveBeenCalledWith 7
            expect(@transform.calls[0].object).toBe @context
            expect(@value).toBe 8


        describe '@ref( string[] )', ->
          beforeEach ->
            @reference = @model.ref ['a','b']
            @value = @reference.value()

          it 'calls transform (with this set to context) and returns reference when value() is called', ->
            expect(@reference instanceof @ref.Reference).toBe true
            expect(@value).toEqual 7

          describe 'when multiple model attributes change', ->
            beforeEach ->
              @reference.on 'change', @onChange = jasmine.createSpy 'change'
              @model.set a: 9, b: 19

            it "'change' listeners are called once", ->
              stop = false
              setTimeout (=> stop = true), 0
              waitsFor -> stop
              runs =>
                expect(@onChange.callCount).toBe 1
                expect(@onChange).toHaveBeenCalledWith @reference, 9

        describe '@ref( string[], transform )', ->
          beforeEach ->
            @reference = @model.ref ['a','b'], @transform
            @value = @reference.value()

          it 'calls transform and returns reference when value() is called', ->
            expect(@reference instanceof @ref.Reference).toBe true
            expect(@transform.callCount).toBe 1
            expect(@transform).toHaveBeenCalledWith 7, 17
            expect(@value).toEqual 8

          describe 'when multiple model attributes change', ->
            beforeEach ->
              @transform.reset()
              @reference.on 'change', @onChange = jasmine.createSpy 'change'
              @model.set a: 9, b: 19

            it "'change' listeners are called once with the value of the reference", ->
              stop = false
              setTimeout (=> stop = true), 0
              waitsFor -> stop
              runs =>
                expect(@onChange.callCount).toBe 1
                expect(@onChange).toHaveBeenCalledWith @reference, 8

            it "calls transform with changed model attribute values", ->
              stop = false
              setTimeout (=> stop = true), 0
              waitsFor -> stop
              runs =>
                expect(@transform).toHaveBeenCalledWith 9, 19

        describe '@ref( string[], transform, context )', ->
          beforeEach ->
            @reference = @model.ref ['a','b'], @transform, @context
            @value = @reference.value()

          it 'calls transform (with this set to context) and returns reference when value() is called', ->
            expect(@reference instanceof @ref.Reference).toBe true
            expect(@transform.callCount).toBe 1
            expect(@transform).toHaveBeenCalledWith 7, 17
            expect(@transform.calls[0].object).toBe @context
            expect(@value).toEqual 8

          describe 'when multiple model attributes change', ->
            beforeEach ->
              @transform.reset()
              @reference.on 'change', @onChange = jasmine.createSpy 'change'
              @model.set a: 9, b: 19

            it "'change' listeners are called once with the value of the reference", ->
              stop = false
              setTimeout (=> stop = true), 0
              waitsFor -> stop
              runs =>
                expect(@onChange.callCount).toBe 1
                expect(@onChange).toHaveBeenCalledWith @reference, 8

            it "calls transform with changed model attribute values", ->
              stop = false
              setTimeout (=> stop = true), 0
              waitsFor -> stop
              runs =>
                expect(@transform).toHaveBeenCalledWith 9, 19
                expect(@transform.calls[0].object).toBe @context


    describe 'Reference', ->
      beforeEach ->
        @reference = @model.ref 'a'

      describe '@ref( transform?:function( attr_vals:{string | string[]} ) )', ->

        it '@ref() returns this (original reference)', ->
          expect(@reference.ref()).toBe @reference
          expect(@reference.ref(undefined)).toBe @reference
          expect(@reference.ref(null)).toBe @reference

        describe '@ref( function ) returns this (original reference)', ->
          beforeEach ->
            @new_reference = @reference.ref @transform

          describe 'when @value() is called', ->
            beforeEach ->
              @value = @new_reference.value()

            it 'calls transform and returns result from transform', ->
              expect(@transform).toHaveBeenCalledWith 7
              expect(@value).toBe 8

      describe '@combine( ref:{Reference | Reference[]}, transform?:function( attr_vals:{string | string[]} ), context?:object )', ->
        beforeEach ->
          @reference_a = @model.ref 'a'
          @reference_b = @model.ref 'b'
          @reference_c = @model.ref 'c'

        it '@combine( {NOT a Reference or Array} ) returns this (original reference)', ->
          expect(@reference_a.combine()).toBe @reference_a
          expect(@reference_a.combine(undefined)).toBe @reference_a
          expect(@reference_a.combine(null)).toBe @reference_a
          expect(@reference_a.combine(->)).toBe @reference_a
          expect(@reference_a.combine(5)).toBe @reference_a
          expect(@reference_a.combine({})).toBe @reference_a

        describe "@combine( Reference )", ->
          beforeEach ->
            @combine_reference = @reference_a.combine @reference_b

          it 'returns a Reference', ->
            expect(@combine_reference instanceof @ref.Reference).toBe true

          describe 'when value() is called', ->
            beforeEach ->
              @value = @combine_reference.value()

            it 'calls default transform and returns result (first reference value)', ->
              expect(@value).toBe 7


        describe "@combine( Reference, transform )", ->
          beforeEach ->
            @combine_reference = @reference_a.combine @reference_b, @transform

          it 'returns a Reference', ->
            expect(@combine_reference instanceof @ref.Reference).toBe true

          describe 'when value() is called', ->
            beforeEach ->
              @value = @combine_reference.value()

            it 'calls transform and returns result (first reference value)', ->
              expect(@transform).toHaveBeenCalledWith 7, 17
              expect(@value).toBe 8

        describe "@combine( Reference, transform, context )", ->
          beforeEach ->
            @combine_reference = @reference_a.combine @reference_b, @transform, @context

          it 'returns a Reference', ->
            expect(@combine_reference instanceof @ref.Reference).toBe true

          describe 'when value() is called', ->
            beforeEach ->
              @value = @combine_reference.value()

            it 'calls transform (with this set to context) and returns result', ->
              expect(@transform).toHaveBeenCalledWith 7, 17
              expect(@value).toBe 8
              expect(@transform.calls[0].object).toBe @context

        describe "@combine( Reference[] )", ->
          beforeEach ->
            @combine_reference = @reference_a.combine [@reference_b, @reference_c]

          it 'returns a Reference', ->
            expect(@combine_reference instanceof @ref.Reference).toBe true

          describe 'when value() is called', ->
            beforeEach ->
              @value = @combine_reference.value()

            it 'calls transform and returns result', ->
              expect(@value).toBe 7

          describe 'when multiple model attributes change', ->
            beforeEach ->
              @combine_reference.on 'change', @onChange = jasmine.createSpy 'change'
              @model.set a: 9, b: 19, c: 29

            it "'change' listeners are called once with the value of the reference", ->
              stop = false
              setTimeout (=> stop = true), 0
              waitsFor -> stop
              runs =>
                expect(@onChange.callCount).toBe 1
                expect(@onChange).toHaveBeenCalledWith @combine_reference, 9


        describe "@combine( Reference[], transform )", ->
          beforeEach ->
            @combine_reference = @reference_a.combine [@reference_b, @reference_c], @transform

          it 'returns a Reference', ->
            expect(@combine_reference instanceof @ref.Reference).toBe true

          describe 'when value() is called', ->
            beforeEach ->
              @value = @combine_reference.value()

            it 'calls transform and returns result', ->
              expect(@transform).toHaveBeenCalledWith 7, 17, 27
              expect(@value).toBe 8


          describe 'when multiple model attributes change', ->
            beforeEach ->
              @transform.reset()
              @combine_reference.on 'change', @onChange = jasmine.createSpy 'change'
              @model.set a: 9, b: 19, c: 29

            it "'change' listeners are called once with the value of the reference", ->
              stop = false
              setTimeout (=> stop = true), 0
              waitsFor -> stop
              runs =>
                expect(@onChange.callCount).toBe 1
                expect(@onChange).toHaveBeenCalledWith @combine_reference, 8


            it "calls transform with changed model attribute values", ->
              stop = false
              setTimeout (=> stop = true), 0
              waitsFor -> stop
              runs =>
                expect(@transform).toHaveBeenCalledWith 9, 19, 29


        describe "@ref( Reference[], transform, context )", ->
          beforeEach ->
            @combine_reference = @reference_a.combine [@reference_b, @reference_c], @transform, @context

          it 'returns a Reference', ->
            expect(@combine_reference instanceof @ref.Reference).toBe true

          describe 'when value() is called', ->
            beforeEach ->
              @value = @combine_reference.value()

            it 'calls transform (with this set to context) and returns result', ->
              expect(@transform).toHaveBeenCalledWith 7, 17, 27
              expect(@value).toBe 8
              expect(@transform.calls[0].object).toBe @context


          describe 'when multiple model attributes change', ->
            beforeEach ->
              @transform.reset()
              @combine_reference.on 'change', @onChange = jasmine.createSpy 'change'
              @model.set a: 9, b: 19, c: 29

            it "'change' listeners are called once with the value of the reference", ->
              stop = false
              setTimeout (=> stop = true), 0
              waitsFor -> stop
              runs =>
                expect(@onChange.callCount).toBe 1
                expect(@onChange).toHaveBeenCalledWith @combine_reference, 8

            it "calls transform with changed model attribute values", ->
              stop = false
              setTimeout (=> stop = true), 0
              waitsFor -> stop
              runs =>
                expect(@transform).toHaveBeenCalledWith 9, 19, 29
                expect(@transform.calls[0].object).toBe @context


      describe '@onChangeAndDo( handler:function, context?:object )', ->

        describe '@onChangeAndDo( handler:function )', ->

          beforeEach ->
            @reference.onChangeAndDo @onChange = jasmine.createSpy 'onChangeAndDo'

          it 'immediately calls handler', ->
            expect(@onChange.callCount).toBe 1
            expect(@onChange).toHaveBeenCalledWith @reference, 7

          describe 'when the Reference value changes', ->

            beforeEach ->
              @onChange.reset()
              @model.set a: 8

            it 'calls handler', ->
              done = false
              runs -> setTimeout (-> done=true), 10
              waitsFor -> done
              runs =>
                expect(@onChange.callCount).toBe 1
                expect(@onChange).toHaveBeenCalledWith @reference, 8

