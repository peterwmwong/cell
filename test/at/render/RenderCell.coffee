define ['cell!AnotherCell'], (AnotherCell)->
  render: (_,A)-> [
    _ '.booleanFalse',
      false

    _ '.undefined',
      undefined

    _ '.null',
      null

    _ '.number',
      5

    _ '.numberZero',
      0

    _ 'ol.list',
      for el,pos in [10,20,30]
        _ "li.li#{pos}", el

    _ "<div class='htmlNode anotherClass' style='background-color:#F00;' data-custom='something'>",
      _ 'a', href: 'http://www.yahoo.com',
        'foobar'

    _ '.node', class: 'anotherClass',
      $('<a href="http://www.google.com">blargo</a>')[0]

    _ '#idnode', class: 'anotherClass',
      $('<a href="http://www.bing.com">pwn</a>')[0]

    _ AnotherCell,
      id: 'anotherCellId'
      class: 'anotherCellClass'
      foo: 'bar'
      collection: 'collection_val'
      model: 'model_val'
  ]

  bind:
    afterRender: ->
      $(@el).append "<div class='afterRender'>afterRender</div>"
