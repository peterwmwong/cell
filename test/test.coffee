define ->
  escapeHTML = do->
    div = document.createElement 'div'
    (str)->
      div.innerHTML = ''
      div.appendChild document.createTextNode str
      div.innerHTML

  load: (name, req, load, config)->
    req [name], (specs)->
      module name, before:specs.$beforeEach, after:specs.$afterEach
      for specName, spec of specs when specName not in ['$beforeEach', '$afterEach']
        specName = escapeHTML specName

        if typeof spec is 'function'
          test specName, spec

        else if typeof spec?.async is 'function'
          asyncTest specName, spec.async
        
        else
          test specName, ->
            fail "Could not run test! Test is not sync (<function>) or async ({async:<function>})"

      load true