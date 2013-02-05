define [
  'util/type'
  'cell/Events'
  'cell/util/spy'
], (type, Events, spy)->

  Model = Events.extend
    constructor: (attributes)->
      @_a = attributes or {}
      return

    attributes: ->
      @_s()
      result = {}
      for attr of @_a
        result[attr] = @_a[attr]
      result

    get: (key)->
      @_s key
      @_a[key]

    set: (key, value)->
      if (type.isS key) and (@_a[key] isnt value)
        old_value = @_a[key]
        @trigger "change:#{key}", @, (@_a[key] = value), old_value
        true

    onChangeAndDo: (key, cb, ctx)->
      if @on "change:#{key}", cb, ctx
        cb "initial:#{key}", @, @get key
      return

    _s: spy.addModel

  Model