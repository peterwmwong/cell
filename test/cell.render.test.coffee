define ->

  testRender = (render, expectedInnerHTML)->
    NewCell = cell.extend {render}
    equal new NewCell().el.innerHTML, expectedInnerHTML, "@el.innerHTML"

  "cell.render = -> []": ->
  	testRender (-> []), ""

  "cell.render = -> undefined": ->
    testRender (-> undefined), ""

  "cell.render = -> null": ->
    testRender (-> null), ""

  "cell.render = -> [ undefined, null, (->) ]": ->
    testRender (-> [ undefined, null, (->) ]), ""
    
  "cell.render = -> [ <number>, <string> ]": ->
    testRender (-> [ 5, 'testString' ]), "5testString"

  "cell.render = -> [ <DOM NODE> ]": ->
    testRender (-> [ document.createElement 'a' ]), "<a></a>"
