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
        nodeHTMLEquals @testCell1.render().el, '<div cell="TestCell1" class="TestCell1">TestCell1 Contents</div>'

      it_renders 'String',
        'hello world'
        '<div cell="TestCell1" class="TestCell1">hello world</div>'

      it_renders 'Number',
        777
        '<div cell="TestCell1" class="TestCell1">777</div>'

    describe 'after_render', ->

      it 'called after render_el', ->
        @testCell1.render_el = sinon.stub()
        @testCell1.after_render = sinon.stub()
        @testCell1.render()
        expect(@testCell1.render_el.calledBefore @testCell1.after_render).toBe true


      it '@el already created', ->
        @testCell1.render_el = -> 'hello world'
        el = undefined
        @testCell1.after_render = -> el = @el
        @testCell1.render()
        nodeHTMLEquals el, '<div cell="TestCell1" class="TestCell1">hello world</div>'
