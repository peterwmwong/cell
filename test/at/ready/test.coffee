define -> (done)->
  html = (sel)=> @$(sel).html()

  setTimeout(
    ->
      equal html('.App > .AsyncRender'), "Async"
      equal html('.App > .SyncRender'), "Sync"
      equal html('.App > a.one'), "one"
      equal html('.App > a.two'), "two"
      done()
    100
  )
