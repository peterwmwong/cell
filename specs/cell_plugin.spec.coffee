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

  it 'is an instanceof of Backbone.View and cell', ->
    expect(@testCell1 instanceof @cell.Cell).toBe true
    expect(@testCell1 instanceof Backbone.View).toBe true

