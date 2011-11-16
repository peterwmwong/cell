define ->

  testRender = (render, expectedInnerHTML)->
    NewCell = cell.extend {render}
    equal new NewCell().el.innerHTML, expectedInnerHTML, "@el.innerHTML"

  "cell.render = -> <NOT AN ARRAY>": ->
    for invalid in [undefined, null, (->), 5, 'testString', document.createElement('a')] then do(invalid)->
      testRender (-> invalid), ""

  "cell.render = -> []": ->
    testRender (-> []), ""

  "cell.render = -> [ undefined, null, (->) ]": ->
    testRender (-> [ undefined, null, (->) ]), ""
    
  "cell.render = -> [ <number>, <string> ]": ->
    testRender (-> [ 5, 'testString' ]), "5testString"

  "cell.render = -> [ <DOM NODE> ]": ->
    testRender (-> [ document.createElement 'a' ]), "<a></a>"

  "cell.render = -> [ <DOM NODE>, <string>, <number> ]": ->
    testRender (-> [
      document.createElement 'a'
      'testString'
      7
    ]), "<a></a>testString7"

