define -> (done)->

  equal @$('.Container > .CellWithInit.one').html(),
    """
    id: oneid
    class: one
    foo: bar
    opts === initArgs: true
    this.cell.prototype.name: CellWithInit
    """

  equal @$('.Container > .CellWithInit.two').html(),
    """
    id: twoid
    class: two
    foo: blarg
    opts === initArgs: true
    this.cell.prototype.name: CellWithInit
    """
  
  done()
