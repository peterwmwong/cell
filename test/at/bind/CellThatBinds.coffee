define
  init: ->
    @clickcount = 0

  render: (R)->
    """
    Click Count: <span id='clickcount'>#{@clickcount}</span>
    <div class='foo'>
      <div id='bar'>
        <button type="button" class='add'>Add</button>
        <button type="button" class='remove'>Remove</button>
      </div>
    </div>
    """
  
  bind:
    'click .foo > #bar > .add': ->
      @$('#clickcount').html ++@clickcount

    'click .foo > #bar > .remove': ->
      @$('#clickcount').html --@clickcount

