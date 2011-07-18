define ->
  id = 0
  render: (R)-> [
    R 'p', "E(#{id++})"
  ]