# !!! Compare with commit: 04fe62d8657d4be2ebf72eaad5cc6456ccdefaa5
define (require)->
  require('bench-dom')
    baseline: "dom.data('name', 'newName');"
    now:      "dom.dataSet('name', 'newName');"
  