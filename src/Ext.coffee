define ->
  Surrogate = ->

  Ext = ->
  Ext::run = (element)->
    @func element, @options
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
