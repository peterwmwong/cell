window.TodoView = Cell.extend

   'render <li>': ->
      """
      <div class="todo #{ @model.get('done') and 'done' or '' }">
        <div class="display">
          <input class="check" type="checkbox" #{ @model.get('done') and 'checked="checked"' or '' } />
          <div class="todo-content">#{@model.get 'content'}</div>
          <span class="todo-destroy"></span>
        </div>
        <div class="edit">
          <input class="todo-input" type="text" value="#{@model.get 'content'}" />
        </div>
      </div>
      """

    # The DOM events specific to an item.
    events:
      "click .check"              : "toggleDone"
      "dblclick div.todo-content" : "edit"
      "click span.todo-destroy"   : "clear"
      "keypress .todo-input"      : "updateOnEnter"
      "blur"                      : "close"

    # The TodoView listens for changes to its model, re-rendering. Since there's
    # a one-to-one correspondence between a **Todo** and a **TodoView** in this
    # app, we set a direct reference on the model for convenience.
    initialize: ->
      @input = @$ '.todo-input'
      @model.bind 'change', @update.bind this
      @model.view = this

    # Toggle the `"done"` state of the model.
    toggleDone: -> @model.toggle()

    # Switch this view into `"editing"` mode, displaying the input field.
    edit: ->
      $(@el).addClass "editing"
      @input.focus()

    # Close the `"editing"` mode, saving changes to the todo.
    close: ->
      @model.save content: @$('.todo-input').val()
      $(@el).removeClass 'editing'

    # If you hit `enter`, we're through editing the item.
    updateOnEnter: (e)-> if e.keyCode == 13 then @close()

    # Remove this view from the DOM.
    remove: -> $(@el).remove()

    # Remove the item, destroy the model.
    clear: -> @model.clear()
