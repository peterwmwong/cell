define (require)->
  bench = require '../bench-utils/bench'

  configs = {}

  requirejs.config
    context: 'now'
    baseUrl: '../../../'
    paths:
      cell: 'src'
    deps: ['cell/Model','cell/Collection','cell/util/spy']
    callback: (Model,Collection,spy)->
      configs.now = {Model,Collection,spy}
      runBench()
      return

  requirejs.config
    context: 'baseline'
    baseUrl: '../../../cell-bench-baseline'
    paths:
      cell: 'src'
    deps: ['cell/Model','cell/Collection','cell/util/spy']
    callback: (Model,Collection,spy)->
      configs.baseline = {Model,Collection,spy}
      runBench()
      return

  settings = undefined
  runBench = ->
    if configs.baseline and configs.now
      settings.deps = configs
      bench.run settings
    return

  ({baseline,now,both,setup,teardown})->
    settings =
      setup: setup or ''
      teardown: teardown or ''

    settings.tests =
      if both
        baseline: both
        now: both
      else {baseline,now}

    runBench()