bind = do->
  slice = Array.prototype.slice
  if fbind = Function.prototype.bind
    (func,obj)-> fbind.apply func, [obj].concat slice.call arguments, 2
  else
    (func,obj)->
      args = slice.call arguments, 2
      -> func.apply obj, args.concat(slice.call(arguments))

err =
  if typeof console?.error == 'function' then (msg)-> console.error msg
  else ->

identity = (a)->a

extendObj = (destObj, srcObj)->
  destObj[p] = srcObj[p] for p of srcObj
  destObj

uniqueId = do->
  postfix = 0
  (prefix)-> prefix+(postfix++)

inherits = do->
  ctor = ->
  (parent, protoProps)->
    child =
      if protoProps and protoProps.hasOwnProperty 'constructor' then protoProps.constructor
      else -> return parent.apply this, arguments
    extendObj child, parent
    ctor.prototype = parent.prototype
    child.prototype = new ctor()
    extendObj child.prototype, protoProps
    child::constructor = child
    child.__super__ = parent.prototype
    child

window.Cell ?= Cell = do->
  tmpNode = document.createElement 'div'

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

    @__attach_css?()

    # Create DOM node
    tmpNode.innerHTML = @__renderOuterHTML
    @el = tmpNode.children[0]

    # Add the Cell's class
    className = ""
    for n in [@__cell_name,@el.className,@class] when n
      className += if className then ' '+n else n
    @el.className = className

    (typeof @id == 'string') and @el.id = @id

    # Rendering helper function passed to the Cell.render function to make
    # the following easier:
    #  - asynchronous and synchronous rendering
    #  - rendering other cells and DOM nodes
    #  - rendering strings, numbers, and potentially null/undefined values
    renderHelper_nocheck = (a, b)=>
      if not a? or a==false then ""
      else if (type = typeof a) == 'string' or type == 'number' then a
      else if a.prototype?.Cell == a
        cell = new a extendObj b ? {}, parent: this
        "<#{cell.__renderTagName} id='#{cell._cid}'></#{cell.__renderTagName}>"
      else if a instanceof HTMLElement
        @_renderQ[uid = uniqueId '__cell_render_node_'] = a
        "<#{a.tagName} id='#{uid}'></#{a.tagName}>"
      else if a instanceof Array
        i=0
        res = ""
        if typeof b != 'function' then b = identity
        for e in a then res += renderHelper_nocheck b e,i++,a
        res
      else
        err 'render({CellType,HTMLElement,string,number},[cellOptions])'
        ""

    @_renderHelper = (a, cellOpts)=>
      unless @_renderQ? then ""
      else renderHelper_nocheck a, cellOpts

    @_renderHelper.async = bind @__renderinnerHTML, this
    @update()

Cell.extend = do->
  renderFuncNameRegex = /render( <(\w+)([ ]+.*)*>)*/
  eventsNameRegex = /bind( (.+))?/

  extend = (protoProps, name)->
    ebinds = []
    for propName,prop of protoProps
      # Find and add event binding
      if (match = eventsNameRegex.exec propName) and typeof prop == 'object'
        # default bind -> 'bind el'
        bindProp = match[2] ? 'el'
        # Map event handler functions specified by name
        for desc,handler of prop when typeof handler == 'string'
          prop[desc] = protoProps[handler] ? @::[handler]
        ebinds.push prop: bindProp, desc: prop
          
      # Find and add render function (if not already found)
      else if not protoProps.__renderTagName and match = renderFuncNameRegex.exec propName
        if typeof (protoProps.__render=prop) != 'function'
          err "Cell.extend expects '#{propName}' to be a function"
          return
        tag = protoProps.__renderTagName = match[2] ? 'div'
        protoProps.__renderOuterHTML = "<#{tag}#{match[3] ? ""}></#{tag}>"

    if ebinds.length
      protoProps.__eventBindings = ebinds

    child = inherits this, protoProps

    # Must find a render function 
    if not (p = child.prototype).__renderTagName
      err 'Cell.extend([constructor:Function],prototypeMembers:Object): could not find a render function in prototypeMembers'
    else
      child.extend = extend
      p.Cell = child
      if name then p.__cell_name = name
      if typeof protoProps.css_href == 'string' ? typeof protoProps.css == 'string'
        p.__attach_css = ->
          delete p.__attach_css
          if typeof (css = protoProps.css) == 'string'
            el = document.createElement 'style'
            el.innerHTML = css
          else
            el = document.createElement 'link'
            el.href = protoProps.css_href
            el.rel = 'stylesheet'
          el.type = 'text/css'
          $('head').append el
      child


Cell.prototype =
  $: (selector)-> $ selector, @el

  update: ->
    if not @_renderQ
      @_renderQ = {}
      @initialize?()
      if typeof (innerHTML = @__render @_renderHelper) == 'string'
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
        if observed.nodeType == 1
          [matched,eventName,selector] = elEventRegex.exec(desc) ? []
          if match = elEventRegex.exec(desc)
            binders.push(
              if sel = match[2]
                bind selbinder, null, sel, eventName, prop, handler
              else
                bind elbinder, null, eventName, prop, handler
            )
        else if typeof observed.bind == 'function'
          binders.push bind bindablebinder, null, desc, prop, handler
      return binders

    ->
      if @_unbinds
        for ub in @_unbinds
          try ub()
        delete @_unbinds

      if ebindings = @Cell::__eventBindings
        delete @Cell::__eventBindings
        binderCache = []
        for b in ebindings
          binderCache = binderCache.concat getBinders this, b.prop, b.desc
        @Cell::__binderCache = binderCache

      if @__binderCache
        @_unbinds = []
        for b in @__binderCache
          @_unbinds.push b this

      return
      
  __renderinnerHTML: (innerHTML)->
    if @_renderQ
      @el.innerHTML = @_ie_hack_innerHTML = innerHTML
      for pcid,child of @_renderQ
        if not child.el.innerHTML
          child.el.innerHTML = child._ie_hack_innerHTML
        @$("##{pcid}").replaceWith child.el
        delete child._ie_hack_innerHTML
      delete @_renderQ
      @__onrender()

  __onchildrender: (cell)->
    if @_renderQ
      @_renderQ[cell._cid] = cell
    else
      delete cell._ie_hack_innerHTML
      @$("##{cell._cid}").replaceWith cell.el

  __onrender: ->
    @__delegateEvents()
    @_parent?.__onchildrender? this
    try @_onrender? this


if typeof window.define == 'function'
  $ ->
    # Load/render Cells specified in DOM node data-cell attributes
    for node in $('[data-cell]') when cellname=node.getAttribute('data-cell')
      do(node)->
        opts = {}
        if node.getAttribute('data-cell-cachebust') != null
          opts.urlArgs = "bust=#{new Date().getTime()}"
        if baseurl = node.getAttribute 'data-cell-baseurl'
          opts.baseUrl = baseurl
        require opts, [cellname], (CellType)-> $(node).append(new CellType().el)
    return

  window.cell ?=
    define: do->
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
