define (require)->
  Parent = require 'cell!./Parent'

  initialize: ->
    @model.on 'flash', @onFlash, @
    @collection.on 'flash', @onFlash, @

    @parent = new Parent
      model: @model
      collection: @collection

  render: ->
    @$el.append @parent.render().el
    @
  
  onFlash: (modelOrCollection)->
    ++modelOrCollection.root

  events:
    'click': ->
      @model.root_el++
      false