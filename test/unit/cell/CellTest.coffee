define ->
   $testObj: 'cell/Cell'

   '<init>()': (require,get) ->
      loadComponentsSpy = sinon.spy()
      require.def 'cell/util/loadComponents', [], -> loadComponentsSpy 
      get (Cell) ->
         mockCallback = ->
         ci = new Cell 'test name', mockCallback

         same ci.name, 'test name', '@name'
         same ci.status, 'loading', '@status'
         same ci.template, undefined, '@template'
         same ci.styling, undefined, '@styling'

         ok loadComponentsSpy.calledOnce, 'cell/util/loadComponents called once'
         same loadComponentsSpy.args[0].length, 5, 'cell/util/loadComponents passed 5 arguments'
         [name, ctrCb, tmpCb, styCb] = loadComponentsSpy.args[0]
         same name, 'test name', 'cell/util/loadComponents passed cell name'
         same typeof ctrCb, 'function', 'cell/util/loadComponents passed controller loaded callback function'
         same typeof tmpCb, 'function', 'cell/util/loadComponents passed template callback function'
         same typeof styCb, 'function', 'cell/util/loadComponents passed styling callback function'

         start()

