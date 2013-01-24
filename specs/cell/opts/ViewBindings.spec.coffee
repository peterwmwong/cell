define ['../../utils/spec-utils'], ({nodeHTMLEquals,stringify,node,browserTrigger})->

  ({beforeEachRequire})->

    describe '@updateBinds()', ->

      beforeEachRequire ['cell/opts/ViewBindings','cell/View'], (ViewBindings, @View)->

      describe "Given multiple binds, when a bind updates due to another bind's update", ->

        beforeEach ->
          @view = new @View()
          @view.count = -1
          @__ = @view.__

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

          @view.count = 0
          @view.updateBinds()

        it 'Calls binds 3 times (1 - updateBinds(), 2 - bind1 changed, 3 - bind2 changed)', ->
          expect(@bind1.callCount).toBe 3
          expect(@bind2.callCount).toBe 3
          expect(@oneEl.innerHTML).toBe '2'
          expect(@twoEl.innerHTML).toBe '2'

      describe "when a bind continues to update", ->

        beforeEach ->
          @view = new @View()
          @view.count = -1
          @__ = @view.__

          @bind1 = jasmine.createSpy('bind1').andCallFake -> ++@count
          @oneEl = @__ '.one', @bind1

          # Binds are called during rendering
          @bind1.reset()
          
          @view.count = 0
          @view.updateBinds()

        it 'max out after 10 tries', ->
          expect(@bind1.callCount).toBe 10
          expect(@view.count).toBe 10
          expect(@oneEl.innerHTML).toBe '10'

    describe 'Passing Bindings (functions) to __', ->

      beforeEachRequire ['cell/opts/ViewBindings','cell/View'], (ViewBindings, @View)->
        @view = new @View()
        @view.test = 'test val'
        @__ = @view.__

      describe 'when a bind is passed as the condition to __.each(collection, renderer:function)', ->

        describe 'when renderer returns an array of nodes', ->

          beforeEach ->
            @collection = [1,2,3]
            @CellWithEach = @View.extend
              _cellName: 'test'
              render: (__)=> [
                __ '.parent',
                  __.each (=> @collection), (item)->
                    __ ".item#{item}"
              ]
            @view = new @CellWithEach()

          it 'renders initially correctly', ->
            nodeHTMLEquals @view.el,
              '<div cell="test" class="test"><div class="parent"><div class="item1"></div><div class="item2"></div><div class="item3"></div></div></div>'

          describe 'when collection changes and updateBinds() is called', ->

            beforeEach ->
              @item2 = @view.el.children[0].children[1]
              @item3 = @view.el.children[0].children[2]
              @collection.shift()
              @collection.push 4
              @view.updateBinds()

            it 'renders after change correctly', ->
              nodeHTMLEquals @view.el,
                '<div cell="test" class="test"><div class="parent"><div class="item2"></div><div class="item3"></div><div class="item4"></div></div></div>'

            it "doesn't rerender previous items", ->
              expect(@view.el.children[0].children[0]).toBe @item2
              expect(@view.el.children[0].children[1]).toBe @item3


      describe 'when a bind is passed as the condition to __.if(condition, {then:function, else:function})', ->

        describe 'when then and else return array of nodes', ->

          beforeEach ->
            @condition = true
            @CellWithIf = @View.extend
              _cellName: 'test'
              render: (__)=> [
                __ '.parent',
                  __.if (=> @condition),
                    then: -> [
                      __ '.then1'
                      __ '.then2'
                    ]
                    else: -> [
                      __ '.else1'
                      __ '.else2'
                    ]
              ]
            @view = new @CellWithIf()

          it 'renders initially correctly', ->
            nodeHTMLEquals @view.el,
              '<div cell="test" class="test"><div class="parent"><div class="then1"></div><div class="then2"></div></div></div>'

          it 'renders after change correctly', ->
            @condition = false
            @view.updateBinds()
            nodeHTMLEquals @view.el, '<div cell="test" class="test"><div class="parent"><div class="else1"></div><div class="else2"></div></div></div>'


        describe 'when then and else return a node', ->

          beforeEach ->
            @condition = true
            @CellWithIf = @View.extend
              _cellName: 'test'
              render: (__)=> [
                __ '.parent',
                  __.if (=> @condition),
                    then: -> __ '.then'
                    else: -> __ '.else'
              ]
            @view = new @CellWithIf()

          it 'renders initially correctly', ->
            nodeHTMLEquals @view.el, '<div cell="test" class="test"><div class="parent"><div class="then"></div></div></div>'

          it 'renders after change correctly', ->
            @condition = false
            @view.updateBinds()
            nodeHTMLEquals @view.el, '<div cell="test" class="test"><div class="parent"><div class="else"></div></div></div>'

      describe 'when a bind is passed as an attribute', ->

        beforeEach ->
          @node = @__ '.bound', 'data-custom':(-> @test), 'non-bind': 'constant value'

        it "sets bindings's value to the element's attribute", ->
          expect(@node.getAttribute 'data-custom').toBe 'test val'
          expect(@node.getAttribute 'non-bind').toBe 'constant value'

        describe "when the bindings's value changes and @updateBinds() is called", ->
          beforeEach ->
            @view.test = 'test val2'
            @view.updateBinds()

          it "automatically sets the element's attribute to the new binding's value", ->
            expect(@node.getAttribute 'data-custom').toBe 'test val2'


      describe "when the attribute is a on* event handler", ->
        it "doesn't think it's a bind", ->
          @node = @__ '.bound', onclick: @clickHandler = jasmine.createSpy 'click'
          expect(@clickHandler).not.toHaveBeenCalled()
          browserTrigger @node, 'click'
          expect(@clickHandler).toHaveBeenCalled()

      describe "when a bind is passed as a child", ->

        describe_render_reference = ({value_type, ref_value, ref_value_after, expected_child_html, expected_child_html_after})->

          describe "when the bindings's value is of type #{value_type}", ->

            beforeEach ->
              @view.test = ref_value
              @node = @__ '.parent',
                'BEFORE'
                -> @test
                'AFTER'

            it "child is rendered correctly", ->
              nodeHTMLEquals @node, "<div class=\"parent\">BEFORE#{expected_child_html}AFTER</div>"

            describe "when the bindings's value changes and @updateBinds() is called", ->
              beforeEach ->
                @view.test = ref_value_after
                @view.updateBinds()

              it "automatically rerenders child correctly", ->
                nodeHTMLEquals @node, "<div class=\"parent\">BEFORE#{expected_child_html_after}AFTER</div>"


        describe "when the bindings's value is undefined", ->

          beforeEach ->
            @view.test = undefined
            @node = @__ '.parent',
              'BEFORE'
              -> @test
              'AFTER'

          it "child is rendered correctly", ->
            nodeHTMLEquals @node, "<div class=\"parent\">BEFOREAFTER</div>"

          describe "when the bindings's value changes and @updateBinds() is called", ->
            beforeEach ->
              @view.test = 'something'
              @view.updateBinds()

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
