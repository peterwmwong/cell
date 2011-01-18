define -> ({getStyle,$},done)->
   $ 'div.a', (a)->
      equal a.innerHTML,
         'Hello <span id="firstName">Grace</span> <span id="lastName">Qiu</span>!'
         "Cell innerHTML should be modified by Cell's controller"
      
      $ '#firstName', (firstName)->
         equal getStyle( firstName, 'color' ),
            'rgb(255, 0, 0)',
            'Cell style should have applied red color to span#firstName'

         done()
