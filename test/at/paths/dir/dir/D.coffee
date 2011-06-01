define ->
  id = 0
  render: (R)-> "<p>D(#{id++})</p>#{R.cell '../../E'}"
