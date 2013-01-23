define ['dom/data'], (data)->
  dealloc = (element)->
    data.remove element
    dealloc(child) for child in element.children

  remove: (element)->
    dealloc element
    if parent = element.parentNode
      parent.removeChild element