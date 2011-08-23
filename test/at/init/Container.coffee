define ['cell!./CellWithInit'], (CellWithInit)->
  render: (R)-> [
    R CellWithInit, id:'oneid', class:'one', model: 'oneModel', foo:'bar'
    R CellWithInit, id:'twoid', class:'two', model: 'twoModel', foo:'blarg'
  ]
  