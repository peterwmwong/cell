window.Stats = Cell.extend
   'render <div>': ->
      """
      #{not (remaining = @model.remaining().length) and " " or
        "<span class='todo-count'>
          <span class='number'>#{remaining}</span>
          <span class='word'>#{ (remaining==1) and 'item' or 'items' }</span> left.
         </span>"
       }
      #{not (done = @model.done().length) and " " or
        "<span class='todo-clear'>
            <a href='#'>
               Clear <span class='number-done'>#{done}</span>
               completed <span class='word-done'>#{ (done == 1) and 'item' or 'items' }</span>
            </a>
         </span>"
       }
      """

   initialize: -> @model.bind 'all', @update.bind this
