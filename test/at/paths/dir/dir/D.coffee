define ['cell!../../E'], (E)->
  id = 0
  render: (R)-> "<p>D(#{id++})</p>#{R E}"
