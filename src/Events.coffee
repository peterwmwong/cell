define [
  'cell/util/ev'
  'cell/util/extend'
  'cell/util/hash'
  'cell/util/spy'
  'cell/util/type'
], (ev, extend, hash, spy, type)->

  triggerHandlers = (handlers, event, args)->
    while (h = handlers.pop())
      h[0].apply h[1], [event].concat args
    return

  Events = ->
    hash @
    @_e = all: []
    return

  Events.extend = extend
  Events:: =
    constructor: Events

    # (event, fn)
    # (event, fn, ctx)
    on: (event, fn, ctx)->
      if @_e
        if (type.isS event) and (type.isF fn)
          (@_e[event] or= []).push [fn,ctx]
          true

    # (event, fn)
    # (event, fn, ctx)
    # (undefined, fn)
    # (undefined, fn, ctx)
    # (undefined, undefined, ctx)
    off: (event, fn, ctx)->
      if @_e
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

    parent: ->
      spy.addParent @
      @_parent

    _setParent: (newParent)->
      unless @_parent is newParent
        @_parent = newParent
        @trigger "parent#{@$$hashkey}"
      return

    trigger: (event, args...)->
      if @_e
        triggerHandlers (@_e.all.concat @_e[event] or []), event, args
        if parent = @_parent
          parent.trigger.apply parent, [event].concat args
      return

    destroy: ->
      if events = @_e
        delete @_e
        triggerHandlers events.all.concat(events.destroy or []), 'destroy', @
      return

  Events