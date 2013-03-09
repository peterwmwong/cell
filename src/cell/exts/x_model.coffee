define [
  'dom/events'
  'cell/Ext'
], (events,Ext)->

  ModelElement =
    input:
      text: text =
        e: 'keyup'
        g: 'value'
        s: (value)->
          @el[@ea] = value
          return
      checkbox:
        e: 'change'
        g: 'checked'
        s: (value)->
          @el[@ea] = not not value
          return
    select:
      e: 'change'
      g: text.g
      s: text.s
    textarea: text

  Ext.extend
    render: ->
      if modelEl = ModelElement[tag = @el.tagName.toLowerCase()]
        modelEl = modelEl[@el.type] if tag is 'input'

      if modelEl
        @ea = modelEl.g
        events.on @el, modelEl.e, =>
          @view.model.set @options, @el[modelEl.g]
          return
        @watch (->@view.model.get @options), modelEl.s
      return