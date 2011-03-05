do ->
   err = (msg)-> console?.error? msg
   bind = Function.prototype.bind and ((func,obj)->func.bind obj) or (_ and _.bind)
   uniqueId = (_ and _.uniqueId) or do->
      postfix = 0
      (prefix)->prefix+postfix

   Cell = window.Cell = do->
      tmpNode = document.createElement 'div'
      renderEach = (list,func)-> (func l for l in list).join '\n'
      renderCell_nocheck = (self,CellType,options)->
         cell = new CellType Object.create(options or {}, parent: value: self)
         "<#{cell.__renderTagName} id='#{cell.cid}'></#{cell.__renderTagName}>"

      (options = {})->
         # Backbone.View Unique identifier for Instance
         @cid = uniqueId '__cell_instance_'

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
               if @_renderQ
                  unless node instanceof HTMLElement
                     err "render.node(node:HTMLElement) was expecting an HTMLElement"
                     ""
                  else
                     @_renderQ[uid = uniqueId '__cell_render_node_'] = node
                     "<#{node.tagName} id='#{uid}'></#{node.tagName}>"

            cells: (cellOptionArrays...)=>
               if @_renderQ
                  unless cellOptionArrays instanceof Array
                     err 'render.cells( (cell:Cell,options:Object)* ) expects an Array'
                     ""
                  else
                     cellOptionArrays.reduce ((r,co)=> r+=renderCell_nocheck this, co[0], co[1]), ""

            cell: (CellType, options)=> @_renderQ and renderCell_nocheck this, CellType, options

            async: bind(@__renderinnerHTML, this)

            each: renderEach

         @update()


   Cell.extend = do->
      renderFuncNameRegex = /render( <(\w+)([ ]+.*)*>)*/
      eventsNameRegex = /events (.+)/
      setupCellProto = (NewCell)->
         p = NewCell.prototype
         # Unique identifier for Cell
         p.__cell_id = uniqueId '__cell_'
         p.__cssAttached = false
         ebinds = p.__eventBindings = []

         for prop in Object.getOwnPropertyNames p
            # Find and add event binding
            if match = eventsNameRegex.exec prop
               if typeof (binddesc = p[prop]) == 'object'
                  ebinds.push prop: match[1], desc: binddesc
            
            # Find and add render function (if not already found)
            else if not p.renderTagName and match = renderFuncNameRegex.exec prop
               if typeof (p.__render=p[prop]) != 'function'
                  err "Cell.extend expects '#{prop}' to be a function"
                  return
               p.__renderTagName = match[2] or 'div'
               p.__renderOuterHTML = "<#{p.__renderTagName}#{match[3] or ""}></#{p.__renderTagName}>"

         # Must have found a render function 
         if p.__renderTagName then NewCell
         else err 'Cell.extend([constructor:Function],prototypeMembers:Object): could not find a render function in prototypeMembers'

      (protoProps)-> setupCellProto Backbone.View.extend.call(this, protoProps)


   _.extend Cell.prototype, Backbone.View.prototype,
      update: ->
         if not @_renderQ
            @_renderQ = {}
            if typeof (innerHTML = @__render @_renderHelpers) == 'string'
               @__renderinnerHTML innerHTML

      bind: do->
         elEventRegex = /^(\w+)\s*(.*)$/

         (observed, bindDesc)->
            if observed
               binder =
                  if observed instanceof HTMLElement then (desc,handler)=>
                     [_,eventName,selector] = elEventRegex.exec(desc) or []
                     eventName = "#{eventName}.#{@cid}"
                     target = $(observed)
                     if selector
                        target.delegate selector, eventName, handler
                        -> target.undelegate selector, eventName, handler
                     else
                        target.bind eventName, handler
                        -> target.unbind eventName, handler
                  else if typeof observed.bind == 'function' then (desc,handler)=>
                     observed.bind desc, handler
                     -> observed.unbind desc, handler

               if binder
                  for desc,handler of bindDesc when typeof desc == 'string'
                     binder desc, @__getHandler(handler)

      __getHandler: (handler)->
         handler =
            if typeof handler == 'string' then @[handler]
            else if typeof handler == 'function' then handler
         handler and bind handler,this

      __delegateEvents: ->
         if @__unbinds
            for ubs in @__unbinds when ubs
               for ub in ubs when ub
                  try ub()
         @__unbinds = (@bind @[prop],desc for {prop,desc} in @__eventBindings)
         return

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
         
      __renderinnerHTML: (innerHTML)->
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
         @__delegateEvents()
         @_initialize?()
         @_parent?.__onchildrender? this
         try @_onrender? this
