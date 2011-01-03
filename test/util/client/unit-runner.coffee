define ['/util/parseTestsFromLocation.js','/util/unit-suite.js','/util/qunit-result-handler.js'], (parseTests,unit_suite) ->
   for suiteName in parseTests()
      do(suiteName)->
         # Load test suite module
         require ["#{suiteName}.js"], (suite) ->
         
            # Run Unit Suite
            unit_suite suiteName, suite

