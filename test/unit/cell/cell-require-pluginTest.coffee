define ->

   noThrow = (func) ->
      try func()
      catch e
         ok false, 'Should NOT throw exception'

   $testObj: 'cell/cell-require-plugin'

   'require("cell!")' : (require, get) ->

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

         ok cellLoadedSpy.calledOnce, "Cell loaded callback called once"
         equal cellLoadedSpy.args[0], 2, "Cell loaded callback passed 2 args"
         equal cellLoadedSpy.args[0][0], cellMock, "Cell loaded callback args[0] is Cell"
         equal cellLoadedSpy.args[0][1], undefined, "Cell loaded callback args[1] is undefined (no errors)"
         ok CellSpy.calledOnce, "Cell shouldn't called again"

         start()
         

