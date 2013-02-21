define [
  'dom/events'
  'cell/Ext'
], (events,Ext)->

  ModelElement =
    text:
      g: 'value'
      s: (value)->
        @el[@ea] = value
        return
    checkbox:
      g: 'checked'
      s: (value)->
        @el[@ea] = (not not value)
        return

  Ext.extend
    func: (@el, ma, getValue, view)->
      if (@el.tagName is 'INPUT') and (modelEl = ModelElement[@el.type.toLowerCase()])
        @ea = modelEl.g
        events.on @el,
          'change'
          ->
            view.model.set ma, @el[@ea]
            return
          @
        getValue (-> @model.get ma), modelEl.s
      return