define ->
   defer = (f)-> setTimeout f,0
   mockPlugin = undefined

   $testObj: 'cell/loader'
   
   $beforeTest: (require,done)->
      require.def 'cell', [], ->
         mockPlugin =
            load: sinon.spy (name,require,done)->
               done( rtn = {render: sinon.spy()} )
               rtn
            loadDefineDependency: sinon.spy()

      require ['cell'], done

   $afterTest: (done)->
      # Clear body
      while document.body.firstChild
         document.body.removeChild document.body.firstChild
      done()


   'Should not try to load any Cells if no data-cell attributes specified': (require,get,done)-> get (loader)->
      ok not mockPlugin.load.called, 'No Cells should have been loaded'
      ok not mockPlugin.loadDefineDependency.called, 'No Cells should have been defined with cell! dependency'
      done()


   'Should load and render to <div data-cell="cellname"></div>': (require,get,done)->
      document.body.innerHTML = '<div id="node" data-cell="cellname"></div>'

      get (loader)-> defer ->
         ok mockPlugin.load.calledOnce and mockPlugin.load.calledWith('cellname'), 'Should load cell specified by data-cell attribute'
         renderSpy = mockPlugin.load.returnValues[0].render
         ok renderSpy.calledOnce, 'Should render cell'
         equal JSON.stringify(renderSpy.args[0][0].data), JSON.stringify({}), 'Should call cell.render passing {data} == {}, when data-cell-data attribute is NOT specified'
         equal renderSpy.args[0][0].replace, document.querySelector('#node'), 'Should call cell.render passing {to} the node with the data-cell attribute'
         done()


   'Should load and render to <div data-cell="cellname" data-cell-data=\'{"key1":"val1"}\'></div>, JSON.parse-ing and passing data-cell-data attribute': (require,get,done)->
      document.body.innerHTML = '<div id="node" data-cell="cellname" data-cell-data=\'{"key1":"val1"}\'></div>'

      get (loader)-> defer ->
         ok mockPlugin.load.calledOnce and mockPlugin.load.calledWith('cellname'), 'Should load cell specified by data-cell attribute'
         renderSpy = mockPlugin.load.returnValues[0].render
         ok renderSpy.calledOnce, 'Should render cell'
         equal renderSpy.args[0][0].data.key1, 'val1', 'Should call cell.render passing {data} JSON.parse-ed data-cell-data attribute'
         equal renderSpy.args[0][0].replace, document.querySelector('#node'), 'Should call cell.render passing {to} the node with the data-cell attribute'
         done()


   'Should pass {} for {data} to Cell.render({data, to}) when JSON.parse throws error on data-cell-data attribute': (require,get,done)->
      document.body.innerHTML = '<div id="node" data-cell="cellname" data-cell-data=\'unparseable JSON data\'></div>'

      get (loader)-> defer ->
         ok mockPlugin.load.calledOnce and mockPlugin.load.calledWith('cellname'), 'Should load cell specified by data-cell attribute'
         renderSpy = mockPlugin.load.returnValues[0].render
         ok renderSpy.calledOnce, 'Should render cell'
         equal JSON.stringify(renderSpy.args[0][0].data), JSON.stringify({}), 'Should call cell.render passing {data} == {}, when data-cell-data attribute is JSON unparseable'
         equal renderSpy.args[0][0].replace,  document.querySelector('#node'), 'Should call cell.render passing {to} the node with the data-cell attribute'
         done()


   'Should load and render multiple cells': (require,get,done)->
      document.body.innerHTML = '''
                                <div id="node1" data-cell="cellname1" data-cell-data=\'unparseable JSON data\'></div>
                                <div>
                                   <div id="node2" data-cell="cellname2" data-cell-data=\'{"key2":"val2"}\'></div>
                                </div>
                                '''

      get (loader)-> defer ->
         ok mockPlugin.load.callCount, 2, 'Should load cell both cells'

         call = mockPlugin.load.getCall 0
         ok call.calledWith('cellname1'), 'Should load cell #1'
         renderSpy = call.returnValue.render
         ok renderSpy.calledOnce, 'Should render cell #1'
         equal JSON.stringify(renderSpy.args[0][0].data), JSON.stringify({}), 'Should call cell.render passing {data} == {}, when data-cell-data attribute is JSON unparseable'
         equal renderSpy.args[0][0].replace, document.querySelector('#node1'), 'Should call cell.render passing {to} the node with the data-cell attribute'

         call = mockPlugin.load.getCall 1
         ok call.calledWith('cellname2'), 'Should load cell #2'
         renderSpy = call.returnValue.render
         ok renderSpy.calledOnce, 'Should render cell #2'
         equal renderSpy.args[0][0].data.key2, 'val2', 'Should call cell.render passing {data} JSON.parse-ed data-cell-data attribute'
         equal renderSpy.args[0][0].replace, document.querySelector('#node2'), 'Should call cell.render passing {to} the node with the data-cell attribute'
         
         done()
