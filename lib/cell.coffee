define ->
  # Error logging
  E = if (typeof console?.error is 'function') then ((msg...)-> console.error msg...) else ->

  # When running in require.js optimizer, window & doc do not exist
  $ = (window = this).$
  doc = window.document or {createElement:->}

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
        E "render_el: unsupported render element", c
    parent

  # Load/render cells specified in DOM node data-cell attributes
  $(doc).ready ->
    _range.selectNode doc.body
    $('[data-cell]').each ->
      if cellname = @getAttribute 'data-cell'
        require ["cell!#{cellname}"], (CType)=>
          @appendChild new CType().render().el
          return
      return
    return

  exports =
    Cell: Cell = Backbone.View.extend
      render: ->
        @el.innerHTML = ''
        children = @render_el()
        if _.isArray children
          _renderNodes @el, children
        @after_render()
        @

    pluginBuilder: 'cell-builder-plugin'

    load: (name, req, load, config)->
      req [name], (CDef)->
        if typeof CDef isnt 'object'
          E "cell!: Couldn't load #{name} cell. cell definitions should be objects, but instead was #{typeof CDef}"
        else
          if not exports.__preinstalledCells__?[name]?
            (exports.__preinstalledCells__ or= {})[name] = true
            el = doc.createElement 'link'
            el.href = req.toUrl "#{name}.css"
            el.rel = 'stylesheet'
            el.type = 'text/css'
            $('head')[0].appendChild el

          CDef.className = CDef.name = /(.*\/)?(.*)$/.exec(name)[2]

          # Normalize render_el and after_render
          CDef.render_el or= $.noop
          CDef.after_render or= $.noop

          load Cell.extend CDef
        return
      return

