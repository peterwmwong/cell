define do->
  div = document.createElement 'div'

  normalizeHTML: (html)->
    div.innerHTML = html
    div.innerHTML

  nodeToHTML: (node)->
    div.innerHTML = ''
    div.appendChild node
    div.innerHTML