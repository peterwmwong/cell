do ->
   renderFuncNameRegex = /render( <(\w+)([ ]+.*)*>)*/
   tmpNode = document.createElement 'div'
   renderEach = (list,func)-> (func l for l in list).join '\n'

   Cell = window.Cell = (options = {})->
      # Backbone.View Unique identifier for Instance
      @cid = _.uniqueId '__cell_instance_'

      # Allow Backbone.View to configure
      @_configure options

      if options
         # Parent cell
         @_parent = options.parent
         # On render/update callback function
         @_onrender = typeof options.onrender == 'function' and options.onrender

      @__attach_css()

      # run-initialize-once wrapper function
      @_initialize = @initialize and do =>
         hasRan = false
         =>
            unless hasRan
               hasRan = true
               try @initialize()

      # Create DOM node
      tmpNode.innerHTML = @__renderOuterHTML
      @el = tmpNode.children[0]

      # Hash of helper rendering functions passed to render function to make
      # the following easier:
      #  - asynchronous and synchronous rendering
      #  - rendering other cells and DOM nodes
      #  - rendering lists
      @_renderHelpers =
         node: (node)=>
            unless node instanceof HTMLElement then throw new Error "render.node(node:HTMLElement) was expecting an HTMLElement"
            else if @_renderQ
               @_renderQ[uid = _.uniqueId '__cell_render_node_'] = node
               "<#{node.tagName} id='#{uid}'></#{node.tagName}>"

         cells: (cellOptionArrays...)=>
            if @_renderQ
               unless cellOptionArrays instanceof Array
                     throw new Error 'render.cells( (cell:Cell,options:Object)* ) expects an Array'
               cellOptionArrays.reduce ((r,co)=> r+=@__rendercell_nocheck co[0], co[1]), ""

         cell: (CellType, options)=> @_renderQ and @__rendercell_nocheck CellType, options

         async: _.bind(@__renderinnerHTML, this)

         each:  renderEach

      @update()

   Cell.extend = (protoProps)->
      NewCell = Backbone.View.extend.call this, protoProps
      Cell::__init_cell.call NewCell.prototype
      NewCell

   _.extend Cell.prototype, Backbone.View.prototype,
      update: ->
         if not @_renderQ
            @_renderQ = {}
            if typeof (innerHTML = @__render @_renderHelpers) == 'string'
               @__renderinnerHTML innerHTML

      __attach_css: ->
         if not @__cssAttached and not document.querySelector "[data-cell-style=#{@__cell_id}]"
            @__cssAttached = true
            if typeof @css == 'string'
               el = document.createElement 'style'
               el.type = "text/css"
               el.innerHTML = @css
            else if typeof @css_href == 'string'
               el = document.createElement 'link'
               el.href = @css_href
               el.rel = 'stylesheet'
               el.type = 'text/css'

            if el
               el.dataset and (el.dataset.cellStyle = @__cell_id) or el.setAttribute "data-cell-style", @__cell_id
               document.head.appendChild el

      __init_cell: ->
         # Unique identifier for Cell
         @__cell_id = _.uniqueId '__cell_'

         @__cssAttached = false

         # Find render and parse function
         for p in Object.getOwnPropertyNames(this) when match = renderFuncNameRegex.exec(p)
            if typeof (@__render=@[p]) != 'function'
               throw new Error "Cell.extend expects '#{p}' to be a function"
            @__renderTagName = match[2] or 'div'
            @__renderOuterHTML = "<#{@__renderTagName}#{match[3] or ""}></#{@__renderTagName}>"
            return
         throw new Error 'Cell.extend([constructor:Function],prototypeMembers:Object): could not find a render function in prototypeMembers'
         
      __renderinnerHTML: (innerHTML)->
         if @_renderQ
            @el.innerHTML = innerHTML
            for pcid,child of @_renderQ
               try
                  if pc = @el.querySelector "##{pcid}"
                     pc.parentNode.replaceChild (child instanceof HTMLElement and child) or child.el, pc
            delete @_renderQ
            @__onrender()

      __rendercell_nocheck: (CellType,options)->
         cell = new CellType Object.create options or {}, parent: value: this
         "<#{cell.__renderTagName} id='#{cell.cid}'></#{cell.__renderTagName}>"

      __onchildrender: (cell)->
         if @_renderQ
            @_renderQ[cell.cid] = cell
         else if pc = @el.querySelector "##{cell.cid}"
            pc.parentNode.replaceChild cell.el, pc

      __onrender: ->
         @delegateEvents()
         @_initialize?()
         @_parent?.__onchildrender? this
         try @_onrender? this
