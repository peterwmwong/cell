define [
  'cell/Ext'
  'dom/class'
], (Ext,cls)->

  Ext.extend
    render: ->
      if @options and @options.constructor is Object
        for k,v of @options then do(k)=>
          @watch v, (value)->
            (if value then cls.add else cls.remove) @el, k
            return
          return
      return