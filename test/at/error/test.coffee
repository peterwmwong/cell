define -> (done)->

  equal @$('body').html(), "Error was correct", "Error should have been passed to console.error"

  done()
