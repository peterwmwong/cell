define [
  'backbone'
  'jquery'
], (Backbone,$)->

  isArrayish =
    if typeof Zepto is 'function'
      (o)-> (_.isArray o) or (Zepto.fn.isPrototypeOf o)
    else
      (o)-> (_.isArray o) or o.jquery

  isBind = (o)-> typeof o is 'function'

  
  # Maps cid to cell
  cidMap = {}

  # Override jQuery.cleanData()
  # This method is called whenever a DOM node is removed using $.fn.remove(),
  # $.fn.empty(), or $.fn.html().  If the DOM node being removed is a cell's
  # @el, lookup the cell and call @dispose()
  origCleanData = $.cleanData
  $.cleanData = ( elems, acceptData )->
    i=0
    while elem = elems[i++]
      origCleanData [elem], acceptData
      if cid = elem.cellcid
        cell = cidMap[cid]
        cell.$el = undefined
        cell.remove()
    return

  module =
    Cell: Backbone.View.extend

      constructor: ->
        @_binds = []
        _.bindAll @, '__', 'updateBinds'
        Backbone.View.apply @, arguments
        @listenTo bindUpdater, 'all', @updateBinds if (bindUpdater = @model or @collection)

      _renderBindEl: (bind)->
        return false if ((newVal = bind.func()) is bind.val) and bind.nodes

        newNodes =
          if newVal?
            @_renderChildren newVal, []
          else
            [document.createTextNode '']

        nodes = bind.nodes

        # Is this on a 'change' (not initial)
        if nodes
          target = nodes[0]
          parent = target.parentNode

          # Insert new nodes in the appropriate place
          parent.insertBefore n, target for n in newNodes

          # Remove old nodes
          $(nodes).remove()

        bind.nodes = newNodes
        bind.val = newVal
        true

      _renderBindAttr: (bind)->
        return false if (newVal = bind.func()) is bind.val
        bind.el.setAttribute bind.attr, bind.val = newVal
        true

      _renderChildren: (nodes, rendered)->
        return rendered unless nodes?
        nodes = [nodes] unless isArrayish nodes

        for n in nodes when n?
          if n.nodeType is 1
            rendered.push n

          else if isArrayish n
            @_renderChildren n, rendered

          else if isBind n
            bind =
              nodes: undefined
              val: undefined
              func: _.bind n, @

            @_renderBindEl bind
            @_binds.push bind
            rendered.push n for n in bind.nodes

          else
            rendered.push document.createTextNode n

        rendered

      __: (viewOrHAML, optionsOrFirstChild)->
        children =
          if optionsOrFirstChild and optionsOrFirstChild.constructor is Object
            options = optionsOrFirstChild
            [].slice.call arguments, 2
          else
            [].slice.call arguments, 1

        # HAML
        if typeof viewOrHAML is 'string'
          if m = /^(\w+)?(#([\w\-]+))*(\.[\w\.\-]+)?$/.exec(viewOrHAML)
            # Tag
            parent = document.createElement m[1] or 'div'

            # id
            if m[3]
              parent.setAttribute 'id', m[3]

            # class
            if m[4]
              parent.className = m[4].slice(1).replace(/\./g, ' ')

            for k,v of options
              if isBind v
                @_binds.push bind =
                  el: parent
                  attr: k
                  func: _.bind v, @
                @_renderBindAttr bind

              else
                parent.setAttribute k, v

        # Cell
        else if viewOrHAML and viewOrHAML.prototype instanceof Backbone.View
          parent = (new viewOrHAML options).render().el

        if parent
          parent.appendChild child for child in @_renderChildren children, []
          parent

      render: ->
        @el.appendChild child for child in @_renderChildren (@renderEl @__), []
        @afterRender()
        @

      updateBinds: ->
        for i in [0...10]
          change = false
          for b in @_binds
            bindChange =
              if b.attr
                @_renderBindAttr b 
              else
                @_renderBindEl b
            change or= bindChange
          break unless change
        return

      # Removes anything that might leak memory
      remove: ->
        delete cidMap[@cid]
        @el.cellcid = undefined
        @$el.remove() if @$el
        @stopListening()
        @model = @collection = @el = @$el = @$ = undefined
        return

      _setElement: Backbone.View::setElement
      setElement: (element, delegate)->
        @_setElement element, delegate

        # Track the cell instance by cid
        cidMap[@cid] = this
        @el.setAttribute 'cell', @_cellName

        # Used jQuery.cleanData() to retrieve the cell instance
        # associated with a DOM Element
        @el.cellcid = @cid
        @

      renderEl: $.noop
      afterRender: $.noop

    pluginBuilder: 'cell-builder-plugin'

    load: (name, req, load, config)->
      # Attach te associated CSS file for cell
      unless (module._installed or= {})[name]
        module._installed[name] = true
        el = document.createElement 'link'
        el.href = req.toUrl name+".css"
        el.rel = 'stylesheet'
        el.type = 'text/css'
        document.head.appendChild el

      load (proto)->
        proto or= {}
        proto.className = proto._cellName = /(.*\/)?(.*)$/.exec(name)[2]
        module.Cell.extend proto

      return
