define [
  'cell/Model'
  'cell/Collection'
  'cell/util/http'
  'util/extend'
  'util/type'
], (Model,Collection,http,extend,type)->

  copyObj = (obj)->
    newObj = {}
    if obj
      newObj[k] = obj[k] for k of obj
    newObj

  Resource = (@url, @_params)->

  Resource::defaultParams = (params)->
    for k of @_params
      params[k] = @_params[k] unless params[k]?
    return

  Resource::create = (attrs)->
    new Resource.Instance @, attrs, true

  Resource::get = (params,success,error)->
    inst = new Resource.Instance @, undefined, false
    params = copyObj params
    http
      method: 'GET'
      url: @genUrl params, false
      (status,response,isSuccess)->
        if isSuccess
          inst.set(k, v) for k,v of (JSON.parse response)
          success?()
        else error?()
        return
    inst

  Resource::query = (params,success,error)->
    inst = new Resource.CollectionInstance @
    params = copyObj params
    http
      method: 'GET'
      url: @genUrl params, false
      (status,response,isSuccess)->
        if isSuccess
          inst.add JSON.parse response
          success?()
        else error?()
        return
    inst

  Resource.Instance = Model.extend
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
            @set(k, v) for k,v of (JSON.parse response)
            @_isNew = false
            success?()
          else error?()
          return
      return


  Resource.CollectionInstance = Collection.extend
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