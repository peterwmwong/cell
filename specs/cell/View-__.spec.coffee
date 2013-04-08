define ['../utils/spec-utils'], ({nodeHTMLEquals,stringify,node,browserTrigger})->

  ({beforeEachRequire})->

    beforeEachRequire [
      "fixtures/TestCell1"
      'cell/View'
      'cell/Collection'
    ], (@TestCell1,@View,@Collection)->
      @view = new @View()
      @_ = @view._

    describe '_( viewOrSelector:[View, String], attrHash_or_options?:Object, children...:[DOMNode, String, Number, Array] )', ->

      it_renders = (desc, input_args, expected_html_output, debug)->
        describe "_( #{desc} )", ->
          input_strings = stringify input_args, true
          it "_( #{input_strings} ) === #{expected_html_output}", ->
            debugger if debug
            nodeHTMLEquals (@_ input_args...), expected_html_output

      it_renders_views = (desc, input_args, expected_html_output, debug)->
        describe "_( #{desc} )", ->
          input_strings = stringify input_args, true
          it "_( View, #{input_strings} ) === #{expected_html_output}", ->
            debugger if debug
            nodeHTMLEquals (@_ @TestCell1, input_args...), expected_html_output

      describe "_( function )", ->
        it "_( function ) === undefined", ->
          expect(@_ ->).toBe undefined

      for empty in [undefined,null] then do(empty)->
        empty_str = "#{empty is '' and '""' or empty}"
        describe "_( #{empty_str} )", ->
          it "_( #{empty_str} ) === undefined", ->
            expect(@_ empty).toBe undefined

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

      it_renders 'selector:String, undefined',
        [ 'p#myid.myclass.myclass2', undefined ]
        '<p class="myclass myclass2" id="myid"></p>'
        true

      it_renders "selector:String, attrHash:Object",
        [ 'p#myid.myclass.myclass2', class:'myclass3', 'data-custom':'myattr', 'data-custom2':'myattr2']
        '<p class="myclass myclass2 myclass3" data-custom="myattr" data-custom2="myattr2" id="myid"></p>'

      it_renders "selector:String, attrHash:Object (innerHTML as a property)",
        [ 'p#myid.myclass.myclass2', class:'myclass3', 'data-custom':'myattr', innerHTML:'<b>wompa</b>']
        '<p class="myclass myclass2 myclass3" data-custom="myattr" id="myid"><b>wompa</b></p>'

      describe "on* event handlers", ->

        it 'registers event handler', ->
          @node = @_ '.bound', onclick: @clickHandler = jasmine.createSpy 'click'
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

    describe '_.each( arrayOrCollection:[array,Collection], renderer:function )', ->
      beforeEach ->
        @items = [
          {name:'a'}
          {name:'b'}
          {name:'c'}
        ]
        @eachRenderer = jasmine.createSpy 'eachRenderer'
        @eachRenderer.andCallFake (item)=> @_ 'b', item.name or item.get 'name'

      describeEachRender = (renderValue,expectedInnerHTML)->
        describe "when renderer returns #{renderValue}, expected #{expectedInnerHTML}", ->
          beforeEach ->
            @ParentView = @View.extend
              _cellName: 'Parent'
              render: (_)=> _.each @items, -> renderValue
            @view = new @ParentView

          it 'renders correctly', ->
            nodeHTMLEquals @view.el,
              '<div cell="Parent" class="Parent">'+
                expectedInnerHTML+
              '</div>'

      describeEachRender 5, '555'
      describeEachRender (-> 6), '666'

      describeEachRender 'my string', 'my stringmy stringmy string'
      describeEachRender (-> 'my string2'), 'my string2my string2my string2'

      describeEachRender [node('b'), node('a')], '<b></b><a></a>'
      describeEachRender (-> [node('a'), node('b')]), '<a></a><b></b><a></a><b></b><a></a><b></b>'

      describeEachRender [], ''
      describeEachRender undefined, ''
      describeEachRender (-> -> 6), ''

      describe '_.each( undefined, renderer:function )', ->

        beforeEach ->
          @ParentView = @View.extend
            _cellName: 'Parent'
            render: (_)=> _.each undefined, @eachRenderer
          @view = new @ParentView

        it 'does NOT calls renderer', ->
          expect(@eachRenderer).not.toHaveBeenCalled()

        it 'renders correctly', ->
          nodeHTMLEquals @view.el,
            '<div cell="Parent" class="Parent"></div>'

      describe '_.each( array:array, renderer:function )', ->

        beforeEach ->
          @ParentView = @View.extend
            _cellName: 'Parent'
            render: (_)=> _.each @items, @eachRenderer
          @view = new @ParentView

        it 'calls renderer for each model in the collection', ->
          expect(@eachRenderer.callCount).toEqual 3
          for item,i in @items
            expect(@eachRenderer.calls[i].args).toEqual [item,i,@items]
            expect(@eachRenderer.calls[i].object).toBe @view

        it 'renders correctly', ->
          nodeHTMLEquals @view.el,
            '<div cell="Parent" class="Parent">'+
              '<b>a</b>'+
              '<b>b</b>'+
              '<b>c</b>'+
            '</div>'

      describe '_.each( array:array, renderer:function ), array is empty', ->

        beforeEach ->
          @ParentView = @View.extend
            _cellName: 'Parent'
            render: (_)=> _.each [], @eachRenderer
          @view = new @ParentView

        it 'does NOT calls renderer', ->
          expect(@eachRenderer).not.toHaveBeenCalled()

        it 'renders correctly', ->
          nodeHTMLEquals @view.el,
            '<div cell="Parent" class="Parent"></div>'

      describe '_.each( collection:Collection, renderer:function )', ->

        beforeEach ->
          @collection = new @Collection @items
          eachRenderer = @eachRenderer 

          @ParentView = @View.extend
            _cellName: 'Parent'
            render: (_)-> _.each @collection, eachRenderer
          @view = new @ParentView collection: @collection

        it 'calls renderer for each model in the collection', ->
          expect(@eachRenderer.callCount).toEqual 3
          @collection.each (item, i)=>
            expect(@eachRenderer.calls[i].args).toEqual [item,i,@collection]
            expect(@eachRenderer.calls[i].object).toBe @view

        it 'renders correctly', ->
          nodeHTMLEquals @view.el,
            '<div cell="Parent" class="Parent">'+
              '<b>a</b>'+
              '<b>b</b>'+
              '<b>c</b>'+
            '</div>'

      describe '_.each( collection:Collection, renderer:function ), collection is empty', ->

        beforeEach ->
          @collection = new @Collection
          eachRenderer = @eachRenderer 

          @ParentView = @View.extend
            _cellName: 'Parent'
            render: (_)-> _.each @collection, eachRenderer
          @view = new @ParentView collection: @collection

        it 'does NOT calls renderer', ->
          expect(@eachRenderer).not.toHaveBeenCalled()

        it 'renders correctly', ->
          nodeHTMLEquals @view.el,
            '<div cell="Parent" class="Parent"></div>'