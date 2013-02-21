define ['dom/data'], (data)->
  dealloc = (element)->
    data.remove element
    children = element.children
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