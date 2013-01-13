define (require)->

  require('cell/defineView!')
    initialize: ->
      @listenTo @model, 'flash', @onFlash
      @listenTo @collection, 'flash', @onFlash

    render_el: -> 'Child'
    
    onFlash: (modelOrCollection)->
      ++modelOrCollection.child

    events:
      'click': ->
        @model.child_el++
        false