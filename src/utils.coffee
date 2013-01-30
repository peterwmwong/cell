define

  isS: (o)-> typeof o is 'string'
  isF: (o)-> typeof o is 'function'

  evrm: (events, fn, whichOrCtx)->
    i=-1
    isWhich = typeof whichOrCtx is 'number'
    while ev = events[++i] when (if isWhich then ev[whichOrCtx] is fn else (ev[0] is fn) and (ev[1] is whichOrCtx))
      events.splice i--, 1
    return

  bind: (f,o)-> -> f.apply o, arguments
  extend: (proto)->
    Parent = @

    Child = (options)->
      return new Child(options) unless @ instanceof Child
      Parent.call @, options
      proto.constructor.call @, options if proto and proto.constructor
      return
    Child.extend = Parent.extend

    Surrogate = ->
    Surrogate:: = Parent::
    Child:: = new Surrogate()
    if proto
      Child::[k] = proto[k] for k of proto
    Child