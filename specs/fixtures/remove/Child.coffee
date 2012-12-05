define (require)->

  require('cell!')
    initialize: ->
      @model.on 'flash', @onFlash, @
      @collection.on 'flash', @onFlash, @

    render_el: -> 'Child'
    
    onFlash: (modelOrCollection)->
      ++modelOrCollection.child

    events:
      'click': ->
        @model.child_el++
        false