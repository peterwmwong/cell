define ['dom/data'], (data)->
  dealloc = (element)->
    data.remove element
    dealloc(child) for child in element.children
    return

  remove: (element)->
    dealloc element
    if parent = element.parentNode
      parent.removeChild element
    return