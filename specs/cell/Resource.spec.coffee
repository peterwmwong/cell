# The following is an example usage of a Resource.
# # Define the Resource
# CommentCard = Resource.extend url: '/commentCards/{id}'

# # Displays the name, description, and referers of a card
# # Also allows for editing and auto-saving of the name and description
# require('cell/defineView!')
#   beforeRender: ->
#     # Retrieve model by id
#     @model = CommentCard.get id: @options.id

#     # When the model changes, save the model. Limit save frequency to to no faster than every 300ms
#     @model.on 'any', (->@$save()),  debounce: 300

#   render: (_)->
#     switch @model.$status()
#       when 'loading'
#         _ '.loading', 'loading...'

#       when 'error'
#         _ '.error', 'Error Message'

#       when 'loaded' then [
#         _ 'input.name', (x_model 'name'), type:'text'
#         _ 'input.description', (x_model 'name'), type:'text'
#         _ '.referers',
#           -> @model.get('referers')?.map (referrer)->
#             _ '.referer', referrer.get 'url'
#       ]

#   # OR....

#   # Assumes css like...
#   # > .loading, > .error, > .loaded
#   #   visibility hidden
#   #
#   # &.loading > .loading
#   #   visibility visible
#   #
#   # &.error > .error
#   #   visibility visible
#   #
#   # &.loaded > .loaded
#   #   visibility visible
#   renderEl: (_)->
#     _ 'div', class:(-> @model.$status()),
#       _ '.loading', 'loading...'
#       _ '.error', 'Error Message'
#       _ 'input.name', (x_model 'name'), type:'text'
#       _ 'input.description', (x_model 'name'), type:'text'
#       _ '.referers',
#         -> @model.get('referers')?.map (referrer)->
#           _ '.referer', referrer.get 'url'

# # List the name of Comment Cards
# require('cell/defineView!')
#   beforeRender: ->
#     @collection = CommentCard.query()
#     @on 'change:filter',
#       (filter)=> @collection.requery name:filter
#       debounce: 1000
      
#   render: (_)-> [
#     _ 'input', (x_model 'filter', @), type:'text'
#     ->
#       switch @collection.$status()
#         when 'loading'
#           _ '.loading', 'loading...'

#         when 'error'
#           _ '.error', 'Error Message'

#         when 'loaded'
#           _ 'ul',
#             -> @collection.map (card)->
#               _ 'li', card.get 'name'
#   ]

#   # OR...

#   # Assumes css like...
#   # > .loading, > .error, > .loaded
#   #   visibility hidden
#   #
#   # &.loading > .loading
#   #   visibility visible
#   #
#   # &.error > .error
#   #   visibility visible
#   #
#   # &.loaded > .loaded
#   #   visibility visible
#   renderEl: (_)->
#     _ 'div', class:(-> @collection.$status()),
#       _ 'input', (x_model 'filter', @), type:'text'
#       _ '.loading', 'loading...'
#       _ '.error', 'Error Message'
#       _ 'ul.loaded',
#         -> @collection.map (card)->
#           _ 'li', card.get 'name'
#   ]

define ->
  
  ({beforeEachRequire})->
    beforeEachRequire [
      'cell/Resource'
      'cell/Collection'
    ], (@Resource, @Collection)->

    describe 'Resource', ->
      describe '#create( params:object ) : ResourceInstance', ->
      describe '#get( params:object ) : ResourceInstance', ->
      describe '#query( params:object ) : ResourceCollectionInstance', ->

    describe 'ResourceCollectionInstance', ->
      it 'is an instanceof Collection', ->
      describe '@requery( params:object ) : ', ->

    describe 'ResourceInstance', ->
      describe '@delete( params:object ) : ResourceInstance', ->
      describe '@save( params:object ) : ResourceInstance', ->
