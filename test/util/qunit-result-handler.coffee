define ['./qunit-event-formatters.js'], (eventFormatters)->
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

   sendTestEvent = (event) ->
      if logmsg = eventFormatters[event.type](event)
        console?.log logmsg
      ###
      req = new XMLHttpRequest()
      req.open 'POST', '/result', true
      req.onreadystatechange = (res) ->
         if res.readyState == 4 and res.status != 200
            console.log "Could not send test event event #{JSON.stringify(event)}"
      req.setRequestHeader 'Content-Type','application/json'
      req.send(JSON.stringify event)
      ###

   # Register QUnit log hooks
   QUnit.begin= -> sendTestEvent
      type: 'start'
   QUnit.done = ({failed, passed})-> sendTestEvent
      type: 'done'
      pass: passed
      fail: failed

   QUnit.moduleStart= (mod) ->
     sendTestEvent
         type: 'suite.start'
         suite: (curSuite = mod)

   QUnit.moduleDone = (mod) ->
     sendTestEvent
        type: 'suite.done'
        pass: curSuiteCount.passed()
        fail: curSuiteCount.failed()
        suite: mod

   QUnit.testStart= (test) ->
     sendTestEvent
      type: 'test.start'
      suite: curSuite
      test: (curTest = test)

   QUnit.testDone = ({name, failed, passed, total}) ->
      sendTestEvent
         type: 'test.done'
         suite: curSuite
         test: name
         pass: passed
         fail: failed
   
   QUnit.log = ({result,message,actual,expected})->
      # Allows breakpoint on exception -> breakpoint on assertion failure
      unless result then try throw new Error()

      sendTestEvent
         type: 'test.assert'
         suite: curSuite
         test: curTest
         assert: message
         isPass: result
         actual: JSON.stringify actual
         expected: JSON.stringify expected
