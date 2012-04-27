define -> ({beforeEachRequire})->

  beforeEachRequire ['cell!fixtures/TestCell1'], (@TestCell1)->
    @testCell1 = new @TestCell1

  it 'is an instanceof of cell', ->
    expect(@testCell1 instanceof cell).toBe true

  it 'is an instanceof of Backbone.View', ->
    expect(@testCell1 instanceof Backbone.View).toBe true
