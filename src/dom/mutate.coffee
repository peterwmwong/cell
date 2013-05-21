define ['cell/dom/data','cell/dom/browser'], (data,browser)->
  # IE<9: Array::slice.call(element.children) blows up... lame
  toArray =
    if browser.msie < 9 then -> (el for el in @)
    else Array::slice

  dealloc = (element)->
    unless element.nodeType is 3
      data.remove element
      children = toArray.call element.children
      len = children.length
      i=-1
      while ++i < len
        dealloc children[i]
    return

  remove: (element)->
    dealloc element
    if parent = element.parentNode
      parent.removeChild element
    return