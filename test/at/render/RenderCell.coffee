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
    
    _ '.node',
      _ document.createElement 'table'
      
    _ "<div class='htmlNode anotherClass' style='background-color:#F00;' data-custom='something'>",
      _ 'a', href: 'http://www.yahoo.com',
        'foobar'

    _ '#selID1',
      'Selector id'

    _ '#ignoredID1', id:'optionID1', class: 'optionClass1', 'data-custom':'customValue',
      'Selector id, option id, option class, option data-custom attribute'

    _ '#ignoredID2#selID2',
      'Multiple Selector ids'

    _ '.selClass1.selClass2',
      'Multiple Selector classes'

    _ '.selClass3', id:'optionID2', class: 'optionClass2', 'data-custom':'customValue',
      'Selector class, option id, option class, option data-custom attribute'

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
