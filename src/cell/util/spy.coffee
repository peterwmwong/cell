define [
  'util/hash'
  'util/fn'
  'util/type'
], (hash,fn,type)->

  onChangeCalled = logObjMap = log = false

  addLog = (obj, event)->
    (log[key = hash obj] or (log[key] = {}))[event] = 1
    logObjMap[key] = obj
    return

  doAfter = window.requestAnimationFrame or setTimeout
  allChanges = {}
  watches = {}

  _onChange = ->
    onChangeCalled = false
    changes = allChanges
    allChanges = {}
    for key, context of changes
      # f(e())
      context.f context.e()
    return

  onChange = ->
    allChanges[hash @] = @
    unless onChangeCalled
      onChangeCalled = true
      doAfter _onChange
    return

  addCol: ->
    if log
      addLog @, 'add'
      addLog @, 'remove'
    return
      
  addModel: (key)->
    if log
      addLog @, (event = if key then "change:#{key}" else 'all')
      addLog @collection, event if @collection
    return

  unwatch: (key)->
    if w = watches[key = hash key]
      for watch in w
        for key, observed of watch.w
          observed.off undefined, undefined, watch
    return

  watch: (key, e, f, callContext)->
    callContext or= key

    unless type.isF e
      f.call callContext, e

    else
      key = hash key
      e = fn.b0 e, callContext
      f = fn.b1 f, callContext

      (
        if (w = watches[key]) then w
        else (watches[key] = [])
      ).push context = {e,f,w:{}}
      
      log = {}
      logObjMap = {}

      try value = e()

      accesslog = log
      accesslogObjMap = logObjMap
      logObjMap = log = false

      context.w = accesslogObjMap
      for key of accesslog
        obj = accesslogObjMap[key]
        for event of accesslog[key]
          obj.on event, onChange, context

      f value

    return