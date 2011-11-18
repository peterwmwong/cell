define ->

  testRender = (render, expectedInnerHTML)->
    NewCell = cell.extend {render}
    strictEqual new NewCell().el.innerHTML, expectedInnerHTML, "@el.innerHTML"


  "called with cell renderHelper (cell::$R)": ->
    NewCell = cell.extend render: render = sinon.spy()
    instance = new NewCell()
    ok render.calledOnce, 'render() called once'
    deepEqual render.getCall(0).args[0], cell::$R, 'render() was passed cell.prototype.$R (cell render helper)'
    ok (typeof render.getCall(0).args[1] is 'function'), 'render() was passed a function (asynchronous render helpser)'

  "-> <NOT AN ARRAY>": ->
    for invalid in [undefined, null, (->), 5, 'testString', document.createElement('a')] then do(invalid)->
      testRender (-> invalid), ""

  "-> []": ->
    testRender (-> []), ""

  "-> [ undefined, null, (->) ]": ->
    testRender (-> [ undefined, null, (->) ]), ""
    
  "-> [ <number>, <string> ]": ->
    testRender (-> [ 5, 'testString' ]), "5testString"

  "-> [ <DOM NODE> ]": ->
    testRender (-> [ document.createElement 'a' ]), "<a></a>"

  "-> [ <DOM NODE>, <string>, <number> ]": ->
    testRender (-> [
      document.createElement 'a'
      'testString'
      7
    ]), "<a></a>testString7"

