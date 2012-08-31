define ['cell'], ({Cell})->
  E = if (typeof console?.error is 'function') then ((msg...)-> console.error msg...) else ->
  _isJQueryish =
    if typeof window.Zepto is 'function'
      $.fn.isPrototypeOf.bind $.fn
    else
      (o)-> o.jquery?

  _isObj = (o)-> o?.constructor is Object

  _renderNodes = (parent,nodes)->
    while nodes.length > 0 when (c = nodes.shift())?
      if _.isElement c
        parent.appendChild c
      else if typeof c in ['string','number']
        parent.appendChild document.createTextNode c
      else if _isJQueryish c
        c.appendTo parent
      else if _.isArray c
        Array::unshift.apply nodes, c
      else
        E "__: unsupported render child", c
    parent

  # HAML-like selector, ex. div#myID.myClass
  _parseHAML = (haml)->
    if m = /^(\w+)?(#([\w\-]+))*(\.[\w\.\-]+)?$/.exec haml
      {
        tag: m[1] or 'div'
        id:  v = m[3]
        className: if v = m[4] then v.slice(1).replace(/\./g, ' ') else ''
      }

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
              if (not _isObj b) or (_isJQueryish b)
                children.unshift b
              else
                for k,v of b
                  if k isnt 'class' then el.setAttribute k, v
                  else el.className += v

            if haml.className
              el.className += if el.className then " #{haml.className}" else haml.className
            el

          else
            E "__(): unsupported argument '#{a}'"

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
        else E "__(): unsupported argument #{a}"

      parent and _renderNodes parent, children

  __.$ = (args...)-> $ __ args...
  __