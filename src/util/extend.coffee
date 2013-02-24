define ->
  constructorProp = 'constructor'

  (proto)->
    Parent = @

    Child = (options)->
      return new Child(options) unless @ instanceof Child
      Parent.call @, options
      proto[constructorProp].call @, options if proto and proto[constructorProp]
      return
    Child.extend = Parent.extend

    Surrogate = ->
    Surrogate:: = Parent::
    Child:: = new Surrogate()
    if proto
      Child::[k] = proto[k] for k of proto
      # Just for you IE8
      if proto[constructorProp]
        Child::[constructorProp] = proto[constructorProp]
    Child