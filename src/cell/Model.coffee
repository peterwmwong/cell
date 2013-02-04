define ['util/hash','util/type','cell/Events'], (hash, type, Events)->

  spy =
    add: (model, key)->
      if @l
        unless entry = @l[hashkey =  hash model]
          entry = @l[hashkey] = model: model, props: {}
        entry.props[key] = 1

    start: ->
      @l = {}
      return

    stop: ->
      log = @l
      @l = undefined
      log
  
  Model = Events.extend
    constructor: (attributes)->
      @_a = attributes or {}
      return

    attributes: ->
      result = {}
      for attr of @_a
        result[attr] = @_a[attr]
      result

    get: (key)->
      spy.add @, key
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

  Model._spy = spy
  Model