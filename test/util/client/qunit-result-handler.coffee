define ->
   class Count
      constructor: ->
         @counts = {}
         @reset()

      passed: -> @counts[true]
      failed: -> @counts[false]

      count: (isPass)->
         ++@counts[isPass]

      reset: ->
         @counts[true] = @counts[false] = 0
 
   overallCount = new Count()
   curSuiteCount = new Count()
   curSuite = undefined
   curTest = undefined

   eventFormatters =
      start: -> "----------------------------------------"
      done: ->
         """
         ----------------------------------------
         [ FAIL: #{overallCount.failed()}  PASS: #{overallCount.passed()} ]
         """
      'suite.start': ({suite}) -> suite
      'suite.done': ({suite}) -> "#{suite} [ FAIL: #{curSuiteCount.failed()}  PASS: #{curSuiteCount.passed()} ]"
      'test.start': ({suite,test}) -> undefined
      'test.done': ({suite,test}) -> undefined
      'test.assert': ({suite,test,assert,isPass}) ->
         unless isPass
            ">>> FAIL <<< #{suite} | #{test} | #{assert}"
         else
            undefined

   sendTestEvent = (event) ->
      logmsg = eventFormatters[event.type](event)
      console.log logmsg if logmsg

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
      pass: overallCount.passed()
      fail: overallCount.failed()

   QUnit.moduleStart= (mod) ->
      curSuiteCount.reset()
      sendTestEvent
         type: 'suite.start'
         suite: (curSuite = mod)

   QUnit.moduleDone = (mod) -> sendTestEvent
      type: 'suite.done'
      suite: mod

   QUnit.testStart= (test) -> sendTestEvent
      type: 'test.start'
      suite: curSuite
      test: (curTest = test)

   QUnit.testDone = (test, fail, pass) ->
      overallCount.count fail == 0
      curSuiteCount.count fail == 0
      sendTestEvent
         type: 'test.done'
         suite: curSuite
         test: test
         pass: pass
         fail: fail
   
   QUnit.log = (isPass, html_message, {message})->
      # Allows breakpoint on exception -> breakpoint on assertion failure
      unless isPass then try throw new Error()

      sendTestEvent
         type: 'test.assert'
         suite: curSuite
         test: curTest
         assert: message
         isPass: isPass
