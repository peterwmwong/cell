define [
  'util/hash'
  'util/fn'
  'util/type'
], (hash,fn,type)->

  onChangeCalled = logObjMap = log = false

  addLog = (obj, event)->
    (log[key = hash obj] or (log[key] = {}))[event] = true
    logObjMap[key] = obj
    return

  doAfter = window.requestAnimationFrame or setTimeout
  allChanges = {}
  watches = {}

  _onChange = ->
    onChangeCalled = false
    changes = allChanges
    allChanges = {}
    evaluateAndMonitor changes[key] for key of changes
    return

  onChange = ->
    allChanges[hash @] = @
    unless onChangeCalled
      onChangeCalled = true
      doAfter _onChange
    return

  evaluateAndMonitor = (context)->
    log = {}
    logObjMap = {}

    value = context.e()

    accesslog = log
    accesslogObjMap = logObjMap
    logObjMap = log = false

    if prevlog = context.l
      prevObjMap = context.w
      removes = []
      for key, events of prevlog
        for event of events
          if accesslog[key][event]
            delete accesslog[key][event]
          else
            removes.push [key, event]

      i=0
      while keyEvent = removes[i++]
        prevObjMap[keyEvent[0]].off keyEvent[1], undefined, context

    context.l = accesslog
    context.w = accesslogObjMap
    for key of accesslog
      obj = accesslogObjMap[key]
      for event of accesslog[key]
        obj.on event, onChange, context

    context.f value
    return

  addCol: ->
    if log
      addLog @, 'add'
      addLog @, 'remove'
    return
      
  addModel: (key)->
    if log
      addLog (
        if (c = @collection) and logObjMap[hash c] then c
        else @
      ), (key and "change:#{key}" or 'all')

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
      obj = key
      (
        if (w = watches[key = hash key]) then w
        else (watches[key] = [])
      ).push context =
        e: fn.b0 e, obj
        f: fn.b1 f, callContext
        w:{}

      evaluateAndMonitor context

    return