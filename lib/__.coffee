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
    newNodes = _renderNodes [val]

    # Is this on a 'change' (not initial)
    if @prevNodes and @prevNodes.length > 0
      target = @prevNodes[0]
      parent = target.parentNode

      # Insert new nodes in the appropriate place
      _.each newNodes, (node)-> parent.insertBefore node, target

      # Remove old nodes
      $(@prevNodes).remove()

    @prevNodes = newNodes
    return

  _onReferenceChangeAttr = (ref,val)->
    @[0].setAttribute @[1], val
    return

  _renderNodes = (nodes)->
    rendered = []
    while (c = nodes.shift())?
      if _.isElement c
        rendered.push c

      else if _isJQueryish c
        rendered = rendered.concat c.toArray()

      else if _.isArray c
        nodes = c.concat nodes

      else if c instanceof ref.Reference
        ctx = {}
        c.onChangeAndDo _onReferenceChangeChild, ctx
        rendered = rendered.concat ctx.prevNodes

      else
        rendered.push document.createTextNode c
    rendered

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
        if m = /^(\w+)?(#([\w\-]+))*(\.[\w\.\-]+)?$/.exec(viewOrHAML)
          # Tag
          el = document.createElement m[1] or 'div'

          # id
          if m[3]
            el.setAttribute 'id', m[3]

          # class
          if m[4]
            el.className = m[4].slice(1).replace(/\./g, ' ')

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
    _.each (_renderNodes children), parent.appendChild, parent
    parent

  __.$ = -> $ __.apply null, arguments

  cell.Cell::__ = __
  cell.Cell::render = ->
    _.each (_renderNodes [@renderEl @__]), @el.appendChild, @el
    @afterRender()
    @
  __