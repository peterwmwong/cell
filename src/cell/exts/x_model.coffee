define [
  'utils'
  'dom/events'
  'cell/Ext'
], (utils,events,Ext)->

  ModelElement =
    text:
      g: 'value'
      s: (value)->
        debugger
        @el[@ea] = value
        return
    checkbox:
      g: 'checked'
      s: (value)->
        @el[@ea] = not not value
        return

  onElementChange = ->
    @m[@ma] = @el[@ea]
    @v.updateBinds()
    return

  getModelValue = -> @m[@ma]

  Ext.extend
    func: (@el, @ma, getValue, @v)->
      if (@el.tagName is 'INPUT') and (modelEl = ModelElement[@el.type.toLowerCase()])
        @m = @v.model
        @ea = modelEl.g
        events.bind @el, 'change', (utils.bind onElementChange, @)
        getValue (utils.bind getModelValue, @), (utils.bind modelEl.s, @)
      return