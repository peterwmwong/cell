define [
  'cell/Model'
  'cell/Collection'
  'cell/util/http'
  'cell/util/extend'
  'cell/util/type'
], (Model,Collection,http,extend,type)->

  copyObj = (obj)->
    newObj = {}
    if obj
      newObj[k] = obj[k] for k of obj
    newObj

  jsonAndTransformModel = (response, model)->
    jsonObj = JSON.parse response
    jsonObj = @transform jsonObj if @transform
    model.set(k, v) for k,v of jsonObj
    return

  jsonAndTransformCollection = (response, collection)->
    jsonObjs = JSON.parse response
    collection.add (if @transform then (@transform obj for obj in jsonObjs) else jsonObjs)
    return

  Resource = ({@url, params:@_params, model, collection, @transform})->
    @Model = (model or Model).extend ModelInstance
    @Collection = (collection or Collection).extend CollectionInstance
    return

  Resource.extend = extend

  Resource::defaultParams = (params)->
    for k of @_params
      params[k] = @_params[k] unless params[k]?
    return

  Resource::create = (attrs)->
    new @Model @, attrs, true

  Resource::get = (params,success,error)->
    inst = new @Model @, undefined, false
    params = copyObj params
    http
      method: 'GET'
      url: @genUrl params, false
      (status,response,isSuccess)=>
        if isSuccess
          jsonAndTransformModel.call @, response, inst
          success?()
        else error?()
        return
    inst

  Resource::query = (params,success,error)->
    inst = new @Collection @
    params = copyObj params
    http
      method: 'GET'
      url: @genUrl params, false
      (status,response,isSuccess)=>
        if isSuccess
          jsonAndTransformCollection.call @, response, inst
          success?()
        else error?()
        return
    inst

  ModelInstance =
    constructor: (@_res, initialAttrs, @_isNew)->
      Model.call @, initialAttrs
      return

    $delete: (params,success,error)->
      unless @_isNew
        # Is it a new or updated
        params = copyObj params
        http
          method: 'DELETE'
          url: @_res.genUrl params, false
          (status,response,isSuccess)->
            if isSuccess then success?()
            else error?()
            return
        return

    $save: (params,success,error)->
      # Is it a new or updated
      params = copyObj params
      http
        method:
          if @_isNew then 'POST'
          else 'PUT'
        url: @_res.genUrl params, false
        data: JSON.stringify @_a
        (status,response,isSuccess)=>
          if isSuccess
            jsonAndTransformModel.call @_res, response, @
            @_isNew = false
            success?()
          else error?()
          return
      return

  CollectionInstance =
    constructor: (@_res)->
      Collection.call @
      return
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