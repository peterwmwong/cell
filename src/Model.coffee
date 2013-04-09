define [
  'cell/util/type'
  'cell/Events'
  'cell/util/spy'
], (type, Events, spy)->

  Model = Events.extend
    constructor: (@_a={})->
      Events.call @
      @parent = undefined
      value.parent = @ for key,value of @_a when value instanceof Events
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
          delete old_value.parent

        if value instanceof Events
          value.parent = @

        @trigger "change:#{key}", @, (@_a[key] = value), old_value
        true

    destroy: ->
      Events::destroy.call @
      @parent?.remove [@] if @parent
      delete @_a
      @destroy = @attributes = @get = @set = ->
      return

    _s: spy.addModel

  Model