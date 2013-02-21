define [
  'util/hash'
  'util/type'
  'util/fn'
  'util/extend'
  'cell/util/spy'
], (hash, type,fn,extend,spy)->

  getValue = (v,callback)->
    if type.isF v
      spy.watch hash(@view), (fn.b0 v, @view), (fn.b1 callback, @)
    else
      callback.call @, v
    return

  Ext = (@options={})->
    @getValue = fn.b2 getValue, @
    return

  Ext::run = (element, view)->
    @func element, @options, @getValue, @view = view
    return

  Ext.extend = extend
  Ext