define [
  'cell/Ext'
  'util/fn'
  'util/type'
  'dom/class'
], (Ext,fn,type,cls)->

  Ext.extend
    render: ->
      opts = @options
      if opts and opts.constructor is Object
        for k,v of opts then do(k)=>
          @watch (if type.isF(v) then fn.b0(v,@view) else v), (value)->
            (if value then cls.add else cls.remove) @el, k
            return
          return
      return