define [
  'util/hash'
  'util/fn'
  'util/type'
  'util/defer'
], (hash,fn,type,defer)->

  logStack = []
  onChangeCalled = log = false

  addLog = (obj, event)->
    unless log.l[key = event + (obj.$$hashkey or hash obj)]
      log.s += key
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

  _eam: evaluateAndMonitor = (context)->
    logStack.push log
    log =
      s: ''
      l: curLog = {}
      c: {}

    value = context.e()

    if log.s isnt context.s
      if prevLog = context.l
        for eventKey of prevLog
          if curLog[eventKey]
            delete curLog[eventKey]
          else
            prevLog[eventKey].o.off prevLog[eventKey].e, undefined, context

      for eventKey of curLog
        curLog[eventKey].o.on curLog[eventKey].e, onChange, context
      context.s = log.s
      context.l = curLog

    log = logStack.pop()
    context.f value
    return

  addCol: ->
    if log
      log.c[@$$hashkey or hash @] = true
      addLog @, 'add'
      addLog @, 'remove'
    return
      
  addModel: (key)->
    if log
      addLog (
        if ((obj = @collection) and log.c[obj.$$hashkey or hash obj]) then obj
        else @
      ), (if key then "change:#{key}" else 'all')
    return

  suspendWatch: (f)->
    suspendedLog = log
    log = false
    try f()
    log = suspendedLog
    return

  unwatch: (key)->
    if w = watches[key = hash key]
      delete watches[key]
      i=0
      while (context = w[i++])
        for key of context.l
          context.l[key].o.off undefined, undefined, context
    return

  watch: (keyObj, e, f, callContext)->
    callContext or= keyObj

    unless type.isF e
      f.call callContext, e
      return

    else
      (watches[key = hash keyObj] or (watches[key] = [])).push context =
        e: fn.b0 e, keyObj
        f: fn.b1 f, callContext

      evaluateAndMonitor context
      context
