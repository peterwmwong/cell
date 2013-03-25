define [
  'cell/Model'
  'cell/Collection'
  'cell/util/http'
  'util/extend'
  'util/type'
], (Model,Collection,http,extend,type)->

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

  copyObj = (obj)->
    newObj = {}
    for k of obj
      newObj[k] = obj[k]
    newObj

  Resource = (@url, @_params)->

  Resource::defaultParams = (params)->
    params[k] = @_params[k] for k of @_params
    return

  Resource::create = (params)->
    inst = new Resource.Instance()
    params = copyObj params
    http
      method: 'POST'
      url: @genUrl params, true
      data: JSON.stringify params
      (status,response)->
        for k,v of (JSON.parse response)
          inst.set k, v
        return
    inst

  Resource::get = (params)->
    inst = new Resource.Instance()
    params = copyObj params
    http
      method: 'GET'
      url: @genUrl params, false
      (status,response)->
        for k,v of (JSON.parse response)
          inst.set k, v
        return
    inst

  Resource::query = (params)->
    inst = new Resource.CollectionInstance()
    params = copyObj params
    http
      method: 'GET'
      url: @genUrl params, false
      (status,response)->
        inst.add JSON.parse response
        return
    inst

  Resource.Instance = Model.extend
    delete: (params)->

    save: (params)->


  Resource.CollectionInstance = Collection.extend
    requery: (params)->

  Resource::genUrl = (params, disableQueryParams)->
    @defaultParams params
    url = (url = @url).replace /{([A-z0-9]+)}/g, (match, key, index)->
      value = params[key]
      delete params[key]
      encodeURIComponent value

    unless disableQueryParams
      delim = '?'
      for k,v of params when v
        url += "#{delim}#{encodeURIComponent k}=#{encodeURIComponent v}"
        delim = '&'

    url

  Resource