define ['cell!./dir/MockNested','__'], (MockNested,__)->
  render_el: -> [
    "Mock: "
    __ MockNested
  ]
