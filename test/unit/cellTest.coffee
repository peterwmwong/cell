define ->
   MockCell = undefined

   $testObj: 'cell'
   $beforeTest: (require,done)->
      delete window.cell
      require.def 'cell/Cell', [], -> MockCell=sinon.spy(->return this)
      require ['cell/Cell'], done

   "cell.define is a function": (require,get,done)-> get ->
      ok window.cell, 'window.cell should exist'
      strictEqual typeof window.cell.define, 'function', 'window.cell.define is a function'
      done()

   "cell.define(cellDefinition:Object): Should return define module as new Cell(callDefinition)": (require,get,done)-> get ->
      require ['../mocks/defObjectCell'], (obj)->
         ok MockCell.calledOnce
         ok MockCell.args[0][0].id == "defObjectCell"
         ok MockCell.thisValues[0] == obj
         done()

   "cell.define(cellDefinitionFunction:Function): Should return define module as new Cell(callDefinitionFunction())": (require,get,done)-> get ->
      require ['../mocks/defFuncCell'], (obj)->
         ok MockCell.calledOnce
         ok MockCell.args[0][0].id == "defFuncCell"
         ok MockCell.thisValues[0] == MockCell.returnValues[0] == obj
         done()

