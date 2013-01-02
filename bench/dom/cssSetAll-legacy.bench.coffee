# !!! Compare with commit: 04fe62d8657d4be2ebf72eaad5cc6456ccdefaa5
define (require)->
  require('bench-dom')
    baseline:       "dom.css({margin: '1px',padding: '2px',color: '#BADA55'});"
    now:      "dom.cssSetAll({margin: '1px',padding: '2px',color: '#BADA55'});"