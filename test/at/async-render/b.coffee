cell.define
   css: ->
      """
      .#{@cell} > #firstName {
         color: #F00;
      }
      """

   render: ({firstName,lastName},done)->
      done """
           <div>
               Hello <span id='firstName'>#{firstName}</span> <span id='lastName'>#{lastName}</span>!
           </div>
           """
   on:
      rendered: ->
         @view('#firstName')[0].innerHTML = 'Grace'
