define ['cell/util/ConfigMap'], (ConfigMap)->
   isFunction = (v)-> typeof v === 'function'

   new ConfigMap
      'template.renderer':
         doc:
            desc:'Converts template/data to HTML and passing HTML to {done} callback'
            api: 'function({template:String,data:Object},done:function)'
         validate: isFunction
         value: ->
      'style.renderer':
         doc:
            desc:'Converts style to CSS and passing CSS to {done} callback'
            api: 'function(style:String,done:function)'
         validate: isFunction
         value: ->

