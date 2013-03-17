define (require)->
  Benchmark = require 'benchmark'
  escapeCode = (str)->
    str
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')

  # Shamelessly stolen from lodash's perf.js... I need to learn statistics :(
  #
  # Gets the Hz, i.e. operations per second, of `bench` adjusted for the
  # margin of error.
  #
  # @private
  # @param {Object} bench The benchmark object.
  # @returns {Number} Returns the adjusted Hz.
  getHz = (bench)->
    result = (1 / (bench.stats.mean + bench.stats.moe))
    if isFinite(result) then result else 0

  run: ({setup,tests,teardown,deps})->
    Benchmark::setup = setup if setup
    Benchmark::teardown = teardown if teardown
    log 'benchCode', "<pre>// Setup\n#{escapeCode setup}</pre>"

    s = new Benchmark.Suite

    s.on 'cycle', (event)->
      log 'bench', String event.target

    s.on 'complete', ->
      log 'benchResultHeader', ' '
      formatNumber = Benchmark.formatNumber
      fastest = @filter 'fastest'
      fastestHz = getHz fastest[0]
      slowest = @filter 'slowest'
      slowestHz = getHz slowest[0]
      aHz = getHz @[0]
      bHz = getHz @[1]

      if fastest.length > 1
        log 'benchResult', 'It\'s too close to call.'

      else
        percent = ((fastestHz / slowestHz) - 1) * 100
        log "benchResult #{if fastest[0].name is 'now' then 'faster' else 'slower'}",
          """
          #{fastest[0].name} is
          #{formatNumber(
            if percent < 1 then percent.toFixed 2
            else Math.round percent
          )} % faster.
          """

    for name in ['now','baseline']
      test = tests[name]
      s.add name, test, deps[name]
      log 'benchCode', "<pre>// #{name}<br>#{escapeCode test}</pre>"

    log 'benchCode', "<pre>// Teardown\n#{escapeCode teardown}</pre>"

    s.run async: true
