# Error logging
E = if (typeof console?.error is 'function') then ((msg...)-> console.error msg...) else ->

# When running in require.js optimizer, window & doc do not exist
window = this
$ = window.$
doc = window.document or {createElement:->}

_isObj = (o)-> o?.constructor is Object
_range = doc.createRange()

_renderNodes = (parent,nodes)->
  while nodes.length > 0 when (c = nodes.shift())?
    if _.isElement c
      parent.appendChild c
    else if c.jquery
      c.appendTo parent
    else if typeof c in ['string','number']
      parent.appendChild doc.createTextNode c
    else if _.isArray c
      Array::unshift.apply nodes, c
    else
      E "__: unsupported render child #{c}"
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
          el = doc.createElement haml.tag
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

        else
          E "__(): unsupported argument '#{a}'"

      else if a.prototype instanceof window.cell
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

        (new a cell_options).el

      else if _.isElement a then a
      else E "__(): unsupported argument #{a}"

    parent and _renderNodes parent, children

window.cell = cell = Backbone.View.extend
  __: __
  render: ->
    @el.innerHTML = ''
    if _.isArray(children = @render_el __)
      @el.appendChild child for child in children
    @after_render()
    @

# cell AMD Module
if typeof define is 'function' and typeof require is 'function'
  define 'cell', [], exports =
  
    pluginBuilder: 'cell-builder-plugin'

    load: (name, req, load, config)->
      req [name], (CDef)->
        if typeof CDef isnt 'object'
          E "cell!: Couldn't load #{name} cell. cell definitions should be objects, but instead was #{typeof CDef}"
        else
          CDef.name = /(.*\/)?(.*)$/.exec(name)[2]

          if not exports.__preinstalledCells__?[name]?
            el = doc.createElement 'link'
            el.href = req.toUrl "#{name}.css"
            el.rel = 'stylesheet'
            el.type = 'text/css'
            $('head')[0].appendChild el

          CDef.className = CDef.name

          # Normalize render_el and after_render
          CDef.render_el or= $.noop
          CDef.after_render or= $.noop

          load cell.extend CDef
        return
      return

    __: __
      
  # Load/render cells specified in DOM node data-cell attributes
  $(doc).ready ->
    _range.selectNode doc.body
    $('[data-cell]').each ->
      if cellname = @getAttribute 'data-cell'
        require ["cell!#{cellname}"], (CType)=>
          @.appendChild new CType().render().el
          return
      return
    return
  return