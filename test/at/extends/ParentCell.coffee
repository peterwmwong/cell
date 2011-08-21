define
  render: (_)-> [
    _ '.childOption', @childOption
    _ '.renderChild', @renderChild()
  ]

  afterRender: ->
    @$el.append "<div class='parentAfterRender'>from parent afterRender</div>"
