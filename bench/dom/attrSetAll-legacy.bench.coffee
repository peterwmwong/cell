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
      baseline: ->
        baseline.attr
          name: '1px'
          width: '2px'
          height: '#BADA55'

      now: ->
        now.attrSetAll
          name: '1px'
          width: '2px'
          height: '#BADA55'
  