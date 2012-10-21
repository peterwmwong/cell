define ['backbone'], ->
  noop = ->

  # Load/render cells specified in DOM node data-cell attributes
  $ ->
    $('[data-cell]').each (i,el)->
      if cellname = @getAttribute 'data-cell'
        require ["cell!#{cellname}"], (CType)->
          el.appendChild new CType().render().el
          return
      return
    return

  pic = undefined
  exp =
    Cell: Backbone.View.extend
      render: ->
        @render_el and @el.innerHTML = @render_el()
        @after_render?()
        @

    pluginBuilder: 'cell-builder-plugin'

    load: (name, req, load, config)->
      req [name], (def)->
        throw "Couldn't load #{name} cell" unless def is Object(def)
        pic or= (exp.__preinstalledCells__ or= {})
        unless pic[name]
          pic[name] = true
          el = document.createElement 'link'
          el.href = req.toUrl "#{name}.css"
          el.rel = 'stylesheet'
          el.type = 'text/css'
          $('head').append el

        def.className = def.name = /(.*\/)?(.*)$/.exec(name)[2]

        # Normalize render_el and after_render
        def.render_el or= noop
        def.after_render or= noop

        load exp.Cell.extend def
        return
      return
