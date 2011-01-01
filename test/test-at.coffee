{hasFlag, getFlagArg, isFlag} = require './util/server/commandflags.coffee'
findtests = require './util/server/findtests.coffee'

log = console.log
port = 8080
testsdir = __dirname+'/at/simple'
browserCmd = getFlagArg('-browser', 'b') or 'google-chrome'
debug = hasFlag '-debug', 'd'

{spawn} = require 'child_process'

# Find tests

allPassed = true
done = false

testsurl = "http://localhost:#{port}/tests/test.html"

# Setup test result server
results = (require './util/server/test-server').create
   testsDir: testsdir
   srcDir: __dirname+'/../build'
   depsDir: __dirname+'/../deps'
   mocksDir: __dirname+'/mocks'
   utilDir: __dirname+'/util/client'
   port: port

# Listen for failure
results.on 'test.assert', ({suite, test, assert, isPass}) ->
   if not isPass
      log "FAIL #{suite}/#{test} - #{assert}"
      allPassed = false

# Listen for completion
results.on 'done', (ev)->
   log """
       ----------------------------------
       FAIL: #{ev.fail}  PASS: #{ev.pass}
       ----------------------------------
       """
   if not done
      done = true
      if debug
         log "*** DEBUG: Goto #{testsurl} ***"
      else
         browser.kill()
         process.exit 0

browser = spawn(browserCmd,[testsurl])
