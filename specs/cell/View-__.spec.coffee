define ['../utils/spec-utils'], ({nodeHTMLEquals,stringify,node,browserTrigger})->

  ({beforeEachRequire})->

    beforeEachRequire [
      "fixtures/TestCell1"
      'cell/View'
      'cell/Collection'
    ], (@TestCell1,@View,@Collection)->
      @view = new @View()
      @__ = @view.__

    describe '__( viewOrSelector:[View, String], attrHash_or_options?:Object, children...:[DOMNode, String, Number, Array] )', ->

      it_renders = (desc, input_args, expected_html_output, debug)->
        describe "__( #{desc} )", ->
          input_strings = stringify input_args, true
          it "__( #{input_strings} ) === #{expected_html_output}", ->
            debugger if debug
            nodeHTMLEquals (@__ input_args...), expected_html_output

      it_renders_views = (desc, input_args, expected_html_output, debug)->
        describe "__( #{desc} )", ->
          input_strings = stringify input_args, true
          it "__( View, #{input_strings} ) === #{expected_html_output}", ->
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

      it_renders 'selector:String, children...:[DOM Nodes, String, Number, Array]',
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
          node 'b'
        ]]
        '<p class="myclass myclass2" id="myid"><span></span>hello<table></table>world5<div></div>0<b></b></p>'

      it_renders 'selector:String, children...:[undefined, null]',
        [ 'p#myid.myclass.myclass2', [
          undefined
          null
        ]]
        '<p class="myclass myclass2" id="myid"></p>'

      it_renders "selector:String, attrHash:Object",
        [ 'p#myid.myclass.myclass2', class:'myclass3', 'data-custom':'myattr', 'data-custom2':'myattr2']
        '<p class="myclass3" data-custom="myattr" data-custom2="myattr2" id="myid"></p>'

      describe "on* event handlers", ->

        it 'registers event handler', ->
          @node = @__ '.bound', onclick: @clickHandler = jasmine.createSpy 'click'
          expect(@clickHandler).not.toHaveBeenCalled()
          browserTrigger @node, 'click'
          # expect(@clickHandler).toHaveBeenCalled()
          # expect(@clickHandler.calls[0].object).toBe @view

      it_renders "selector:String, attrHash:Object, children...:[DOM Nodes, String, Number, Array, jQuery]",
        [ 'p', 'data-custom':'myattr', 'data-custom2':'myattr2',
          node 'span'
          'hello'
          [node('table'), 'world', 5, [node('div')]]
          0
          node 'b'
        ]
        '<p data-custom="myattr" data-custom2="myattr2"><span></span>hello<table></table>world5<div></div>0<b></b></p>'

      it_renders 'selector:String, children...:[undefined, null]',
        [ 'p', 'data-custom':'myattr', 'data-custom2':'myattr2',
          undefined
          null
        ]
        '<p data-custom="myattr" data-custom2="myattr2"></p>'

      it_renders_views "view:View",
        []
        '<div cell="TestCell1" class="TestCell1">TestCell1 Contents</div>'
        true

    describe '__.if( condition:truthy, {then:function, else:function} )', ->

      describe 'when only then is provided', ->

        beforeEach ->
          @thenNode = node 'div'
          @thenElse =
            then: => @thenNode

        it 'when condition is truthy, renders then', ->
          expect(@__.if(true, @thenElse)).toEqual @thenNode

        it 'when condition is falsy, renders undefined', ->
          expect(@__.if(false, @thenElse)).toEqual undefined
        
      describe 'when only else is provided', ->

        beforeEach ->
          @elseNode = node 'div'
          @thenElse =
            else: => @elseNode

        it 'when condition is truthy, renders undefined', ->
          expect(@__.if(true, @thenElse)).toEqual undefined

        it 'when condition is falsy, renders undefined', ->
          expect(@__.if(false, @thenElse)).toEqual @elseNode

      describe 'when then and else are provided', ->

        beforeEach ->
          @thenNode = node 'div'
          @elseNode = node 'span'
          @thenElse =
            then: jasmine.createSpy('then').andCallFake => @thenNode
            else: jasmine.createSpy('else').andCallFake => @elseNode

        it 'when condition is truthy, renders then', ->
          for truthy in [true,1,'1',[],{}]
            expect(@__.if(truthy, @thenElse)).toEqual @thenNode

        it 'when condition is falsy, renders else', ->
          for falsy in [false,0,'',undefined,null]
            expect(@__.if(falsy, @thenElse)).toEqual @elseNode

        it 'calls then and else with View as `this`', ->
          @__.if true, @thenElse
          expect(@thenElse.then.calls[0].object).toBe @view

          @__.if false, @thenElse
          expect(@thenElse.else.calls[0].object).toBe @view

      describe 'when then/else returns an array of nodes', ->

        beforeEach ->
          @thenNode1 = node 'div'
          @thenNode2 = node 'div'
          @thenElse =
            then: => [
              @thenNode1
              @thenNode2
            ]

        it 'when condition is truthy, renders then', ->
            expect(@__.if(true, @thenElse)).toEqual [@thenNode1,@thenNode2]

    describe '__.each( many:array, renderer:function )', ->

      beforeEach ->
        @items = [
          {name:'a'}
          {name:'b'}
          {name:'c'}
        ]
        @eachRenderer = jasmine.createSpy('eachRenderer')
        @eachRenderer.andCallFake (item)=> @__ 'div', item.name or item.attributes.name

      it 'when many is non-empty array', ->
        result = @__.each @items, @eachRenderer
        expect(@eachRenderer.callCount).toEqual 3
        for item,i in @items
          expect(@eachRenderer.calls[i].args).toEqual [item,i,@items]
          expect(@eachRenderer.calls[i].object).toBe @view
        nodeHTMLEquals result[0], '<div>a</div>'
        nodeHTMLEquals result[1], '<div>b</div>'
        nodeHTMLEquals result[2], '<div>c</div>'

      it 'when many is undefined', ->
        result = @__.each undefined, @eachRenderer
        expect(@eachRenderer).not.toHaveBeenCalled()

    describe '__.each( many:array, view:View )', ->

      beforeEach ->
        @SubView = @View.extend
          _cellName: 'Sub'
          render: (__)-> @model.name
        @items = [
          {name:'a'}
          {name:'b'}
          {name:'c'}
        ]

      it 'when many is non-empty array', ->
        result = @__.each @items, @SubView
        nodeHTMLEquals result[0], '<div cell="Sub" class="Sub">a</div>'
        nodeHTMLEquals result[1], '<div cell="Sub" class="Sub">b</div>'
        nodeHTMLEquals result[2], '<div cell="Sub" class="Sub">c</div>'


    describe '__.each( collection:Collection, view:View )', ->

      beforeEach ->
        SubView = @View.extend
          _cellName: 'Sub'
          render: (__)-> @model.get 'name'

        @ParentView = @View.extend
          _cellName: 'Parent'
          render: (__)-> __.each @collection, SubView

        @collection = new @Collection [
          {name:'a'}
          {name:'b'}
          {name:'c'}
        ]

      it 'renders view for each model in the collection', ->
        result = (new @ParentView collection: @collection).el.children
        nodeHTMLEquals result[0], '<div cell="Sub" class="Sub">a</div>'
        nodeHTMLEquals result[1], '<div cell="Sub" class="Sub">b</div>'
        nodeHTMLEquals result[2], '<div cell="Sub" class="Sub">c</div>'
      