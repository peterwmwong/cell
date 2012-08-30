define ['./spec-utils'], ({nodeHTMLEquals,stringify,node})->
  TestCell1Name = 'fixtures/TestCell1'
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


    describe '__()', ->

      beforeEachRequire [
        "cell!#{TestCell1Name}"
        '__'
      ], (@TestCell1,@__)->

      for invalid in ['',undefined,null, (->)] then do(invalid)->
        describe "#{invalid is '' and '""' or invalid}", ->
          it "__ #{invalid is '' and '""' or invalid} === undefined", ->
            expect(@__ invalid).toBe(undefined)

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
        true

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

      it_renders 'Selector:<String>, Children...:<undefined, null, Function>',
        [ 'p#myid.myclass.myclass2', [
          undefined
          null
          (->)
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

      it_renders 'Selector:<String>, Children...:<undefined, null, Function>',
        [ 'p', 'data-custom':'myattr', 'data-custom2':'myattr2',
          undefined
          null
          (->)
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
