// Generated by CoffeeScript 1.4.0

define(function(require) {
  var bench;
  bench = require('bench');
  window.domBefore = require('domBefore');
  window.domAfter = require('domAfter');
  return bench.run({
    setup: "var before = domBefore('<div></div>');\nvar after = domAfter('<div></div>');",
    tests: {
      before: function() {
        before.css('margin');
        return before.css('padding');
      },
      after: function() {
        after.css('margin');
        return after.css('padding');
      }
    }
  });
});
