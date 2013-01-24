define ->
  Surrogate = ->

  Ext = ->
  Ext:: =
    getValue: (v,callback)->
      callback(
        if typeof v is 'function' then v()
        else v
      )
      return
      
    run: (element)->
      @func element, @options, @getValue
      return

  Ext.extend = (func)->
    NewExt = (options)->
      return new NewExt(options) unless @ instanceof NewExt
      @options = options
      return

    Surrogate:: = Ext::
    NewExt:: = new Surrogate()
    NewExt::func = func
    NewExt

  Ext
