# Error logging
E = if (typeof console?.error is 'function') then ((msg)-> console.error msg) else ->

# When running in require.js optimizer, window & document do not exist
window = this
document = window.document or {createElement:->}

_isObj = (o)-> o?.constructor is Object

# is-Node check for all browsers
_isNode =
  if typeof Node is 'object'
    (o)-> o instanceof Node
  else
    (o)-> typeof o is 'object' and typeof o.nodeType is 'number' and typeof o.nodeName is 'string'

# ES5 Array.isArray
_isArray = Array.isArray or (obj)-> obj and obj.push is Array::push and obj.length?

# ES5 Function.bind
_bind =
  if Function::bind then (func,obj)-> func.bind obj
  else (func,obj)-> -> func.apply obj, arguments

_createDiv = -> document.createElement 'div'
_range = document.createRange()
_fnode = (html)->
  (node = _range.createContextualFragment(html).childNodes[0]).nodeType is 1 and node

_renderNodes = (parent,nodes)->
  while nodes.length > 0 when (c = nodes.shift())?
    if _isNode c
      parent.appendChild c
    else if c.jquery
      c.appendTo parent
    else if typeof c in ['string','number']
      parent.appendChild document.createTextNode c
    else if _isArray c
      Array::unshift.apply nodes, c
    else
      E 'renderNodes: unsupported child type = '+c
  parent

# HAML-like selector, ex. div#myID.myClass
_parseHAML = (haml)->
  if m = /^(\w+)?(#([\w\-]+))*(\.[\w\.\-]+)?$/.exec haml
    result =
      tag: m[1] or 'div'
      id:  v = m[3]
      className: if v = m[4] then v.slice(1).replace(/\./g, ' ') else ''

if not String::trim
  String::trim = -> $.trim this

window.cell = class cell
  constructor: (@options = {})->
    @model = @options.model if @options.model?
    @init? @options

    # Create DOM node and cache jQuery for node
    @$el = jQuery(@el = @_tag())

    # Set id
    @el.id = id if id = @options.id

    # Add the cell's class
    className = @el.className
    for n,i in [@cell::name,@class,@options.class] when n
      className += " #{n}"
    @el.className = className if className = className.trim()

    _renderNodes @el, if (_isArray nodes = @render? @_) then nodes else []
    for evSel, handler of @on when (typeof handler is 'function') and (m = /^([A-z]+)(\s(.*))?$/.exec evSel) and (event = m[1])
      @$el.on event, m[3], _bind(handler, this)
    @afterRender?()

    return

  $: (selector)-> jQuery selector, @el
  
  _: (a,b,children...)->
    if a
      if _isNode b
        children.unshift b
        b = undefined

      parent =
        if typeof a is 'string'
          if haml = _parseHAML a
            el = document.createElement haml.tag
            el.setAttribute 'id', haml.id if haml.id

            if b?
              if not _isObj b
                children.unshift b
              else
                for k,v of b
                  if k isnt 'class' then el.setAttribute k, v
                  else el.className += v

            if haml.className
              el.className += if el.className then " #{haml.className}" else haml.className
            el

          # HTML start tag, ex. "<div class='blah' style='color:#F00;'>"
          else if /^<[A-z]/.test a then _fnode a
          else
            E "renderParent: unsupported parent string = '#{a}'"

        else if a::cell is a
          cell_options =
            if typeof b is 'string' and (haml = _parseHAML b)
              if _isObj children[0]
                (c = children.shift()).id = haml.id
                c.class = haml.className
                c
              else 
                id: haml.id
                class: haml.className

            else if _isObj b
              b
          (new a cell_options).el

        else if _isNode a then a
        else E "renderParent: unsupported parent type = #{a}"

      parent and _renderNodes parent, children

cell.extend = (protoProps = {})->
  if typeof protoProps isnt 'object'
    throw "cell.extend(): expects an object {render,init,name}"

  else if (protoProps.init and typeof protoProps.init isnt 'function') or
      (protoProps.render and typeof protoProps.render isnt 'function')
    throw "cell.extend(): expects {render,init} to be functions"

  else
    child = class extends this
    child::[k] = v for k,v of protoProps
    child::cell = child

    # Normalize/fast-path tag
    child::_tag =
      if (t = typeof protoProps.tag) is 'string'
        -> _fnode(protoProps.tag) or _createDiv()
      else if t is 'function'
        -> _fnode(@tag()) or _createDiv()
      else
        _createDiv

    # Render CSS in <style>
    if typeof (css = protoProps.css) is 'string'
      el = document.createElement 'style'
      el.innerHTML = css

    # Attach CSS <link>
    else if typeof (cssref = protoProps.css_href) is 'string'
      el = document.createElement 'link'
      el.href = cssref
      el.rel = 'stylesheet'

    if el
      el.type = 'text/css'
      $('head')[0].appendChild el
      
    child

# cell AMD Module
if typeof define is 'function' and typeof require is 'function'
  define 'cell', [], exports =
    pluginBuilder: 'cell-builder-plugin'
    load: (name, req, load, config)->
      req [name], (CDef)->
        if typeof CDef isnt 'object'
          E "Couldn't load #{name} cell. cell definitions should be objects, but instead was #{typeof CDef}"
        else
          CDef.name = /(.*\/)?(.*)$/.exec(name)[2]

          if not exports.__preinstalledCells__?[name]?
            CDef.css_href ?= req.toUrl "#{name}.css"

          if typeof CDef.extends is 'string'
            req ["cell!#{CDef.extends}"], (parentCell)->
              if parentCell::name
                CDef.class = parentCell::name + " #{CDef.class}" or ""
              load parentCell.extend CDef
              return
          else
            load cell.extend CDef
        return
      return
  
  # Load/render cells specified in DOM node data-cell attributes
  jQuery(document).ready ->
    _range.selectNode document.body
    jQuery('[data-cell]').each ->
      if cellname = @getAttribute 'data-cell'
        opts = {}
        cachebust = /(^\?cachebust)|(&cachebust)/.test window.location.search
        if ((cachebustAttr = @getAttribute 'data-cell-cachebust') isnt null or cachebust) and cachebustAttr isnt 'false'
          opts.urlArgs = "bust=#{new Date().getTime()}"
        if baseurl = @getAttribute 'data-cell-baseurl'
          opts.baseUrl = baseurl
        require opts, ["cell!#{cellname}"], (CType)=>
          jQuery(@).append(new CType().el)
          return
      return
    return
  return