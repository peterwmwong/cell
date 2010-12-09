define ->
   defer = (func) -> setTimeout func, 0

   $testObj: 'cell/cell-require-plugin'
   $beforeTest: (done) ->
      # Make requirejs forget about the plugin, so a new plugin 
      # context is created for each test
      for cbArray in require.s.plugins.callbacks
         cbArray.splice 0, cbArray.length
      delete require.s.plugins.defined['cell']
      done()

   'require(cell!)' : (require, get, done) ->

      CellSpy = sinon.spy()
      require.def 'cell/Cell', -> CellSpy

      get (crp) ->
         cellLoadedSpy = sinon.spy()
         require ['cell!mock/mockCellOne'], cellLoadedSpy

         ok not cellLoadedSpy.called, "Cell loaded callback shouldn't be called until it's actually loaded"

         ok CellSpy.calledOnce, 'Cell called once'
         equal CellSpy.args[0].length, 2, 'Cell passed 2 args'
         equal CellSpy.args[0][0], 'mock/mockCellOne', 'Cell args[0] is Cell name'
         equal typeof CellSpy.args[0][1], 'function', 'Cell args[0] is a function (callback)'

         cellMock = {}
         CellSpy.args[0][1](cellMock)
         defer ->
            ok cellLoadedSpy.calledOnce, "Cell loaded callback called once"
            equal cellLoadedSpy.args[0].length, 1, "Cell loaded callback passed 2 args"
            equal cellLoadedSpy.args[0][0], cellMock, "Cell loaded callback args[0] is Cell"
            ok CellSpy.calledOnce, "Cell shouldn't called again"

            done()

   'require(cell!, cell!) repeated calls' : (require, get, done) ->

      CellSpy = sinon.spy()
      require.def 'cell/Cell', -> CellSpy

      get (crp) ->
         cellLoadedSpy1 = sinon.spy()
         cellLoadedSpy2 = sinon.spy()
         require ['cell!mock/mockCellOne','cell!mock/mockCellTwo'], cellLoadedSpy1
         require ['cell!mock/mockCellOne','cell!mock/mockCellTwo'], cellLoadedSpy2

         ok not cellLoadedSpy1.called and not cellLoadedSpy2.called, "Cell loaded callback shouldn't be called until it's actually loaded"

         equal CellSpy.callCount, 2,'Cell called twice'
         equal CellSpy.args[0].length, 2, 'Cell passed 2 args'
         equal CellSpy.args[0][0], 'mock/mockCellOne', 'Cell args[0] is Cell name'
         equal typeof CellSpy.args[0][1], 'function', 'Cell args[1] is a function (callback)'

         equal CellSpy.args[1].length, 2, 'Cell passed 2 args'
         equal CellSpy.args[1][0], 'mock/mockCellTwo', 'Cell args[0] is Cell name'
         equal typeof CellSpy.args[1][1], 'function', 'Cell args[1] is a function (callback)'

         [cellMockOne,cellMockTwo]= [{},{}]
         CellSpy.args[0][1](cellMockOne)
         CellSpy.args[1][1](cellMockTwo)
         defer ->
            ok cellLoadedSpy1.calledOnce, "Cell loaded callback called once"
            equal cellLoadedSpy1.args[0].length, 2, "Cell loaded callback passed 2 args"
            equal cellLoadedSpy1.args[0][0], cellMockOne, "Cell loaded callback args[0] is mockCellOne"
            equal cellLoadedSpy1.args[0][1], cellMockTwo, "Cell loaded callback args[1] is mockCellTwo"

            ok cellLoadedSpy2.calledOnce, "Cell loaded callback called once"
            equal cellLoadedSpy2.args[0].length, 2, "Cell loaded callback passed 2 args"
            equal cellLoadedSpy2.args[0][0], cellMockOne, "Cell loaded callback args[0] is mockCellOne"
            equal cellLoadedSpy2.args[0][1], cellMockTwo, "Cell loaded callback args[1] is mockCellTwo"

            equal CellSpy.callCount, 2, "Cell shouldn't be called again"
            done()

         
   'require([cell!,cell!]) multi cell' : (require, get, done) ->

      CellSpy = sinon.spy()
      require.def 'cell/Cell', -> CellSpy

      get (crp) ->
         cellLoadedSpy = sinon.spy()
         require ['cell!mock/mockCellOne','cell!mock/mockCellTwo'], cellLoadedSpy

         ok not cellLoadedSpy.called, "Cell loaded callback shouldn't be called until it's actually loaded"

         equal CellSpy.callCount, 2,'Cell called twice'
         equal CellSpy.args[0].length, 2, 'Cell passed 2 args'
         equal CellSpy.args[0][0], 'mock/mockCellOne', 'Cell args[0] is Cell name'
         equal typeof CellSpy.args[0][1], 'function', 'Cell args[1] is a function (callback)'

         equal CellSpy.args[1].length, 2, 'Cell passed 2 args'
         equal CellSpy.args[1][0], 'mock/mockCellTwo', 'Cell args[0] is Cell name'
         equal typeof CellSpy.args[1][1], 'function', 'Cell args[1] is a function (callback)'

         [cellMockOne,cellMockTwo]= [{},{}]
         CellSpy.args[0][1](cellMockOne)
         CellSpy.args[1][1](cellMockTwo)
         defer ->
            ok cellLoadedSpy.calledOnce, "Cell loaded callback called once"
            equal cellLoadedSpy.args[0].length, 2, "Cell loaded callback passed 2 args"
            equal cellLoadedSpy.args[0][0], cellMockOne, "Cell loaded callback args[0] is mockCellOne"
            equal cellLoadedSpy.args[0][1], cellMockTwo, "Cell loaded callback args[1] is mockCellTwo"
            equal CellSpy.callCount, 2, "Cell shouldn't be called again"

            done()

