define [
  'util/extend'
  'cell/util/spy'
], (extend,spy)->

  Ext = (@options={})->

  Ext::watch = (v,callback)->
    spy.watch @view, v, callback, @
    return

  Ext::run = (element, view)->
    @view = view
    @el = element
    @render()
    return

  Ext.extend = extend
  Ext