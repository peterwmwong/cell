define ['cell/Cell'], (Cell)->
   window.cell ?= Object.create {},
      define:
         value: ->
            found = i = def = type = 0
            `for(;i<arguments.length;++i){
               if(!((def=arguments[i]) instanceof Array) && ((type = typeof def) == 'object' || type == 'function'))
                  found = true;
                  break;
            }`
            if not found then throw new Error 'No cell definition'

            arguments[i] =
               # Define by object
               if type == 'object'
                  new Cell def
               # Wrap defining function, define by returned object
               else
                  -> new Cell def arguments...
                  
            define arguments...
