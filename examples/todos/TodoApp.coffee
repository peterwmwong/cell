window.TodoApp = Cell.extend
   'render <div id="todoapp">': (opts, render)->
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
          <ul id="todo-list"></ul>
        </div>

        #{render.cell Stats,
            total:Todos.length
            done: Todos.done().length
            remaining: Todos.remaining().length}

      </div>
      """

   # Delegated events for creating new items, and clearing completed ones.
   events:
     'keypress #new-todo':  'createOnEnter'
     'keyup #new-todo':     'showTooltip'
     'click .todo-clear a': 'clearCompleted'

   # At initialization we bind to the relevant events on the `Todos`
   # collection, when items are added or changed. Kick things off by
   # loading any preexisting todos that might be saved in *localStorage*.
   initialize: ->
      @input = @$ '#new-todo'

      Todos.bind 'add',     @addOne.bind this
      Todos.bind 'refresh', @addAll.bind this
      Todos.bind 'all',     @render.bind this

      Todos.fetch()

   # Add a single todo item to the list by creating a view for it, and
   # appending its element to the `<ul>`.
   addOne: (todo)->
      @$('#todo-list').append new TodoView(model: todo).el

   # Add all items in the **Todos** collection at once.
   addAll: ->
      Todos.each (todo)=> @addOne todo

   # Generate the attributes for a new Todo item.
   newAttributes: ->
      content: @input.val()
      order:   Todos.nextOrder()
      done:    false

   # If you hit return in the main input field, create new **Todo** model,
   # persisting it to *localStorage*.
   createOnEnter: (e)->
      if e.keyCode == 13
         Todos.create @newAttributes()
         @input.val ''

   # Clear all done todo items, destroying their models.
   clearCompleted: ->
     _.each Todos.done(), (todo)-> todo.clear()
     return false

   # Lazily show the tooltip that tells you to press `enter` to save
   # a new todo item, after one second.
   showTooltip: (e)->
     tooltip = @$ ".ui-tooltip-top"
     val = @input.val()
     tooltip.fadeOut()
     if @tooltipTimeout then clearTimeout @tooltipTimeout
     if val == '' or val == @input.attr 'placeholder' then return
     show = -> tooltip.show().fadeIn()
     @tooltipTimeout = _.delay show, 1000
