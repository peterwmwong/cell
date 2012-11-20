define (require)->
  Child = require 'cell!./Child'

  initialize: ->
    @model.on 'flash', @onFlash, @
    @collection.on 'flash', @onFlash, @

    @child = new Child
      model: @model
      collection: @collection

  render: ->
    @$el.append @child.render().el
    @

  onFlash: (modelOrCollection)->
    ++modelOrCollection.parent

  events:
    'click': ->
      @model.parent_el++
      false
