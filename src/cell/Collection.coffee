define [
  'util/type'
  'cell/Events'
  'cell/Model'
], (type,Events,Model)->

  filterMatch = (matcher, attr)->
    return false for k of matcher when (expected_value = matcher[k])? and (expected_value isnt attr[k])
    true

  Events.extend
    constructor: (array)->
      @_i = array or []
      return

    model: Model

    # TODO TEST
    add: (models)->
      if models
        models = [models] unless type.isA models
        len = models.length
        i=-1
        while ++i < len
          model =
            if (item = models[i]) instanceof Model then item
            else new @model item

      return

    # TODO TEST
    filterBy: (matcherHash)->
      return cur_items unless len = (cur_items = @_i).length
      i=-1
      (item while ++i < len when filterMatch matcherHash, (item = cur_items[i]))

    # TODO TEST
    length: -> @_i.length