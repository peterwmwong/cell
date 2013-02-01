define ['../../utils/spec-utils'], ({node,browserTrigger})-> ({beforeEachRequire})->
  beforeEachRequire [
    'cell/opts/ViewExts'
    'cell/opts/ViewBindings'
    'cell/View'
    'cell/exts/x_model'
  ], (@ViewExts, @ViewBindings, @View, @x_model)->

  describe 'x_model( model_attr:string )', ->
    beforeEach ->
      @NewView = @View.extend
        render: (__)=> [
          __ 'input', (@x_model 'text'), type: 'text'
          __ 'input', (@x_model 'check'), type: 'checkbox'
        ]
      @model =
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
      expect(@model).toEqual
        text: 'new text value'
        check: true

      checkbox = @view.el.children[1]
      checkbox.checked = false
      browserTrigger checkbox, 'change'
      expect(@model).toEqual
        text: 'new text value'
        check: false

    it 'model -> view', ->
      text = @view.el.children[0]
      checkbox = @view.el.children[1]

      @model.text = 'new text value'
      @view.updateBinds()
      expect(text.value).toBe 'new text value'
      expect(checkbox.checked).toBe true

      @model.check = false
      @view.updateBinds()
      expect(text.value).toBe 'new text value'
      expect(checkbox.checked).toBe false