define ->

  testRender = (render, expectedInnerHTML)->
    render_spy = sinon.spy render
    NewCell = cell.extend {render: render_spy}
    instance = new NewCell()
    strictEqual instance.el.innerHTML, expectedInnerHTML, "@el.innerHTML"
    ok render_spy.calledOnce, 'called once'
    ok render_spy.calledOn(instance) , 'called with "this" set to cell instance'


  "called with cell renderHelper (cell::_)": ->
    NewCell = cell.extend render: render = sinon.spy()
    instance = new NewCell()
    ok render.calledOnce, 'render() called once'
    ok render.getCall(0).calledWith(cell::_), 'render() was passed cell.prototype._ (cell render helper)'

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

