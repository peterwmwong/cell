define
  render: (R,A)->
    # Wait 100ms (ex. get data via XHR)
    setTimeout (->
      # Render after
      A ['Foo Bar']
    ), 100

