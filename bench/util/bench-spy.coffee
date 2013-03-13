define (require)->
  bench = require '../bench-utils/bench'

  requirejs.config
    context: 'now'
    baseUrl: '../../../src'
    deps: ['cell/Model','cell/util/spy']
    callback: (Model,spy)->
      window.ModelNow = Model
      window.spyNow = spy
      runBench()
      return

  requirejs.config
    context: 'baseline'
    baseUrl: 'https://raw.github.com/peterwmwong/cell/master/src/'
    # baseUrl: '../../../src'
    deps: ['cell/Model','cell/util/spy']
    callback: (Model,spy)->
      window.ModelBaseline = Model
      window.spyBaseline = spy
      runBench()
      return

  settings = undefined
  runBench = ->
    if settings and window.spyBaseline and window.spyNow and window.ModelBaseline and window.ModelNow
      bench.run settings
    return

  ({baseline,now,both,setup,teardown})->
    settings =
      setup: setup or ''
      teardown: teardown or ''
    settings.tests = {baseline,now}
    runBench()