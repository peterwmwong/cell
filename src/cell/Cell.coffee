define ['Eventful','cell/Config','cell/CellInstance','cell/util/attachStyle'], (Eventful,Config,CellInstance,attachStyle)->
   class Cell extends Eventful
      constructor: (name,tmpl,style)->
         Object.defineProperty this, 'name',
            value: name
            enumerable: true

         Object.defineProperty this, 'template',
            value: tmpl
            enumerable: true

         Object.defineProperty this, 'style',
            value: style
            enumerable: true
         
         if style
            @request 'renderCSS',
               (css)-> attachStyle name, css if css
               Config.get('style.renderer')
         
      render: ({data,to})->

