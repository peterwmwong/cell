define ['cell!AnotherCell'], (AnotherCell)->
  render: (R,A)->
    """
    <div class='booleanFalse'>#{R false}</div>
    <div class='undefined'>#{R undefined and "Shouldn't be rendered"}</div>
    <div class='null'>#{R null and "Shouldn't be rendered"}</div>
    <div class='number'>#{R 5}</div>
    <div class='numberZero'>#{R 0}</div>
    <ol class='list'>
      #{R inputList = [10,20,30], (el,pos,list)->
        "<li class='li#{pos}'>#{el}, Passed input list: #{list is inputList}</li>"
      }
    </ol>
    <div class='node'>#{R $('<a href="www.google.com">blargo</div>')[0]}</div>
    #{R AnotherCell,
        id: 'anotherCellId'
        class: 'anotherCellClass'
        foo: 'bar'
        collection: 'collection_val'
        model: 'model_val'}
    """
