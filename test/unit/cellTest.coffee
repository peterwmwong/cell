define ->
   $testObj: 'cell'

   'cell() one cell': (require, get, done) -> get (cell) ->
      cell 'mock/mockCellOne', (One) ->
         ok One?,'Should find mock/mockCellOne'
         ok One.forAssert == 777,'Verify mockCellOne'
         done()

   'cell() multiple cells': (require, get, done) -> get (cell) ->
      cell ['mock/mockCellOne','mock/mockCellTwo'], (One,Two) ->
         ok One?,'Should find mock/mockCellOne'
         ok One.forAssert == 777,'Verify mockCellOne'
         ok Two?,'Should find mock/mockCellTwo'
         ok Two.forAssert == 888,'Verify mockCellOne'
         done()
