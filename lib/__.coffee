define ['cell'], ({Cell})->
  _isJQueryish =
    if typeof window.Zepto is 'function'
      $.fn.isPrototypeOf.bind $.fn
    else
      (o)-> o.constructor is jQuery

  _isObj = (o)-> o and o.constructor is Object

  _renderNodes = (parent,nodes)->
    if (n = nodes[0]) instanceof Bind
      n.bindTo parent
    else
      while nodes.length > 0 when (c = nodes.shift())?
        if _.isElement c
          parent.appendChild c
        else if typeof c in ['string','number'] or _.isDate c
          parent.appendChild document.createTextNode c
        else if _isJQueryish c
          c.appendTo parent
        else if _.isArray c
          nodes.unshift.apply nodes, c
        else
          throw "__: unsupported render child"
    parent

  # HAML-like selector, ex. div#myID.myClass
  _parseHAML = (haml)->
    if m = /^(\w+)?(#([\w\-]+))*(\.[\w\.\-]+)?$/.exec(haml)
      tag: m[1] or 'div'
      id:  v = m[3]
      className: if v = m[4] then v.slice(1).replace(/\./g, ' ') else ''

  __ = (a,b,children...)->
    if a
      if _.isElement b
        children.unshift b
        b = undefined

      parent =
        if typeof a is 'string'
          if haml = _parseHAML a
            el = document.createElement haml.tag
            el.setAttribute 'id', haml.id if haml.id

            if b?
              if (not _isObj b) or (_isJQueryish b) or (b instanceof Bind)
                children.unshift b
              else
                for k,v of b
                  if k is 'class' then el.className += v
                  else el.setAttribute k, v

            if haml.className
              el.className += if el.className then " #{haml.className}" else haml.className
            el

          else
            throw "__(): unsupported argument '#{a}'"

        else if a.prototype instanceof Cell
          cell_options =
            if typeof b is 'string' and (haml = _parseHAML b)
              if _isObj children[0]
                (c = children.shift()).id = haml.id
                c.className = haml.className
                c
              else 
                id: haml.id
                className: haml.className

            else if _isObj b
              b

          if cell_options
            cell_options.className =
              if cell_options.className
                "#{a::className} #{cell_options.className}"
              else
                a::className

          (new a cell_options).render().el

        else if _.isElement a then a
        else throw "__(): unsupported argument #{a}"

      parent and _renderNodes parent, children

  Bind = (@model, @attrs, @transform)->
    @attrs = [@attrs] if typeof @attrs is 'string'
    @args = new Array @attrs.length+1
    @args[@attrs.length] = @model
    @estring = 'change:' + @attrs.join ' change:'
    @els = []
    @model.on @estring, @onChange, @
    @

  Bind.prototype =
    bindTo: (el)->
      @els.push el
      el.innerHTML = @getResult()
      return

    getResult: -> 
      @args[i] = @model.attributes[a] for a,i in @attrs
      val = @transform and (@transform @args...) or @args.slice(0,-1).join ' '
      val? and val or ''

    onChange: ->
      if @els.length > 0
        val = @getResult()
        el.innerHTML = val for el in @els
      return

  __.bind = (model, attrs, transform)-> new Bind model, attrs, transform

  __.$ = (args...)-> $ __ args...

  Cell::__ = __
  Cell::render = ->
    @render_el and _renderNodes @el, [@render_el(__,__.bind)]
    @after_render?()
    @
  __