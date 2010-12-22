define ['cell/Eventful','cell/Config','cell/util/attachCSS','cell/util/attachHTML'],
   (Eventful,Config,attachCSS,attachHTML)->
      isNonEmptyString = (s)-> typeof s == 'string' and s.trim()

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
                           attachCSS @name, css
                     Config.get('renderer.style')
               rendered = true
            )()
            
         render: ({data,to})->
            if isNonEmptyString @template
               @request 'render.template',
                  {template: @template, data:data}
                  (html)=>
                     if isNonEmptyString html
                        attachHTML @name, html, to
                  Config.get('renderer.template')
