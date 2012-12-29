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
        before.css 'margin'
        before.css 'padding'

      after: ->
        after.css 'margin'
        after.css 'padding'
  