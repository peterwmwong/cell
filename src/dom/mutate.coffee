define ['dom/data'], (data)->
  remove: (element)->
    data.remove element
    if parent = element.parentNode
      parent.removeChild element