define (require)->
  bench = require 'bench'
  window.domBaseline = require 'domBaseline'
  window.domNow = require 'domNow'

  bench.run
    setup:
      """
      var baseline = domBaseline('<div></div>');
      var now = domNow('<div></div>');
      """

    tests:
      baseline: ->
        baseline.css
          margin: '1px'
          padding: '2px'
          color: '#BADA55'

      now: ->
        now.cssSetAll
          margin: '1px'
          padding: '2px'
          color: '#BADA55'
  