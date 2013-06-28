// Generated by CoffeeScript 1.6.3
define(function(require) {
  var bench, configs, runBench, settings;
  bench = require('../bench-utils/bench');
  configs = {};
  requirejs.config({
    context: 'now',
    baseUrl: '../../../',
    paths: {
      cell: 'src'
    },
    deps: ['cell/Model', 'cell/Collection', 'cell/util/spy'],
    callback: function(Model, Collection, spy) {
      configs.now = {
        Model: Model,
        Collection: Collection,
        spy: spy
      };
      runBench();
    }
  });
  requirejs.config({
    context: 'baseline',
    baseUrl: '../../../cell-bench-baseline',
    paths: {
      cell: 'src'
    },
    deps: ['cell/Model', 'cell/Collection', 'cell/util/spy'],
    callback: function(Model, Collection, spy) {
      configs.baseline = {
        Model: Model,
        Collection: Collection,
        spy: spy
      };
      runBench();
    }
  });
  settings = void 0;
  runBench = function() {
    if (configs.baseline && configs.now) {
      settings.deps = configs;
      bench.run(settings);
    }
  };
  return function(_arg) {
    var baseline, both, now, setup, teardown;
    baseline = _arg.baseline, now = _arg.now, both = _arg.both, setup = _arg.setup, teardown = _arg.teardown;
    settings = {
      setup: setup || '',
      teardown: teardown || ''
    };
    settings.tests = both ? {
      baseline: both,
      now: both
    } : {
      baseline: baseline,
      now: now
    };
    return runBench();
  };
});

/*
//@ sourceMappingURL=bench-spy.map
*/