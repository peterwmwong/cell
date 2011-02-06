cell.define
   render: ({firstName,lastName,email})->
      """
      <div>
         Hello <span id='firstName'>#{firstName}</span>
         <span id='lastName'>#{lastName}</span>!<br/>
         #{@render './otherCells/emailInfo' email}
      </div>
      """
