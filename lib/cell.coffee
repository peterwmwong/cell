# Error logging
E = (typeof console?.error is 'function') and ((msg)-> console.error msg) or ->

# When running in require.js optimizer, window & document do not exist
window = this
document = window.document or {createElement:->}

# is-Node check for all browsers
_isNode =
  if typeof Node is 'object'
    (o)-> o instanceof Node
  else
    (o)-> typeof o is 'object' and typeof o.nodeType is 'number' and typeof o.nodeName is 'string'

# ES5 Array.isArray
_isArray =
  if Array.isArray then Array.isArray
  else do->
    _push = Array::push
    (obj)-> obj.push is push and obj.length?

# ES5 Function.bind
_bind =
  if Function::bind then (func,obj)-> func.bind obj
  else (func,obj)-> ()-> func.apply obj

_createDiv = -> document.createElement 'div'
_tmpNode = _createDiv()

_renderNodes = (parent,nodes)->
  while nodes.length > 0 when (c = nodes.shift())?
    if _isNode c
      parent.appendChild c
    else if typeof c in ['string','number']
      parent.appendChild document.createTextNode c
    else if _isArray c
      Array::unshift.apply nodes, c
    else
      E 'renderNodes: unsupported child type = '+c
  parent

_selRx = /^(\w+)?(#([\w\-]+))*(\.[\w\.\-]+)?$/
_tagnameRx = /^<[A-z]/
_evSelRx = /^([A-z]+)(\s(.*))?$/

window.cell = class cell
  constructor: (@options = {})->
    @model = @options.model if @options.model?
    @init? @options

    # Create DOM node and cache jQuery for node
    @$el = jQuery(@el = @_tag())

    # Set id
    @el.id = id if id = @options.id

    # Add the cell's class
    for n,i in [@cell::name,@class,@options.class] when n
      @el.className += (i and " #{n}" or n)

    _renderNodes @el, (_isArray nodes = @render? @$R) and nodes or []
    for evSel, handler of @on
      if (typeof handler is 'function') and (m = _evSelRx.exec evSel) and (event = m[1])
        @$el.on event, m[3], (_bind handler, this)
    @afterRender?()

    return

  $: (selector)-> jQuery selector, @el
  
  $R: (a,b,children...)->
    if a
      if b?.constructor isnt Object
        children.unshift b
        b = undefined

      parent =
        if typeof a is 'string'
          # HAML-like selector, ex. div#myID.myClass
          if m = _selRx.exec a
            el = document.createElement m[1] or 'div'
            el.id = v if v = m[3]

            if b
              if 'class' of b
                el.className += b.class
                delete b.class
              for k,v of b
                el.setAttribute k, v

            if v = m[4]
              el.className += v.replace /\./g, ' '
            el

          # HTML start tag, ex. "<div class='blah' style='color:#F00;'>"
          else if _tagnameRx.test a
            _tmpNode.innerHTML = a
            _tmpNode.children[0]

          else
            E "renderParent: unsupported parent string = '#{a}'"

        else if a::cell is a then (new a b).el
        else if _isNode a then a
        else E "renderParent: unsupported parent type = #{a}"

      return parent and _renderNodes parent, children
    return

cell.extend = (protoProps = {})->
  if typeof protoProps isnt 'object'
    throw "cell.extend(): expects an object {render,init,name}"

  else if (protoProps.init and typeof protoProps.init isnt 'function') or
      (protoProps.render and typeof protoProps.render isnt 'function')
    throw "cell.extend(): expects {render,init} to be functions"

  else
    child = class extends cell
    child::[k] = v for k,v of protoProps
    child::cell = child

    # Normalize/fast-path tag
    child::_tag =
      if (t = typeof protoProps.tag) is 'string'
        ->
          _tmpNode.innerHTML = protoProps.tag
          _tmpNode.children[0] or document.createElement 'div'
      else if t is 'function'
        ->
          _tmpNode.innerHTML = protoProps.tag()
          _tmpNode.children[0] or document.createElement 'div'
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
  _modNameRx = /(.*\/)?(.*)$/

  define 'cell', [], exports =
    pluginBuilder: 'cell-builder-plugin'
    load: (name, req, load, config)->
      req [name], (CDef)->
        if typeof CDef isnt 'object'
          E "Couldn't load #{name} cell. cell definitions should be objects, but instead was #{typeof CDef}"
        else
          CDef.name = _modNameRx.exec(name)[2]

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