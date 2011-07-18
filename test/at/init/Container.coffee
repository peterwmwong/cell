define ['cell!./CellWithInit'], (CellWithInit)->
  render: (R)-> [
    R CellWithInit, id:'oneid', class:'one', foo:'bar'
    R CellWithInit, id:'twoid', class:'two', foo:'blarg'
  ]
  