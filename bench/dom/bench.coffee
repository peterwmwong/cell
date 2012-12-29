define (require)->
  Benchmark = require 'benchmark'
  platform = require 'platform'
  publishResults = require 'publishResults'

  run: ({publish,sandboxid,setup,tests})->
    Benchmark::setup = setup if setup

    Benchmark.platform = platform

    s = new Benchmark.Suite

    s.on 'cycle', (event)->
      log 'bench', String event.target

    s.on 'complete', ->
      log 'benchResultHeader', ' '

      results = {}
      {hz:baseline,name:baselineName} = @[0]

      for {name,hz} in @
        r = results[name] =
          unless name is baselineName
            (parseInt 1000 * hz / baseline)
          else
            1000
        diff = r - 1000
        desc =
          if diff < 0 then 'slower'
          else if diff > 0 then 'faster'
          else ''
        log "benchResult #{desc}", "#{name} #{Math.abs diff/10.0}% #{desc}"

      if publish and /[?&]publish/.test(window.location.search)
        publishResults.toBrowserScope results, publish.testkey, publish.sandboxid

    for name,test of tests
      s.add name, test

    s.run async: true
