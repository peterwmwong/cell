define [
  'util/hash'
  'util/fn'
  'util/type'
  'util/defer'
], (hash,fn,type,defer)->

  logStack = []
  onChangeCalled = log = false

  addLog = (obj, event, key)->
    unless log.l[key = event + (key or hash obj)]
      log.l[key] =
        o:obj
        e:event
    return

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
      defer _onChange
    return

  evaluateAndMonitor = (context)->
    logStack.push log
    log =
      l: curLog = {}
      c: {}

    value = context.e()

    if prevLog = context.l
      for eventKey of prevLog
        if curLog[eventKey]
          delete curLog[eventKey]
        else
          prevLog[eventKey].o.off prevLog[eventKey].e, undefined, context

    for eventKey of curLog
      curLog[eventKey].o.on curLog[eventKey].e, onChange, context

    context.l = curLog
    log = logStack.pop()

    context.f value
    return

  addCol: ->
    if log
      log.c[colKey = hash @] = true
      addLog @, 'add', colKey
      addLog @, 'remove', colKey
    return
      
  addModel: (key)->
    if log
      addLog (
        if ((c = @collection) and log.c[hash c]) then c
        else @
      ), (key and "change:#{key}" or 'all')

    return

  unwatch: (key)->
    if w = watches[hash key]
      i=0
      while (context = w[i++])
        for key of context.l
          context.l[key].o.off undefined, undefined, context
      delete watches[hash key]
    return

  watch: (keyObj, e, f, callContext)->
    callContext or= keyObj

    unless type.isF e
      f.call callContext, e

    else
      (watches[key = hash keyObj] or (watches[key] = [])).push context =
        e: fn.b0 e, keyObj
        f: fn.b1 f, callContext

      evaluateAndMonitor context

    return