define -> ({getStyle,$},done)->
   $ 'div.emailInfo', (emailInfo)->
      equal emailInfo.innerHTML.trim(),
         'Email: <span id="email">peter.wm.wong@gmail.com</span>'
         "Nested Cell should have been rendered"
      
      $ '#email', (email)->
         equal getStyle( email, 'color' ), 'rgb(255, 0, 0)', 'Nested Cell style should have applied red color to #email'
         done()
