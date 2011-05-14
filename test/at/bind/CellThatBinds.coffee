define ->
  initialize: ->
    @clickcount = 0

  render: (R)->
    """
    Click Count: <span id='clickcount'>#{@clickcount}</span>
    <div class='foo'>
      <div id='bar'>
        <button type="button" class='clickable'>Add One</a>
      </div>
    </div>
    """
  
  bind:
    'click .foo > #bar > .clickable': ->
      @$('#clickcount').html ++@clickcount

