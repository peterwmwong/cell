define ->
   defer = (func) -> setTimeout func, 1000

   $testObj: 'cell'

   "require(cell!) should not load cell that doesn't exist": (require,get,done)->
      get (cellPlugin)->
         loaded = false
         require ['cell!/blarg/blarg'], (mockCell)->
            loaded = true
         
         defer ()->
            ok not loaded, 'Should NOT load a non-existent cell'
            done()

   "define(cell!) should provide cell reference to cell's js": (require, get, done)->
      get (cellPlugin) ->
         require ['cell!/test/unit/mock/jsOnly'], (mockCell)->
            ok mockCell.jsSpy.calledOnce, "js called once"
            equal mockCell.jsSpy.args[0].length, 1, 'js passed 1 arg'
            equal mockCell.jsSpy.args[0][0], mockCell, 'js passed cell reference'
            done()
  
   'require(cell!) should load multiple cells': (require, get, done)->
      get (cellPlugin)->
         require ['cell!/test/unit/mock/tmplStyleJS','cell!/test/unit/mock/jsOnly'], (tmplStyleJS, jsOnly)->
            equal tmplStyleJS.template, 'tmplStyleJS template', 'Should have loaded template'
            equal tmplStyleJS.style, 'tmplStyleJS style', 'Should have loaded style'
            ok tmplStyleJS.jsSpy.calledOnce, 'Should have loaded js'

            equal jsOnly.template, undefined, 'Should NOT have loaded template'
            equal jsOnly.style, undefined, 'Should NOT have loaded style'
            ok jsOnly.jsSpy.calledOnce, 'Should have loaded js'
            done()

   'require(cell!) should load cell w/ template, style, and js': (require, get, done)->
      get (cellPlugin)->
         require ['cell!/test/unit/mock/tmplStyleJS'], (mockCell)->
            equal mockCell.template, 'tmplStyleJS template', 'Should have loaded template'
            equal mockCell.style, 'tmplStyleJS style', 'Should have loaded style'
            ok mockCell.jsSpy.calledOnce, 'Should have loaded js'
            done()

   'require(cell!) should load cell w/ template and js': (require, get, done)->
      get (cellPlugin)->
         require ['cell!/test/unit/mock/tmplJS'], (mockCell)->
            equal mockCell.template, 'tmplJS template', 'Should have loaded template'
            equal mockCell.style, undefined, 'Should NOT have loaded style'
            ok mockCell.jsSpy.calledOnce, 'Should have loaded js'
            done()

   'require(cell!) should load cell w/ template': (require, get, done)->
      get (cellPlugin)->
         require ['cell!/test/unit/mock/tmpl'], (mockCell)->
            equal mockCell.template, 'tmpl template', 'Should have loaded template'
            equal mockCell.style, undefined, 'Should NOT have loaded style'
            equal mockCell.jsSpy, undefined, 'Should NOT have loaded js'
            done()

   'require(cell!) should load cell w/ js': (require, get, done)->
      get (cellPlugin)->
         require ['cell!/test/unit/mock/jsOnly'], (mockCell)->
            equal mockCell.template, undefined, 'Should NOT have loaded template'
            equal mockCell.style, undefined, 'Should NOT have loaded style'
            ok mockCell.jsSpy.calledOnce, 'Should have loaded js'
            done()

   'require(cell!) called more then once, should only load js once': (require,get,done)->
      get (cellPlugin)->
         require ['cell!/test/unit/mock/jsOnly'], (mockCell)->
            ok mockCell.jsSpy.calledOnce, "js called once"
            require ['cell!/test/unit/mock/jsOnly'], (mockCell)->
               ok mockCell.jsSpy.calledOnce, "js called once"
               done()

