define
  init: (opts)->
    @initArg = opts

  render: (R)-> [
    """
    id: #{@initArg.id}
    class: #{@initArg.class}
    model: #{@model}
    foo: #{@initArg.foo}
    opts === initArgs: #{@initArg is @options}
    this.cell.prototype.name: #{@cell::name}
    """
  ]