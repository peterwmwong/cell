define [
  'cell'
  'underscore'
  'backbone'
], ({Cell}, _, Backbone)->

  _isJQueryish =
    if typeof Zepto is 'function'
      Zepto.fn.isPrototypeOf.bind Zepto.fn
    else
      (o)-> o.jquery

  _isObj = (o)-> o and o.constructor is Object

  _renderNodes = (parent,nodes)->
    while (c = nodes.pop())?
      if _.isElement c
        parent.insertBefore c, parent.firstChild

      else if _isJQueryish c
        c.appendTo parent

      else if _.isArray c
        nodes = nodes.concat c

      else if c instanceof Bind
        c.bindTo parent

      else
        parent.insertBefore (document.createTextNode c), parent.firstChild

    parent

  # HAML-like selector, ex. div#myID.myClass
  _parseHAML = (haml)->
    if m = /^(\w+)?(#([\w\-]+))*(\.[\w\.\-]+)?$/.exec(haml)
      tag: m[1] or 'div'
      id:  v = m[3]
      className:
        if v = m[4]
          v.slice(1).replace(/\./g, ' ')
        else
          ''

  __ = (viewOrHAML, optionsOrFirstChild, children...)->
    return unless viewOrHAML

    options =
      if _isObj optionsOrFirstChild
        optionsOrFirstChild
      else
        children.push optionsOrFirstChild
        undefined

    parent =
      # HAML
      if typeof viewOrHAML is 'string'
        if haml = _parseHAML viewOrHAML
          el = document.createElement haml.tag
          el.setAttribute 'id', haml.id if haml.id
          el.className = haml.className if haml.className

          _.each options, (v,k)->
            if v instanceof Bind
              v.bindToAttr el, k
            else
              el.setAttribute k, v
            return
          el

      # Cell
      else if viewOrHAML.prototype instanceof Backbone.View
        (new viewOrHAML options).render().el

    throw "__(): unsupported argument #{viewOrHAML}" if not parent
    _renderNodes parent, children

  Bind = (@model, @attrs, @transform)->
    @attrs = [@attrs] if typeof @attrs is 'string'
    @boundEls = []
    @boundAttrs = []
    @model.on "change:#{@attrs.join ' change:'}", @onChange, @
    @

  Bind::bindTo = (el)->
    @boundEls.push el
    el.innerHTML = @getResult()
    return

  Bind::bindToAttr = (el, attr)->
    @boundAttrs.push {el,attr}
    el.setAttribute attr, @getResult()
    return

  Bind::getResult = -> 
    args = _.map(@attrs, ((a)-> @[a]), @model.attributes)
    (@transform? args..., @model) or args.join(' ') or ''

  Bind::onChange = ->
    # Don't do anything if bound to nothing
    if @boundEls.length or @boundAttrs.length
      val = @getResult()

      # Update innerHTMLs of content bound elements
      _.each @boundEls, (el)->
        el.innerHTML = val
        return

      # Update attribute values of attribute bounded elements
      _.each @boundAttrs, ({el,attr})->
        el.setAttribute attr, val
        return

    return

  __.bind = (model, attrs, transform)-> new Bind model, attrs, transform

  __.$ = (args...)-> $ __ args...

  Cell::__ = __
  Cell::render = ->
    @render_el and _renderNodes @el, [@render_el(__,__.bind)]
    @after_render?()
    @
  __