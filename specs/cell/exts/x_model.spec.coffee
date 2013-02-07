define ['../../utils/spec-utils'], ({node,browserTrigger,waitOne})-> ({beforeEachRequire})->
  beforeEachRequire [
    'cell/opts/ViewExts'
    'cell/View'
    'cell/Model'
    'cell/exts/x_model'
  ], (@ViewExts, @View, @Model, @x_model)->

  describe 'x_model( model_attr:string )', ->
    beforeEach ->
      @NewView = @View.extend
        render: (__)=> [
          __ 'input', (@x_model 'text'), type: 'text'
          __ 'input', (@x_model 'check'), type: 'checkbox'
        ]
      @model = new @Model
        text: 'text value'
        check: true
      @view = new @NewView model: @model
        

    it 'should render model attribute value to inputs', ->
      expect(@view.el.children[0].value).toBe 'text value'
      expect(@view.el.children[1].checked).toBe true

    it 'view -> model', ->
      text = @view.el.children[0]
      text.value = 'new text value'
      browserTrigger text, 'change'
      expect(@model.attributes()).toEqual
        text: 'new text value'
        check: true

      checkbox = @view.el.children[1]
      checkbox.checked = false
      browserTrigger checkbox, 'change'
      expect(@model.attributes()).toEqual
        text: 'new text value'
        check: false

    describe 'model -> view', ->
      beforeEach ->
        @text = @view.el.children[0]
        @checkbox = @view.el.children[1]

      it 'text', ->
        @model.set 'text', 'new text value'
        waitOne ->
          expect(@text.value).toBe 'new text value'
          expect(@checkbox.checked).toBe true

      it 'check', ->
        @model.set 'check', false
        waitOne ->
          expect(@text.value).toBe 'text value'
          expect(@checkbox.checked).toBe false