define [
  'cell/Events'
  'util/type'
  'cell/Model'
  'cell/util/spy'
], (Events,type,Model,spy)->

  iter = (str,before,after)->
    Function.call undefined,
      'f'
      'c'
      'd'
      "this._s();"+
      "if(f==null){return}"+
      "var i=-1,t=this,l=t.length(),e#{before or ''};"+
      "while(++i<l){"+
        "e=t._i[i];"+
        str+
      "}"+
      (after or '')

  Events.extend

    constructor: (array)->
      @_i = []
      @add array
      return

    readOnly: ->
      @_ro = true
      return

    model: Model

    at: (index)->
      @_s()
      @_i[index]

    length: ->
      @_s()
      @_i.length

    indexOf:
      if Array::indexOf then (model)->
        @_s()
        @_i.indexOf model
      else (iter 'if(e===f){return i}','','return -1')
    toArray: ->
      @_s()
      @_i.slice()

    each:    iter 'if(f.call(c,e,i,t)===!1){i=l}'
    map:     iter 'r.push(f.call(c,e,i,t))', ',r=[]', 'return r'
    reduce:  iter 'f=c.call(d,f,e,i,t);', '', 'return f'

    add: (models,index)->
      if models and not @_ro
        models = 
          if type.isA models
            models.slice()
          else
            [models]

        i=-1
        len = models.length
        index = @length() unless index?
        while ++i < len
          @_i.splice index++, 0, (models[i] = @_toM models[i])

        @trigger 'add', models, @, index-len
      return

    remove: (models)->
      if models and not @_ro
        models = [models] unless type.isA models

        i=-1
        len = models.length
        removedModels = []
        indices = []
        while ++i < len
          model = models[i]
          if (index = @indexOf model) > -1
            removedModels.push model
            indices.push index
            @_i.splice index, 1

        if indices.length
          @trigger 'remove', removedModels, @, indices
      return

    _toM: (o)-> if o instanceof @model then o else new Model o
    _s: spy.addCol
