define -> (done)->

  equal @$('.Container > .CellWithInit.one').html(),
    """
    id: oneid
    class: one
    model: oneModel
    foo: bar
    opts === initArgs: true
    this.cell.prototype.name: CellWithInit
    """

  equal @$('.Container > .CellWithInit.two').html(),
    """
    id: twoid
    class: two
    model: twoModel
    foo: blarg
    opts === initArgs: true
    this.cell.prototype.name: CellWithInit
    """
  
  done()
