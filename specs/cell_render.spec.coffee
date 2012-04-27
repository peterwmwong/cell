define ['./spec-utils'], ({nodeHTMLEquals,nodeToHTML})->
  NODE = (tag)-> document.createElement tag

  ({beforeEachRequire})->

    beforeEachRequire ['cell!fixtures/TestCell1'], (@TestCell1)->
      @testCell1 = new @TestCell1

    describe 'render_el', ->

      it_renders = (desc, render_el_return, expected_html_output)->
        describe desc, ->
          it "[#{render_el_return.join ','}] renders el === '#{expected_html_output}'", ->
            @testCell1.render_el = -> render_el_return
            nodeHTMLEquals @testCell1.render().el, expected_html_output

      it 'no render_el', ->
        nodeHTMLEquals @testCell1.render().el, '<div class="TestCell1"></div>'

      it 'render_el is passed cell.__', ->
        @testCell1.render_el = sinon.stub()
        @testCell1.render()
        expect(@testCell1.render_el.calledWithExactly cell::__).toBe true

      it_renders 'Array of nodes',
        [
          NODE 'a'
          NODE 'span'
          NODE 'input'
        ]
        '<div class="TestCell1"><a></a><span></span><input></input></div>'

    describe 'after_render', ->

      it 'called after render_el', ->
        @testCell1.render_el = sinon.stub()
        @testCell1.after_render = sinon.stub()
        @testCell1.render()
        expect(@testCell1.render_el.calledBefore @testCell1.after_render).toBe true


      it '@el already created', ->
        @testCell1.render_el = -> [
          NODE 'a'
          NODE 'span'
          NODE 'input'
        ]
        el = undefined
        @testCell1.after_render = -> el = @el
        @testCell1.render()
        nodeHTMLEquals el, '<div class="TestCell1"><a></a><span></span><input></input></div>'
