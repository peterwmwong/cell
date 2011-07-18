define ['cell!dir/B','cell!dir/C'], (B,C)->
  render: (R)-> [
  	R 'p', 'A'
  	R B
  	R C
  ]