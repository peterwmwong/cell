define -> (done)->

  @$('.CellThatBinds .add')
    .click()
    .click()
  equal @$('body #clickcount').html(), "2", "Click count should have been incremented twice"
  
  @$('.add.not')
    .click()
  equal @$('body #clickcount').html(), "2", "Bind selector is limited to cell's DOM"

  @$('.CellThatBinds .remove')
    .click()
    .click()
    .click()
  @$('.add.not')
    .click()
  equal @$('body #clickcount').html(), "-1", "Click count should have been decremented three times"

  done()
