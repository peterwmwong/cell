define ->
  constrProp = 'constructor'
  protoProp = 'prototype'

  (proto)->
    Parent = @

    Child = (options...)->
      return new Child(options...) unless @ instanceof Child
      Parent.apply @, options
      proto[constrProp].apply @, options if proto and proto[constrProp]
      return
    Child.extend = Parent.extend

    Surrogate = ->
    Surrogate[protoProp] = Parent[protoProp]
    Child[protoProp] = new Surrogate()
    if proto
      Child[protoProp][k] = proto[k] for k of proto
      # Just for you IE8
      if proto[constrProp]
        Child[protoProp][constrProp] = proto[constrProp]
    Child