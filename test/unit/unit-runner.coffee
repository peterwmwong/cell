define ['/test/unit/unit-suite.js'], (unit_suite) ->
   curSuite = undefined
   curTest = undefined

   sendTestEvent = (event) ->
      console.log(JSON.stringify event)
      req = new XMLHttpRequest()
      req.open 'POST', '/result', true
      req.onreadystatechange = (res) ->
         if res.readyState == 4 and res.status != 200
            console.log "Could not send test event event #{JSON.stringify(event)}"
      req.setRequestHeader 'Content-Type','application/json'
      req.send(JSON.stringify event)

   # Register QUnit log hooks
   QUnit.begin= -> sendTestEvent
      type: 'start'
   QUnit.done = (fail, pass)-> sendTestEvent
      type: 'done'
      pass: pass
      fail: fail

   QUnit.moduleStart= (mod) -> sendTestEvent
      type: 'suite.start'
      suite: (curSuite = mod)

   QUnit.moduleDone = (mod) -> sendTestEvent
      type: 'suite.done'
      suite: mod

   QUnit.testStart= (test) -> sendTestEvent
      type: 'test.start'
      suite: curSuite
      test: (curTest = test)

   QUnit.testDone = (test, fail, pass) -> sendTestEvent
      type: 'test.start'
      suite: curSuite
      test: test
      pass: pass
      fail: fail
   
   QUnit.log = (isPass, html_message, {message}) -> sendTestEvent
      type: 'test.assert'
      suite: curSuite
      test: curTest
      assert: message
      isPass: isPass

   # Parse comma delimited test suite names from url 
   # ex. ?test=suite1,suite2,suite3
   for item in document.location.search.slice(1).split('&')
      [k,v] = item.split '='
      if k == 'tests' and v?
         for suiteName in v.split ','
            suiteName = decodeURIComponent suiteName
            
            # Load test suite module
            require ["/test/#{suiteName}.js"], (suite) ->
            
               # Run Unit Suite
               unit_suite suiteName, suite

   true #TODO Remove when Coffee-Script >0.9.5. Issue/879: fixed in commit 39c4c2320085709c3ea6
