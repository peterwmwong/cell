define ['cell/View'], (View)->
  dfi = window.__installedViews or {}

  pluginBuilder: 'cell/defineView-builder-plugin'
  load: (name, req, load, config)->
    # Attach te associated CSS file for cell
    unless dfi[name]
      dfi = true
      el = document.createElement 'link'
      el.href = req.toUrl name+".css"
      el.rel = 'stylesheet'
      el.type = 'text/css'
      document.head.appendChild el

    load (proto)->
      proto or= {}
      proto.className = proto._cellName = /(.*\/)?(.*)$/.exec(name)[2]
      View.extend proto
    return