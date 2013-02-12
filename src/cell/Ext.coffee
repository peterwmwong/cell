define [
  'util/hash'
  'util/type'
  'util/fn'
  'util/extend'
  'cell/util/spy'
], (hash, type,fn,extend,spy)->

  getValue = (v,callback)->
    _callback = (value)=>
      callback.call @, value
      return

    if type.isF v
      spy.watch hash(@view), (fn.bind v, @view), _callback
    else
      _callback v
    return

  Ext = (@options={})->
    @getValue = fn.bind getValue, @
    return

  Ext::run = (element, view)->
    @func element, @options, @getValue, @view = view
    return

  Ext.extend = extend
  Ext
