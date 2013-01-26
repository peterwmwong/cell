define
  bind: (f,o)-> -> f.apply o, arguments
  extend: (proto)->
    Parent = @

    Child = (options)->
      return new Child(options) unless @ instanceof Child
      Parent.call @, options
      return
    Child.extend = Parent.extend

    Surrogate = ->
    Surrogate:: = Parent::
    Child:: = new Surrogate()
    if proto
      Child::[k] = v for k,v of proto
    Child