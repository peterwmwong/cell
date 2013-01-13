define (require)->
  Parent = require './Parent'

  require('cell/defineView!')
    initialize: ->
      @listenTo @model, 'flash', @onFlash
      @listenTo @collection, 'flash', @onFlash

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