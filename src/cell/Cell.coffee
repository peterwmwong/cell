define ['require','cell/Eventful','cell/Config','cell/CellRendering','cell/util/attachCSS','cell/util/DOMHelper'],
   (require,Eventful,Config,CellRendering,attachCSS,DOMHelper)->
      isNonEmptyString = (s)-> typeof s == 'string' and s.trim()
      cssClassRegex = /([^\/]*$)/
      pathRegex = /(.*?)[^\/]*$/

      class Cell extends Eventful
         constructor: (name,tmpl,style)->
            super()
            unless isNonEmptyString name
               throw new Error "Cell's name must be a non-empty string, instead was '#{name}'"

            # Define read-only properties name, template, style
            for k,v of {name:name, template:tmpl, style:style, path:pathRegex.exec(name)[1], hasTemplate:!!isNonEmptyString(tmpl), cssClassName:cssClassRegex.exec(name)[0]}
               Object.defineProperty this, k, {value: v, enumerable: true}
         
         renderStyle: ->
            if not @__rendered and isNonEmptyString @style
               @__rendered = true
               @request 'render.style',
                  @style
                  (css)=>
                     if css = isNonEmptyString css
                        attachCSS @name, css, (styleTagNode)->
                           
                  Config.get 'style.renderer'

         render: (opts,done)->
            if @hasTemplate and opts?
               data = opts.data
               attach = opts.attach or DOMHelper.getAttachMethodTarget opts

               unless attach.target?
                  throw new Error "One attach method (#{attachMethods.join ','}) needs to be specified to determine how Cell '#{@name}' will be attached to the DOM."

               @request 'render.template', template:@template, data:data,
                  ({html,nestedRequests})=>
                     unless (html = isNonEmptyString html)
                        try done? undefined, new Error("No HTML was rendered from template:\n#{@template}")
                     else
                        attachedNodes = DOMHelper[attach.method] attach.target, html
                        
                        if attachedNodes.length > 0
                           for n in attachedNodes
                              n.classList.add @cssClassName

                           rendering = new CellRendering(this,data,attachedNodes)
                           try done? rendering
                           @fire 'render', rendering

                           if nestedRequests instanceof Array
                              path = @path
                              for req in nestedRequests
                                 {method,target} = DOMHelper.getAttachMethodTarget req
                                 req.attach = {method:method, target:DOMHelper.getElementFromNodes(target, attachedNodes)}
                                 delete req[method]
                                 cell = req.cell
                                 delete req.cell
                                 require ["cell!#{path}#{cell}"], do(req)->
                                    (cell)-> cell.render(req)
                              return # Prevent coffee-script from creating a result array

                  # Default Handler
                  Config.get 'template.renderer'
