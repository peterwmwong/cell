cell.define
   css: ->
      """
      #{@cell} > #email {
         color: #F00;
      }
      """
   render: (email)->
      """
      <div>
         Email: <span id='email'>{{email}}</span>
      </div>
      """
