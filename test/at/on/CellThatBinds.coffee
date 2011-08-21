define
  init: ->
    @clickcount = 0

  render: (R)-> [
    'Click Count: '
    R '#clickcount', @clickcount
    R '.foo',
      R '#bar',
        R 'input.add', type: 'button', value: 'Add'
        R 'input.remove', type: 'button', value: 'Remove'
  ]
  
  on:
    'click .foo > #bar > .add': ->
      @$('#clickcount').html ++@clickcount

    'click .foo > #bar > .remove': ->
      @$('#clickcount').html --@clickcount

