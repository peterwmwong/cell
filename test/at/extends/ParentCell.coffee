define
  render: (R)-> [
  	R '.childOption', @childOption
  	R '.renderChild', @renderChild()
  ]

  bind:
    afterRender: ->
      $(@el).append "<div class='parentAfterRender'>from parent afterRender</div>"
