define -> (done)->
  setTimeout (=>
    equal @$('body .RenderAsyncCell').html(), "Foo Bar"
    done()
  ), 100
