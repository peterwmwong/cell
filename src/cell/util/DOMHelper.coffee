define ->
   attachMethods = ['replace','appendTo','prependTo','before','after']
   numAttachMethods = attachMethods.length
   after = (target,nodes)->
      for n in nodes
         target = target.insertAdjacentElement 'afterEnd', n
  
   getAttachMethodTarget: (o)->
      for m in attachMethods when t=o[m]
         return target: t, method: m
      return target:undefined

   getElementFromNodes: (nid,nodes)->
      sel = '#'+nid
      for n in nodes when n.id==nid or n=n.querySelector(sel)
         return n

   htmlToDOMNodes: (html,parentTagName)->
      tmp = document.createElement(parentTagName or 'div')
      tmp.innerHTML = html
      htmlColToArray tmp.children

   htmlColToArray: htmlColToArray=(htmlcol)->
      i=-1
      l=htmlcol.length
      while(++i<l)
         htmlcol[i]

   replace:(target,nodes)->
      target.parentNode.replaceChild(newTarget=nodes[0], target)
      after newTarget,nodes.slice(1)

   before:(target,nodes)->
      after target.insertAdjacentElement('beforeBegin',nodes[0]), nodes.slice(1)

   after:after

   appendTo:(target,nodes)->
      after target.appendChild(nodes[0]), nodes.slice(1)

   prependTo:(target,nodes)->
      after target.insertAdjacentElement('afterBegin', nodes[0]), nodes.slice(1)


