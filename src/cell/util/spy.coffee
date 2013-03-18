define [
  'util/hash'
  'util/fn'
  'util/type'
  'util/defer'
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
      for eventKey of prevScope.log
        if scope.log[eventKey]
          delete scope.log[eventKey]
        else
          prevScope.log[eventKey].o.off prevScope.log[eventKey].e, undefined, context

      for eventKey of scope.log
        scope.log[eventKey].o.on scope.log[eventKey].e, onChange, context

      context.scope = scope

    scope = suspendedScope
    context.f value
    return

  addCol: ->
    if scope and not scope.col[key = @$$hashkey]
      scope.sig += key
      scope.col[key] = true
      unless prevScope.col[key]
        scope.log['add'+key] = o: @, e: 'add'
        scope.log['remove'+key] = o: @, e: 'remove'
    return
      
  addModel: (event)->
    if scope
      eventKey = event +
        if ((obj = @collection) and scope.col[key = obj.$$hashkey]) then key
        else
          obj = @
          @$$hashkey

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
