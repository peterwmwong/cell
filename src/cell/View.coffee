define [
  'cell/Collection'
  'cell/Ext'
  'cell/Model'
  'cell/util/spy'
  'dom/data'
  'dom/events'
  'dom/mutate'
  'util/fn'
  'util/hash'
  'util/type'
], (Collection, Ext, Model, {watch,unwatch,suspendWatch}, data, events, mutate, fn, hash, type)->

  protoProp = 'prototype'
  noop = ->
  d = document

  HashQueue = ->
    @h = {}
    return

  HashQueue[protoProp] =
    push: (key,val)->
      (@h[key] or= []).push val
      return
    shift: (key)->
      if entry = @h[key]
        if entry.lengh is 1
          delete @h[key]
          entry[0]
        else
          entry.shift()

  EachBind = (@view, @expr, @renderer)->
    @hq = new HashQueue
    @parent = undefined
    return

  EachBind[protoProp].install = (@parent)->
    if @expr instanceof Collection
      expr = @expr
      @view.watch (->expr.toArray()),
        ->
          EachBindOnChange.call @, @expr
          return
        @
    else
      @view.watch @expr, EachBindOnChange, @
    return

  EachBindOnChange = (value)->
    array =
      if value instanceof Collection then value.toArray()
      else value

    newEls = []
    newhq = new HashQueue

    # Check if each item has been rendered
    i = -1
    len = array.length
    while ++i<len
      item = array[i]
      key = hash item
      unless temp = @hq.shift key
        temp = @renderer.call @view, item, i, value
      
      newhq.push key, temp
      newEls.push temp

    # Remove the elements for the itmes that were removed from the collection
    for key of @hq.h
      temp = @hq.h[key]
      i = 0
      len = temp.length
      mutate.remove temp[i++] while i<len

    @hq = newhq

    # Add the elements for the current items
    @view._rcs newEls, @parent

    return

  _each = (col,renderer)->
    new EachBind @view, col, renderer

  _ = (viewOrHAML, optionsOrFirstChild)->
    children = [].slice.call arguments, 1
    i = -1
    len = children.length
    while ++i < len
      break unless children[i] instanceof Ext

    exts = children.splice 0, i
    options =
      if children.length and children[0] and children[0].constructor is Object
        children.shift()
      else
        {}

    # HAML
    if type.isS viewOrHAML
      if m = /^(\w+)?(#([\w\-]+))?(\.[\w\.\-]+)?$/.exec(viewOrHAML)
        # Tag
        parent = d.createElement m[1] or 'div'

        # id
        if m[3]
          parent.setAttribute 'id', m[3]

        # class
        if m[4]
          classes = m[4].slice(1).replace(/\./g, ' ')
          options.class =
            if options.class then classes + " #{options.class}"
            else classes

        for k,v of options
          if match = /^on(\w+)/.exec k
            events.on parent, match[1], v, @
          else
            @watch v,
              (value)->
                if @k is 'innerHTML'
                  parent.innerHTML = value
                else
                  parent.setAttribute @k, value
                return
              {k}
          
    # View
    else if viewOrHAML and viewOrHAML[protoProp] instanceof View
      suspendWatch ->
        parent = new viewOrHAML(options).el

    if parent
      @_rcs children, parent
      i = exts.length
      while i--
        exts[i].run parent, @
      parent


  View = Model.extend
    constructor: (options)->
      Model.call @
      t = @
      t.options =
        if options
          t.model = options.model
          t.collection = options.collection
          delete options.model
          delete options.collection
          options
        else {}

      t._ = fn.b _, @
      t._.view = @
      t._.each = _each

      t.beforeRender()
      t.el = el = t.renderEl t._
      cellName = t._cellName
      el.className = if (cls = el.className) then (cls+' '+cellName) else cellName
      data.set el, 'cellRef', t
      el.setAttribute 'cell', cellName
      t._rcs (t.render t._), el
      t.afterRender()
      return

    beforeRender: noop
    renderEl: -> d.createElement 'div'
    render: noop
    afterRender: noop

    watch: (expr,callback, callContext)->
      watch @, expr, callback, callContext
      return

    destroy: ->
      if @el
        Model[protoProp].destroy.call @
        unwatch @
        mutate.remove @el
        delete @el
      return

    _rc: (n, parent, insertBeforeNode, rendered)->
      if n instanceof EachBind
        n.install parent

      else if type.isF n
        nodes = []
        @watch n, (renderValue)->
          prevNodes = nodes
          renderValue = [d.createTextNode ''] unless renderValue?
          nodes = @_rcs renderValue, parent, prevNodes[0]
          renderValue = 0
          while n = prevNodes[renderValue++]
            mutate.remove n
          return

      # Is Element or Text Node
      else if n.nodeType in [1,3]
        rendered.push parent.insertBefore n, insertBeforeNode

      else if type.isA n
        @_rcs n, parent, insertBeforeNode, rendered

      else
        rendered.push parent.insertBefore d.createTextNode(n), insertBeforeNode
      return

    _rcs: (nodes, parent, insertBeforeNode=null, rendered=[])->
      nodes = [nodes] unless type.isA nodes
      @_rc(n, parent, insertBeforeNode, rendered) for n in nodes when n?
      rendered
