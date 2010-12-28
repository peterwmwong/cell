define ['require','cell/Eventful','cell/Config','cell/CellRendering','cell/util/attachCSS'],
   (require,Eventful,Config,CellRendering,attachCSS)->
      isNonEmptyString = (s)-> typeof s == 'string' and s.trim()
      getInstanceId = (->
         cellIdMap = {}
         (cellName)->
            cellIdMap[cellName] = (cellIdMap[cellName] or -1)+1
      )()
      cssClassRegex = /([^\/]*$)/

      class Cell extends Eventful
         constructor: (name,tmpl,style)->
            super()
            unless isNonEmptyString name
               throw new Error "Cell's name must be a non-empty string, instead was '#{name}'"

            # Define read-only properties name, template, style
            for k,v of {name: name, template: tmpl, style: style}
               Object.defineProperty this, k, {value: v, enumerable: true}
         
         renderStyle: (->
            # Render style ONCE
            rendered = false
            return ->
               if not rendered and isNonEmptyString @name
                  @request 'render.style',
                     @style
                     (css)=>
                        if isNonEmptyString css
                           attachCSS @name, css, (styleTagNode)->
                              
                     Config.get 'renderer.style'
               rendered = true
            )()
         
         __createDOMNode: (html)->
            node = document.createElement 'div'
            node.id = @name + '_' + getInstanceId @name
            node.classList.add cssClassRegex.exec(@name)[0]
            node.innerHTML = html
            node

         render: ({data,to},done)->
            if isNonEmptyString @template

               unless to
                  throw new Error "No 'to' DOM node was specified for Cell '#{@name}' to be rendered to"

               @request 'render.template',
                  # Data
                  {template: @template, data:data}

                  # Callback
                  ({html,nestedRequests})=>
                     unless isNonEmptyString html
                        done undefined, new Error("No HTML was rendered from template:\n#{@template}")
                     else
                        attachedNode = @__createDOMNode(html)
                        to.parentNode.replaceChild attachedNode, to
                        done new CellRendering(this,data,attachedNode)

                        if nestedRequests instanceof Array
                           for {cell,data,to} in nestedRequests
                              do (cell,data,to)->
                                 # TODO coffeescript 1.0.0 should have fixed this with "do" keyword
                                 require ['cell!'+cell], (cell)->
                                    cell.render {data:data, to:attachedNode.querySelector(to)}


                  # Default Handler
                  Config.get 'renderer.template'
       
