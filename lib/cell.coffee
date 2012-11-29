define (require)->
  Backbone = require 'backbone'
  $ = require 'jquery'

  # Load/render cells specified in DOM node data-cell attributes
  $ ->
    $('[data-cell]').each (i,el)->
      if cellname = @getAttribute 'data-cell'
        require ["cell!#{cellname}"], (CType)->
          el.appendChild new CType().render().el
          return
      return
    return

  # Maps cid to cell
  cidToCell = {}

  # Override jQuery.cleanData()
  # This method is called whenever a DOM node is removed using $.fn.remove(),
  # $.fn.empty(), or $.fn.html().  If the DOM node being removed is a cell's
  # @el, lookup the cell and call @dispose()
  origCleanData = $.cleanData
  $.cleanData = ( elems, acceptData )->
    origCleanData elems, acceptData
    i = 0
    while (elem = elems[i++]) when (cid = elem.getAttribute 'cell_cid')
      cidToCell[cid].dispose()
    return

  pic = undefined
  exp =

    Cell: Backbone.View.extend

      # Removes 
      dispose: ->
        delete cidToCell[@cid]
        @model?.off null, null, @
        @collection?.off null, null, @
        @undelegateEvents()
        @model = @collection = @el = @$el = @$ = undefined

      setElement: (element, delegate)->
        Backbone.View::setElement.call @, element, delegate
        cidToCell[@cid] = this
        @el.setAttribute 'cell', @name
        @el.setAttribute 'cell_cid', @cid
        @

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
        def.render_el or= $.noop
        def.after_render or= $.noop

        load exp.Cell.extend def
        return
      return
