define ['util/fn','util/extend'], (fn,extend)->
  Ext = (@options={})->
    @getValue = fn.bind @getValue, @
    return
  Ext:: =
    getValue: (v,callback)->
      callback.call @, v
      return
      
    run: (element, @view)->
      @func element, @options, @getValue, view
      return

  Ext.extend = extend
  Ext
