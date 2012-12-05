define (require)->
  Backbone = require 'backbone'
  $ = require 'jquery'

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

  module =
    Cell: Backbone.View.extend

      # Removes anything that might leak memory
      dispose: ->
        delete cidToCell[@cid]
        @model?.off null, null, @
        @collection?.off null, null, @
        @undelegateEvents()
        @model = @collection = @el = @$el = @$ = undefined
        return

      setElement: (element, delegate)->
        Backbone.View::setElement.call @, element, delegate

        # Track the cell instance by cid
        cidToCell[@cid] = this
        @el.setAttribute 'cell', @_cellName

        # Used jQuery.cleanData() to retrieve the cell instance
        # associated with a DOM Element
        @el.setAttribute 'cell_cid', @cid
        @

      render: ->
        @el.innerHTML = @renderEl()
        @afterRender()
        @

      renderEl: $.noop
      afterRender: $.noop

    pluginBuilder: 'cell-builder-plugin'

    load: (name, req, load, config)->
      # Attach te associated CSS file for cell
      unless (module._installed or= {})[name]
        module._installed[name] = true
        el = document.createElement 'link'
        el.href = req.toUrl "#{name}.css"
        el.rel = 'stylesheet'
        el.type = 'text/css'
        document.head.appendChild el

      name = /(.*\/)?(.*)$/.exec(name)[2]
      load (proto,statics)->
        proto or= {}
        proto.className = proto._cellName = name
        module.Cell.extend proto, statics

      return
