// Generated by CoffeeScript 1.4.0

define(function(require) {
  var bench;
  bench = require('bench');
  window.domBaseline = require('domBaseline');
  window.domNow = require('domNow');
  return bench.run({
    setup: "var html = '<div></div>';\nvar baseline = domBaseline(html);\nvar now = domNow(html);",
    tests: {
      baseline: function() {
        return baseline.css('margin');
      },
      now: function() {
        return now.css('margin');
      }
    }
  });
});
