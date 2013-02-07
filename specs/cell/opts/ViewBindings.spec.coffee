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
        @__ = @view.__


      describe '__.each( collection, view:View )', ->

        beforeEach ->
          items = [
            {name:'a'}
            {name:'b'}
            {name:'c'}
          ]

          ChildView = @View.extend
            _cellName: 'Child'
            render: (__)-> @model.name

          ParentView = @View.extend
            _cellName: 'Parent'
            render: (__)-> __.each (-> items), ChildView

          @result = new ParentView().el

        it 'when many is non-empty array', ->
          nodeHTMLEquals @result,
            '<div cell="Parent" class="Parent">'+
            '<div cell="Child" class="Child">a</div>'+
            '<div cell="Child" class="Child">b</div>'+
            '<div cell="Child" class="Child">c</div>'+
            '</div>'

      describe 'when a bind is passed as the condition to __.each(collection, renderer:function)', ->

        describe 'when renderer returns an array of nodes', ->

          beforeEach ->
            @models = [
              new @Model a: 1
              new @Model a: 2
              new @Model a: 3
            ]
            @collection = new @Collection @models
            @CellWithEach = @View.extend
              _cellName: 'test'
              render: (__)=> [
                __ '.parent',
                  __.each (=> @collection.map (m)-> m.get 'a'), (value)->
                    __ ".item#{value}"
              ]
            @view = new @CellWithEach()

          it 'renders initially correctly', ->
            nodeHTMLEquals @view.el,
              '<div cell="test" class="test"><div class="parent"><div class="item1"></div><div class="item2"></div><div class="item3"></div></div></div>'

          describe 'when collection changes', ->

            beforeEach ->
              @item2 = @view.el.children[0].children[1]
              @item3 = @view.el.children[0].children[2]
              @collection.remove @collection.at 0
              @collection.add new @Model a: 4

            it 'renders after change correctly', ->
              waitOne ->
                nodeHTMLEquals @view.el,
                  '<div cell="test" class="test"><div class="parent"><div class="item2"></div><div class="item3"></div><div class="item4"></div></div></div>'

            it "doesn't rerender previous items", ->
              waitOne ->
                expect(@view.el.children[0].children[0]).toBe @item2
                expect(@view.el.children[0].children[1]).toBe @item3


      describe 'when a bind is passed as the condition to __.if(condition, {then:function, else:function})', ->

        describe 'when then and else return array of nodes', ->

          beforeEach ->
            @model = new @Model condition: true
            @CellWithIf = @View.extend
              _cellName: 'test'
              render: (__)=> [
                __ '.parent',
                  __.if (=> @model.get 'condition'),
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
            @model.set 'condition', false
            waitOne ->
              nodeHTMLEquals @view.el, '<div cell="test" class="test"><div class="parent"><div class="else1"></div><div class="else2"></div></div></div>'

        describe 'when then and/or else are not specified', ->

          beforeEach ->
            @model = new @Model condition: true
            @CellWithIf = @View.extend
              _cellName: 'test'
              render: (__)=> [
                __ '.parent',
                  __.if (=> @model.get 'condition'), {}
              ]
            @view = new @CellWithIf()

          it 'renders nothing', ->
            nodeHTMLEquals @view.el, '<div cell="test" class="test"><div class="parent"></div></div>'
            @model.set 'condition', false
            nodeHTMLEquals @view.el, '<div cell="test" class="test"><div class="parent"></div></div>'

        describe 'when then and else return a node', ->

          beforeEach ->
            @model = new @Model condition: true
            @CellWithIf = @View.extend
              _cellName: 'test'
              render: (__)=> [
                __ '.parent',
                  __.if (=> @model.get 'condition'),
                    then: -> __ '.then'
                    else: -> __ '.else'
              ]
            @view = new @CellWithIf()

          it 'renders initially correctly', ->
            waitOne ->
              nodeHTMLEquals @view.el, '<div cell="test" class="test"><div class="parent"><div class="then"></div></div></div>'

          it 'renders after change correctly', ->
            @model.set 'condition', false
            waitOne ->
              nodeHTMLEquals @view.el, '<div cell="test" class="test"><div class="parent"><div class="else"></div></div></div>'

      describe 'when a bind is passed as an attribute', ->

        beforeEach ->
          @node = @__ '.bound', 'data-custom':(-> @get 'test'), 'non-bind': 'constant value'

        it "sets binding's value to the element's attribute", ->
          expect(@node.getAttribute 'data-custom').toBe 'test val'
          expect(@node.getAttribute 'non-bind').toBe 'constant value'

        describe "when the binding's value changes and @updateBinds() is called", ->
          beforeEach ->
            @view.set 'test', 'test val2'

          it "automatically sets the element's attribute to the new binding's value", ->
            waitOne ->
              expect(@node.getAttribute 'data-custom').toBe 'test val2'


      describe "when the attribute is a on* event handler", ->
        it "doesn't think it's a bind", ->
          @node = @__ '.bound', onclick: @clickHandler = jasmine.createSpy 'click'
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
