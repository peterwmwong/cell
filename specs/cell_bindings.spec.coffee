define ['./utils/spec-utils'], ({nodeHTMLEquals,stringify,node})->

  ({beforeEachRequire})->

    describe '@updateBinds()', ->

      beforeEachRequire ['backbone','cell'], (@Backbone, {@Cell})->

      describe "When @model or @collection is present", ->

        beforeEach ->
          spyOn @Cell.prototype , 'updateBinds'

          @model = new @Backbone.Model()
          @cellWithModel = new @Cell {@model}

          @collection = new @Backbone.Collection()
          @cellWithCollection = new @Cell {@collection}

        describe "when a @model/@collecion trigger's an event", ->

          beforeEach ->
            @model.trigger 'modelEvent'
            @collection.trigger 'collectionEvent'

          it "calls @updateBinds()", ->
            expect(@Cell::updateBinds.calls[0]).toEqual
              args: ['modelEvent']
              object: @cellWithModel

            expect(@Cell::updateBinds.calls[1]).toEqual
              args: ['collectionEvent']
              object: @cellWithCollection

      describe "Given multiple binds, when a bind updates due to another bind's update", ->

        beforeEach ->
          @cell = new @Cell()
          @cell.count = -1
          @__ = @cell.__

          @bind1 = jasmine.createSpy('bind1').andCallFake ->
            ++@count if @count is 0
            @count
          @oneEl = @__ '.one', @bind1

          @bind2 = jasmine.createSpy('bind2').andCallFake ->
            ++@count if @count is 1
            @count
          @twoEl = @__ '.two', @bind2

          # Binds are called during rendering
          @bind1.reset()
          @bind2.reset()

          @cell.count = 0
          @cell.updateBinds()

        it 'Calls binds 3 times (1 - updateBinds(), 2 - bind1 changed, 3 - bind2 changed)', ->
          expect(@bind1.callCount).toBe 3
          expect(@bind2.callCount).toBe 3
          expect(@oneEl.innerHTML).toBe '2'
          expect(@twoEl.innerHTML).toBe '2'

      describe "when a bind continues to update", ->

        beforeEach ->
          @cell = new @Cell()
          @cell.count = -1
          @__ = @cell.__

          @bind1 = jasmine.createSpy('bind1').andCallFake -> ++@count
          @oneEl = @__ '.one', @bind1

          # Binds are called during rendering
          @bind1.reset()
          
          @cell.count = 0
          @cell.updateBinds()

        it 'max out after 10 tries', ->
          expect(@bind1.callCount).toBe 10
          expect(@cell.count).toBe 10
          expect(@oneEl.innerHTML).toBe '10'

    describe 'Passing Bindings (functions) to __', ->

      beforeEachRequire ['cell'], ({@Cell})->
        @cell = new @Cell()
        @cell.test = 'test val'
        @__ = @cell.__

      describe 'when a bind is passed as an attribute', ->

        beforeEach ->
          @node = @__ '.bound', 'data-custom': -> @test

        it "sets bindings's value to the element's attribute", ->
          expect(@node.getAttribute 'data-custom').toBe 'test val'

        describe "when the bindings's value changes and @updateBinds() is called", ->
          beforeEach ->
            @cell.test = 'test val2'
            @cell.updateBinds()

          it "automatically sets the element's attribute to the new binding's value", ->
            expect(@node.getAttribute 'data-custom').toBe 'test val2'


      describe "when a bind is passed as a child", ->

        describe_render_reference = ({value_type, ref_value, ref_value_after, expected_child_html, expected_child_html_after})->

          describe "when the bindings's value is of type #{value_type}", ->

            beforeEach ->
              @cell.test = ref_value
              @node = @__ '.parent',
                'BEFORE'
                -> @test
                'AFTER'

            it "child is rendered correctly", ->
              nodeHTMLEquals @node, "<div class=\"parent\">BEFORE#{expected_child_html}AFTER</div>"

            describe "when the bindings's value changes and @updateBinds() is called", ->
              beforeEach ->
                @cell.test = ref_value_after
                @cell.updateBinds()

              it "automatically rerenders child correctly", ->
                nodeHTMLEquals @node, "<div class=\"parent\">BEFORE#{expected_child_html_after}AFTER</div>"


        describe "when the bindings's value is undefined", ->

          beforeEach ->
            @cell.test = undefined
            @node = @__ '.parent',
              'BEFORE'
              -> @test
              'AFTER'

          it "child is rendered correctly", ->
            nodeHTMLEquals @node, "<div class=\"parent\">BEFOREAFTER</div>"

          describe "when the bindings's value changes and @updateBinds() is called", ->
            beforeEach ->
              @cell.test = 'something'
              @cell.updateBinds()

            it "automatically rerenders child correctly", ->
              nodeHTMLEquals @node, "<div class=\"parent\">BEFOREsomethingAFTER</div>"


        describe_render_reference
          value_type: 'DOMNode'
          ref_value: node 'a'
          ref_value_after: node 'b'
          expected_child_html: '<a></a>'
          expected_child_html_after: '<b></b>'

        describe_render_reference
          value_type: 'String'
          ref_value: 'Hello World!'
          ref_value_after: 'Goodbye!'
          expected_child_html: 'Hello World!'
          expected_child_html_after: 'Goodbye!'

        describe_render_reference
          value_type: 'Number'
          ref_value: 0
          ref_value_after: 1
          expected_child_html: '0'
          expected_child_html_after: '1'

        describe_render_reference
          value_type: 'jQuery'
          ref_value: $('<div class="initial"></div>')
          ref_value_after: $('<div class="after"></div>')
          expected_child_html: '<div class="initial"></div>'
          expected_child_html_after: '<div class="after"></div>'

        describe_render_reference
          value_type: 'Array'
          ref_value: [
            'Hello World!'
            0
            $('<div class="initial"></div>')
          ]
          ref_value_after: [
            'Goodbye!'
            1
            $('<div class="after"></div>')
          ]
          expected_child_html: 'Hello World!0<div class="initial"></div>'
          expected_child_html_after: 'Goodbye!1<div class="after"></div>'

