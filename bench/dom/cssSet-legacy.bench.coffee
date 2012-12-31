define (require)->
  bench = require 'bench'
  window.domBaseline = require 'domBaseline'
  window.domNow = require 'domNow'

  bench.run
    setup:
      """
      var html = '<div></div>';
      var baseline = domBaseline(html);
      var now = domNow(html);
      """

    tests:
      before: ->
        baseline.css 'margin', '1px'

      after: ->
        now.cssSet 'margin', '1px'
  