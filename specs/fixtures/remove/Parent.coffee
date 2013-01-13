define (require)->
  Child = require './Child'

  require('cell/defineView!')
    initialize: ->
      @listenTo @model, 'flash', @onFlash
      @listenTo @collection, 'flash', @onFlash

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
