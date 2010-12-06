define ->
   return (suiteName, tests) ->
      # Get module name being tested
      testObjName = tests.$testObj

      module suiteName

      # Get tests
      for testName, testFunc of tests
         if testName != '$testObj' # Skip
            asyncTest testName, ->
               # Create require context to load modules being tested.
               #   Not only does this seperate test modules from modules 
               #   being tested, it allows tests to override/inject modules 
               #   with mock/spy modules.
               require {baseUrl: '/src', context: "#{suiteName}/#{testName}"}, ['require'], (require) ->
                  try
                     testFunc require, (getTestObjCB) ->
                        # Load module
                        require [testObjName], (testObj) ->
                           try
                              getTestObjCB(testObj)
                           catch error
                              ok false, "TEST EXCEPTION: #{error.stack || error}"
                              start()
                  catch error
                     ok false, "TEST EXCEPTION: #{error.stack || error}"
                     start()
