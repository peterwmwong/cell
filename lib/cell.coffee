# Error logging
E =
  (typeof console?.error == 'function') and ((msg)-> console.error msg) or ->

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

window.cell ?= cell = do->
  tmpNode = document.createElement 'div'
  optsToProps = ['id','class','model','collection']

  (@options = {})->
    @_cid = uniqueId '__cell_instance_'
      
    # Copy over class and id properties for convenience
    for p in optsToProps when (val = @options[p])
      @[p] = val

    # Create DOM node
    tmpNode.innerHTML = @__renderOuterHTML
    @el = tmpNode.children[0]
    @$el = $(@el)

    # Add the cell's class
    className = ""
    for n in [@cell::name,@el.className,@class] when n
      className += ' '+n
    if className != ""

      @el.className = className

    (typeof @id == 'string') and @el.id = @id

    @update()
    return

cell.extend = do->
  renderFuncNameRegex = /render([ ]+<(\w+)([ ]+.*)*>[ ]*)?$/
  eventsNameRegex = /bind( (.+))?/
  eventSelRegex = /^(\w+)(\s(.*))?$/

  (protoProps, name)->
    protoProps.__eventBindings = @::__eventBindings?.slice(0) or []

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

    if typeof name == 'string'
      protoProps.name = name
    child = inherits this, protoProps

    # Must find a render function 
    if not (p = child.prototype).__renderTagName
      E 'cell.extend([constructor:Function],prototypeMembers:Object): could not find a render function in prototypeMembers'
    else
      child.extend = cell.extend
      p.cell = child

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
    @init? @options
    if typeof (innerHTML = @__render bind(@renderHelper,this), bind(@__renderinnerHTML,this)) == 'string'
      @__renderinnerHTML innerHTML
    return

  # Rendering helper function passed to the cell.render function to make
  # the following easier:
  #  - asynchronous and synchronous rendering
  #  - rendering other cells and DOM nodes
  #  - rendering strings, numbers, and potentially null/undefined values
  renderHelper: (a, b)->
    # undefined, null, false -> ""
    if a is undefined or a is null or a==false then ""

    # string, number
    else if (type = typeof a) == 'string' or type == 'number' then a

    # cell
    else if a.prototype?.cell == a
      acell = new a extendObj b ? {}
      @$el.one 'beforeDelegateEvents', => try @$("##{acell._cid}").replaceWith acell.el
      "<#{acell.__renderTagName} id='#{acell._cid}'></#{acell.__renderTagName}>"

    # node
    else if isElement a
      uid = uniqueId '__cell_render_node_'
      @$el.one 'beforeDelegateEvents', => try @$("##{uid}").replaceWith a
      "<#{a.tagName} id='#{uid}'></#{a.tagName}>"

    # array
    else if a instanceof Array
      i=0
      res = ""
      if typeof b != 'function' then b = (a)->a
      for e in a then res += @renderHelper b e,i++,a
      res

    # not supported
    else
      E 'render({CType,HTMLElement,string,number},[cellOptions])'
      ""

  __delegateEvents: ->
    # Unbind any previous event bindings
    if @_unbinds
      for ub in @_unbinds then try ub()
      delete @_unbinds
    @_unbinds = []
    for {prop,binds} in @__eventBindings when isElement(obj = @[prop])
      obj = @$(obj)
      for {name,sel,handler} in binds then do(obj,name,sel,handler)=>
        if typeof handler is 'string'
          handler = @[handler]

        if typeof handler is 'function'
          handler = bind handler, this
          @_unbinds.push(
            if sel
              obj.delegate sel, name, handler
              ->
                obj.undelegate sel, name, handler
                return
            else
              obj.bind name, handler
              ->
                obj.unbind name, handler
                return
          )
        return
    return
      
  __renderinnerHTML: (innerHTML)->
    @$el.html(innerHTML)
        .trigger 'beforeDelegateEvents', this
    @__delegateEvents()
    @$el.trigger 'afterRender'
    return

# cell AMD Module
if typeof define == 'function' and typeof require == 'function'
  define 'cell', [], exports =
    pluginBuilder: 'cell-pluginBuilder'

    load: do->
      moduleNameRegex = /(.*\/)?(.*)/
      loadDef = (name, load, parentCell, def)-> load parentCell.extend def, moduleNameRegex.exec(name)[2]
      (name, req, load, config)->
        req [name], (CDef)->
          if typeof CDef != 'object'
            E "Couldn't load #{name} cell. cell definitions should be objects, but instead was #{typeof CDef}"
          else
            if typeof exports.__preinstalledCells__?[name] == 'undefined'
              CDef.css_href ?= req.toUrl "#{name}.css"

            if typeof CDef.extends == 'string'
              req ["cell!#{CDef.extends}"], (parentCell)->
                if parentCell::name
                  CDef.class = "#{parentCell::name}#{CDef.class or ""}"
                loadDef name, load, parentCell, CDef
                return
            else
              loadDef name, load, cell, CDef
          return
        return

  require ['cell'], (cell)->
    # Load/render cells specified in DOM node data-cell attributes
    require.ready ->
      $('[data-cell]').each ->
        node = this
        if cellname=node.getAttribute('data-cell')
          opts = {}
          cachebust = /(^\?cachebust)|(&cachebust)/.test window.location.search
          if ((cachebustAttr = node.getAttribute('data-cell-cachebust')) != null or cachebust) and cachebustAttr != 'false'
            opts.urlArgs = "bust=#{new Date().getTime()}"
          if baseurl = node.getAttribute 'data-cell-baseurl'
            opts.baseUrl = baseurl
          require opts, ["cell!#{cellname}"], (CType)->
            $(node).append(new CType().el)
            return
        return
      return
    return
