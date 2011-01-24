define ->
   attachMethods = ['replace','appendTo','prependTo','before','after']
   numAttachMethods = attachMethods.length
   after = (target,nodes)->
      for n in nodes
         target = target.insertAdjacentElement 'afterEnd', n

   # Exposed for testing
   __htmlToDOMNodes: __htmlToDOMNodes = (html,parentTagName)->
      tmp = document.createElement(parentTagName)
      tmp.innerHTML = html
      htmlcol = tmp.children
      i=-1
      l=htmlcol.length
      while(++i<l)
         htmlcol[i]

   getAttachMethodTarget: (o)->
      for m in attachMethods when t=o[m]
         return target: t, method: m
      return target:undefined

   getElementFromNodes: (nid,nodes)->
      sel = '#'+nid
      for n in nodes when n.id==nid or n=n.querySelector(sel)
         return n

   replace:(target,html)->
      nodes = __htmlToDOMNodes html, target.parentNode.tagName
      target.parentNode.replaceChild(newTarget=nodes[0], target)
      after newTarget,nodes.slice(1)
      nodes

   before:(target,html)->
      nodes = __htmlToDOMNodes html, target.parentNode.tagName
      after target.insertAdjacentElement('beforeBegin',nodes[0]), nodes.slice(1)
      nodes

   after:(target,html)->
      nodes = __htmlToDOMNodes html, target.parentNode.tagName
      after target, nodes
      nodes

   appendTo:(target,html)->
      nodes = __htmlToDOMNodes html, target.tagName
      after target.appendChild(nodes[0]), nodes.slice(1)
      nodes

   prependTo:(target,html)->
      nodes = __htmlToDOMNodes html, target.tagName
      after target.insertAdjacentElement('afterBegin', nodes[0]), nodes.slice(1)
      nodes

