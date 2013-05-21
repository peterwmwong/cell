define

  toBeOneOf: ->
    if arguments.indexOf
      return arguments.indexOf @actual

    for arg in arguments when @actual is arguments[i]
      return true

    return false

  toHaveBeenCalledOnce: ->
    if arguments.length > 0
      throw new Error 'toHaveBeenCalledOnce does not take arguments, use toHaveBeenCalledWith'

    if !jasmine.isSpy @actual
      throw new Error "Expected a spy, but got #{jasmine.pp @actual}."

    @message = ->
      msg = "Expected spy #{@actual.identity} to have been called once, but was "
      count = @actual.callCount
      return [
        if count is 0
          msg + 'never called.'
        else
          msg + 'called ' + count + ' times.'
        msg.replace('to have', 'not to have') + 'called once.'
      ]

    return @actual.callCount is 1
