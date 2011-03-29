window.TodoApp = Cell.extend

   'render <div id="todoapp">': (R)->
      """
      <div class="title">
        <h1>Todos</h1>
      </div>

      <div class="content">

        <div id="create-todo">
          <input id="new-todo" placeholder="What needs to be done?" type="text" />
          <span class="ui-tooltip-top" style="display:none;">Press Enter to save this task</span>
        </div>

        <div id="todos">
          <ul id="todo-list">
            #{R @collection.models, (todo)-> R TodoView, model:todo}
          </ul>
        </div>

        #{R Stats, model: @collection}

      </div>
      """

   bind:
      # If you hit return in the main input field, create new **Todo** model,
      # persisting it to *localStorage*.
      'keypress #new-todo': (e)->
         if e.keyCode == 13
            @collection.create
               content: @$('#new-todo').val()
               order:   @collection.nextOrder()
               done:    false
            @$('#new-todo').val ''

      # Lazily show the tooltip that tells you to press `enter` to save
      # a new todo item, after one second.
      'keyup #new-todo': (e)->
         tooltip = @$ ".ui-tooltip-top"
         val = @$('#new-todo').val()
         tooltip.hide()
         if @tooltipTimeout then clearTimeout @tooltipTimeout
         if val == '' or val == @$('#new-todo').attr 'placeholder' then return
         @tooltipTimeout = _.delay (-> tooltip.show()), 1000

      # Clear all done todo items, destroying their models.
      'click .todo-clear a': ->
           _.each @collection.done(), (todo)-> todo.clear()
           return false

   'bind collection':
      # Add a single todo item to the list by creating a view for it, and
      # appending its element to the `<ul>`.
      add: addOne=(todo)->
         @$('#todo-list').append new TodoView(model: todo).el

      # Add all items in the **Todos** collection at once.
      refresh: ->
         @collection.each (todo)=> addOne.call this, todo

