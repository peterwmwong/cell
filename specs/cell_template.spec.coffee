define ['./utils/spec-utils'], ({nodeHTMLEquals,stringify,node})->
  verify_is_jQueryish = (obj)->
    expect(Object.getPrototypeOf obj).toBe $.fn

  ({beforeEachRequire})->

    describe 'Bindings: Bound function expressions', ->

      beforeEachRequire ['cell'], ({@Cell})->
        @cell = new @Cell()
        @cell.test = 'test val'
        @__ = @cell.__

      describe 'when the bind is passed as an attribute', ->

        beforeEach ->
          @node = @__ '.bound', 'data-custom': -> @test

        it "sets initial value of bindings's value to the element's attribute", ->
          expect(@node.getAttribute 'data-custom').toBe 'test val'

        describe "when the bindings's value changes and @updateBinds() is called", ->
          beforeEach ->
            @cell.test = 'test val2'
            @cell.updateBinds()

          it "automatically sets value of the element's attribute to the new binding's value", ->
            expect(@node.getAttribute 'data-custom').toBe 'test val2'

      describe "when the bind is passed as a child", ->

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

    describe 'Cell.prototype.render is modified', ->

      beforeEachRequire ['cell'], ({Cell})->
        C = Cell.extend renderEl: @renderEl = jasmine.createSpy 'renderEl'
        c = new C()
        @__ = c.__
        c.render()
          
      it 'calls Cell.renderEl(__)', ->
        expect(@renderEl).toHaveBeenCalledWith @__

    describe '__( viewOrSelector:[Backbone.View, String], attrHash_or_options?:Object, children:[DOMNode, String, Number, Array, jQuery] )', ->

      beforeEachRequire [
        "fixtures/TestCell1"
        'cell'
      ], (@TestCell1,{Cell})->
        @__ = new Cell().__


      it_renders = (desc, input_args, expected_html_output, debug)->
        describe "__( #{desc} )", ->
          input_strings = stringify input_args, true
          it "__( #{input_strings} ) === #{expected_html_output}", ->
            debugger if debug
            nodeHTMLEquals (@__ input_args...), expected_html_output

      it_renders_views = (desc, input_args, expected_html_output, debug)->
        describe "__( #{desc} )", ->
          input_strings = stringify input_args, true
          it "__( Backbone.View, #{input_strings} ) === #{expected_html_output}", ->
            debugger if debug
            nodeHTMLEquals (@__ @TestCell1, input_args...), expected_html_output

      describe "__( function )", ->
        it "__( function ) === undefined", ->
          expect(@__ ->).toBe undefined

      for empty in [undefined,null] then do(empty)->
        empty_str = "#{empty is '' and '""' or empty}"
        describe "__( #{empty_str} )", ->
          it "__( #{empty_str} ) === undefined", ->
            expect(@__ empty).toBe undefined

      it_renders 'empty string',
        ['']
        '<div></div>'

      it_renders 'selector:String(tag, id, multiple classes)',
        ['p#myid.myclass.myclass2']
        '<p class="myclass myclass2" id="myid"></p>'

      it_renders 'selector:String, child:String',
        ['p#myid.myclass.myclass2', 'blargo']
        '<p class="myclass myclass2" id="myid">blargo</p>'

      it_renders "selector:String, child:String('<')",
        ['p#myid.myclass.myclass2', '<']
        '<p class="myclass myclass2" id="myid"><</p>'

      it_renders 'selector:String, child:Number',
        ['p#myid.myclass.myclass2', 777]
        '<p class="myclass myclass2" id="myid">777</p>'

      it_renders 'selector:String, child:Number(0)',
        ['p#myid.myclass.myclass2', 0]
        '<p class="myclass myclass2" id="myid">0</p>'

      it_renders 'selector:String, child:DOMNode',
        ['p#myid.myclass.myclass2', node 'span']
        '<p class="myclass myclass2" id="myid"><span></span></p>'

      it_renders 'selector:String, child:jQuery',
        ['p#myid.myclass.myclass2', $('<span></span>')]
        '<p class="myclass myclass2" id="myid"><span></span></p>'

      it_renders 'selector:String, child:jQuery',
        ['p#myid.myclass.myclass2', $('<span></span>')]
        '<p class="myclass myclass2" id="myid"><span></span></p>'

      do->
        mock_date = new Date()
        it_renders 'selector:String, child:Date',
          ['p#myid.myclass.myclass2', mock_date]
          '<p class="myclass myclass2" id="myid">'+mock_date.toString()+'</p>'

      it_renders 'selector:String, children:String[]',
        ['p#myid.myclass.myclass2', ['one','two','three']]
        '<p class="myclass myclass2" id="myid">onetwothree</p>'

      it_renders 'selector:String, children:String...',
        ['p#myid.myclass.myclass2', 'one', 'two', 'three']
        '<p class="myclass myclass2" id="myid">onetwothree</p>'

      it_renders 'selector:String, children...:[DOM Nodes, String, Number, Array, jQuery]',
        [ 'p#myid.myclass.myclass2', [
          node 'span'
          'hello'
          [
            node 'table'
            'world'
            5
            [ node 'div' ]
          ]
          0
          node 'a'
          $ '<span class="result"></span><span class="jQueryObjDeux"></span>'
        ]]
        '<p class="myclass myclass2" id="myid"><span></span>hello<table></table>world5<div></div>0<a></a><span class="result"></span><span class="jQueryObjDeux"></span></p>'

      it_renders 'selector:String, children...:[undefined, null]',
        [ 'p#myid.myclass.myclass2', [
          undefined
          null
        ]]
        '<p class="myclass myclass2" id="myid"></p>'

      it_renders "selector:String, attrHash:Object",
        [ 'p#myid.myclass.myclass2', class:'myclass3', 'data-custom':'myattr', 'data-custom2':'myattr2']
        '<p class="myclass3" data-custom="myattr" data-custom2="myattr2" id="myid"></p>'

      it_renders "selector:String, attrHash:Object, children...:[DOM Nodes, String, Number, Array, jQuery]",
        [ 'p', 'data-custom':'myattr', 'data-custom2':'myattr2',
          node 'span'
          'hello'
          [node('table'), 'world', 5, [node('div')]]
          0
          node 'a'
        ]
        '<p data-custom="myattr" data-custom2="myattr2"><span></span>hello<table></table>world5<div></div>0<a></a></p>'

      it_renders 'selector:String, children...:[undefined, null]',
        [ 'p', 'data-custom':'myattr', 'data-custom2':'myattr2',
          undefined
          null
        ]
        '<p data-custom="myattr" data-custom2="myattr2"></p>'

      it_renders_views "view:Backbone.View",
        []
        '<div cell="TestCell1" class="TestCell1">TestCell1 Contents</div>'

      it_renders_views "view:Backbone.View, options:Object",
        [ tagName: 'span' ]
        '<span cell="TestCell1" class="TestCell1">TestCell1 Contents</span>'

