define -> ({beforeEachRequire})->

  beforeEachRequire [
    'cell!fixtures/TestCell1'
    'cell'
  ], (@TestCell1,@cell)->
    @testCell1 = new @TestCell1

  it 'attaches <link> for stylesheet', ->
    expect(
      $('link[href="/specs/fixtures/TestCell1.css"][rel=stylesheet][type="text/css"]').length
    ).not.toBe 0

  it 'exposes @Cell', ->
    expect(@testCell1 instanceof @cell.Cell).toBe true

  it 'Creates a Backbone.View from the definition of the module', ->
    expect(@testCell1 instanceof Backbone.View).toBe true

  it 'overrides Backbone.View._ensureElement() to add a cell attribute', ->
    expect(@testCell1.$el.attr 'cell').toBe 'TestCell1'
