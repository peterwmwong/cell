define [
  'backbone'
  'jquery'
], (Backbone,$)->

  isArrayish =
    if typeof Zepto is 'function'
      (o)-> (_.isArray o) or (Zepto.fn.isPrototypeOf o)
    else
      (o)-> (_.isArray o) or o.jquery

  isBind = _.isFunction

  # Maps cid to cell
  cidMap = {}

  # Override jQuery.cleanData()
  # This method is called whenever a DOM node is removed using $.fn.remove(),
  # $.fn.empty(), or $.fn.html().  If the DOM node being removed is a cell's
  # @el, lookup the cell and call @dispose()
  origCleanData = $.cleanData
  $.cleanData = ( elems, acceptData )->
    i=0
    while elem = elems[i++]
      origCleanData [elem], acceptData
      if cid = elem.cellcid
        cell = cidMap[cid]
        cell.$el = undefined
        cell.remove()
    return

  __ = (viewOrHAML, optionsOrFirstChild)->
    children =
      [].slice.call arguments,
        if optionsOrFirstChild and optionsOrFirstChild.constructor is Object
          options = optionsOrFirstChild
          2
        else
          1

    # HAML
    if typeof viewOrHAML is 'string'
      if m = /^(\w+)?(#([\w\-]+))*(\.[\w\.\-]+)?$/.exec(viewOrHAML)
        # Tag
        parent = document.createElement m[1] or 'div'

        # id
        if m[3]
          parent.setAttribute 'id', m[3]

        # class
        if m[4]
          parent.className = m[4].slice(1).replace(/\./g, ' ')

        for k,v of options
          if isBind v
            bind = new AttrBind parent, k, (_.bind v, @)
            @_binds.push bind
            bind.needRender()
            bind.render @

          else
            parent.setAttribute k, v

    # Cell
    else if viewOrHAML and viewOrHAML.prototype instanceof Backbone.View
      parent = (new viewOrHAML options).render().el

    if parent
      @_renderChildren children, parent
      parent

  __if = (condition,thenElse)->
    if typeof condition is 'function'
      new IfBind undefined, condition, thenElse.then, thenElse.else
    else
      thenElse[if condition then 'then' else 'else']?()

  __each = (col,renderer)->
    if col instanceof Backbone.Collection
      col.map renderer
    else
      renderer item, i, col for item,i in col

  Bind = (@parent, @getValue)->
  Bind::value = undefined
  Bind::nodes = undefined
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
    @
  IfBind.prototype = Bind.prototype

  AttrBind = (@parent, @attr, @getValue)->
  AttrBind::value = undefined
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
    this
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

  EachBind = (@parent, @_getValue, @itemRenderer)->
    @itemhash = new HashQueue

  EachBind::value = []
  EachBind::itemhash = undefined
  EachBind::needRender = ->
    value = @getValue() or []

    # Quick change checks
    unless change = (value isnt @value) or (@value.length isnt value.length)

      # Deep change check (check each item)
      i = @value.length
      while --i >= 0
        break if value[i] isnt @value[i]
      change = (i >= 0)

    if change
      @value = value
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
    for items of @itemhash.hash
      for itemEl in items
        @parent.removeChild itemEl
    @itemhash = newItemHash

    # Add the elements for the current items
    @parent.appendChild el for el in newEls
    return
    
  IfBind.prototype = Bind.prototype

  module =
    Cell: Backbone.View.extend

      constructor: ->
        @_binds = []
        @__ = _.bind @__, @
        @__.if = __if
        @__.each = __each
        Backbone.View.apply @, arguments
        @listenTo bindUpdater, 'all', @updateBinds if (bindUpdater = @model or @collection)

      _renderChildren: (nodes, parent, insertBeforeNode=null, rendered=[])->
        return rendered unless nodes?
        nodes = [nodes] unless isArrayish nodes

        for n in nodes when n?

          # Is Element or Text Node
          if n.nodeType in [1,3]
            rendered.push parent.insertBefore n, insertBeforeNode

          else if isArrayish n
            @_renderChildren n, parent, insertBeforeNode, rendered

          else if isBind n
            @_binds.push bind = new Bind parent, _.bind(n,@)
            bind.needRender()
            bind.render @, rendered

          else if n instanceof Bind
            @_binds.push n
            n.parent = parent
            n.needRender()
            n.render @, rendered

          else
            tn = document.createTextNode n
            rendered.push parent.insertBefore tn, insertBeforeNode

        rendered

      __: __

      render: ->
        @_renderChildren (@renderEl @__), @el
        @afterRender()
        @

      updateBinds: ->
        i = 0
        change = true
        while change and (i++ < 10)
          change = false
          for b in @_binds
            if b.needRender()
              change = true
              b.render @
        return

      # Removes anything that might leak memory
      remove: ->
        delete cidMap[@cid]
        @el.cellcid = undefined
        @$el.remove() if @$el
        @stopListening()
        @model = @collection = @el = @$el = @$ = undefined
        return

      _setElement: Backbone.View::setElement
      setElement: (element, delegate)->
        @_setElement element, delegate

        # Track the cell instance by cid
        cidMap[@cid] = this
        @el.setAttribute 'cell', @_cellName

        # Used jQuery.cleanData() to retrieve the cell instance
        # associated with a DOM Element
        @el.cellcid = @cid
        @

      renderEl: ->
      afterRender: ->

    pluginBuilder: 'cell-builder-plugin'

    load: (name, req, load, config)->
      # Attach te associated CSS file for cell
      unless (module._installed or= {})[name]
        module._installed[name] = true
        el = document.createElement 'link'
        el.href = req.toUrl name+".css"
        el.rel = 'stylesheet'
        el.type = 'text/css'
        document.head.appendChild el

      load (proto)->
        proto or= {}
        proto.className = proto._cellName = /(.*\/)?(.*)$/.exec(name)[2]
        module.Cell.extend proto

      return
