define -> (done)->

  @$('.CellThatBinds .clickable')
    .click()
    .click()
  equal @$('body #clickcount').html(), "2", "Click count should have been incremented twice"
  
  @$('.clickable.not')
    .click()
  equal @$('body #clickcount').html(), "2", "Bind selector is limited to cell's DOM"

  done()
