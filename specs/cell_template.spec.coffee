define ['./utils/spec-utils'], ({nodeHTMLEquals,stringify,node})->

  ({beforeEachRequire})->

    describe '__.if( condition:truthy, {then:function, else:function} )', ->

      beforeEachRequire ['cell/View'], (View)->
        @__ = new View().__

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
            then: => @thenNode
            else: => @elseNode

        it 'when condition is truthy, renders then', ->
          for truthy in [true,1,'1',[],{}]
            expect(@__.if(truthy, @thenElse)).toEqual @thenNode

        it 'when condition is falsy, renders else', ->
          for falsy in [false,0,'',undefined,null]
            expect(@__.if(falsy, @thenElse)).toEqual @elseNode


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

    describe '__.each( many:arrayOrCollection, renderer:function )', ->

      beforeEachRequire ['cell/View'], (View)->
        @__ = new View().__
        @items = [
          {name:'a'}
          {name:'b'}
          {name:'c'}
        ]
        @eachRenderer = jasmine.createSpy('eachRenderer')
        @eachRenderer.andCallFake (item)=> @__ 'div', item.name or item.attributes.name

      it 'when many is an empty array or collection', ->
        expect(@__.each [], @eachRenderer).toEqual []
        expect(@__.each (new Backbone.Collection), @eachRenderer).toEqual []
        expect(@eachRenderer.callCount).toEqual 0

      it 'when many is non-empty array', ->
        result = @__.each @items, @eachRenderer
        expect(@eachRenderer.callCount).toEqual 3
        expect(@eachRenderer.calls[i].args).toEqual [item,i,@items] for item,i in @items
        nodeHTMLEquals result[0], '<div>a</div>'
        nodeHTMLEquals result[1], '<div>b</div>'
        nodeHTMLEquals result[2], '<div>c</div>'

      it 'when many is non-empty collection', ->
        collection = new Backbone.Collection @items

        result = @__.each collection, @eachRenderer
        expect(@eachRenderer.callCount).toEqual 3

        for item,i in @items
          args = @eachRenderer.calls[i].args
          expect(args[0] instanceof Backbone.Model).toBe true
          expect(args[0].attributes).toEqual item
          expect(args[1]).toEqual i
          expect(args[2]).toBe collection.models

        nodeHTMLEquals result[0], '<div>a</div>'
        nodeHTMLEquals result[1], '<div>b</div>'
        nodeHTMLEquals result[2], '<div>c</div>'

    describe '__( viewOrSelector:[Backbone.View, String], attrHash_or_options?:Object, children...:[DOMNode, String, Number, Array, jQuery] )', ->

      beforeEachRequire [
        "fixtures/TestCell1"
        'cell/View'
      ], (@TestCell1,View)->
        @__ = new View().__


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
        true

      it_renders_views "view:Backbone.View, options:Object",
        [ tagName: 'span' ]
        '<span cell="TestCell1" class="TestCell1">TestCell1 Contents</span>'

