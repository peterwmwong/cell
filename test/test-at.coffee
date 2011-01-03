{hasFlag, getFlagArg, isFlag} = require './util/server/commandflags.coffee'
findtests = require './util/server/findtests.coffee'
eventFormatters = require './util/client/qunit-event-formatters.coffee'

log = console.log
port = 8080
testsdir = __dirname+'/at'
browserCmd = getFlagArg('-browser', 'b') or 'google-chrome'
debug = hasFlag '-debug', 'd'

{spawn} = require 'child_process'

# Find tests
testSpec = process.argv[process.argv.length-1]
findtests {spec:testSpec+'.coffee', dir:testsdir}, (tests) ->
   if tests.length <= 0
      log "No tests found for \"#{testSpec}\""
      process.exit 0

   testsurl = "http://localhost:#{port}/util/at-runner.html?tests=#{(encodeURIComponent '/tests'+test for test in tests).join ','}"

   log "Running tests: \n #{tests.join '\n '}"

   # Setup test result server
   results = (require './util/server/test-server').create
      testsDir: testsdir
      srcDir: __dirname+'/../build'
      depsDir: __dirname+'/../deps'
      mocksDir: __dirname+'/mocks'
      utilDir: __dirname+'/util/client'
      port: port

   # Listen for failure
   results.on 'test.assert', (event) ->
      if not event.isPass
         log eventFormatters['test.assert'](event)

   # Listen for completion
   results.on 'done', do->
      debugPrinted = false
      (event)->
         log eventFormatters['done'](event)

         if not debugPrinted
            debugPrinted = true
            if debug
               log "\n*** DEBUG: Goto #{testsurl} ***\n"
            else
               browser.kill()
               process.exit 0

   browser = spawn(browserCmd,[testsurl])
