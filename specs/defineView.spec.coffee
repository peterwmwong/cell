define ['jquery'], ($)-> ({beforeEachRequire})->

  beforeEachRequire [
    'fixtures/TestCell1'
    'cell/View'
  ], (@TestCell1, @View)->
    @testCell1 = new @TestCell1

  it 'attaches <link> for stylesheet', ->
    expect(
      $('link[href$="specs/fixtures/TestCell1.css"][rel=stylesheet][type="text/css"]').length
    ).not.toBe 0

  it 'exposes @View', ->
    expect(@testCell1 instanceof @View).toBe true

  it 'modifies rendering to automatically add cell attribute', ->
    expect(@testCell1.el.getAttribute 'cell').toBe 'TestCell1'

  it 'modifies rendering to automatically add class', ->
    expect(@testCell1.el.className).toBe 'TestCell1'
