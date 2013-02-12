define ['util/hash'], (hash)->

  log = false

  doAfter = window.requestAnimationFrame or (f)-> setTimeout f, 0
  onChangeCalled = false
  allChanges = {}
  watches = {}

  _onChange = ->
    onChangeCalled = false
    changes = allChanges
    allChanges = {}
    for key of changes
      # f(e())
      changes[key].f changes[key].e()
    return

  onChange = ->
    allChanges[hash @] = @
    unless onChangeCalled
      onChangeCalled = true
      doAfter _onChange
    return

  addCol: ->
    log.c[hash @] = @ if log
    return
      
  addModel: (key)->
    if log
      for k, obj of {m:@, d:@collection} when obj
        unless entry = log[k][hashkey = hash obj]
          entry = log[k][hashkey] = m: obj, p: {}
        entry.p[key] = 1
    return

  unwatch: (key)->
    if w = watches[key]
      for watch in w
        for key, observed of watch.w
          observed.off undefined, undefined, watch
    return

  watch: (key, e, f)->
    unless w = watches[key]
      w = watches[key] = []
    w.push context = {e,f,w:{}}
    
    log = m:{}, c:{}, d:{}

    try value = e()

    accesslog = log
    log = false

    for _, logs of {0:accesslog.m,1:accesslog.d}
      for key, m of logs
        context.w[key] = m.m
        if (props = m.p)[undefined]
          m.m.on 'all', onChange, context
        else
          for p of props
            m.m.on "change:#{p}", onChange, context

    for key, c of accesslog.c
      context.w[key] = c
      c.on 'add', onChange, context
      c.on 'remove', onChange, context

    f value

    return