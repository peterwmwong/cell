define ['../utils/spec-utils'], ({waitOne})->
  ({beforeEachRequire})->

    beforeEachRequire [
      'util/defer'
    ], (@defer)->

    describe 'defer(func:function)', ->

      it 'executes func at a later time', ->
        done = false
        @defer -> done = true
        expect(done).toBe false
        waitsFor (-> done), 'defer to callback'
        runs -> expect(done).toBe true
