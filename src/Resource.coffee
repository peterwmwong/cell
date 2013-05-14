define [
  'cell/Model'
  'cell/Collection'
  'cell/util/http'
  'cell/util/extend'
  'cell/util/spy'
  'cell/util/type'
], (Model,Collection,http,extend,spy,type)->

  idfunc = (o)->o

  Resource = ({@url, params:@_params, model, collection, transform})->
    @transform = transform or idfunc
    @Model = (model or Model).extend ModelInstance
    @Collection = (collection or Collection).extend CollectionInstance
    return

  Resource.extend = extend

  Resource::parseModelResponse = (response,model)->
    jsonObj = JSON.parse response
    jsonObj = @transform jsonObj
    model.set(k, v) for k,v of jsonObj
    return

  Resource::parseCollectionResponse = (response,collection)->
    jsonObjs = JSON.parse response
    collection.add (@transform obj for obj in jsonObjs)
    return

  Resource::defaultParams = (params)->
    for k of @_params
      params[k] = @_params[k] unless params[k]?
    return

  Resource::create = (attrs)->
    new @Model @, attrs, true

  Resource::get = (params,success,error)->
    inst = new @Model @, undefined, false
    http
      method: 'GET'
      url: @genUrl params, false
      (status,response,isSuccess)=>
        if isSuccess
          @parseModelResponse response, inst
          inst._setStatus 'ok'
          success?()
        else
          inst._setStatus 'error'
          error?()
        return
    inst

  Resource::query = (params,success,error)->
    inst = new @Collection @
    http
      method: 'GET'
      url: @genUrl params, false
      (status,response,isSuccess)=>
        if isSuccess
          @parseCollectionResponse response, inst
          inst._setStatus 'ok'
          success?()
        else
          inst._setStatus 'error'
          error?()
        return
    inst

  Resource::genUrl = (params)->
    newParams = {}
    newParams[k] = params[k] for k of params
    @defaultParams newParams
    url = (url = @url).replace /{([A-z0-9]+)}/g, (match, key, index)->
      value = newParams[key]
      delete newParams[key]
      encodeURIComponent value

    delim = '?'
    for k,v of newParams when v
      url += "#{delim}#{encodeURIComponent k}=#{encodeURIComponent v}"
      delim = '&'
    url

  getStatus = ->
    spy.addResStatus.call @
    @_status

  setStatus = (newStatus)->
    @trigger "status", @, @_status = newStatus
    return

  ModelInstance =
    constructor: (@_res, initialAttrs, isNew)->
      Model.call @, initialAttrs
      @_status = (if isNew then 'new' else 'loading')
      return

    _setStatus: setStatus
    status: getStatus

    $delete: (params,success,error)->
      unless @_status is 'new'
        # Is it a new or updated
        http
          method: 'DELETE'
          url: @_res.genUrl params, false
          (status,response,isSuccess)=>
            if isSuccess
              @_setStatus 'deleted'
              success?()
            else
              @_setStatus 'error'
              error?()
            return
        @_setStatus 'deleting'
        return

    $save: (params,success,error)->
      # Is it a new or updated
      http
        method:
          if @_status is 'new' then 'POST'
          else 'PUT'
        url: @_res.genUrl params, false
        data: JSON.stringify @_a
        (status,response,isSuccess)=>
          if isSuccess
            @_res.parseModelResponse response, @
            @_setStatus 'ok'
            success?()
          else
            @_setStatus 'error'
            error?()
          return

      @_setStatus 'saving'
      return

  CollectionInstance =
    constructor: (@_res)->
      Collection.call @
      @_status = 'loading'
      return

    _setStatus: setStatus
    status: getStatus

    requery: (params)->

  Resource