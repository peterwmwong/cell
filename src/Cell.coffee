bind =
  if Function.prototype.bind
    (func,obj)-> func.bind obj
  else
    (func,obj)-> (-> func.apply obj, arguments)
err =
  if typeof console?.error == 'function' then (msg)-> console.error msg
  else ->

extendObj = (destObj, srcObj)->
  destObj[p] = srcObj[p] for p of srcObj
  return

uniqueId = do->
  postfix = 0
  (prefix)-> prefix+(postfix++)

inherits = do->
  ctor = ->
  (parent, protoProps, staticProps)->
    child =
      if protoProps and protoProps.hasOwnProperty 'constructor' then protoProps.constructor
      else -> return parent.apply this, arguments
    extendObj child, parent
    ctor.prototype = parent.prototype
    child.prototype = new ctor()
    if protoProps then extendObj child.prototype, protoProps
    if staticProps then extendObj child, staticProps
    child::constructor = child
    child.__super__ = parent.prototype
    child


window.cell ?= Object.create {},
  define: value: do->
    moduleNameRegex = /(.*\/)?(.*)/
    ensureDef = (def)->
      if (typedef = typeof def) == 'function' or typedef == 'object' then def
      else err('Cell definition is not a function or object')

    (id,deps,def)->
      # Normalize arguments, these are valid combinations: (id,deps,def), (id,def), (deps,def)
      if def then def = ensureDef def
      else if deps
        def = ensureDef deps
        deps = undefined
        if id instanceof Array
          deps = id
          id = undefined
      else if id
        def = ensureDef id
        id = deps = undefined

      if def
        deps = (if deps instanceof Array then deps else []).concat(['require', 'module'])
        id = typeof id == 'string' and id
        args = []
        if id then args.push id
        args.push deps
        args.push (deps..., require, module)->
          cellName = moduleNameRegex.exec(module.id)[2]
          def = if typeof def == 'function' then def deps... else def
          def.css_href ?= require.toUrl "./#{cellName}.css"
          Cell.extend def, cellName

        define args...

window.Cell ?= Cell = do->
  tmpNode = document.createElement 'div'
  renderEach = (list,func)-> (func list[i],i,list for i in [0..list.length-1]).join '\n'
  renderCell_nocheck = (self,CellType,options)->
    cell = new CellType Object.create(options or {}, parent: value: self)
    "<#{cell.__renderTagName} id='#{cell._cid}'></#{cell.__renderTagName}>"
  optsToProps = ['model', 'collection', 'class', 'id']

  (@options = {})->
    @_cid = uniqueId '__cell_instance_'
      
    # Copy over 'most used' options into this for convenience
    for propName in optsToProps when prop = @options[propName]
      @[propName] = prop

    # Parent cell
    @_parent = @options.parent

    # On render/update callback function
    @_onrender = if typeof @options.onrender == 'function' then options.onrender

    @__attach_css()

    # Create DOM node
    tmpNode.innerHTML = @__renderOuterHTML
    @el = tmpNode.children[0]

    # Add the Cell's class
    @el.className = "#{@__cell_name or ''} #{@el.className or ''} #{@class or ''}"

    # Hash of helper rendering functions passed to render function to make
    # the following easier:
    #  - asynchronous and synchronous rendering
    #  - rendering other cells and DOM nodes
    #  - rendering lists
    @_renderHelpers =
      node: (node)=>
        if @_renderQ
          unless node instanceof HTMLElement
            err "render.node(node:HTMLElement) was expecting an HTMLElement"
            ""
          else
            @_renderQ[uid = uniqueId '__cell_render_node_'] = node
            "<#{node.tagName} id='#{uid}'></#{node.tagName}>"

      cells: (cellOptionArrays...)=>
        if @_renderQ
          unless cellOptionArrays instanceof Array
            err 'render.cells( (cell:Cell,options:Object)* ) expects an Array'
            ""
          else
            cellOptionArrays.reduce ((r,co)=> r+=renderCell_nocheck this, co[0], co[1]), ""

      cell: (CellType, options)=> @_renderQ and renderCell_nocheck this, CellType, options

      async: bind(@__renderinnerHTML, this)

      each: renderEach

    @update()

Cell.extend = do->
  renderFuncNameRegex = /render( <(\w+)([ ]+.*)*>)*/
  eventsNameRegex = /events (.+)/

  extend = (protoProps, name)->
    child = inherits this, protoProps
    child.extend = extend
    p = child.prototype

    p.__cell_name = name
    p.__cell_id = uniqueId '__cell_'
    p.__cssAttached = false
    ebinds = p.__eventBindings = []

    for prop in Object.getOwnPropertyNames p
      # Find and add event binding
      if (match = eventsNameRegex.exec prop) and typeof (binddesc = p[prop]) == 'object'
        # Map event handler functions specified by name
        for desc,handler of binddesc when typeof handler == 'string'
          binddesc[desc] = p[handler]
        ebinds.push prop: match[1], desc: binddesc
          
      # Find and add render function (if not already found)
      else if not p.renderTagName and match = renderFuncNameRegex.exec prop
        if typeof (p.__render=p[prop]) != 'function'
          err "Cell.extend expects '#{prop}' to be a function"
          return
        p.__renderTagName = match[2] or 'div'
        p.__renderOuterHTML = "<#{p.__renderTagName}#{match[3] or ""}></#{p.__renderTagName}>"

    # Must have found a render function 
    if p.__renderTagName then child
    else err 'Cell.extend([constructor:Function],prototypeMembers:Object): could not find a render function in prototypeMembers'

Cell.prototype =
  $: (selector)-> $ selector, @el

  update: ->
    if not @_renderQ
      @_renderQ = {}
      @initialize?()
      if typeof (innerHTML = @__render @_renderHelpers) == 'string'
        @__renderinnerHTML innerHTML

  __delegateEvents: do->
    elEventRegex = /^(\w+)\s*(.*)$/
    selbinder = (sel,eventName,prop,handler,obj)->
      handler = bind handler, obj
      eventName = "#{eventName}.#{obj._cid}"
      (observed = $(obj[prop])).delegate sel, eventName, handler
      -> observed.undelegate sel, eventName, handler

    elbinder = (eventName,prop,handler,obj)->
      handler = bind handler, obj
      (observed = $(obj[prop])).bind eventName, handler
      -> observed.unbind eventName, handler

    bindablebinder = (eventName,prop,handler,obj)->
      handler = bind handler, obj
      (observed = obj[prop]).bind eventName, handler
      -> observed.unbind eventName, handler

    getBinders = (obj,prop,bindDesc)->
      observed = obj[prop]
      binders = []
      for desc,handler of bindDesc when typeof desc == 'string'
        if observed instanceof HTMLElement
          [matched,eventName,selector] = elEventRegex.exec(desc) or []
          if match = elEventRegex.exec(desc)
            binders.push(
              if sel = match[2] then selbinder.bind null, sel, eventName, prop, handler
              else elbinder.bind null, eventName, prop, handler
            )
        else if typeof observed.bind == 'function'
          binders.push bindablebinder.bind null, desc, prop, handler
      return binders

    ->
      if @_unbinds
        for ub in @_unbinds
          try ub()
      @_unbinds = []

      if @__eventBindings
        ebindings = @__eventBindings
        cellProto = Object.getPrototypeOf this
        delete cellProto.__eventBindings
        binderCache = []
        for b in ebindings
          binderCache = binderCache.concat getBinders(this, b.prop, b.desc)
        cellProto.__binderCache = binderCache

      for b in @__binderCache
        @_unbinds.push b(this)

      return

  __attach_css: ->
    if not @__cssAttached and not document.querySelector "[data-cell-id=#{@__cell_id}]"
      @__cssAttached = true
      if typeof @css == 'string'
        el = document.createElement 'style'
        el.type = "text/css"
        el.innerHTML = @css
      else if typeof @css_href == 'string'
        el = document.createElement 'link'
        el.href = @css_href
        el.rel = 'stylesheet'
        el.type = 'text/css'

      if el
        if el.dataset then (el.dataset.cellId = @__cell_id)
        else el.setAttribute "data-cell-id", @__cell_id
        document.head.appendChild el
       
  __renderinnerHTML: (innerHTML)->
    if @_renderQ
      @el.innerHTML = innerHTML
      for pcid,child of @_renderQ
        try
          if pc = @el.querySelector "##{pcid}"
            pc.parentNode.replaceChild (if child instanceof HTMLElement then child else child.el), pc
      delete @_renderQ
      @__onrender()

  __onchildrender: (cell)->
    if @_renderQ
      @_renderQ[cell._cid] = cell
    else if pc = @el.querySelector "##{cell._cid}"
      pc.parentNode.replaceChild cell.el, pc

  __onrender: ->
    @__delegateEvents()
    @_parent?.__onchildrender? this
    try @_onrender? this
