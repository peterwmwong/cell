define [
  'util/type'
  'cell/Events'
  'cell/util/spy'
], (type, Events, spy)->

  Model = Events.extend
    constructor: (attributes)->
      @_a = attributes or {}
      @collection = undefined
      return

    attributes: ->
      if @_a
        @_s 'all'
        result = {}
        for attr of @_a
          result[attr] = @_a[attr]
        result

    get: (key)->
      if @_a
        @_s "change:#{key}"
        @_a[key]

    set: (key, value)->
      if @_a
        if (type.isS key) and (@_a[key] isnt value)
          old_value = @_a[key]
          @trigger (event = "change:#{key}"), @, (@_a[key] = value), old_value

          if collection = @collection
            collection.trigger event, @, value, old_value
          true

    onChangeAndDo: (key, cb, ctx)->
      if @_a
        if @on "change:#{key}", cb, ctx
          cb "initial:#{key}", @, @get key
      return

    destroy: ->
      if @_a
        Events::destroy.call @
        @collection.remove [@] if @collection
        delete @_a
      return

    _s: spy.addModel

  Model