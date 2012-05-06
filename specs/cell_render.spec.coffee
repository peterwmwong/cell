define ['./spec-utils'], ({nodeHTMLEquals,stringify,node})->

  ({beforeEachRequire})->

    beforeEachRequire [
      'cell!fixtures/TestCell1'
      'cell'
    ], (@TestCell1, @cell)->
      @testCell1 = new @TestCell1

    describe 'render_el', ->

      it_renders = (desc, render_el_return, expected_html_output)->
        describe desc, ->
          input_strings = stringify render_el_return, true
          it "[#{input_strings}] === #{expected_html_output}", ->
            @testCell1.render_el = -> render_el_return
            nodeHTMLEquals @testCell1.render().el, expected_html_output

      it 'no render_el', ->
        nodeHTMLEquals @testCell1.render().el, '<div class="TestCell1">TestCell1 Contents</div>'

      it_renders 'Array of nodes',
        [
          node 'a'
          node 'span'
          node 'input'
        ]
        '<div class="TestCell1"><a></a><span></span><input></input></div>'

      it_renders 'Array of Nodes, Strings, Numbers, JQuery',
        [
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
          jQuery '<span class="jQueryObj"></span><span class="jQueryObjDeux"></span>'
        ]
        '<div class="TestCell1"><span></span>hello<table></table>world5<div></div>0<a></a><span class="jQueryObj"></span><span class="jQueryObjDeux"></span></div>'

    describe 'after_render', ->

      it 'called after render_el', ->
        @testCell1.render_el = sinon.stub()
        @testCell1.after_render = sinon.stub()
        @testCell1.render()
        expect(@testCell1.render_el.calledBefore @testCell1.after_render).toBe true


      it '@el already created', ->
        @testCell1.render_el = -> [
          node 'a'
          node 'span'
          node 'input'
        ]
        el = undefined
        @testCell1.after_render = -> el = @el
        @testCell1.render()
        nodeHTMLEquals el, '<div class="TestCell1"><a></a><span></span><input></input></div>'
