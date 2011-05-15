define
  init: (opts)->
    @initArg = opts

  render: (R)-> "id: #{@initArg.id}, class: #{@initArg.class}, foo: #{@initArg.foo}, opts === initArgs: #{@initArg is @options}"
