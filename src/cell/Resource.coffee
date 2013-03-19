define [

], ()->

  # CommentCard = Resource.extend
  #   url: '/commentCards/{id}'

  # # Displays the name, description, and referers of a card
  # # Also allows for editing and auto-saving of the name and description
  # require('cell/defineView!')
  #   beforeRender: ->
  #     @model = CommentCard.get id: @options.id

  #     # When the model changes, save the model. Limit save frequency to to no faster than every 300ms
  #     @model.on 'any', (->@$save()),  debounce: 300

  #   render: (_)-> [
  #     _ 'input.name', (x_model 'name'), type:'text'
  #     _ 'input.description', (x_model 'name'), type:'text'
  #     _ '.referers', ->
  #       @model.get('referers')?.map (referrer)->
  #         _ '.referer', referrer.get 'url'
  #   ]

  # # List the name of Comment Cards
  # require('cell/defineView!')
  #   beforeRender: ->

  #     # Watch for when 'filter' changes...
  #     @watch (-> @get 'filter'),

  #       # ... and query for a new list of cards that match 'filter'
  #       (filter)-> @set 'cards', CommentCard.query name: filter

  #       # If 'filter' changes too frequently, only evaluate every 100ms at most
  #       debounce: 100

  #   render: (_)-> [
  #     _ 'input', (x_model 'filter', @),
  #       type:'text'
  #       onkeypress:(e)->
  #         if e.which is '13'
  #           @set 'cards', CommentCard.query name: @get 'filter'
  #     _ 'ul',
  #       -> @get('cards').map (card)->
  #         _ 'li', card.get 'name'
  #   ]

  Resource = (@url)->
    # @url = 