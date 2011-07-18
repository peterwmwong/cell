define ['cell!../../E'], (E)->
  id = 0
  render: (R)-> [
    R 'p', "D(#{id++})"
    R E
  ]