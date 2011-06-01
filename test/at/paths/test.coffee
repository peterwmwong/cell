define -> (done)->
  hasOneOfEach = (sels)=>
    for s in sels
      equal @$(s).length, 1, "Expected #{s}"

  hasOneOfEach [
    'body > .A'
    'body > .A > .B'
    'body > .A > .B > .D'
    'body > .A > .B > .D > .E'
    'body > .A > .C'
    'body > .A > .C > .D'
    'body > .A > .C > .D > .E'
  ]

  equal @$('body > .A > .B > .D > p').html(), "D(0)"
  equal @$('body > .A > .B > .D > .E > p').html(), "E(0)"
  equal @$('body > .A > .C > .D > p').html(), "D(1)"
  equal @$('body > .A > .C > .D > .E > p').html(), "E(1)"

  hasOneOfEach [
    'head > link[href="./A.css"]'
    'head > link[href="./dir/B.css"]'
    'head > link[href="./dir/C.css"]'
    'head > link[href="./dir/dir/D.css"]'
    'head > link[href="./dir/dir/../../E.css"]'
  ]

  done()

