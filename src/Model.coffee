define [
  'cell/util/type'
  'cell/Events'
  'cell/util/spy'
], (type, Events, spy)->

  Model = Events.extend
    constructor: (@_a={})->
      Events.call @
      value._setParent(@) for key,value of @_a when value instanceof Events
      return

    attributes: ->
      @_s 'all'
      result = {}
      for attr of @_a
        result[attr] = @_a[attr]
      result

    get: (key)->
      @_s "change:#{key}"
      @_a[key]

    set: (key, value)->
      old_value = @_a[key]
      if (type.isS key) and (old_value isnt value)

        if old_value instanceof Events
          old_value._setParent undefined

        if value instanceof Events
          value._setParent @

        @trigger "change:#{key}", @, (@_a[key] = value), old_value
        true

    destroy: ->
      Events::destroy.call @
      @_parent?.remove? [@] if @_parent
      delete @_a
      @destroy = @attributes = @get = @set = ->
      return

    _s: spy.addModel

  Model