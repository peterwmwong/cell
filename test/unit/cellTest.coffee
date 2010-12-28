define ->
   defer = (func) -> setTimeout func, 1000
   MockCell = (n,t,s)->
      this.name = n
      this.template = t
      this.style = s

   $testObj: 'cell'
   $beforeTest: (require,done)->
      require.def 'cell/Cell', [], -> MockCell
      require ['cell/Cell'], done

   "require(cell!) should not load cell that doesn't exist": (require,get,done)->
      get (cellPlugin)->
         loaded = false
         require ['cell!/blarg/blarg'],
            (mockCell)->
               ok not loaded, 'Should NOT load a non-existent cell'
               done()
            (loaded,failed)->
               ok 'cell!/blarg/blarg' not of loaded, 'non-existent cell should NOT be in loaded map'
               ok 'cell!/blarg/blarg' of failed, 'non-existent cell should be in failed map'
               done()

   "define(cell!) should provide cell reference to cell's js": (require, get, done)->
      get (cellPlugin) ->
         require ['cell!/mocks/jsOnly'], (mockCell)->
            ok mockCell instanceof MockCell, 'cell should be an instanceof cell/Cell'
            ok mockCell.jsSpy.calledOnce and mockCell.jsSpy.calledWithExactly(mockCell), 'js called once and passed cell reference'
            done()
  
   'require(cell!) should load multiple cells': (require, get, done)->
      get (cellPlugin)->
         require ['cell!/mocks/tmplStyleJS','cell!/mocks/jsOnly'], (tmplStyleJS, jsOnly)->

            ok tmplStyleJS instanceof MockCell, 'cell should be an instanceof cell/Cell'
            equal tmplStyleJS.name, '/mocks/tmplStyleJS', 'Should have loaded template'
            equal tmplStyleJS.template, 'tmplStyleJS template', 'Should have loaded template'
            equal tmplStyleJS.style, 'tmplStyleJS style', 'Should have loaded style'
            ok tmplStyleJS.jsSpy.calledOnce, 'Should have loaded js'

            ok jsOnly instanceof MockCell, 'cell should be an instanceof cell/Cell'
            equal jsOnly.name, '/mocks/jsOnly', 'Should NOT have loaded template'
            equal jsOnly.template, undefined, 'Should NOT have loaded template'
            equal jsOnly.style, undefined, 'Should NOT have loaded style'
            ok jsOnly.jsSpy.calledOnce, 'Should have loaded js'
            done()

   'require(cell!) should load cell w/ template, style, and js': (require, get, done)->
      get (cellPlugin)->
         require ['cell!/mocks/tmplStyleJS'], (mockCell)->
            ok mockCell instanceof MockCell, 'cell should be an instanceof cell/Cell'
            equal mockCell.name, '/mocks/tmplStyleJS', 'Should have loaded template'
            equal mockCell.template, 'tmplStyleJS template', 'Should have loaded template'
            equal mockCell.style, 'tmplStyleJS style', 'Should have loaded style'
            ok mockCell.jsSpy.calledOnce, 'Should have loaded js'
            done()

   'require(cell!) should load cell w/ template and js': (require, get, done)->
      get (cellPlugin)->
         require ['cell!/mocks/tmplJS'], (mockCell)->
            ok mockCell instanceof MockCell, 'cell should be an instanceof cell/Cell'
            equal mockCell.name, '/mocks/tmplJS', 'Should have loaded template'
            equal mockCell.template, 'tmplJS template', 'Should have loaded template'
            equal mockCell.style, undefined, 'Should NOT have loaded style'
            ok mockCell.jsSpy.calledOnce, 'Should have loaded js'
            done()

   'require(cell!) should load cell w/ template': (require, get, done)->
      get (cellPlugin)->
         require ['cell!/mocks/tmpl'], (mockCell)->
            ok mockCell instanceof MockCell, 'cell should be an instanceof cell/Cell'
            equal mockCell.name, '/mocks/tmpl', 'Should have loaded template'
            equal mockCell.template, 'tmpl template', 'Should have loaded template'
            equal mockCell.style, undefined, 'Should NOT have loaded style'
            equal mockCell.jsSpy, undefined, 'Should NOT have loaded js'
            done()

   'require(cell!) should load cell w/ js': (require, get, done)->
      get (cellPlugin)->
         require ['cell!/mocks/jsOnly'], (mockCell)->
            ok mockCell instanceof MockCell, 'cell should be an instanceof cell/Cell'
            equal mockCell.name, '/mocks/jsOnly', 'Should NOT have loaded template'
            equal mockCell.template, undefined, 'Should NOT have loaded template'
            equal mockCell.style, undefined, 'Should NOT have loaded style'
            ok mockCell.jsSpy.calledOnce, 'Should have loaded js'
            done()

   'require(cell!) called more then once, should only load js once': (require,get,done)->
      get (cellPlugin)->
         require ['cell!/mocks/jsOnly'], (mockCell1)->
            ok mockCell1.jsSpy.calledOnce, "js called once"
            require ['cell!/mocks/jsOnly'], (mockCell2)->
               equal mockCell1, mockCell2, "cell should be the same"
               ok mockCell2.jsSpy.calledOnce, "js called once"
               done()

