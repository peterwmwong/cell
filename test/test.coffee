log = console.log
port = 8080
browser = undefined
testFailed = false

{lstatSync} = require 'fs'
{spawn} = require 'child_process'

isTest = (name) ->
   if name.match /Test$/
      for ext in ['.js','.coffee']
         try return (lstatSync name+ext).isFile()
   else
      log "#{name} does not end with 'Test'"
   return false

# Find tests
tests = (test for test in process.argv when isTest(__dirname+test))
return log 'No tests specified' if tests.length <= 0
testsurl = "http://localhost:#{port}/test/unit/unit-runner.html?tests=#{(encodeURIComponent test for test in tests).join '.'}"

# Setup test result server
results = (require './util/test_result_server').create
   baseDir: __dirname
   port: port

# Listen for failure
results.on 'test.assert', ({suite, test, assert, isPass}) ->
   if not isPass
      log "FAIL #{suite}/#{test} - #{assert}"
      testFailed = true

# Listen for completion
results.on 'done', ->
   if not testFailed
      browser.kill()
      process.exit 0
   else
      log "*** Above test(s) failed ***"
      log " 1) Goto #{testsurl}"
      log " 2) Breakpoint on Exceptions"

browser = spawn('google-chrome',[testsurl])
