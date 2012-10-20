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

    describe '__.bind(backbone_model, attrs, transform)', ->

      describe 'when passed as a Child for __()', ->

        describe "when attrs is an Array (multiple attribute names)", ->
          beforeEachRequire ['__'], (__)->
            @model = new Backbone.Model().set
              attr1: 'initial value1'
              attr2: 'initial value2'

            @node = __ '.bound',
              __.bind @model, ['attr1','attr2'], (attr1, attr2, model)-> "attr1: #{attr1}, attr2: #{attr2}"

          it "sets initial value of backbone_model's attribute (attrs) to innerHTML", ->
            expect(@node.innerHTML).toBe "attr1: initial value1, attr2: initial value2"

          describe "backbone_model either attribute changes", ->
            beforeEach ->
              @model.set
                attr1: 'new1'
                attr2: 'new2'

            it "automatically sets value of the backbone_model's attribute (attrs) to innerHTML", ->
              expect(@node.innerHTML).toBe  "attr1: new1, attr2: new2"

        describe "when attrs is a string (one attribute's name)", ->

          describe "automatically transforms undefined into ''", ->
            beforeEachRequire ['__'], (__)->
              @model = new Backbone.Model()
              @node = __ '.bound',
                __.bind @model, 'attr'

            it "sets initial value of backbone_model's attribute (attrs) to innerHTML", ->
              expect(@node.innerHTML).toBe ""

          describe "and transform is a function, automatically transforms undefined into ''", ->
            beforeEachRequire ['__'], (__)->
              @model = new Backbone.Model()
              @node = __ '.bound',
                __.bind @model, 'attr', ->

            it "sets initial value of backbone_model's attribute (attrs) to innerHTML", ->
              expect(@node.innerHTML).toBe ""

          describe "and transform is undefined", ->
            beforeEachRequire ['__'], (__)->
              @model = new Backbone.Model().set
                attr: 'initial value'
              @node = __ '.bound',
                __.bind @model, 'attr'

            it "sets initial value of backbone_model's attribute (attrs) to innerHTML", ->
              expect(@node.innerHTML).toBe "initial value"

            describe "backbone_model attribute (attrs) changes", ->
              beforeEach ->
                @model.set 'attr', 'new value'

              it "automatically sets value of the backbone_model's attribute (attrs) to innerHTML", ->
                expect(@node.innerHTML).toBe "new value"

          describe "and transform is a function", ->
            beforeEachRequire ['__'], (__)->
              @model = new Backbone.Model().set
                attr: 'initial value'
              @node = __ '.bound',
                __.bind @model, 'attr', (attr, model)-> "attr: #{attr}"

            it "sets initial value of backbone_model's attribute (attrs) to innerHTML", ->
              expect(@node.innerHTML).toBe "attr: initial value"

            describe "backbone_model attribute (attrs) changes", ->
              beforeEach ->
                @model.set 'attr', 'new value'

              it "automatically sets value of the backbone_model's attribute (attrs) to innerHTML", ->
                expect(@node.innerHTML).toBe "attr: new value"

    describe 'Cell.prototype.render is modified', ->

      beforeEachRequire ['cell','__'], ({Cell},@__)->
        @cdef = render_el: (__,bind)->
        spyOn(@cdef, 'render_el').andCallThrough()
        C = Cell.extend(@cdef)
        new C().render()
          
      it 'calls Cell.render_el(__,__.bind)', ->
        expect(@cdef.render_el).toHaveBeenCalledWith(@__, @__.bind)

    describe '__()', ->

      beforeEachRequire [
        "cell!fixtures/TestCell1"
        '__'
      ], (@TestCell1,@__)->

      for invalid in [(->)] then do(invalid)->
        invalid_str = "#{invalid is '' and '""' or invalid}"
        describe invalid_str, ->
          it "__ #{invalid_str} === undefined", ->
            expect(=> @__ invalid).toThrow()

      for empty in ['',undefined,null] then do(empty)->
        empty_str = "#{empty is '' and '""' or empty}"
        describe empty_str, ->
          it "__ #{empty_str} === undefined", ->
            expect(@__ empty).toBe undefined

      it_renders = (desc, input_args, expected_html_output, debug)->
        describe desc, ->
          input_strings = stringify input_args, true
          it "__ #{input_strings} === #{expected_html_output}", ->
            debugger if debug
            nodeHTMLEquals (@__ input_args...), expected_html_output

      it_renders_cell = (desc, input_args, expected_html_output, debug)->
        describe desc, ->
          input_strings = stringify input_args, true
          it "__ Cell, #{input_strings} === #{expected_html_output}", ->
            debugger if debug
            nodeHTMLEquals (@__ @TestCell1, input_args...), expected_html_output

      it_renders 'Selector:<String> (tag, id, multiple classes)',
        ['p#myid.myclass.myclass2']
        '<p class="myclass myclass2" id="myid"></p>'

      it_renders 'Selector:<String>, Child:<String>',
        ['p#myid.myclass.myclass2', 'blargo']
        '<p class="myclass myclass2" id="myid">blargo</p>'

      it_renders 'Selector:<String>, Child:<String> # Zepto regression',
        ['p#myid.myclass.myclass2', '<']
        '<p class="myclass myclass2" id="myid"><</p>'

      it_renders 'Selector:<String>, Child:<Number>',
        ['p#myid.myclass.myclass2', 777]
        '<p class="myclass myclass2" id="myid">777</p>'

      it_renders 'Selector:<String>, Child:<Number === 0>',
        ['p#myid.myclass.myclass2', 0]
        '<p class="myclass myclass2" id="myid">0</p>'

      it_renders 'Selector:<String>, Child:<DOM Node>',
        ['p#myid.myclass.myclass2', node 'span']
        '<p class="myclass myclass2" id="myid"><span></span></p>'

      it_renders 'Selector:<String>, Child:<jQuery-ish object>',
        ['p#myid.myclass.myclass2', $('<span></span>')]
        '<p class="myclass myclass2" id="myid"><span></span></p>'

      do->
        mock_date = new Date()
        it_renders 'Selector:<String>, Child:<Date> # REGRESSION',
          ['p#myid.myclass.myclass2', mock_date]
          '<p class="myclass myclass2" id="myid">'+mock_date.toString()+'</p>'

      it_renders 'Selector:<String>, Children:<Array of Strings>',
        ['p#myid.myclass.myclass2', ['one','two']]
        '<p class="myclass myclass2" id="myid">onetwo</p>'

      it_renders 'Selector:<String>, Children...:<DOM Nodes, String, Number, Array, jQuery-ish object>',
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

      it_renders 'Selector:<String>, Children...:<undefined, null>',
        [ 'p#myid.myclass.myclass2', [
          undefined
          null
        ]]
        '<p class="myclass myclass2" id="myid"></p>'

      it_renders "Selector:<String>, Attribute Map:<Object>",
        [ 'p#myid.myclass.myclass2', class:'myclass3', 'data-custom':'myattr', 'data-custom2':'myattr2']
        '<p class="myclass3 myclass myclass2" data-custom="myattr" data-custom2="myattr2" id="myid"></p>'

      it_renders "Selector:<String>, Attribute Map:<Object>, Children...:<DOM Nodes, String, Number, Array, jQuery-ish object>",
        [ 'p', 'data-custom':'myattr', 'data-custom2':'myattr2',
          node 'span'
          'hello'
          [node('table'), 'world', 5, [node('div')]]
          0
          node 'a'
        ]
        '<p data-custom="myattr" data-custom2="myattr2"><span></span>hello<table></table>world5<div></div>0<a></a></p>'

      it_renders 'Selector:<String>, Children...:<undefined, null>',
        [ 'p', 'data-custom':'myattr', 'data-custom2':'myattr2',
          undefined
          null
        ]
        '<p data-custom="myattr" data-custom2="myattr2"></p>'

      it_renders_cell "cell:<cell>",
        []
        '<div class="TestCell1">TestCell1 Contents</div>'

      it_renders_cell "cell:<cell>, options:<Object>",
        [ tagName: 'span' ]
        '<span class="TestCell1">TestCell1 Contents</span>'

      it_renders_cell "cell:<cell>, Selector String:<String>",
        [ '#myid.myclass.myclass2' ]
        '<div class="TestCell1 myclass myclass2" id="myid">TestCell1 Contents</div>'

      it_renders_cell "cell:<cell>, Selector String:<String>, options:<Object>",
        [ '#myid.myclass.myclass2', tagName: 'a' ]
        '<a class="TestCell1 myclass myclass2" id="myid">TestCell1 Contents</a>'
