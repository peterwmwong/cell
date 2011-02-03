define ['cell!'], (c)->
   c.on 'rendered', ({$,$$})->
     $('#firstName').innerHTML = 'Grace'

