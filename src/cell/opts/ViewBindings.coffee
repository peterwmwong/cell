define [
  'cell/View'
], (View)->
  
  isBind = (o)-> typeof o is 'function'
  bind = (f,o)->
    -> f.apply o, arguments

  Bind = (@parent, @getValue)->
  Bind::getRenderValue = -> @value
  Bind::needRender = ->
    if (value = @getValue()) isnt @value
      @value = value
      true
    else
      false
  Bind::render = (view, rendered)->
    renderValue = @getRenderValue()
    renderValue = [document.createTextNode ''] unless renderValue?
    nodes = view._renderChildren renderValue, @parent, @nodes?[0]
    @parent.removeChild n for n in @nodes if @nodes
    @nodes = nodes
    rendered.push n for n in nodes if rendered
    return

  IfBind = (@parent, @getValue, @then, @else)->
    @getRenderValue = -> if @value then @then() else @else()
    return
  IfBind.prototype = Bind.prototype

  ElBind = (@parent,@getValue)->

  AttrBind = (@parent, @attr, @getValue)->
  AttrBind::needRender = Bind::needRender
  AttrBind::render = ->
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
  HashQueue::push = (key,val)->
    entry = (@hash[key] or= [])
    entry.push val
    return
  HashQueue::shift = (key)->
    if entry = @hash[key]
      if entry.lengh is 1
        delete @hash[key]
        entry[0]
      else
        entry.shift()

  EachBind = (@parent, @getValue, @itemRenderer)->
    @itemhash = new HashQueue
    return

  EachBind::needRender = ->
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

  EachBind::render = ->
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
    @listenTo bindUpdater, 'all', @updateBinds if (bindUpdater = @model or @collection)
    orig_constructor.call @
    return

  orig_renderAttr = View::_renderAttr
  View::_renderAttr = (k, v, parent)->
    if isBind v
      @_binds.push bind = new AttrBind parent, k, (bind v, @)
      bind.needRender()
      bind.render @
    return

  orig_renderChild = View::_renderChild
  View::_renderChild = (n, parent, insertBeforeNode, rendered)->
    if isBind n
      n = new Bind parent, bind(n,@)

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
    @_binds = undefined
    orig_remove.call @

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
