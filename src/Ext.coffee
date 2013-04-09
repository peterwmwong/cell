define [
  'cell/util/extend'
  'cell/util/spy'
], (extend,spy)->

  Ext = (@options={})->

  Ext::watch = (v,callback)->
    spy.watch @view, v, callback, @
    return

  Ext::run = (@el, @view)->
    @render()
    return

  Ext.extend = extend
  Ext