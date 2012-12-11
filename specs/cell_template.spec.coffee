define ['./spec-utils'], ({nodeHTMLEquals,stringify,node})->
  verify_is_jQueryish = (obj)->
    expect(Object.getPrototypeOf obj).toBe $.fn

  ({beforeEachRequire})->

    describe '__.$()', ->

      beforeEachRequire ['__'], (__)->
        @result = __.$ 'p#myid.myclass.myclass2'

      it 'returns a jQuery-ish object', ->
        verify_is_jQueryish @result

      it 'jQuery-ish object wraps whatever is returned from __', ->
        nodeHTMLEquals @result[0], '<p class="myclass myclass2" id="myid"></p>'


    describe 'Reference integration', ->

      beforeEachRequire [
        '__'
        'ref'
      ], (@__, ref)->
        @model = new Backbone.Model().set
          a: 'a val'
          b: 'b val'
          c: 'c val'

        @ref_a = @model.ref 'a'
        @ref_b = @model.ref 'b'
        @ref_a_b = @ref_a.combine @ref_b

      describe 'when a Reference is passed as an attribute value', ->

        beforeEach ->
          @node = @__ '.bound', 'data-custom': @ref_a

        it "sets initial value of References's value to the element's attribute", ->
          expect(@node.getAttribute 'data-custom').toBe 'a val'

        describe "when the Reference's value changes", ->
          beforeEach ->
            @model.set a: 'a val 2'

          it "automatically sets value of the Reference to the element's attribute", ->
            done = false
            runs -> setTimeout (->done=true), 10
            waitsFor -> done
            runs =>
              expect(@node.getAttribute 'data-custom').toBe  "a val 2"

      describe 'when a Reference is passed as a child', ->

        beforeEach ->
          @node = @__ '.bound', @ref_a

        it "sets initial value of References's value to the element's attribute", ->
          expect(@node.innerHTML).toBe 'a val'

        describe "when the Reference's value changes", ->
          beforeEach ->
            @model.set a: 'a val 2'

          it "automatically sets value of the Reference to the element's attribute", ->
            done = false
            runs -> setTimeout (->done=true), 10
            waitsFor -> done
            runs =>
              expect(@node.innerHTML).toBe  "a val 2"


    describe 'Cell.prototype.render is modified', ->

      beforeEachRequire ['cell','__'], ({Cell},@__)->
        @cdef = renderEl: (__,bindTo)->
        spyOn(@cdef, 'renderEl').andCallThrough()
        C = Cell.extend(@cdef)
        new C().render()
          
      it 'calls Cell.renderEl(__,__.bindTo)', ->
        expect(@cdef.renderEl).toHaveBeenCalledWith(@__, @__.bindTo)

    describe '__( viewOrSelector:[Backbone.View, String], attrHash_or_options?:Object, children:[DOMNode, String, Number, Array, jQuery] )', ->

      beforeEachRequire [
        "fixtures/TestCell1"
        '__'
      ], (@TestCell1,@__)->

      for invalid in [(->)] then do(invalid)->
        invalid_str = "#{invalid is '' and '""' or invalid}"
        describe "__( #{invalid_str} )", ->
          it "__( #{invalid_str} ) === undefined", ->
            expect(=> @__ invalid).toThrow()

      for empty in ['',undefined,null] then do(empty)->
        empty_str = "#{empty is '' and '""' or empty}"
        describe "__( #{empty_str} )", ->
          it "__( #{empty_str} ) === undefined", ->
            expect(@__ empty).toBe undefined

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

