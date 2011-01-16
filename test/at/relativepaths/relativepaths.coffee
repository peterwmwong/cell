define -> ({document,getStyle,$},done)->
   console.log
   equal $('div.emailInfo').innerHTML,
      'Email: <span id="email">peter.wm.wong@gmail.com</span>'
      "Nested Cell should have been rendered"

   equal getStyle( $('#email'), 'color' ), 'rgb(255, 0, 0)', 'Nested Cell style should have applied red color to #email'

   done()
