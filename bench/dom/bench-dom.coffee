define (require)->
  bench = require 'bench'
  window.DOMBaseline = require 'DOMBaseline'
  window.DOMNow = require 'DOMNow'

  ({dom_html,baseline,now,both})->
    dom_html or= '<div></div>'
    settings =
      setup:
        """
        var domBaseline = DOMBaseline('#{dom_html}');
        var domNow = DOMNow('#{dom_html}');
        """

    settings.tests =
      if both
        baseline: both
        now: both

      else
        {baseline,now}

    settings.tests.baseline = "var dom=domBaseline;\n#{settings.tests.baseline}"
    settings.tests.now = "var dom=domNow;\n#{settings.tests.now}"

    bench.run settings