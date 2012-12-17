define [
  'cell'
  'jquery'
  'underscore'
  'backbone'
  'ref'
], (cell, $, _, Backbone, ref)->

  _isJQueryish =
    if typeof Zepto is 'function'
      Zepto.fn.isPrototypeOf.bind Zepto.fn
    else
      (o)-> o.jquery

  _isObj = (o)-> o and o.constructor is Object

  _onReferenceChangeChild = (ref,val)->
    @html val
    return

  _onReferenceChangeAttr = (ref,val)->
    @[0].setAttribute @[1], val
    return

  _renderNodes = (parent,nodes)->
    $parent = undefined
    while (c = nodes.pop())?
      if _.isElement c
        parent.insertBefore c, parent.firstChild

      else if _isJQueryish c
        c.appendTo parent

      else if _.isArray c
        nodes = nodes.concat c

      else if c instanceof ref.Reference
        $parent or= $ parent
        c.onChangeAndDo _onReferenceChangeChild, $parent

      else
        parent.insertBefore (document.createTextNode c), parent.firstChild

    parent

  # HAML-like selector, ex. div#myID.myClass
  _parseHAML = (haml)->
    if m = /^(\w+)?(#([\w\-]+))*(\.[\w\.\-]+)?$/.exec(haml)
      tag: m[1] or 'div'
      id:  m[3]
      className:
        if v = m[4]
          v.slice(1).replace(/\./g, ' ')
        else
          ''

  __ = (viewOrHAML, optionsOrFirstChild)->
    return unless viewOrHAML

    children =
      if arguments.length is 0 then []
      else [].slice.call arguments, 2

    options =
      if _isObj optionsOrFirstChild
        optionsOrFirstChild
      else
        children.unshift optionsOrFirstChild
        undefined

    parent =
      # HAML
      if typeof viewOrHAML is 'string'
        if haml = _parseHAML viewOrHAML
          el = document.createElement haml.tag
          el.setAttribute 'id', haml.id if haml.id
          el.className = haml.className if haml.className

          _.each options, (v,k)->
            if v instanceof ref.Reference
              v.onChangeAndDo _onReferenceChangeAttr, [el,k]
            else
              el.setAttribute k, v
            return
          el

      # Cell
      else if viewOrHAML.prototype instanceof Backbone.View
        (new viewOrHAML options).render().el

    throw "__(): unsupported argument #{viewOrHAML}" if not parent
    _renderNodes parent, children

  __.$ = -> $ __.apply null, arguments

  cell.Cell::__ = __
  cell.Cell::render = ->
    _renderNodes @el, [@renderEl __]
    @afterRender()
    @
  __