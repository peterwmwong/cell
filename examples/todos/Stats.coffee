window.Stats = Cell.extend
   css_href: 'Stats.css'

   'render <div class="Stats">': (R)->
      """
      #{R remaining = @model.remaining().length and "
          <span class='todo-count'>
            <span class='number'>#{remaining}</span>
            <span class='word'>#{ remaining==1 and 'item' or 'items' }</span> left.
          </span>"}
      #{R done = @model.done().length and "
          <span class='todo-clear'>
            <a href='#'>
              Clear <span class='number-done'>#{done}</span>
              completed <span class='word-done'>#{ done==1 and 'item' or 'items' }</span>
            </a>
           </span>"}
      """

   'bind model':
      all: 'update'
