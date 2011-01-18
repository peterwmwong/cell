define ['/util/parseTestsFromLocation.js','/util/load_iframe.js','/util/qunit-result-handler.js'], (parseTests,load_iframe)->
   module ''
   waitfor = (getSel,cssSel,timeout,done)->
      # Normalize arguments
      #   timeout is optional
      if typeof timeout == 'function'
         done = timeout
         timeout = 1000
      
      unless typeof done == 'function' and typeof cssSel == 'string' and typeof timeout == 'number'
         ok false, "waitfor: illegal arguments"
      else
         hasTimedOut = false
         setTimeout (->hasTimedOut=true), timeout

         id = setInterval (->
            if hasTimedOut
               clearInterval id
               ok false, "waitfor: Timed out waiting for $('#{cssSel}')"
            else
               try
                  if node = getSel cssSel
                     clearInterval id
                     done node
         ), 50

   for testname in parseTests()
      do(testname)->
         asyncTest testname, ->
            require [testname+'.js'],
               (test)->
                  testdoc = testname+'.html'
                  try load_iframe testdoc, document.body, (contentDocument,error)->
                     if error
                        ok false, "Could not load test document '#{testdoc}' into iframe"
                        start()
                     else
                        try
                           test
                              document: contentDocument
                              getStyle: (node,style)-> contentDocument.defaultView.getComputedStyle(node,null).getPropertyValue(style)
                              $: waitfor.bind(null, (sel)->contentDocument.querySelector(sel))
                              $$:waitfor.bind(null, (sel)->
                                 if ((nodes = contentDocument.querySelectorAll(sel)) and nodes.length > 0)
                                    nodes
                              )
                              start
                        catch e
                           ok false, "Test '#{testname}' threw Error='#{e}'"
                           start()
                   catch e
                      ok false, "Could not load test document '#{testdoc}' into iframe"
                      start()
               (loaded,failed)->
                  ok false, "Could not load test '#{testname}'. Error='#{failed[testname]}'"

