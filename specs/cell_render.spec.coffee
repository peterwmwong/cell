define ['./utils/spec-utils'], ({nodeHTMLEquals,stringify,node})->

  ({beforeEachRequire})->

    beforeEachRequire [
      'fixtures/TestCell1'
      'cell/View'
    ], (@TestCell1, @View)->
      @testCell1 = new @TestCell1


    describe '@render()', ->

      beforeEach ->
        C = @View.extend renderEl: @renderEl = jasmine.createSpy 'renderEl'
        c = new C()
        @__ = c.__
        c.render()
          
      it 'calls Cell.renderEl(__)', ->
        expect(@renderEl).toHaveBeenCalledWith @__

    describe '@renderEl()', ->

      it_renders = (desc, render_el_return, expected_html_output)->
        describe desc, ->
          input_strings = stringify render_el_return, true
          it "[#{input_strings}] === #{expected_html_output}", ->
            @testCell1.renderEl = -> render_el_return
            nodeHTMLEquals @testCell1.render().el, expected_html_output

      it 'no renderEl', ->
        nodeHTMLEquals @testCell1.render().el, '<div cell="TestCell1" class="TestCell1">TestCell1 Contents</div>'

      it_renders 'String',
        'hello world'
        '<div cell="TestCell1" class="TestCell1">hello world</div>'

      it_renders 'Number',
        777
        '<div cell="TestCell1" class="TestCell1">777</div>'

    describe '@afterRender()', ->

      it 'called after renderEl', ->
        @testCell1.renderEl = sinon.stub()
        @testCell1.afterRender = sinon.stub()
        @testCell1.render()
        expect(@testCell1.renderEl.calledBefore @testCell1.afterRender).toBe true


      it '@el already created', ->
        @testCell1.renderEl = -> 'hello world'
        el = undefined
        @testCell1.afterRender = -> el = @el
        @testCell1.render()
        nodeHTMLEquals el, '<div cell="TestCell1" class="TestCell1">hello world</div>'
