define ['cell!./AsyncRender', 'cell!./SyncRender'], (Async,Sync)->
  render: (R,A)->
    s = new Sync()
    s.ready => @$el.append s.el
    s.ready => @$el.append "<a class='one'>one</a>"

    a = new Async()
    a.ready => @$el.append a.el
    a.ready => @$el.append "<a class='two'>two</a>"
    return

