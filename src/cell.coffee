define ['cell/Cell','celltext'], (Cell)->
   modNameRegex = /(.*?)(\.[a-zA-Z0-9]+)*$/
   baseUrlRegex = /(.*\/)?([a-zA-Z0-9]+)(\.[\w]+)?$/
   cellMap = {}

   # RequireJS Plugin load API
   load: (name, require, done)->
      names =
         template:"celltext!#{name}.html"
         style:"celltext!#{name}.less"
         controller:"#{name}.js"

      loadCtrl = (tmplLoaded,cell)->
         require [names.controller],
            (ctrl)->
               cell.renderStyle()
               done cell
            (loaded,failed)->
               cell.renderStyle()
               if tmplLoaded then done cellMap[name]
               else done undefined, new Error "Could not load cell '#{name}'"

      require [names.template,names.style],
         (tmpl,style)->
            loadCtrl true, (cellMap[name] = new Cell name, tmpl, style)
         (loaded,failed)->
            loadCtrl names.template of loaded, (cellMap[name] = new Cell name, loaded[names.template], loaded[names.style])
         
   # RequireJS Cell Extension Plugin loadDefineDependency API
   loadDefineDependency: (jsCellName)->
      [match,absName] = modNameRegex.exec jsCellName
      return absName and cellMap[absName]

