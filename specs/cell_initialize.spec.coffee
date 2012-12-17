define ->

  ({beforeEachRequire})->

    beforeEachRequire [
      'fixtures/TestCell1'
    ], (@TestCell1)->
      @testCell1 = new @TestCell1

    describe '@initialize()', ->

      it "sets cell's element with 'cell' and 'cellCid' attributes", ->
        expect(@testCell1.el.getAttribute 'cell').toBe 'TestCell1'
        expect(@testCell1.el.getAttribute 'cellcid').toBe @testCell1.cid