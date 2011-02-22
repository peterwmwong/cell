do ->
   renderFuncNameRegex = /render( <(\w+)([ ]+.*)*>)*/
   tmpNode = document.createElement 'div'

   Cell = window.Cell = (options)->
      @cid = _.uniqueId '__cell_view__'
      @_configure(options or {})
      if options
         @_parent = options.parent
         @_onrender = options.onrender

      @_initialize = @initialize and do =>
         hasRan = false
         =>
            unless hasRan
               hasRan = true
               try @initialize()

      tmpNode.innerHTML = @__renderOuterHTML
      @el = tmpNode.children[0]

      @_renderHelpers =
         node: (node)=>
            unless node instanceof HTMLElement then throw new Error "render.node(node:HTMLElement) was expecting an HTMLElement"
            else if @_renderQ
               @_renderQ[uid = _.uniqueId '__cell_view_node__'] = node
               "<#{node.tagName} id='#{uid}'></#{node.tagName}>"

         cells: (cellOptionArrays...)=>
            if @_renderQ
               unless cellOptionArrays instanceof Array
                  throw new Error 'render.cells( (cell:Cell,options:Object)* ) expects an Array'
               cellOptionArrays.reduce ((r,co)=> r+=@__rendercell co[0], co[1]), ""
            
         cell: (CellType, options)=> if @_renderQ then @__rendercell CellType, options

         async: _.bind(@__renderInnerHTML, this)

         each: (list,func)->
            (func l for l in list).join '\n'

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
               @__renderInnerHTML innerHTML

      __init_cell: ->
         for p in Object.getOwnPropertyNames @ when match = renderFuncNameRegex.exec(p)
            if typeof (@__render=@[p]) != 'function'
               throw new Error "Cell.extend expects '#{p}' to be a function"
            @__renderTagName = match[2] or 'div'
            @__renderOuterHTML = "<#{@__renderTagName}#{match[3] or ""}></#{@__renderTagName}>"
            return
         throw new Error 'Cell.extend([constructor:Function],prototypeMembers:Object): could not find a render function in prototypeMembers'

      __renderInnerHTML: (innerHTML)->
         if @_renderQ
            @el.innerHTML = innerHTML
            for pcid,child of @_renderQ
               try
                  if pc = @el.querySelector "##{pcid}"
                     pc.parentNode.replaceChild (child instanceof HTMLElement and child) or child.el, pc
            delete @_renderQ
            @__onrender()

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

      __rendercell: (CellType, options)->
         cell = new CellType Object.create options or {}, parent: value: this
         "<#{cell.__renderTagName} id='#{cell.cid}'></#{cell.__renderTagName}>"
