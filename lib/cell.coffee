# Error logging
E =
  if typeof console?.error == 'function' then (msg)-> console.error msg
  else ->

# When running in require.js optimizer, window & document do not exist
window = this
document = window.document or {createElement:->}

# is-HTMLElement check for all browsers
isElement =
  if typeof HTMLElement == "object" then (o)-> o instanceof HTMLElement
  # For Mr. IE8-can't-handle-DOM2
  else
    (o)-> typeof o == "object" and o.nodeType == 1 and typeof o.nodeName == "string"

# ES5 Function.bind
bind = do->
  slice = Array.prototype.slice
  if fbind = Function.prototype.bind
    (func,obj)-> fbind.apply func, [obj].concat slice.call arguments, 2
  else
    (func,obj)->
      args = slice.call arguments, 2
      -> func.apply obj, args.concat(slice.call(arguments))

# Copies properties from src obj to dest obj
extendObj = (destObj, srcObj)->
  destObj[p] = srcObj[p] for p of srcObj
  destObj

# Generates unique identifiers, given a prefix
uniqueId = do->
  postfix = 0
  (prefix)-> prefix+(postfix++)

# Setup up prototypical inheritance (inspired by goog.inherits and Backbone.js inherits() implementations)
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

# cell AMD Module
define 'cell', [], ->

  window.cell ?= cell = do->
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

      # Create DOM node
      tmpNode.innerHTML = @__renderOuterHTML
      @el = tmpNode.children[0]

      # Add the cell's class
      className = ""
      for n in [@__cell_name,@el.className,@class] when n
        className += if className then ' '+n else n
      @el.className = className

      (typeof @id == 'string') and @el.id = @id

      # Rendering helper function passed to the cell.render function to make
      # the following easier:
      #  - asynchronous and synchronous rendering
      #  - rendering other cells and DOM nodes
      #  - rendering strings, numbers, and potentially null/undefined values
      renderHelper_nocheck = (a, b)=>
        if a is undefined or a is null or a==false then ""
        else if (type = typeof a) == 'string' or type == 'number' then a
        else if a.prototype?.cell == a
          cell = new a extendObj b ? {}, parent: this
          "<#{cell.__renderTagName} id='#{cell._cid}'></#{cell.__renderTagName}>"
        else if isElement a
          @_renderQ[uid = uniqueId '__cell_render_node_'] = a
          "<#{a.tagName} id='#{uid}'></#{a.tagName}>"
        else if a instanceof Array
          i=0
          res = ""
          if typeof b != 'function' then b = (a)->a
          for e in a then res += renderHelper_nocheck b e,i++,a
          res
        else
          E 'render({CType,HTMLElement,string,number},[cellOptions])'
          ""

      @_renderHelper = (a, cellOpts)=>
        unless @_renderQ? then ""
        else renderHelper_nocheck a, cellOpts

      @update()

  cell.extend = do->
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
            E "cell.extend expects '#{propName}' to be a function"
            return
          tag = protoProps.__renderTagName = match[2] != "" and match[2] or 'div'
          protoProps.__renderOuterHTML = "<#{tag}#{match[3] ? ""}></#{tag}>"

      if ebinds.length
        protoProps.__eventBindings = ebinds

      child = inherits this, protoProps

      # Must find a render function 
      if not (p = child.prototype).__renderTagName
        E 'cell.extend([constructor:Function],prototypeMembers:Object): could not find a render function in prototypeMembers'
      else
        child.extend = extend
        p.cell = child
        if name then p.__cell_name = name

        # Render CSS in <style>
        if typeof (css = protoProps.css) == 'string'
          el = document.createElement 'style'
          el.innerHTML = css
        # Attach CSS <link>
        else if typeof (cssref = protoProps.css_href) == 'string'
          el = document.createElement 'link'
          el.href = cssref
          el.rel = 'stylesheet'

        if el
          el.type = 'text/css'
          $('head')[0].appendChild el
          
        child


  cell.prototype =
    $: (selector)-> $ selector, @el

    update: ->
      if not @_renderQ
        @_renderQ = {}
        @initialize?()
        if typeof (innerHTML = @__render @_renderHelper, bind @__renderinnerHTML, this) == 'string'
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

        if ebindings = @cell::__eventBindings
          delete @cell::__eventBindings
          binderCache = []
          for b in ebindings
            binderCache = binderCache.concat getBinders this, b.prop, b.desc
          @cell::__binderCache = binderCache

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


  $ ->
    # Load/render cells specified in DOM node data-cell attributes
    for node in $('[data-cell]') when cellname=node.getAttribute('data-cell')
      do(node)->
        opts = {}
        cachebust = /(^\?cachebust)|(&cachebust)/.test window.location.search
        if ((cachebustAttr = node.getAttribute('data-cell-cachebust')) != null or cachebust) and cachebustAttr != 'false'
          opts.urlArgs = "bust=#{new Date().getTime()}"
        if baseurl = node.getAttribute 'data-cell-baseurl'
          opts.baseUrl = baseurl
        require opts, ["cell!#{cellname}"], (CType)-> $(node).append(new CType().el)
    return

  ###
  Exports
  ###
  __preinstalledCells__: __preinstalledCells__ = []

  pluginBuilder: 'cell-pluginBuilder'

  load: do->
    moduleNameRegex = /(.*\/)?(.*)/
    (name, req, load, config)->
      req [name], (CDef)->
        if typeof CDef != 'object'
          E "Couldn't load #{name} cell. cell definitions should be objects, but instead was #{typeof CDef}"
        else
          found = false
          for cname in __preinstalledCells__ when name == cname
            found = true

          if not found
            CDef.css_href ?= req.toUrl "#{name}.css"

          load cell.extend CDef, moduleNameRegex.exec(name)[2]
        return
      return

