define -> (done)->

  equal @$('.Container > .CellWithInit.one').html(),
    "id: oneid, class: one, foo: bar, opts === initArgs: true"

  equal @$('.Container > .CellWithInit.two').html(),
    "id: twoid, class: two, foo: blarg, opts === initArgs: true"
  
  done()
