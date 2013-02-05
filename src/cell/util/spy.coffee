define ['util/hash'], (hash)->

  onChange = ->
    try @cb @expr()
    return

  log = false

  addCol: ->
    log.c[hash @] = @ if log
    return
      
  addModel: (key)->
    if log
      unless entry = log.m[hashkey =  hash @]
        entry = log.m[hashkey] = m: @, props: {}
      entry.props[key] = 1
    return

  watch: (expr, cb)->
    context = {expr,cb}

    log = m:{}, c:{}

    try value = expr()

    accesslog = log
    log = false

    for modelHashKey, m of accesslog.m
      if (props = m.props)[undefined]
        m.m.on 'all', onChange, context
      else
        for p of props
          m.m.on "change:#{p}", onChange, context

    for collectionHashKey, c of accesslog.c
      c.on "all", onChange, context

    cb value

    return