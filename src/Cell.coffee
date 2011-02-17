do ->
   nextUID= 0
   tmpNode = document.createElement 'div'
   getDOMID = (uid)-> "__cell_#{uid}__"

   Cell = window.Cell = (@options)->
      @cid = _.uniqueId('view')
      @_configure(options || {})

      @_renderQ = {}
      @_onrender = options and options.onrender

      tmpNode.innerHTML = @__renderOuterHTML
      @el = tmpNode.children[0]
      renderInnerHTML = @__renderInnerHTML.bind this
      renderHelpers =
         node: (node)=>
            unless node instanceof HTMLElement then throw new Error "render.node(node:HTMLElement) was expecting an HTMLElement"
            else if @_renderQ
               @_renderQ[uid = nextUID++] = node
               "<#{node.tagName} id='#{getDOMID(uid)}'></#{node.tagName}>"

         cells: (cellOptionArrays...)=>
            if @_renderQ
               unless cellOptionArrays instanceof Array or cellOptionArrays == undefined
                  throw new Error 'render.cells( (cell:Cell,options:Object)* ) expects an Array'
               result = ""
               for [CellType, option] in cellOptionArrays
                  result += _rcell CellType, option
               result
            
         cell: _rcell = (CellType, options)=>
            if @_renderQ
               cell = new CellType Object.create options or {}, onrender: value: (cell)=>
                  if @_renderQ
                     @_renderQ[cell.cid] = cell
                  else if pc = @el.querySelector "##{getDOMID(cell.cid)}"
                     pc.parentNode.replaceChild cell.el, pc

                  try options.onrender and options.onrender(cell)
               "<#{cell.__renderTagName} id='#{getDOMID(cell.cid)}'></#{cell.__renderTagName}>"

         async: renderInnerHTML

         each: (list,func)->
            (func l for l in list).join '\n'

      innerHTML = @__render options, renderHelpers
      if typeof innerHTML == 'string'
         renderInnerHTML innerHTML

   Cell.extend = (protoProps)->
      NewCell = Backbone.View.extend.call this, protoProps
      Cell::__addRenderProps.call NewCell.prototype
      NewCell


   _.extend Cell.prototype, Backbone.View.prototype,
      __onrender: ->
         @delegateEvents()
         @initialize @options
         try @_onrender and @_onrender this

      __addRenderProps: do->
         renderFuncNameRegex = /render( <(\w+)([ ]+.*)*>)*/
         ->
            for p in Object.getOwnPropertyNames @ when match = renderFuncNameRegex.exec(p)
               throw new Error "Cell.extend expects '#{p}' to be a function" if typeof (func=@[p]) != 'function'
               @__render = @[p]
               @__renderTagName = match[2] or 'div'
               @__renderOuterHTML = "<#{@__renderTagName}#{match[3] or ""}></#{@__renderTagName}>"
               return
            throw new Error 'Cell.extend([constructor:Function],prototypeMembers:Object): could not find a render function in prototypeMembers'

      __renderInnerHTML: (innerHTML)->
         if @_renderQ
            @el.innerHTML = innerHTML
            for pcid,child of @_renderQ
               try
                  if pc = @el.querySelector "##{getDOMID(pcid)}"
                     pc.parentNode.replaceChild (child instanceof HTMLElement and child) or child.el, pc
            delete @_renderQ
            @__onrender()
      
