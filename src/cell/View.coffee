define [
  'util/hash'
  'util/type'
  'dom/data'
  'dom/events'
  'cell/Model'
  'cell/Collection'
  'cell/util/spy'
], (hash, {isA,isF}, data, events, Model, Collection, {watch})->

  bind = (f,o)-> -> f.call o
  noop = ->
  d = document

  render = (parent, view, renderValue, prevNodes)->
    renderValue = [d.createTextNode ''] unless renderValue?
    newNodes = view._renderChildren renderValue, parent, prevNodes[0]
    i=-1
    len=prevNodes.length
    parent.removeChild prevNodes[i] while ++i<len
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
          if condValue then thnElse.then?() else thnElse.else?()
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
                itemRenderer item
          
          newItemHash.push key, prevItemEl
          newEls.push prevItemEl

        # Remove the elements for the itmes that were removed from the collection
        for key, items of itemhash.h
          i=-1
          len=items.length
          while ++i<len
            parent.removeChild items[i]
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
    children =
      [].slice.call arguments,
        if optionsOrFirstChild and optionsOrFirstChild.constructor is Object
          options = optionsOrFirstChild
          2
        else
          1

    # HAML
    if typeof viewOrHAML is 'string'
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
            @_renderAttr(k,v,parent)
          
    # View
    else if viewOrHAML and viewOrHAML.prototype instanceof View
      parent = new viewOrHAML(options).el

    if parent
      @_renderChildren children, parent
      parent

  __.if = (condition,thenElse)->
    if isF condition
      new IfBind @view, condition, thenElse
    else
      thenElse[if condition then 'then' else 'else']?()

  __.each = (col,renderer)->
    if col
      if col instanceof Collection
        debugger
        collection = col
        col = -> collection.toArray()

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
              renderer col[i], i, col
          )
        results
          
  View = Model.extend
    constructor: (@options={})->
      @model = @options.model
      delete @options.model
      @collection = @options.collection
      delete @options.collection

      __ = View::__
      _ = @__ = => __.apply @, arguments
      _.if = __.if
      _.each = __.each
      _.view = @

      @_render_el()
      return

    beforeRender: noop
    render_el: -> d.createElement 'div'
    render: noop
    afterRender: noop

    __: __

    _render_el: ->
      @beforeRender()
      @el = @render_el @__
      @el.className = if (cls = @el.className) then (cls+' '+@_cellName) else @_cellName
      data.set @el, 'cellRef', @
      @el.setAttribute 'cell', @_cellName
      @_renderChildren (@render @__), @el
      @afterRender()
      return

    _renderAttr: (k,v,parent)->
      if isF v
        watch (bind v, @), (value)->
          parent.setAttribute k, value
          return
      else
        parent.setAttribute k, v
      return

    _renderChild: (n, parent, insertBeforeNode, rendered)->
      n = new Bind @, n if isF n

      debugger

      if n.constructor is Bind
        n.r parent
       # Is Element or Text Node
      else if n.nodeType in [1,3]
        rendered.push parent.insertBefore n, insertBeforeNode

      else if isA n
        @_renderChildren n, parent, insertBeforeNode, rendered

      else
        rendered.push parent.insertBefore d.createTextNode(n), insertBeforeNode
      return

    _renderChildren: (nodes, parent, insertBeforeNode=null, rendered=[])->
      return rendered unless nodes?
      nodes = [nodes] unless isA nodes
      @_renderChild(n, parent, insertBeforeNode, rendered) for n in nodes when n?
      rendered
