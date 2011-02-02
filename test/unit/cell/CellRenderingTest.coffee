define ->
   defer = (t,f)-> setTimeout f,t

   class MockEventful

   class MockNode
      constructor: (cell,data,nodes)->
         @querySelector = sinon.spy()
         @querySelectorAll = sinon.spy()

   $testObj: 'cell/CellRendering'

   $beforeTest: (require,done)->
      require.def 'cell/Eventful', [], -> MockEventful
      require ['cell/Eventful'], done


   'new CellRendering(cell,data,nodes): produces an object that is an instance of cell/Eventful': (require,get,done)-> get (CellRendering)->
      ok (new CellRendering {},{},[]) instanceof MockEventful, "Should be an instanceof cell/Eventful"
      done()

   'new CellRendering(cell,data,nodes): throws error if {cell} is undefined or null': (require,get,done)-> get (CellRendering)->
      [undefined,null].forEach (cell)->
         try ok not (new CellRendering cell,{},[]), "Should throw error if {cell} is '#{cell}'"
      done()


   'new CellRendering(cell,data,node): throws error if {node} is undefined or null': (require,get,done)-> get (CellRendering)->
      [undefined,null].forEach (node)->
         try ok not (new CellRendering {},{},node), "Should throw error if {node} is '#{node}'"
      done()


   '@cell, @data, @node, @$, and @$$ are read-only fields': (require,get,done)-> get (CellRendering)->
      [mCell,mData,mNodes] = [{},{},[new MockNode(),new MockNode()]]
      cr = new CellRendering mCell,mData,mNodes

      try cr.cell={}
      try cr.data={}
      try cr.nodes={}
      try cr.$=->
      try cr.$$=->
      equal cr.cell, mCell, 'cell property should be read-only'
      equal cr.data, mData, 'data property should be read-only'
      equal cr.nodes, mNodes, 'node property should be read-only'

      try cr.$()
      for n in mNodes
         ok n.querySelector.calledOnce and n.querySelector.calledOn(n), '$ property should be read-only'

      try cr.$$()
      for n in mNodes
         ok n.querySelectorAll.calledOnce and n.querySelectorAll.calledOn(n), '$ property should be read-only'
 
      done()


   '@$({sel}): Should run querySelector on all nodes and return the undefined if nothing found': (require,get,done)-> get (CellRendering)->
      testParent = document.createElement 'div'
      testParent.innerHTML =
         """
            <div id='testNode1'>
               <div id='t1' class='test'></div><div id='t2' class='test'></div>
            </div>
            <div id='testNode2'>
               <div id='t3' class='test'></div><div id='t4' class='test'></div>
            </div>
         """

      cr = new CellRendering {}, {}, [testParent.querySelector('#testNode1'),testParent.querySelector('#testNode2')]
      node = cr.$('.blarg')

      equal node, undefined

      done()


   '@$({sel}): Should run querySelector on all nodes and return the first node found': (require,get,done)-> get (CellRendering)->
      testParent = document.createElement 'div'
      testParent.innerHTML =
         """
            <div id='testNode1'>
               <div id='t1' class='test'></div><div id='t2' class='test'></div>
            </div>
            <div id='testNode2'>
               <div id='t3' class='test'></div><div id='t4' class='test'></div>
            </div>
         """

      cr = new CellRendering {}, {}, [testParent.querySelector('#testNode1'),testParent.querySelector('#testNode2')]
      node = cr.$('.test')

      ok node instanceof window.HTMLElement, "returned node should be an window.HTMLElement"
      equal node, testParent.querySelector("#t1")

      done()


   '@$$({sel}): Should run querySelectorAll on all nodes and collect return results in an Array': (require,get,done)-> get (CellRendering)->
      testParent = document.createElement 'div'
      testParent.innerHTML =
         """
            <div id='testNode1'>
               <div id='t1' class='test'></div><div id='t2' class='test'></div>
            </div>
            <div id='testNode2'>
               <div id='t3' class='test'></div><div id='t4' class='test'></div>
            </div>
         """

      cr = new CellRendering {}, {}, [testParent.querySelector('#testNode1'),testParent.querySelector('#testNode2')]
      nodes = cr.$$('.test')

      ok nodes instanceof Array, "returned nodes should be an Array"
      equal nodes.length, 4, "should return 4 nodes"
      for i in [0..3]
         equal nodes[i], testParent.querySelector("#t#{i+1}")

      done()


   '@$$({sel}): Should run querySelectorAll on all nodes and return an empty Array if nothing found': (require,get,done)-> get (CellRendering)->
      testParent = document.createElement 'div'
      testParent.innerHTML =
         """
            <div id='testNode1'>
               <div id='t1' class='test'></div><div id='t2' class='test'></div>
            </div>
            <div id='testNode2'>
               <div id='t3' class='test'></div><div id='t4' class='test'></div>
            </div>
         """

      cr = new CellRendering {}, {}, [testParent.querySelector('#testNode1'),testParent.querySelector('#testNode2')]
      nodes = cr.$$('.blarg')

      ok nodes instanceof Array, "returned nodes should be an Array"
      equal nodes.length, 0, "should return 0 nodes"

      done()


   'update(data,done): sets @data and calls @cell.render({data:@data,to:@node},{done})': (require,get,done)-> get (CellRendering)->
      [mData,mNodes] = [{},[new MockNode()]]
      mCell = render: sinon.spy((a,b)->b())
      cr = new CellRendering mCell,mData,mNodes

      newData = {}
      sDone = sinon.spy()
      replaceNode = mNodes[0]
      cr.update newData, ->
         ok mCell.render.calledOnce, 'cell.render called once'
         equal mCell.render.args[0][0].data, newData, 'cell.render passed new data'
         equal mCell.render.args[0][0].replace, replaceNode, 'cell.render passed @node'
         done()
