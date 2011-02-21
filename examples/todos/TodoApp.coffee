window.TodoApp = Cell.extend
   css:
      '#todoapp':
         width: '480px'
         margin: '0 auto 40px'
         background: 'white'
         padding: '20px'
         # todo: box-shadow

      '#todoapp h1':
         'font-size': '36px'
         'font-weight': 'bold'
         'text-align': 'center'
         padding: '20px 0 30px 0'
         'line-height': 1

      '#create-todo':
         position: 'relative'
         input:
            '&::-webkit-input-placeholder':
               'font-style': 'italic'
            width: '466px'
            'font-size': '24px'
            'font-family': 'inherit'
            'line-height': '1.4em'
            border: 0
            outline: 'none'
            padding: '6px'
            border: '1px solid #999999'
            # todo: box-shadow
         span:
            position: 'absolute'
            'z-index': 999
            width: '170px'
            left: '50%'
            'margin-left': '-85px'

      'todo-list':
         'margin-top': '10px'
         li:
            padding: '12px 20px 11px 0'
            position: 'relative'
            'font-size': '24px'
            'line-height': '1.1em'
            'border-bottom': '1px solid #cccccc'

            '&:after':
               content: '"\0020"'
               display: 'block'
               height: 0
               clear: 'both'
               overflow: 'hidden'
               visibility: 'hidden'

         '&.editing':
            padding: 0
            'border-bottom': 0

         '&.editing .display, &.edit':
            display: 'none'

         '&.editing .edit':
            display: 'block'

         '&.editing input':
            width: '444px'
            'font-size': '24px'
            'font-family': 'inherit'
            margin: 0
            'line-height': '1.6em'
            border: '0'
            outline: 'none'
            padding: '10px 7px 0px 27px'
            border: '1px solid #999999'
            'box-shadow': 'rgba(0, 0, 0, 0.2) 0 1px 2px 0 inset'

         '.check':
            position: 'relative'
            top: '9px'


   'render <div id="todoapp">': (render)->
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

        #{render.cell Stats, model: @model}

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

      @model.bind 'add',     @addOne.bind this
      @model.bind 'refresh', @addAll.bind this
      @model.bind 'all',     @render.bind this
      @model.fetch()

   # Add a single todo item to the list by creating a view for it, and
   # appending its element to the `<ul>`.
   addOne: (todo)->
      @$('#todo-list').append new TodoView(model: todo).el

   # Add all items in the **Todos** collection at once.
   addAll: ->
      @model.each (todo)=> @addOne todo

   # Generate the attributes for a new Todo item.
   newAttributes: ->
      content: @input.val()
      order:   @model.nextOrder()
      done:    false

   # If you hit return in the main input field, create new **Todo** model,
   # persisting it to *localStorage*.
   createOnEnter: (e)->
      if e.keyCode == 13
         @model.create @newAttributes()
         @input.val ''

   # Clear all done todo items, destroying their models.
   clearCompleted: ->
     _.each @model.done(), (todo)-> todo.clear()
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
