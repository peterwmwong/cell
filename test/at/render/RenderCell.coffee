define ['cell!AnotherCell'], (AnotherCell)->
  render: (R,A)-> [
    R '.booleanFalse',
      false

    R '.undefined',
      undefined

    R '.null',
      null

    R '.number',
      5

    R '.numberZero',
      0

    R 'ol.list',
      for el,pos in [10,20,30]
        R "li.li#{pos}", el

    R "<div class='htmlNode anotherClass' style='color:#F00;'>",
      R 'a', href: 'http://www.yahoo.com',
        'foobar'

    R '.node',
      $('<a href="http://www.google.com">blargo</a>')[0]

    R AnotherCell,
      id: 'anotherCellId'
      class: 'anotherCellClass'
      foo: 'bar'
      collection: 'collection_val'
      model: 'model_val'
  ]

  bind:
    afterRender: ->
      $(@el).append "<div class='afterRender'>afterRender</div>"
