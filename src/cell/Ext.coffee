define [
  'util/hash'
  'util/type'
  'util/fn'
  'util/extend'
  'cell/util/spy'
], (hash,type,fn,extend,spy)->

  Ext = (@options={})->

  Ext::watch = (v,callback)->
    if type.isF v
      spy.watch hash(@view), (fn.b0 v, @), (fn.b1 callback, @)
    else
      callback.call @, v
    return

  Ext::run = (element, view)->
    @view = view
    @el = element
    @render()
    return

  Ext.extend = extend
  Ext