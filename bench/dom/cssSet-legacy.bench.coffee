# !!! Compare with commit: 04fe62d8657d4be2ebf72eaad5cc6456ccdefaa5
define (require)->
  require('bench-dom')
    baseline: "dom.css('margin', '1px');"
    now:      "dom.cssSet('margin', '1px');"