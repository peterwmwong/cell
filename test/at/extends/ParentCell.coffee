define
  render: (R)->
    """
    <div class='childOption'>#{@childOption}</div>
    <div class='renderChild'>#{@renderChild()}</div>
    """

  bind:
    afterRender: ->
      $(@el).append "<div class='parentAfterRender'>from parent afterRender</div>"
