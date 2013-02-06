define [
  'util/type'
  'util/fn'
  'util/extend'
  'cell/util/spy'
], (type,fn,extend,spy)->

  Ext = (@options={})->
    @getValue = fn.bind @getValue, @
    return

  Ext:: =
    getValue: (v,callback)->
      if type.isF v
        spy.watch (fn.bind v, @view), (value)=>
          callback.call @, value
          return
      else
        callback.call @, v
      return
      
    run: (element, @view)->
      @func element, @options, @getValue, @view
      return

  Ext.extend = extend
  Ext
