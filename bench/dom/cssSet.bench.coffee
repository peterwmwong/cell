define (require)->
  bench = require 'bench'
  window.domBefore = require 'domBefore'
  window.domAfter = require 'domAfter'

  bench.run
    setup:
      """
      var before = domBefore('<div></div>');
      var after = domAfter('<div></div>');
      """

    tests:
      before: ->
        before.css 'margin', '1px'
        before.css 'padding', '2px'

      after: ->
        after.cssSet 'margin', '1px'
        after.cssSet 'padding', '2px'
  