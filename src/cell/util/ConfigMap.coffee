define ->
   class ConfigMap
      constructor: (spec={})->
         @get = (k)->
            c = spec[k]
            if not c
               throw new Error "No Config for '#{k}'"
            c.value

         @set = (k,v)->
            c = spec[k]
            if not c
               throw new Error "No Config for '#{k}'"
            else if c.validate?(v) == false
               throw new Error "Config '#{k}' should be a #{c.api}"
            c.value = v
