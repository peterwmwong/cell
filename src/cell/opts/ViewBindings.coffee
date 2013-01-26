define [
  'utils'
  'cell/View'
  'cell/Ext'
], (utils, View, Ext)->
  
  isBind = (o)-> typeof o is 'function'

  Ext::getValue = (v,callback)->
    if isBind v
      @view._binds.push new ExtBind callback, v
    else
      callback v
    return

  Bind = (@parent, @getValue)->
  Bind:: =
    constructor: Bind
    getRenderValue: -> @value
    needRender: BindNeedRender = ->
      if (value = @getValue()) isnt @value
        @value = value
        true
    render: (view, rendered)->
      renderValue = @getRenderValue()
      renderValue = [document.createTextNode ''] unless renderValue?
      nodes = view._renderChildren renderValue, @parent, (@nodes and @nodes[0])
      @parent.removeChild n for n in @nodes if @nodes
      @nodes = nodes
      rendered.push n for n in nodes if rendered
      return

  ExtBind = (@cb, @getValue)->
    @cb @value = @getValue()
    return
  ExtBind:: =
    needRender: BindNeedRender
    render: ->
      @cb @value
      return

  IfBind = (@parent, @getValue, thn, els)->
    @getRenderValue = -> if @value then thn() else els()
    return
  IfBind:: = Bind::

  AttrBind = (@parent, @attr, @getValue)->
  AttrBind:: =
    needRender: BindNeedRender
    render: ->
      @parent.setAttribute @attr, @value
      return

  hashuid = 0
  nextuid = -> (++hashuid).toString 36
  hashkey = (obj)->
    (objType = typeof obj) + ':' +
      if (objType is 'object') and (obj isnt null)
        obj.$$hashkey or= nextuid()
      else
        obj

  HashQueue = ->
    @hash = {}
    return

  HashQueue:: =
    push: (key,val)->
      entry = (@hash[key] or= [])
      entry.push val
      return
    shift: (key)->
      if entry = @hash[key]
        if entry.lengh is 1
          delete @hash[key]
          entry[0]
        else
          entry.shift()

  EachBind = (@parent, @getValue, @itemRenderer)->
    @itemhash = new HashQueue
    return

  EachBind:: =
    constructor: EachBind
    needRender: ->
      value = @getValue() or []

      # Quick change checks
      unless change = ((not @value?) or @value.length isnt value.length)

        # Deep change check (check each item)
        i = @value.length
        while --i >= 0
          break if value[i] isnt @value[i]
        change = (i >= 0)

      if change
        @value = [].slice.call value
        true
      else
        false

    render: ->
      newEls = []
      newItemHash = new HashQueue

      for item in @value
        key = hashkey item
        unless prevItemEl = @itemhash.shift key
          prevItemEl = @itemRenderer item
        
        newItemHash.push key, prevItemEl
        newEls.push prevItemEl

      # Remove the elements for the itmes that were removed from the collection
      for key, items of @itemhash.hash
        for itemEl in items
          @parent.removeChild itemEl
      @itemhash = newItemHash

      # Add the elements for the current items
      @parent.appendChild el for el in newEls
      return
    
  __ = View::__
  orig__if = __.if
  __.if = (condition,thenElse)->
    if isBind condition
      new IfBind undefined, condition, thenElse.then, thenElse.else
    else
      orig__if.call @, condition, thenElse

  orig__each = __.each
  __.each = (col,renderer)->
    if isBind col
      new EachBind undefined, col, renderer
    else
      orig__each.call @, col, renderer

  orig_constructor = View::_constructor
  View::_constructor = ->
    @_binds = []
    orig_constructor.call @
    return

  orig_renderAttr = View::_renderAttr
  View::_renderAttr = (k, v, parent)->
    if isBind v
      @_binds.push binding = new AttrBind parent, k, (utils.bind v, @)
      binding.needRender()
      binding.render @
    else
      orig_renderAttr k, v, parent
    return

  orig_renderChild = View::_renderChild
  View::_renderChild = (n, parent, insertBeforeNode, rendered)->
    if isBind n
      n = new Bind parent, (utils.bind n, @)

    if (n instanceof Bind) or (n instanceof EachBind)
      @_binds.push n
      n.parent = parent
      n.needRender()
      n.render @, rendered
    else
      orig_renderChild.call @, n, parent, insertBeforeNode, rendered
    return

  orig_remove = View::remove
  View::remove = ->
    delete @_binds
    orig_remove.call @
    return

  View::updateBinds = ->
    i = 0
    change = true
    while change and (i++ < 10)
      change = false
      for b in @_binds
        if b.needRender()
          change = true
          b.render @
    return
