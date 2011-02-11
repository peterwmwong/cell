define ->
   renderFuncNameRegex = /render( <(\w*)>)*/
   renderingQ = {}
   renderedQ = []

   Cell = window.Cell = (cell)->
      Object.defineProperty this, '__cell', value: cell
      return this

   Cell::render = (options)->
      {id,__cell_render,__cell_renderTag} = @__cell

      domid = "__cell_#{id}__"
      renderTo = renderingQ[domid] = {}
      __cell_render options, (innerHTML)->
         if renderTo.ancestor
            renderTo.ancestor.querySelector("#"+domid).innerHTML = innerHTML
         else if renderingQ[domid]
            delete renderingQ[domid]
            renderedQ.push domid:domid, innerHTML:innerHTML

      "<#{__cell_renderTag} id='#{domid}'></#{__cell_renderTag}>"


   Cell::renderElement = (options)->
      (tmpNode = document.createElement 'div').innerHTML = @render options
      di = node = undefined
      `for(var i=renderedQ.length-1; i>=0; i--){
         if(di = renderedQ[i], node = tmpNode.querySelector("#"+di.domid)){
            node.innerHTML = di.innerHTML;
         }
      }`
      renderedQ = []
      node = tmpNode.children[0]
      for k of renderingQ
         renderingQ[k].ancestor = node
      renderingQ = {}
      node
      

   CellPrivate = do->
      nextid = 0
      ->
         Object.defineProperties this, id: value: nextid++
         return this

   CellPrivate::init = (options)->
      # Find Render Function and Tag
      {func,tag} = do=>
         for key in Object.getOwnPropertyNames this when matches = renderFuncNameRegex.exec key
            return func:this[key], tag:matches[3]

      Object.defineProperties this,
         exports:
            value: new Cell(this)
         __cell_renderTag:
            value: tag or 'div'
         __cell_render:
            value: func


   createInitCell = (spec,options)->
      for k,v of spec
         spec[k] = value: spec[k]
      cell = Object.create new CellPrivate(), spec
      CellPrivate::init.call cell, options
      spec.init?.call cell, options
      cell


   Renderer = (spec)->
      @spec = spec
      this

   Renderer::render = (options)->
      createInitCell(@spec, options).exports.render options

   Renderer::renderElement = (options)->
      createInitCell(@spec, options).exports.renderElement options


   Cell.extend = (spec)-> new Renderer spec
