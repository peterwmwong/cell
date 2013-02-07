define ['util/hash'], (hash)->

  log = false

  addCol: ->
    log.c[hash @] = @ if log
    return
      
  addModel: (key)->
    if log
      for k, obj of {m: @, d: @collection} when obj
        unless entry = log[k][hashkey = hash obj]
          entry = log[k][hashkey] = m: obj, p: {}
        entry.p[key] = 1
    return

  watch: (expr, cb)->
    log = m:{}, c:{}, d:{}

    try value = expr()

    accesslog = log
    log = false

    called = false
    onChange = ->
      unless called
        called = true
        setTimeout (->
          called = false
          try cb expr()
          return
        ), 0
      return

    for _, logs of {0:accesslog.m,1:accesslog.d}
      for _, m of logs
        if (props = m.p)[undefined]
          m.m.on 'all', onChange
        else
          for p of props
            m.m.on "change:#{p}", onChange

    for _, c of accesslog.c
      c.on 'add', onChange
      c.on 'remove', onChange

    cb value

    return