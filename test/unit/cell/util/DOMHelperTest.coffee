define ->
   $$ = (parent,sel)->
      parent.querySelectorAll(sel)
   $ = (parent,sel)->
      parent.querySelector(sel)

   testDOMInsertion = (funcName,targetSel,expParentSel,startPos,shouldTargetNotExist)->
      (require,get,done)-> get (DOMHelper)->
         root = document.createElement 'div'
         root.innerHTML = "<span id='parent'><div id='child'></div></span>"
         target = $(root,targetSel)

         tmp = document.createElement 'div'
         tmp.innerHTML = '<div id="test0"></div><div id="test1"><div id="test1child"></div></div><div id="test2"></div>'
         children = DOMHelper.htmlColToArray tmp.children
         
         DOMHelper[funcName] target, children

         if shouldTargetNotExist
            ok !$(root,targetSel), '{target} node should not exist'

         parent = $(root,expParentSel)
         
         for sel in ['#test0','#test1','#test2','#test1 > #test1child']
            ok $$(parent,sel).length, 1, "div:nth-of-type(#{startPos++})##{sel} should exist"

         done()

   equalObj = (a,e)->
      for k,v of e
         equal a[k], v, "property expected['#{k}']===#{v}, instead actual['#{k}']===#{a[k]}"


   $testObj: 'cell/util/DOMHelper'

   $beforeTest: (require,done)->
      if window then done()
      else console.log "!!! BROWSER TEST !!!"

   $afterTest: (done)->
      document.body.innerHTML = ''
      done()


   "getAttachMethodTarget({opts}): if {opts} does not contain a 'replace','appendTo','prependTo','before', or 'after' property, then return {target:undefined}": (require,get,done)-> get ({getAttachMethodTarget})->
      equal getAttachMethodTarget({}).target, undefined
      done()


   "getAttachMethodTarget({opts}): opts={method:node} => {method:method, target:node}": (require,get,done)-> get ({getAttachMethodTarget})->
      for method in ['replace','appendTo','prependTo','before','after']
         opts = {}
         opts[method]=(m={})
         equalObj getAttachMethodTarget(opts), method:method, target:m
      done()


   "htmlToDOMNodes(html): {html} has no nodes, returns []": (require,get,done)-> get ({htmlToDOMNodes})->
      equal htmlToDOMNodes("blarg").length, 0
      done()


   "htmlToDOMNodes(html): {html} has one node, returns [node]": (require,get,done)-> get ({htmlToDOMNodes})->
      nodes = htmlToDOMNodes "<span></span>"
      equal nodes.length, 1
      ok nodes[0].tagName.toLowerCase() == 'span'
      done()


   "htmlToDOMNodes(html,parentTagName): Uses {parentTagName} to create nodes from {html}, returns [node...] (Tags like <tr/> have parent tag restrictions)": (require,get,done)-> get ({htmlToDOMNodes})->
      nodes = htmlToDOMNodes "<tr></tr>", "tbody"
      equal nodes.length, 1
      ok nodes[0].tagName.toLowerCase() == 'tr'
      done()

   "htmlToDOMNodes(html): {html} has multiple node, returns [node...]": (require,get,done)-> get ({htmlToDOMNodes})->
      nodes = htmlToDOMNodes "<span></span><div></div><p></p>"
      equal nodes.length, 3
      for i in [0..(expTags=['span','div','p']).length-1]
         ok nodes[i].tagName.toLowerCase() == expTags[i]
      done()


   "getElementFromNodes(id,nodes): {nodes} is [], returns undefined": (require,get,done)-> get ({getElementFromNodes})->
      equal getElementFromNodes("id",[]), undefined
      done()


   "getElementFromNodes(id,nodes): no node with id==={id} exists in {nodes}, returns undefined": (require,get,done)-> get ({getElementFromNodes})->
      parent = document.createElement 'div'
      parent.innerHTML = "<span></span><div></div><p></p>"

      equal getElementFromNodes("id",parent.children), undefined
      done()


   "getElementFromNodes(id,nodes): a node with an id==={id} exists in {nodes}, returns that node": (require,get,done)-> get ({getElementFromNodes})->
      parent = document.createElement 'div'
      parent.innerHTML = "<span></span><div><div id='test'></div></div><p></p>"

      node = getElementFromNodes("test",parent.children)
      equal node.id, 'test'

      done()


   "getElementFromNodes(id,nodes): one of the {nodes} has an id==={id}, returns that node": (require,get,done)-> get ({getElementFromNodes})->
      parent = document.createElement 'div'
      parent.innerHTML = "<span></span><div><div id='test'></div></div><p></p>"

      node = getElementFromNodes("test",parent.children)
      equal node.id, 'test'

      done()

   "replace(target,nodes)": testDOMInsertion('replace', '#child', '#parent', 1, true)
   "prependTo(target,nodes)": testDOMInsertion('prependTo', '#parent', '#parent', 1)
   "appendTo(target,nodes)": testDOMInsertion('appendTo', '#parent', '#parent', 2)
   "before(target,nodes)": testDOMInsertion('before', '#child', '#parent', 1)
   "after(target,nodes)": testDOMInsertion('after', '#child', '#parent', 2)
