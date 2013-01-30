define ['utils','cell/Events'], (utils, Events)->
  
  Events.extend
    constructor: (attributes)->
      @_a= attributes or {}
      return

    get: (key)-> @_a[key]

    set: (key, value)->
      if (utils.isS key) and (@_a[key] isnt value)
        old_value = @_a[key]
        @trigger "change:#{key}", (@_a[key] = value), old_value
        true

    onChangeAndDo: (key, cb, ctx)->
      if @on "change:#{key}", cb, ctx
        cb "initial:#{key}", @get key
      return