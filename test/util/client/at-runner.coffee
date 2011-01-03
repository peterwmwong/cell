define ['/util/parseTestsFromLocation.js','/util/load_iframe.js','/util/qunit-result-handler.js'], (parseTests,load_iframe)->
   module ''
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
                              document:contentDocument
                              getStyle: (node,style)-> contentDocument.defaultView.getComputedStyle(node,null).getPropertyValue(style)
                              $:contentDocument.querySelector.bind(contentDocument)
                              $$:contentDocument.querySelectorAll.bind(contentDocument)
                              start
                        catch e
                           ok false, "Test '#{testname}' threw Error='#{e}'"
                           start()
                   catch e
                      ok false, "Could not load test document '#{testdoc}' into iframe"
                      start()
               (loaded,failed)->
                  ok false, "Could not load test '#{testname}'. Error='#{failed[testname]}'"

