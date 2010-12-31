define ['cell/Config'], (Config)->
   # Set less as style.renderer
   Config.set 'style.renderer', (less,done)->
      window.less.Parser({'paths':''}).parse less, (err,root)->
         done root.toCSS(), err
