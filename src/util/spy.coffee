define [
  'cell/util/hash'
  'cell/util/fn'
  'cell/util/type'
  'cell/util/defer'
], (hash,fn,type,defer)->

  logStack = []
  onChangeCalled = false
  prevScope = scope = undefined
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

  Scope = ->
    @sig = ''
    @log = {}
    @col = {}
    return

  _eam: evaluateAndMonitor = (context)->
    suspendedScope = scope
    prevScope = context.scope
    scope = new Scope()

    value = context.e()

    if scope.sig isnt prevScope.sig
      plog = prevScope.log
      log = scope.log

      for eventKey of scope.col
        log["add#{eventKey}"] = o:scope.col[eventKey], e:'add'
        log["remove#{eventKey}"] = o:scope.col[eventKey], e:'remove'

      for eventKey of log
        if plog[eventKey]
          delete plog[eventKey]
        else
          log[eventKey].o.on log[eventKey].e, onChange, context

      for eventKey of plog
        plog[eventKey].o.off plog[eventKey].e, undefined, context

      context.scope = scope

    scope = suspendedScope
    context.f value
    return

  addResStatus: ->
    if scope and not scope.log[eventKey = "status#{@$$hashkey}"]
      scope.sig += eventKey
      scope.log[eventKey] = o:@, e:'status'
    return

  addCol: ->
    if scope and not scope.col[key = @$$hashkey]
      scope.sig += key
      scope.col[key] = @
    return
      
  addModel: (event)->
    if scope
      eventKey = event +
        if (obj = @parent) and scope.col[key = obj.$$hashkey] then key
        else (obj = @).$$hashkey

      unless scope.log[eventKey]
        scope.sig += eventKey
        scope.log[eventKey] = o:obj, e:event

    return

  suspendWatch: (f)->
    suspendedScope = scope
    scope = undefined
    try f()
    scope = suspendedScope
    return

  unwatch: (key)->
    if w = watches[key = hash key]
      delete watches[key]
      i=0
      while (context = w[i++])
        for key of context.scope.log
          context.scope.log[key].o.off undefined, undefined, context
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
        scope: new Scope()

      evaluateAndMonitor context
      context
