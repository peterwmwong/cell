define ['utils'], (utils)->

  Model = (@_a={})->
    @_e = any: []
    return

  Model:: =

    get: (key)-> @_a[key]
    set: (key, value)->
      if (utils.isS key) and (@_a[key] isnt value)
        old_value = @_a[key]
        @trigger "change:#{key}", (@_a[key] = value), old_value
        true

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
        utils.ev.rm events, fn, ctx

      return

    trigger: (type, args...)->
      allHandlers = @_e['any'].concat @_e[type] or []
      if i = allHandlers.length
        while i--
          h = allHandlers[i]
          h[0].apply h[1], [type].concat args
      return

    onChangeAndDo: (key, cb, ctx)->
      if @on "change:#{key}", cb, ctx
        cb "initial:#{key}", @get key
      return

  Model