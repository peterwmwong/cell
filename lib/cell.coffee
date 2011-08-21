# Error logging
E =
  (typeof console?.error is 'function') and ((msg)-> console.error msg) or ->

# When running in require.js optimizer, window & document do not exist
window = this
document = window.document or {createElement:->}

# is-Node check for all browsers
_isNode =
  if typeof Node is 'object'
    (o)-> o instanceof Node
  else
    (o)-> typeof o is 'object' and typeof o.nodeType is 'number' and typeof o.nodeName is 'string'

_slice = Array::slice
# ES5 Function.bind
_bind =
  if fbind = Function.prototype.bind
    (func,obj)-> fbind.apply func, [obj].concat _slice.call arguments, 2
  else
    (func,obj)->
      args = _slice.call arguments, 2
      -> func.apply obj, args.concat _slice.call arguments

# Copies properties from src obj to dest obj
_extendObj = (destObj, srcObj)->
  destObj[p] = srcObj[p] for p of srcObj
  destObj

# Setup up prototypical inheritance (inspired by goog.inherits and Backbone.js inherits() implementations)
_ctor = ->
_inherits = (parent, protoProps)->
  child =
    if protoProps and protoProps.hasOwnProperty 'constructor' then protoProps.constructor
    else -> return parent.apply this, arguments
  _extendObj child, parent
  _ctor.prototype = parent.prototype
  child.prototype = new _ctor()
  _extendObj child.prototype, protoProps
  child::constructor = child
  child.__super__ = parent.prototype
  child

_tmpNode = document.createElement 'div'

_renderNodes = (parent,nodes)->
  while nodes.length > 0 when (c = nodes.shift())?
    if _isNode c
      parent.appendChild c
    else if typeof c in ['string','number']
      parent.appendChild document.createTextNode c
    else if c instanceof Array
      Array::unshift.apply nodes, c
    else
      E 'renderNodes: unsupported child type = '+c
  parent

_selRx = /^(\w+)?(#([\w\-]+))*(\.[\w\.\-]+)?$/
_tagnameRx = /^<[A-z]/
_evSelRx = /^([A-z]+)(\s(.*))?$/

_renderParent = (a,b)->
  if typeof a is 'string'
    # HAML-like selector, ex. div#myID.myClass
    if m = _selRx.exec a
      el = document.createElement m[1] or 'div'
      
      if v = m[3]
        el.id = v
      
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

  else if a.prototype?.cell is a
    (new a b).el

  else if _isNode a
    a

  else
    E "renderParent: unsupported parent type = #{a}"
    
window.cell = cell = (@options = {})->
  @init? @options

  # Create DOM node and cache jQuery for node
  _tmpNode.innerHTML =
    if (t = typeof @tag) is 'string' then @tag
    else if t is 'function' then @tag()
    else '<div>'

  @$el = $(@el = _tmpNode.children[0])

  # Set id
  if id = @options.id
    @el.id = id

  # Add the cell's class
  for n in [@cell::name,@class,@options.class] when n
    @el.className += ' '+n

  if @render
    if (nodes = @render @$R, _bind(@_renderChildren, this)) instanceof Array
      @_renderChildren nodes
  else
    @_renderChildren []

  return

cell.prototype =
  $R: (a,b,children...)->
    if a
      if b?.constructor isnt Object
        children.unshift b
        b = undefined

      if parent = _renderParent a,b
        return _renderNodes parent, children
    return

  $: (selector)-> $ selector, @el

  ready: (f)->
    if @_isReady then try f this
    else
      (@_readys ?= []).push f

  _renderChildren: (nodes)->
    _renderNodes @el, nodes
    @_delegateEvents()
    @afterRender?()
    @_isReady = true
    if @_readys
      for r in @_readys
        try r this
      delete @_readys
    return

  _delegateEvents: ->
    for evSel, handler of @on when (typeof handler is 'function') and (m = _evSelRx.exec evSel)
      handler = _bind handler, this
      if event = m[1]
        if sel = m[3]
          @$el.delegate sel, event, handler
        else
          @$el.bind event, handler
    return

cell.extend = (protoProps, name)->
        
  if typeof name is 'string'
    protoProps.name = name
  child = _inherits this, protoProps

  child.extend = cell.extend
  child::cell = child

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
  _modNameRx = /(.*\/)?(.*)/

  define 'cell', [], exports =
    pluginBuilder: 'cell-pluginBuilder'
    load: (name, req, load, config)->
      req [name], (CDef)->
        if typeof CDef isnt 'object'
          E "Couldn't load #{name} cell. cell definitions should be objects, but instead was #{typeof CDef}"
        else
          m = _modNameRx.exec(name)[1..]

          if typeof exports.__preinstalledCells__?[name] is 'undefined'
            CDef.css_href ?= req.toUrl "#{name}.css"

          if typeof CDef.extends is 'string'
            req ["cell!#{CDef.extends}"], (parentCell)->
              if parentCell::name
                CDef.class = parentCell::name + " #{CDef.class}" or ""
              load parentCell.extend CDef, m[1]
              return
          else
            load cell.extend CDef, m[1]
        return
      return
  
  # Replace not-so-helpful-for-webkit require.js load module error handling
  require.onError = (e)-> E e.originalError.stack

  # Load/render cells specified in DOM node data-cell attributes
  require.ready ->
    $('[data-cell]').each ->
      node = this
      if cellname=node.getAttribute('data-cell')
        opts = {}
        cachebust = /(^\?cachebust)|(&cachebust)/.test window.location.search
        if ((cachebustAttr = node.getAttribute('data-cell-cachebust')) isnt null or cachebust) and cachebustAttr isnt 'false'
          opts.urlArgs = "bust=#{new Date().getTime()}"
        if baseurl = node.getAttribute 'data-cell-baseurl'
          opts.baseUrl = baseurl
        require opts, ["cell!#{cellname}"], (CType)->
          $(node).append(new CType().el)
          return
      return
    return
  return