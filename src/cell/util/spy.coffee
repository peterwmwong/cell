define [
  'util/hash'
  'util/fn'
  'util/type'
  'util/defer'
], (hash,fn,type,defer)->

  logStack = []
  onChangeCalled = logl = logs = logc = false
  allChanges = {}
  watches = {}

  _onChange = ->
    onChangeCalled = false
    changes = allChanges
    allChanges = {}
    evaluateAndMonitor changes[key] for key of changes
    return

  onChange = ->
    allChanges[@$$hashkey or hash @] = @
    unless onChangeCalled
      onChangeCalled = true
      defer _onChange
    return

  _eam: evaluateAndMonitor = (context)->
    logStack.push [logs, logc, logl]
    logs = ''
    logl = {}
    logc = {}

    value = context.e()

    if logs isnt context.s
      if prevLog = context.l
        for eventKey of prevLog
          if logl[eventKey]
            delete logl[eventKey]
          else
            prevLog[eventKey].o.off prevLog[eventKey].e, undefined, context

      for eventKey of logl
        logl[eventKey].o.on logl[eventKey].e, onChange, context
      context.s = logs
      context.l = logl

    [logs, logc, logl] = logStack.pop()
    context.f value
    return

  addCol: ->
    if logl and not logc[key = @$$hashkey]
      logs += key
      logc[key] = true
      logl['add'+key] = o: @, e: 'add'
      logl['remove'+key] = o: @, e: 'remove'
    return
      
  addModel: (event)->
    if logl
      eventKey = event +
        if ((obj = @collection) and logc[key = obj.$$hashkey]) then key
        else
          obj = @
          @$$hashkey

      unless logl[eventKey]
        logs += eventKey
        logl[eventKey] = {o:obj, e:event}

    return

  suspendWatch: (f)->
    suspendedLogl = logl
    suspendedLogs = logs
    suspendedLogc = logs
    logl = logs = logc = undefined
    try f()
    logl = suspendedLogl
    logs = suspendedLogs
    logc = suspendedLogc
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
