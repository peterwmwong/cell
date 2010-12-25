define ->
   return (suiteName, tests) ->
      # Get module name being tested
      {$testObj,
       $beforeTest,
       $afterTest,
       $before,
       $after} = tests

      module suiteName

      # Get tests
      for testName, testFunc of tests when typeof testName == 'string' and testName[0] != '$'
         do (testName,testFunc)->
            asyncTest testName, ->
               # Create require context to load modules being tested.
               #   Not only does this seperate test modules from modules 
               #   being tested, it allows tests to override/inject modules 
               #   with mock/spy modules.
               require {baseUrl: '/src', context: "#{suiteName}/#{testName}"}, ['require'], (require) ->
                  runAfterTest = ->
                     if typeof $afterTest == 'function'
                        try $afterTest start
                     else
                        start()

                  try
                     runTestFunc = ->
                        try
                           testFunc require, (getTestObjCB) ->
                              # Load module
                              require [$testObj], (testObj) ->
                                 try getTestObjCB(testObj)
                                 catch error
                                    ok false, "TEST EXCEPTION: #{error.stack || error}"
                                    runAfterTest()
                           , runAfterTest

                        catch error
                           ok false, "TEST EXCEPTION: #{error.stack || error}"
                           runAfterTest()

                     if typeof $beforeTest == 'function'
                        try $beforeTest require, runTestFunc
                     else
                        runTestFunc()
                     
                  catch error
                     ok false, "TEST EXCEPTION: #{error.stack || error}"
                     runAfterTest()
