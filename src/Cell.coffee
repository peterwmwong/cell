define ->
   nextId = 0
   tmpNode = document.createElement 'div'

   Cell = window.Cell = (parent, options)->
      if not (parent instanceof Cell or (parent instanceof HTMLElement))
         throw new Error 'new Cell(parent:{HTMLElement or Cell}, [options:Object])'

      @__rendered = false
      @__renderQ = {}
      Object.defineProperties this,
         parent:  {value: parent }
         options: {value: options}

      pcid = "#__cell_#{nextId++}__"
      tmpNode.innerHTML = @__renderStartTag+@__renderEndTag
      @node = tmpNode.children[0]

      @html = "<#{@__renderTag} id='#{pcid.slice 1}'></#{@__renderTag}>"

      innerHTML = @__render options, (innerHTML)=>
         @__renderInnerHTML innerHTML, pcid

      if typeof innerHTML == 'string'
         @__renderInnerHTML innerHTML, pcid


   Cell.renderHTML = (parent,options)-> (new this parent, options).html
   Cell.extend = (conFunc, obj)->
      if typeof conFunc != 'function'
         obj = conFunc
         conFunc = undefined

      if typeof obj != 'object' or obj instanceof Array
         throw new Error 'Cell.extend([constructor:function],prototypeMembers:Object) expects prototypeMembers to be an Object, but was '+obj

      NewCell = not conFunc and @ or ->
         ParentCell.apply @, arguments
         conFunc and conFunc.apply @, arguments

      (obj[k] = value: v) for k,v of obj
      
      NewCell.prototype = Object.create @.prototype, obj
      Cell::__addRenderProps.call NewCell.prototype
      NewCell::constructor = NewCell
      NewCell.extend = Cell.extend
      NewCell.renderHTML = Cell.renderHTML
      NewCell

   Cell.prototype =
      constructor: Cell

      __addRenderProps: do->
         renderFuncNameRegex = /render( <(\w+)([ ]+.*)*>)*/
         ->
            for p in Object.getOwnPropertyNames @ when match = renderFuncNameRegex.exec(p)
               throw new Error "Cell.extend expects '#{p}' to be a function" if typeof (func=@[p]) != 'function'

               @__render = @[p]
               @__renderTag = match[2] or 'div'
               @__renderStartTag = "<#{@__renderTag}#{match[3] or ""}>"
               @__renderEndTag   = "</#{@__renderTag}>"
               return
            return

      __renderTheQ: ->
         for pcid,child of @__renderQ
            if pc = @node.querySelector pcid
               pc.parentNode.replaceChild child.node
         delete @__renderQ
      
      __renderInnerHTML: (innerHTML, pcid)->
         if not @__rendered
            @__rendered = true
            @node.innerHTML = innerHTML

            placeholder = (@parent.node or @parent).querySelector(pcid)
            if placeholder
               placeholder.parentNode.replaceChild @node, placeholder
            else if @parent instanceof Cell
               @parent.__renderQ[pcid] = this
            else if @parent instanceof HTMLElement
               @parent.appendChild @node

            @__renderTheQ()
      
