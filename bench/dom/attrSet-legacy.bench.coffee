define (require)->
  bench = require 'bench'
  window.domBaseline = require 'domBaseline'
  window.domNow = require 'domNow'

  bench.run
    setup:
      """
      var html = '<select multiple name="samp"></select>';
      var baseline = domBaseline(html);
      var now = domNow(html);
      """

    tests:
      before: ->
        baseline.attr 'name', 'newName'

      after: ->
        now.attrSet 'name', 'newName'
  