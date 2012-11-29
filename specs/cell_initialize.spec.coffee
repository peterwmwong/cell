define ->

  ({beforeEachRequire})->

    beforeEachRequire [
      'cell!fixtures/TestCell1'
    ], (@TestCell1)->
      @testCell1 = new @TestCell1

    describe '@initialize()', ->

      it "sets cell's element with 'cell' and 'cell_cid' attributes", ->
        expect(@testCell1.el.getAttribute 'cell').toBe 'TestCell1'
        expect(@testCell1.el.getAttribute 'cell_cid').toBe @testCell1.cid