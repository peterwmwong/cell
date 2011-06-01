define
  render: (R)->
    """
    #{R.cell './CellWithInit', id:'oneid', class:'one', foo:'bar'}
    #{R.cell './CellWithInit', id:'twoid', class:'two', foo:'blarg'}
    """
