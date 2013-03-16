define ['../../utils/spec-utils'], ({nodeHTMLEquals,stringify,node,browserTrigger,waitOne})->

  ({beforeEachRequire})->

    describe 'Passing Bindings (functions) to __', ->

      beforeEachRequire [
        'cell/View'
        'cell/Model'
        'cell/Collection'
      ], (@View, @Model, @Collection)->
        @view = new @View()
        @view.set 'test', 'test val'
        @view.set 'testInnerHTML', 'test innerHTML'
        @__ = @view.__

      describe 'when a bind is passed as an attribute', ->
        beforeEach ->
          @node = @__ '.bound', 'data-custom':(-> @get 'test'), 'non-bind': 'constant value', innerHTML: (-> @get 'testInnerHTML')

        it "when innerHTML is specified as an attribute, sets the innerHTML", ->
          expect(@node.innerHTML).toBe 'test innerHTML'

        it "sets binding's value to the element's attribute", ->
          expect(@node.getAttribute 'data-custom').toBe 'test val'
          expect(@node.getAttribute 'non-bind').toBe 'constant value'

        describe "when the binding's value changes and @updateBinds() is called", ->
          beforeEach ->
            @view.set 'test', 'test val2'
            @view.set 'testInnerHTML', 'test innerHTML 2'

          it "automatically sets the element's attribute to the new binding's value", ->
            waitOne ->
              expect(@node.getAttribute 'data-custom').toBe 'test val2'

          it "when innerHTML is specified as an attribute, sets the innerHTML", ->
            waitOne ->
              expect(@node.innerHTML).toBe 'test innerHTML 2'

      describe "when the attribute is a on* event handler", ->
        it "doesn't think it's a bind", ->
          @node = @__ '.bound', onclick: @clickHandler = jasmine.createSpy 'click'
          @domFixture.appendChild @node
          expect(@clickHandler).not.toHaveBeenCalled()
          browserTrigger @node, 'click'
          expect(@clickHandler).toHaveBeenCalled()

      describe "when a bind is passed as a child", ->

        describe_render_reference = ({value_type, ref_value, ref_value_after, expected_child_html, expected_child_html_after})->

          describe "when the binding's value is of type #{value_type}", ->
            beforeEach ->
              @view.set 'test', ref_value
              @node = @__ '.parent',
                'BEFORE'
                -> @get 'test'
                'AFTER'

            it "child is rendered correctly", ->
              nodeHTMLEquals @node, "<div class=\"parent\">BEFORE#{expected_child_html}AFTER</div>"

            describe "when the binding's value changes", ->
              beforeEach ->
                @view.set 'test', ref_value_after

              it "automatically rerenders child correctly", ->
                waitOne ->
                  nodeHTMLEquals @node, "<div class=\"parent\">BEFORE#{expected_child_html_after}AFTER</div>"


        describe "when the binding's value is undefined", ->
          beforeEach ->
            @view.set 'test', undefined
            @node = @__ '.parent',
              'BEFORE'
              -> @get 'test'
              'AFTER'

          it "child is rendered correctly", ->
            nodeHTMLEquals @node, "<div class=\"parent\">BEFOREAFTER</div>"

          describe "when the binding's value changes and @updateBinds() is called", ->
            beforeEach ->
              @view.set 'test', 'something'

            it "automatically rerenders child correctly", ->
              waitOne ->
                nodeHTMLEquals @node, "<div class=\"parent\">BEFOREsomethingAFTER</div>"


        describe_render_reference
          value_type: 'DOMNode'
          ref_value: node 'span'
          ref_value_after: node 'b'
          expected_child_html: '<span></span>'
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
          value_type: 'Array'
          ref_value: [
            'Hello World!'
            0
          ]
          ref_value_after: [
            'Goodbye!'
            1
          ]
          expected_child_html: 'Hello World!0'
          expected_child_html_after: 'Goodbye!1'

        describe "and the bind renders a child View that accesses Models/Collections during it's construction", ->
          beforeEach ->
            @model = new @Model test: 'test value'
            
            @ChildView = @View.extend
              beforeRender: =>
                @model.get 'test'

            @count = 0
            @ParentView = @View.extend
              render: (_)=> [
                =>
                  ++@count
                  _ @ChildView
              ]

            @parentView = new @ParentView

          it 'it renders correctly', ->
            expect(@count).toBe 1

          describe "when a Model/Collection accessed by the child View changes", ->
            beforeEach ->
              @model.set 'test', 'test value2'

            it "does NOT rerender the parent's bind", ->
              waitOne ->
                expect(@count).toBe 1

