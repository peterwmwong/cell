define ->
  constrProp = 'constructor'
  protoProp = 'prototype'

  (proto)->
    Parent = @

    Child = ->
      unless @ instanceof Child
        return Child.apply (new ChildSurrogate()), arguments
      (childConstructor or Parent).apply @, arguments
      return @

    Child.extend = Parent.extend

    Surrogate = ->
    Surrogate[protoProp] = Parent[protoProp]

    ChildSurrogate = ->
    childProto = ChildSurrogate[protoProp] = Child[protoProp] = new Surrogate()

    if proto
      childConstructor = proto[constrProp] if proto.hasOwnProperty constrProp
      childProto[k] = proto[k] for k of proto
      # Just for you IE8
      if childConstructor
        childProto[constrProp] = childConstructor
        
    Child