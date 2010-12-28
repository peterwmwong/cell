{hasFlag, getFlagArg, isFlag} = require './util/server/commandflags.coffee'
findtests = require './util/server/findtests.coffee'

log = console.log
port = 8080
testsdir = __dirname+'/unit'
browserCmd = getFlagArg('-browser', 'b') or 'google-chrome'
debug = hasFlag '-debug', 'd'

{spawn} = require 'child_process'

# Find tests
findtests {spec:process.argv[process.argv.length-1], dir:testsdir}, (tests) ->
   if tests.length <= 0
      log "No tests found for \"#{testSpec}\""
      process.exit 0

   allPassed = true
   done = false

   log "Running tests: \n #{tests.join '\n '}"
   testsurl = "http://localhost:#{port}/util/unit-runner.html?tests=#{(encodeURIComponent '/tests'+test for test in tests).join ','}"

   # Setup test result server
   results = (require './util/server/test-server').create
      testsDir: testsdir
      srcDir: __dirname+'/../src'
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
          FAIL: #{ev.pass}  PASS: #{ev.fail}
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
