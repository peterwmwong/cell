define ['utils'], (utils)->

  Events = ->
    @_e = any: []
    return

  Events.extend = utils.extend
  Events:: =
    constructor: Events

    # (type, fn)
    # (type, fn, ctx)
    on: (type, fn, ctx)->
      if (utils.isS type) and (utils.isF fn)
        (@_e[type] or= []).push [fn,ctx]
        true

    # (type, fn)
    # (type, fn, ctx)
    # (undefined, fn)
    # (undefined, fn, ctx)
    # (undefined, undefined, ctx)
    off: (type, fn, ctx)->
      eventsHash =
        if type? then type: @_e[type]
        else @_e

      if fn?
        ctx = 0 if `ctx == null`

      else if ctx?
        fn = ctx
        ctx = 1

      else return

      for type of eventsHash when events = eventsHash[type]
        utils.evrm events, fn, ctx

      return

    trigger: (type, args...)->
      allHandlers = @_e['any'].concat @_e[type] or []
      if i = allHandlers.length
        while i--
          h = allHandlers[i]
          h[0].apply h[1], [type].concat args
      return

  Events