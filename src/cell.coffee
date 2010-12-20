define [], ->
   modNameRegex = /(.*?)(\.[a-zA-Z0-9]+)*$/
   cellMap = {}

   load: (name, require, done)->
      loaded = {}
      cell = cellMap[name] = {}

      names =
         template:"celltext!#{name}.html"
         style:"celltext!#{name}.less"
         controller:"#{name}.js"

      onLoad = (tmpl,style,ctrl)->
         cell.template = tmpl
         cell.style = style
         done cell

      onError = (found,errored)->
         if names.template of found or names.controller of found
            onLoad(found[names.template], found[names.style])
         else
            done undefined, new Error("Could not load cell '#{name}'")

      require [names.template,names.style,names.controller], onLoad, onError
         
         
   loadDefineDependency: (jsCellName)->
      match = modNameRegex.exec jsCellName
      return match and match[1] and cellMap[match[1]]

