define ->
  (matcherHash)->
    (input)->
      result = []
      i=-1
      while ++i < len
        model = input.at i
        match = true
        for k of matcher when (expected_value = matcher[k])? and (expected_value isnt model.get 'k')
          match = false
          break
        result.push attr[k] if match
      result
