define -> ({getStyle,$$},done)->
   $$ '.table td', (tds)->
      equal tds[0].innerHTML, 'peter', 'table row 0 col 0 should be "peter"'
      equal tds[1].innerHTML, 'grace', 'table row 0 col 0 should be "grace"'
      done()
