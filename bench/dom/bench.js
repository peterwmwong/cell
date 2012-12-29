// Generated by CoffeeScript 1.4.0

define(function(require) {
  var Benchmark, platform, publishResults;
  Benchmark = require('benchmark');
  platform = require('platform');
  publishResults = require('publishResults');
  return {
    run: function(_arg) {
      var name, publish, s, sandboxid, setup, test, tests;
      publish = _arg.publish, sandboxid = _arg.sandboxid, setup = _arg.setup, tests = _arg.tests;
      if (setup) {
        Benchmark.prototype.setup = setup;
      }
      Benchmark.platform = platform;
      s = new Benchmark.Suite;
      s.on('cycle', function(event) {
        return log('bench', String(event.target));
      });
      s.on('complete', function() {
        var baseline, baselineName, desc, diff, hz, name, r, results, _i, _len, _ref, _ref1;
        log('benchResultHeader', ' ');
        results = {};
        _ref = this[0], baseline = _ref.hz, baselineName = _ref.name;
        for (_i = 0, _len = this.length; _i < _len; _i++) {
          _ref1 = this[_i], name = _ref1.name, hz = _ref1.hz;
          r = results[name] = name !== baselineName ? parseInt(1000 * hz / baseline) : 1000;
          diff = r - 1000;
          desc = diff < 0 ? 'slower' : diff > 0 ? 'faster' : '';
          log("benchResult " + desc, "" + name + " " + (Math.abs(diff / 10.0)) + "% " + desc);
        }
        if (publish && /[?&]publish/.test(window.location.search)) {
          return publishResults.toBrowserScope(results, publish.testkey, publish.sandboxid);
        }
      });
      for (name in tests) {
        test = tests[name];
        s.add(name, test);
      }
      return s.run({
        async: true
      });
    }
  };
});
