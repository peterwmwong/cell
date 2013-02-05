define ['util/type','util/extend','util/ev'], (type, extend, ev)->

  Events = ->
    @_e = all: []
    return

  Events.extend = extend
  Events:: =
    constructor: Events

    # (event, fn)
    # (event, fn, ctx)
    on: (event, fn, ctx)->
      if (type.isS event) and (type.isF fn)
        (@_e[event] or= []).push [fn,ctx]
        true

    # (event, fn)
    # (event, fn, ctx)
    # (undefined, fn)
    # (undefined, fn, ctx)
    # (undefined, undefined, ctx)
    off: (event, fn, ctx)->
      eventsHash =
        if event? then type: @_e[event]
        else @_e

      if fn?
        ctx = 0 if `ctx == null`

      else if ctx?
        fn = ctx
        ctx = 1

      else return

      for event of eventsHash when events = eventsHash[event]
        ev.rm events, fn, ctx

      return

    trigger: (event, args...)->
      allHandlers = @_e.all.concat @_e[event] or []
      if i = allHandlers.length
        while i--
          h = allHandlers[i]
          h[0].apply h[1], [event].concat args
      return

  Events