define ['../../utils/spec-utils'], ({nodeHTMLEquals,stringify,node,browserTrigger,waitOne})->

  ({beforeEachRequire})->

    describe 'Passing Bindings (functions) to _', ->

      beforeEachRequire [
        'cell/View'
        'cell/Model'
        'cell/Collection'
      ], (@View, @Model, @Collection)->
        @view = new @View()
        @view.set 'test', 'test val'
        @view.set 'testInnerHTML', 'test innerHTML'
        @_ = @view._

      describe '_.map(collection:Collection, renderer:function)', ->

        describe 'when collection is initially empty', ->

        describe 'when renderer returns an array of nodes', ->

          beforeEach ->
            @collection = new @Collection [
              {a: 0}
              {a: 1}
              {a: 2}
            ]
            @CellWithEach = @View.extend
              _cellName: 'test'
              render: (_)=> [
                _ '.parent',
                  _.map @collection, (item)->
                    for i in [0...(item.get 'a')]
                      _ ".item#{item.get 'a'}", i
              ]
            @view = new @CellWithEach()

          it 'renders initially correctly', ->
            nodeHTMLEquals @view.el,
              '<div cell="test" class="test">'+
                '<div class="parent">'+
                  '<div class="item1">0</div>'+
                  '<div class="item2">0</div>'+
                  '<div class="item2">1</div>'+
                '</div>'+
              '</div>'

          describe 'when collection changes...', ->
            beforeEach ->
              [@item10, @item20, @item21] = @view.el.children[0].children

            describe 'by removing an item...', ->

              describe 'from the top', ->
                beforeEach ->
                  @collection.remove @collection.at 0

                it 'renders after change correctly', ->
                  waitOne ->
                    nodeHTMLEquals @view.el,
                      '<div cell="test" class="test">'+
                        '<div class="parent">'+
                          '<div class="item1">0</div>'+
                          '<div class="item2">0</div>'+
                          '<div class="item2">1</div>'+
                        '</div>'+
                      '</div>'

                it "doesn't rerender previous items", ->
                  waitOne ->
                    expect(@view.el.children[0].children[0]).toBe @item10
                    expect(@view.el.children[0].children[1]).toBe @item20
                    expect(@view.el.children[0].children[2]).toBe @item21


              describe 'from the middle', ->
                beforeEach ->
                  @collection.remove @collection.at 1

                it 'renders after change correctly', ->
                  waitOne ->
                    nodeHTMLEquals @view.el,
                      '<div cell="test" class="test">'+
                        '<div class="parent">'+
                          '<div class="item2">0</div>'+
                          '<div class="item2">1</div>'+
                        '</div>'+
                      '</div>'

                it "doesn't rerender previous items", ->
                  waitOne ->
                    expect(@view.el.children[0].children[0]).toBe @item20
                    expect(@view.el.children[0].children[1]).toBe @item21

              describe 'from the bottom', ->
                beforeEach ->
                  @collection.remove @collection.at 2

                it 'renders after change correctly', ->
                  waitOne ->
                    nodeHTMLEquals @view.el,
                      '<div cell="test" class="test">'+
                        '<div class="parent">'+
                          '<div class="item1">0</div>'+
                        '</div>'+
                      '</div>'

                it "doesn't rerender previous items", ->
                  waitOne ->
                    expect(@view.el.children[0].children[0]).toBe @item10


            describe 'by adding an item...', ->

              describe 'to the top', ->
                beforeEach ->
                  @collection.add {a:3}, 0

                it 'renders after change correctly', ->
                  waitOne ->
                    nodeHTMLEquals @view.el,
                      '<div cell="test" class="test">'+
                        '<div class="parent">'+
                          '<div class="item3">0</div>'+
                          '<div class="item3">1</div>'+
                          '<div class="item3">2</div>'+
                          '<div class="item1">0</div>'+
                          '<div class="item2">0</div>'+
                          '<div class="item2">1</div>'+
                        '</div>'+
                      '</div>'

                it "doesn't rerender previous items", ->
                  waitOne ->
                    expect(@view.el.children[0].children[3]).toBe @item10
                    expect(@view.el.children[0].children[4]).toBe @item20
                    expect(@view.el.children[0].children[5]).toBe @item21


              describe 'to the middle', ->
                beforeEach ->
                  @collection.add {a:3}, 2

                it 'renders after change correctly', ->
                  waitOne ->
                    nodeHTMLEquals @view.el,
                      '<div cell="test" class="test">'+
                        '<div class="parent">'+
                          '<div class="item1">0</div>'+
                          '<div class="item3">0</div>'+
                          '<div class="item3">1</div>'+
                          '<div class="item3">2</div>'+
                          '<div class="item2">0</div>'+
                          '<div class="item2">1</div>'+
                        '</div>'+
                      '</div>'

                it "doesn't rerender previous items", ->
                  waitOne ->
                    expect(@view.el.children[0].children[0]).toBe @item10
                    expect(@view.el.children[0].children[4]).toBe @item20
                    expect(@view.el.children[0].children[5]).toBe @item21

              describe 'to the bottom', ->
                beforeEach ->
                  @collection.add {a:3}

                it 'renders after change correctly', ->
                  waitOne ->
                    nodeHTMLEquals @view.el,
                      '<div cell="test" class="test">'+
                        '<div class="parent">'+
                          '<div class="item1">0</div>'+
                          '<div class="item2">0</div>'+
                          '<div class="item2">1</div>'+
                          '<div class="item3">0</div>'+
                          '<div class="item3">1</div>'+
                          '<div class="item3">2</div>'+
                        '</div>'+
                      '</div>'

                it "doesn't rerender previous items", ->
                  waitOne ->
                    expect(@view.el.children[0].children[0]).toBe @item10
                    expect(@view.el.children[0].children[1]).toBe @item20
                    expect(@view.el.children[0].children[2]).toBe @item21


        describe 'when renderer returns a binding that returns an array of nodes', ->

          beforeEach ->
            @collection = new @Collection [
              {a: 0}
              {a: 1}
              {a: 2}
            ]
            @CellWithEach = @View.extend
              _cellName: 'test'
              render: (_)=> [
                _ '.parent',
                  _.map @collection, (item)->
                    ->
                      for i in [0...(item.get 'a')]
                        _ ".item#{item.get 'a'}", i
              ]
            @view = new @CellWithEach()

          it 'renders initially correctly', ->
            nodeHTMLEquals @view.el,
              '<div cell="test" class="test">'+
                '<div class="parent">'+
                  '<div class="item1">0</div>'+
                  '<div class="item2">0</div>'+
                  '<div class="item2">1</div>'+
                '</div>'+
              '</div>'

          describe 'when an item of the collection changes', ->
            beforeEach ->
              [@item10, @item20, @item21] = @view.el.children[0].children
              @collection.at(0).set 'a', 3

            it 'renders after change correctly', ->
              waitOne ->
                nodeHTMLEquals @view.el,
                  '<div cell="test" class="test">'+
                    '<div class="parent">'+
                      '<div class="item3">0</div>'+
                      '<div class="item3">1</div>'+
                      '<div class="item3">2</div>'+
                      '<div class="item1">0</div>'+
                      '<div class="item2">0</div>'+
                      '<div class="item2">1</div>'+
                    '</div>'+
                  '</div>'

            it "doesn't rerender previous items", ->
              waitOne ->
                expect(@view.el.children[0].children[3]).toBe @item10
                expect(@view.el.children[0].children[4]).toBe @item20
                expect(@view.el.children[0].children[5]).toBe @item21

            describe '... and then that item is removed', ->
              beforeEach ->
                @collection.remove @collection.at 0

              it 'renders after change correctly', ->
                waitOne ->
                  nodeHTMLEquals @view.el,
                    '<div cell="test" class="test">'+
                      '<div class="parent">'+
                        '<div class="item1">0</div>'+
                        '<div class="item2">0</div>'+
                        '<div class="item2">1</div>'+
                      '</div>'+
                    '</div>'

              it "doesn't rerender previous items", ->
                waitOne ->
                  expect(@view.el.children[0].children[0]).toBe @item10
                  expect(@view.el.children[0].children[1]).toBe @item20
                  expect(@view.el.children[0].children[2]).toBe @item21


          describe 'when collection changes...', ->
            beforeEach ->
              [@item10, @item20, @item21] = @view.el.children[0].children

            describe 'by removing an item...', ->

              describe 'from the top', ->

                beforeEach ->
                  @collection.remove @collection.at 0

                it 'renders after change correctly', ->
                  waitOne ->
                    nodeHTMLEquals @view.el,
                      '<div cell="test" class="test">'+
                        '<div class="parent">'+
                          '<div class="item1">0</div>'+
                          '<div class="item2">0</div>'+
                          '<div class="item2">1</div>'+
                        '</div>'+
                      '</div>'

                it "doesn't rerender previous items", ->
                  waitOne ->
                    expect(@view.el.children[0].children[0]).toBe @item10
                    expect(@view.el.children[0].children[1]).toBe @item20
                    expect(@view.el.children[0].children[2]).toBe @item21


              describe 'from the middle', ->

                beforeEach ->
                  @collection.remove @collection.at 1

                it 'renders after change correctly', ->
                  waitOne ->
                    nodeHTMLEquals @view.el,
                      '<div cell="test" class="test">'+
                        '<div class="parent">'+
                          '<div class="item2">0</div>'+
                          '<div class="item2">1</div>'+
                        '</div>'+
                      '</div>'

                it "doesn't rerender previous items", ->
                  waitOne ->
                    expect(@view.el.children[0].children[0]).toBe @item20
                    expect(@view.el.children[0].children[1]).toBe @item21

              describe 'from the bottom', ->

                beforeEach ->
                  @collection.remove @collection.at 2

                it 'renders after change correctly', ->
                  waitOne ->
                    nodeHTMLEquals @view.el,
                      '<div cell="test" class="test">'+
                        '<div class="parent">'+
                          '<div class="item1">0</div>'+
                        '</div>'+
                      '</div>'

                it "doesn't rerender previous items", ->
                  waitOne ->
                    expect(@view.el.children[0].children[0]).toBe @item10


            describe 'by adding an item...', ->

              describe 'to the top', ->
                beforeEach ->
                  @collection.add {a:3}, 0

                it 'renders after change correctly', ->
                  waitOne ->
                    nodeHTMLEquals @view.el,
                      '<div cell="test" class="test">'+
                        '<div class="parent">'+
                          '<div class="item3">0</div>'+
                          '<div class="item3">1</div>'+
                          '<div class="item3">2</div>'+
                          '<div class="item1">0</div>'+
                          '<div class="item2">0</div>'+
                          '<div class="item2">1</div>'+
                        '</div>'+
                      '</div>'

                it "doesn't rerender previous items", ->
                  waitOne ->
                    expect(@view.el.children[0].children[3]).toBe @item10
                    expect(@view.el.children[0].children[4]).toBe @item20
                    expect(@view.el.children[0].children[5]).toBe @item21


              describe 'to the middle', ->

                beforeEach ->
                  @collection.add {a:3}, 2

                it 'renders after change correctly', ->
                  waitOne ->
                    nodeHTMLEquals @view.el,
                      '<div cell="test" class="test">'+
                        '<div class="parent">'+
                          '<div class="item1">0</div>'+
                          '<div class="item3">0</div>'+
                          '<div class="item3">1</div>'+
                          '<div class="item3">2</div>'+
                          '<div class="item2">0</div>'+
                          '<div class="item2">1</div>'+
                        '</div>'+
                      '</div>'

                it "doesn't rerender previous items", ->
                  waitOne ->
                    expect(@view.el.children[0].children[0]).toBe @item10
                    expect(@view.el.children[0].children[4]).toBe @item20
                    expect(@view.el.children[0].children[5]).toBe @item21

              describe 'to the bottom', ->
                beforeEach ->
                  @collection.add {a:3}

                it 'renders after change correctly', ->
                  waitOne ->
                    nodeHTMLEquals @view.el,
                      '<div cell="test" class="test">'+
                        '<div class="parent">'+
                          '<div class="item1">0</div>'+
                          '<div class="item2">0</div>'+
                          '<div class="item2">1</div>'+
                          '<div class="item3">0</div>'+
                          '<div class="item3">1</div>'+
                          '<div class="item3">2</div>'+
                        '</div>'+
                      '</div>'

                it "doesn't rerender previous items", ->
                  waitOne ->
                    expect(@view.el.children[0].children[0]).toBe @item10
                    expect(@view.el.children[0].children[1]).toBe @item20
                    expect(@view.el.children[0].children[2]).toBe @item21


      describe 'when a bind is passed as an attribute', ->
        beforeEach ->
          @node = @_ '.bound', 'data-custom':(-> @get 'test'), 'non-bind': 'constant value', innerHTML: (-> @get 'testInnerHTML')

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
          @node = @_ '.bound', onclick: @clickHandler = jasmine.createSpy 'click'
          @domFixture.appendChild @node
          expect(@clickHandler).not.toHaveBeenCalled()
          browserTrigger @node, 'click'
          expect(@clickHandler).toHaveBeenCalled()

      describe "when a bind is passed as a child", ->

        describe_render_reference = ({value_type, ref_value, ref_value_after, expected_child_html, expected_child_html_after})->

          describe "when the binding's value is of type #{value_type}", ->
            beforeEach ->
              @view.set 'test', ref_value
              @node = @_ '.parent',
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
            @node = @_ '.parent',
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
          value_type: 'Array (initially empty)'
          ref_value: []
          ref_value_after: ['Yolo']
          expected_child_html: ''
          expected_child_html_after: 'Yolo'

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

            @ParentView = @View.extend
              render: (_)=>
                _ @ChildView

            spyOn @ParentView::, 'render'
            @parentView = new @ParentView

          it 'it renders correctly', ->
            expect(@ParentView::render.callCount).toBe 1

          describe "when a Model/Collection accessed by the child View changes", ->
            beforeEach ->
              @ParentView::render.reset()
              @model.set 'test', 'test value2'

            it "does NOT rerender the parent's bind", ->
              waitOne ->
                expect(@ParentView::render).not.toHaveBeenCalled()

