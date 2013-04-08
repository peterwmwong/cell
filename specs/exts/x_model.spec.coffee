define ['spec-utils'], ({node,browserTrigger,waitOne,msie})-> ({beforeEachRequire})->
  beforeEachRequire [
    'cell/View'
    'cell/Model'
    'cell/exts/x_model'
  ], (@View, @Model, @x_model)->

  describe 'x_model( model_attr:string, model:Model )', ->
    beforeEach ->
      x_model = @x_model
      @NewView = @View.extend
        beforeRender: ->
          @set 'textarea', 'textarea value'

        render: (_)-> [
          _ 'textarea', (x_model 'textarea',  @)
        ]
      @view = new @NewView
      @v_textarea = @view.el.children[0]

    describe 'view -> model', ->

      it 'textarea', ->
        @v_textarea.value = 'new textarea value'
        browserTrigger @v_textarea, 'keyup'
        expect(@view.get('textarea')).toEqual 'new textarea value'

    describe 'model -> view', ->

      it 'textarea', ->
        @view.set 'textarea', 'new textarea value'
        waitOne ->
          expect(@v_textarea.value).toBe 'new textarea value'

  describe 'x_model( model_attr:string )', ->
    beforeEach ->
      @NewView = @View.extend
        render: (_)=> [
          @v_textarea = _ 'textarea', (@x_model 'textarea'),
          @v_text = _ 'input', (@x_model 'text'), type: 'text'
          @v_checkbox = _ 'input', (@x_model 'check'), type: 'checkbox'
          @v_select = _ 'select', (@x_model 'select'),
            _ 'option', value: 'two'
            _ 'option', value: 'one'
            _ 'option', value: 'three'
        ]

    describe 'when model values are initially undefined', ->
      beforeEach ->
        @view = new @NewView model: new @Model

      it 'should render model attribute value to inputs', ->
        expect(@v_textarea.value).toBe ''
        expect(@v_text.value).toBe ''
        expect(@v_checkbox.checked).toBe false
        expect(@v_select.value).toBe 'two'

    describe 'when model values are initially defined', ->

      beforeEach ->
        @model = new @Model
          textarea: 'textarea value'
          text: 'text value'
          check: true
          select: 'one'
        @view = new @NewView model: @model

      it 'should render model attribute value to inputs', ->
        expect(@v_textarea.value).toBe 'textarea value'
        expect(@v_text.value).toBe 'text value'
        expect(@v_checkbox.checked).toBe true
        expect(@v_select.value).toBe 'one'

      describe 'view -> model', ->

        it 'text', ->
          @v_text.value = 'new text value'
          browserTrigger @v_text, 'keyup'
          expect(@model.attributes()).toEqual
            textarea: 'textarea value'
            text: 'new text value'
            check: true
            select: 'one'

        it 'checkbox', ->
          if msie < 9
            @v_checkbox.defaultChecked = false
          else
            @v_checkbox.checked = false
          browserTrigger @v_checkbox, 'change'
          expect(@model.attributes()).toEqual
            textarea: 'textarea value'
            text: 'text value'
            check: false
            select: 'one'

        it 'select', ->
          @v_select.value = 'three'
          browserTrigger @v_select, 'change'
          expect(@model.attributes()).toEqual
            textarea: 'textarea value'
            text: 'text value'
            check: true
            select: 'three'

        it 'textarea', ->
          @v_textarea.value = 'new textarea value'
          browserTrigger @v_textarea, 'keyup'
          expect(@model.attributes()).toEqual
            textarea: 'new textarea value'
            text: 'text value'
            check: true
            select: 'one'

      describe 'model -> view', ->

        it 'text', ->
          @model.set 'text', 'new text value'
          waitOne ->
            expect(@v_text.value).toBe 'new text value'
            expect(@v_textarea.value).toBe 'textarea value'
            expect(@v_checkbox.checked).toBe true
            expect(@v_select.value).toBe 'one'

        it 'checkbox', ->
          @model.set 'check', false
          waitOne ->
            expect(@v_text.value).toBe 'text value'
            expect(@v_textarea.value).toBe 'textarea value'
            expect(@v_checkbox.checked).toBe false
            expect(@v_select.value).toBe 'one'

        it 'select', ->
          @model.set 'select', 'three'
          waitOne ->
            expect(@v_text.value).toBe 'text value'
            expect(@v_textarea.value).toBe 'textarea value'
            expect(@v_checkbox.checked).toBe true
            expect(@v_select.value).toBe 'three'

        it 'textarea', ->
          @model.set 'textarea', 'new textarea value'
          waitOne ->
            expect(@v_text.value).toBe 'text value'
            expect(@v_textarea.value).toBe 'new textarea value'
            expect(@v_checkbox.checked).toBe true
            expect(@v_select.value).toBe 'one'