define ->
  (proto)->
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