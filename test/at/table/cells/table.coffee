cell.define
   render: ({rows},done)->
      done """
           <table>
               #{@render.each rows, './row'}
           </table>
           """
