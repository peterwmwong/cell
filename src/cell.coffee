define ['cell/Cell'], (Cell)->
   modNameRegex = /(.*?)(\.[a-zA-Z0-9]+)*$/
   cellMap = {}

   load: (name, require, done)->
      names =
         template:"celltext!#{name}.html"
         style:"celltext!#{name}.less"
         controller:"#{name}.js"

      loadCtrl = (tmplLoaded)->
         require [names.controller],
            (ctrl)->
               done cellMap[name]
            (loaded,failed)->
               if tmplLoaded then done cellMap[name]
               else done undefined, new Error "Could not load cell '#{name}'"

      require [names.template,names.style],
         (tmpl,style)->
            cellMap[name] = new Cell name, tmpl, style
            loadCtrl true
         (loaded,failed)->
            cellMap[name] = new Cell name, loaded[names.template], loaded[names.style]
            loadCtrl names.template of loaded
         
         
   loadDefineDependency: (jsCellName)->
      match = modNameRegex.exec jsCellName
      return match and match[1] and cellMap[match[1]]

