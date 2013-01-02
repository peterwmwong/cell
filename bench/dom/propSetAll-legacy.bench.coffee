# !!! Compare with commit: 04fe62d8657d4be2ebf72eaad5cc6456ccdefaa5
define (require)->
  require('bench-dom')
    baseline:       "dom.prop({name:'samp2', multiple:false, title:'BADA55'});"
    now:      "dom.propSetAll({name:'samp2', multiple:false, title:'BADA55'});"


