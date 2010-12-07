{hasFlag, getFlagArg, isFlag} = require './util/commandflags.coffee'

log = console.log
port = 8080
browserCmd = (getFlagArg '-browser', 'b') or 'google-chrome'
browser = undefined
debug = hasFlag '-debug', 'd'
allPassed = true
done = false

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
testSpec= process.argv[process.argv.length-1]
tests = if isTest __dirname+testSpec then [testSpec] else []
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
      allPassed = false

# Listen for completion
results.on 'done', ->
   if not done
      done = true
      if debug
         log "*** DEBUG: Goto #{testsurl} ***"
      else
         browser.kill()
         process.exit 0

browser = spawn(browserCmd,[testsurl])
