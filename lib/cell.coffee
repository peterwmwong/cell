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
    optsToProps = ['id','class','model','collection']

    (@options = {})->
      @_cid = uniqueId '__cell_instance_'
        
      # Copy over class and id properties for convenience
      for p in optsToProps when (val = @options[p])
        @[p] = val

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
    eventSelRegex = /^(\w+)(\s(.*))?$/

    (protoProps, name)->
      protoProps.__eventBindings = []

      # Find and process Event Bindings and Render Function specified in
      # the cell's definition
      for propName,prop of protoProps

        # Parse Event Bindings
        # Syntax: bind [property name]?
        #   [property name] name of property to observe
        #     If not specified, 'el' (view) is used.
        if (match = eventsNameRegex.exec propName) and typeof prop == 'object'
          bindProp = match[2] ? 'el'
          binds = []

          # Parse each Event Binding
          # Syntax: [event name] [CSS selector]?
          #   [event name]    Event to observe
          #   [CSS selector]  If property being observed is an HTMLElement,
          #     the CSS selector will be used to only target selected nodes.
          for desc,handler of prop when (selmatch = eventSelRegex.exec desc)
            binds.push
              name: selmatch[1]
              sel: selmatch[3]
              handler: handler

          if binds.length
            protoProps.__eventBindings.push prop: bindProp, binds: binds
            
        # Find and add render function (if not already found)
        else if not protoProps.__renderTagName and match = renderFuncNameRegex.exec propName
          if typeof (protoProps.__render=prop) != 'function'
            E "cell.extend expects '#{propName}' to be a function"
            return
          tag = protoProps.__renderTagName = match[2] != "" and match[2] or 'div'
          protoProps.__renderOuterHTML = "<#{tag}#{match[3] ? ""}></#{tag}>"

      child = inherits this, protoProps

      # Must find a render function 
      if not (p = child.prototype).__renderTagName
        E 'cell.extend([constructor:Function],prototypeMembers:Object): could not find a render function in prototypeMembers'
      else
        child.extend = cell.extend
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
        @init? @options
        if typeof (innerHTML = @__render @_renderHelper, bind @__renderinnerHTML, this) == 'string'
          @__renderinnerHTML innerHTML

    __delegateEvents: ->
      # Unbind any previous event bindings
      if @_unbinds
        for ub in @_unbinds then try ub()
        delete @_unbinds
      @_unbinds = []

      for {prop,binds} in @cell::__eventBindings
        obj = @[prop]
        do(obj)=>
          if isElement obj
            obj = @$(obj)
            for {name,sel,handler} in binds then do(name,sel,handler)=>
              if typeof handler is 'string'
                handler = @[handler]

              if typeof handler is 'function'
                handler = bind handler, this
                if sel
                  obj.delegate sel, name, handler
                  @_unbinds.push -> obj.undelegate sel, name, handler
                else
                  obj.bind name, handler
                  @_unbinds.push -> obj.unbind name, handler
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

