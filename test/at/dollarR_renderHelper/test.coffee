define -> (done)->
  equal @$(".RenderCell").html().trim(), 'true'
  done()