define ->
   defer = (t,f)-> setTimeout f,t

   $testObj: 'cell/CellRendering'

   'new CellRendering(cell,data,node): throws error if {cell} is undefined or null': (require,get,done)-> get (CellRendering)->
      [undefined,null].forEach (cell)->
         try ok not (new CellRendering cell,{},{}), "Should throw error if {cell} is '#{cell}'"
      done()


   'new CellRendering(cell,data,node): throws error if {node} is undefined or null': (require,get,done)-> get (CellRendering)->
      [undefined,null].forEach (node)->
         try ok not (new CellRendering {},{},node), "Should throw error if {node} is '#{node}'"
      done()


   '@cell, @data, and @node are read-only fields': (require,get,done)-> get (CellRendering)->
      [mCell,mData,mNode] = [{},{},{}]
      cr = new CellRendering mCell,mData,mNode

      try cr.cell={}
      try cr.data={}
      try cr.node={}
      equal cr.cell, mCell, 'cell property should be read-only'
      equal cr.data, mData, 'data property should be read-only'
      equal cr.node, mNode, 'node property should be read-only'
      done()


   'update(data,done): sets @data and calls @cell.render({data:@data,to:@node},{done})': (require,get,done)-> get (CellRendering)->
      [mData,mNode] = [{},{}]
      mCell = render: sinon.spy((a,b)->b())
      cr = new CellRendering mCell,mData,mNode

      newData = {}
      sDone = sinon.spy()
      cr.update newData, ->
         ok mCell.render.calledOnce, 'cell.render called once'
         equal mCell.render.args[0][0].data, newData, 'cell.render passed new data'
         equal mCell.render.args[0][0].to, mNode, 'cell.render passed @node'
         equal mCell.render.args[0][0].to, mNode, 'cell.render passed @node'
         done()
