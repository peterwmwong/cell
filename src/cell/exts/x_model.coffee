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
    func: (@el, ma, getValue, view)->
      if modelEl = ModelElement[tag = el.tagName.toLowerCase()]
        modelEl = modelEl[el.type] if tag is 'input'

      if modelEl
        @ea = modelEl.g
        events.on el, modelEl.e, ->
          view.model.set ma, el[modelEl.g]
          return
        getValue (-> @model.get ma), modelEl.s
      return