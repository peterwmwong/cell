// Generated by CoffeeScript 1.6.1

define(function(require) {
  var Benchmark, escapeCode, getHz;
  Benchmark = require('benchmark');
  escapeCode = function(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };
  getHz = function(bench) {
    var result;
    result = 1 / (bench.stats.mean + bench.stats.moe);
    if (isFinite(result)) {
      return result;
    } else {
      return 0;
    }
  };
  return {
    run: function(_arg) {
      var deps, name, s, setup, teardown, test, tests, _i, _len, _ref;
      setup = _arg.setup, tests = _arg.tests, teardown = _arg.teardown, deps = _arg.deps;
      if (setup) {
        Benchmark.prototype.setup = setup;
      }
      if (teardown) {
        Benchmark.prototype.teardown = teardown;
      }
      log('benchCode', "<pre>// Setup\n" + (escapeCode(setup)) + "</pre>");
      s = new Benchmark.Suite;
      s.on('cycle', function(event) {
        return log('bench', String(event.target));
      });
      s.on('complete', function() {
        var aHz, bHz, fastest, fastestHz, formatNumber, percent, slowest, slowestHz;
        log('benchResultHeader', ' ');
        formatNumber = Benchmark.formatNumber;
        fastest = this.filter('fastest');
        fastestHz = getHz(fastest[0]);
        slowest = this.filter('slowest');
        slowestHz = getHz(slowest[0]);
        aHz = getHz(this[0]);
        bHz = getHz(this[1]);
        if (fastest.length > 1) {
          return log('benchResult', 'It\'s too close to call.');
        } else {
          percent = ((fastestHz / slowestHz) - 1) * 100;
          return log("benchResult " + (fastest[0].name === 'now' ? 'faster' : 'slower'), "" + fastest[0].name + " is\n" + (formatNumber(percent < 1 ? percent.toFixed(2) : Math.round(percent))) + " % faster.");
        }
      });
      _ref = ['now', 'baseline'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        test = tests[name];
        s.add(name, test, deps[name]);
        log('benchCode', "<pre>// " + name + "<br>" + (escapeCode(test)) + "</pre>");
      }
      log('benchCode', "<pre>// Teardown\n" + (escapeCode(teardown)) + "</pre>");
      return s.run({
        async: true
      });
    }
  };
});
