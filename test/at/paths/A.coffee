define ['cell!dir/B','cell!./dir/C'], (B,C)->
  render: (R)-> "<p>A</p>#{R B}#{R C}"
