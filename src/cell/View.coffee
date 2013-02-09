define [
  'util/hash'
  'util/type'
  'util/fn'
  'dom/data'
  'dom/events'
  'cell/Model'
  'cell/Collection'
  'cell/Ext'
  'cell/util/spy'
], (hash, {isA,isF,isS}, fn, data, events, Model, Collection, Ext, {watch})->

  bind = (f,o)-> -> f.call o
  noop = ->
  d = document

  removeChildren = (parent,children)->
    parent.removeChild node while (node = children.pop())
    return

  render = (parent, view, renderValue, prevNodes)->
    renderValue = [d.createTextNode ''] unless renderValue?
    newNodes = view._rcs renderValue, parent, prevNodes[0]
    removeChildren parent, prevNodes
    newNodes

  Bind = (view, expr)->
    @r = (parent)->
      nodes = []
      watch (bind expr, view), (renderValue)->
        nodes = render parent,
          view
          renderValue
          nodes
        return
      return
    return

  IfBind = (view, cond, thnElse)->
    @r = (parent)->
      nodes = []
      watch (bind cond, view), (condValue)->
        nodes = render parent,
          view
          (view.__.if condValue, thnElse)
          nodes
        return
      return
    return

  HashQueue = ->
    @h = {}
    return

  HashQueue:: =
    push: (key,val)->
      entry = (@h[key] or= [])
      entry.push val
      return
    shift: (key)->
      if entry = @h[key]
        if entry.lengh is 1
          delete @h[key]
          entry[0]
        else
          entry.shift()

  EachBind = (view, expr, itemRenderer)->
    itemhash = new HashQueue
    @r = (parent)->
      watch (bind expr, view), (value)->
        newEls = []
        newItemHash = new HashQueue

        i=-1
        len=value.length
        while ++i<len
          unless prevItemEl = (itemhash.shift key = (hash item = value[i]))
            prevItemEl = 
              if itemRenderer.prototype instanceof View
                new itemRenderer(model: item).el
              else
                itemRenderer.call view, item
          
          newItemHash.push key, prevItemEl
          newEls.push prevItemEl

        # Remove the elements for the itmes that were removed from the collection
        for key of itemhash.h
          removeChildren parent, itemhash.h[key]
        itemhash = newItemHash

        # Add the elements for the current items
        i=-1
        len=newEls.length
        while ++i<len
          parent.appendChild newEls[i]
        return
      return
    return

  EachBind::constructor = IfBind::constructor = Bind

  __ = (viewOrHAML, optionsOrFirstChild)->
    children = [].slice.call arguments, 1
    i = -1
    len = children.length
    while ++i < len
      break unless children[i] instanceof Ext

    exts = children.splice 0, i
    if children.length and children[0].constructor is Object
      options = children.shift()

    # HAML
    if isS viewOrHAML
      if m = /^(\w+)?(#([\w\-]+))?(\.[\w\.\-]+)?$/.exec(viewOrHAML)
        # Tag
        parent = d.createElement m[1] or 'div'

        # id
        if m[3]
          parent.setAttribute 'id', m[3]

        # class
        if m[4]
          parent.className = m[4].slice(1).replace(/\./g, ' ')

        for k,v of options
          if match = /^on(\w+)/.exec k
            events.on parent, match[1], v, @
          else
            if isF v
              watch (bind v, @), do(k)-> (value)->
                parent.setAttribute k, value
                return
            else
              parent.setAttribute k, v
          
    # View
    else if viewOrHAML and viewOrHAML.prototype instanceof View
      parent = new viewOrHAML(options).el

    if parent
      while ext = exts.pop()
        ext.run parent, @
      @_rcs children, parent
      parent

  __.if = (condition,thenElse)->
    if isF condition
      new IfBind @view, condition, thenElse
    else
      thenElse[if condition then 'then' else 'else']?.call @view

  __.each = (col,renderer)->
    if col
      if col instanceof Collection
        col = bind col.toArray, col

      if isF col
        new EachBind @view, col, renderer
      else
        length = col.length
        i=-1
        results = []
        while ++i < length
          results.push (
            if renderer.prototype instanceof View
              new renderer(model: col[i]).el
            else
              renderer.call @view, col[i], i, col
          )
        results
          
  View = Model.extend
    constructor: (options)->
      options = options or {}
      @model = options.model
      @collection = options.collection
      delete options.model
      delete options.collection
      @options = options

      __ = View::__
      _ = @__ = fn.bind __, @
      _.if = __.if
      _.each = __.each
      _.view = @

      @_re()
      return

    beforeRender: noop
    renderEl: -> d.createElement 'div'
    render: noop
    afterRender: noop

    __: __

    _re: ->
      @beforeRender()
      @el = el = @renderEl @__
      cellName = @_cellName
      el.className = if (cls = el.className) then (cls+' '+cellName) else cellName
      data.set el, 'cellRef', @
      el.setAttribute 'cell', cellName
      @_rcs (@render @__), el
      @afterRender()
      return

    _rc: (n, parent, insertBeforeNode, rendered)->
      n = new Bind @, n if isF n

      if n.constructor is Bind
        n.r parent
       # Is Element or Text Node
      else if n.nodeType in [1,3]
        rendered.push parent.insertBefore n, insertBeforeNode

      else if isA n
        @_rcs n, parent, insertBeforeNode, rendered

      else
        rendered.push parent.insertBefore d.createTextNode(n), insertBeforeNode
      return

    _rcs: (nodes, parent, insertBeforeNode=null, rendered=[])->
      return rendered unless nodes?
      nodes = [nodes] unless isA nodes
      @_rc(n, parent, insertBeforeNode, rendered) for n in nodes when n?
      rendered
