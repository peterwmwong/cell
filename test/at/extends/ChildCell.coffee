define
  extends: './ParentCell'

  childOption: "from childOption"
  renderChild: ->"from renderChild"

  bind:
    afterRender: ->
      $(@el).append "<div class='childAfterRender'>from child afterRender</div>"
