define ['utils'], (utils)->
  Ext = (@options={})->
    @getValue = utils.bind @getValue, @
    return
  Ext:: =
    getValue: (v,callback)->
      callback(
        if typeof v is 'function' then v()
        else v
      )
      return
      
    run: (element, @view)->
      @func element, @options, @getValue, view
      return

  Ext.extend = utils.extend
  Ext
