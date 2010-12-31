define ['/util/unit-suite.js','/util/qunit-result-handler.js'], (unit_suite) ->
   # Parse comma delimited test suite names from url 
   # ex. ?test=suite1,suite2,suite3
   for item in document.location.search.slice(1).split('&')
      [k,v] = item.split '='
      if k == 'tests' and v?
         for suiteName in v.split ','
            suiteName = decodeURIComponent suiteName
               
            do(suiteName)->
               # Load test suite module
               require ["#{suiteName}.js"], (suite) ->
               
                  # Run Unit Suite
                  unit_suite suiteName, suite

