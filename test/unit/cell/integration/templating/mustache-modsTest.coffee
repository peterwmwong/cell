define ->

   # Helper functions to verify data object passed to getPartial
   _isEmptyObj = (o)->
      typeof o == 'object' and Object.getOwnPropertyNames(o).length == 0

   _strictEqual = (expObj)->
      (o)-> strictEqual(o,expObj)

   _equalObj = (expObj)->
      (o)->
         try
            deepEqual(o,expObj)
            true
         catch e
            false

   # Helper that generates test case
   calling_with = (tmpl,data,getPartial,{getPartial_receives,returns})->
      (require,get,done)-> get ->
         getPartialSpy = sinon.spy getPartial
         rendered = window.Mustache.to_html tmpl, data, {getPartial: getPartialSpy}
         
         ok getPartialSpy.calledOnce , 'Should call getPartial() once'
         equal getPartialSpy.args[0][0], getPartial_receives[0], "Should call getPartial() with arg[0] == #{getPartial_receives[0]}"

         ok getPartial_receives[1](getPartialSpy.args[0][1]), "Should call getPartial() with arg[1] satisfying #{getPartial_receives[1]}"

         equal getPartialSpy.args[0][2], getPartial_receives[2], "Should call getPartial() with arg[0] == #{getPartial_receives[2]}"
         equal rendered, returns, "Should use return '#{returns}'"
         
         done()


   $testObj: '/deps/lib/mustache.js/mustache.js'

   $afterTest: (done)->
      delete window.Mustache
      done()

   'Mustache.to_html()': do ->
      calling_with '{{>CellName}}', (mockData = {contextStuff:'stuff'}), (-> 'test html'),
         getPartial_receives: ['CellName', _equalObj(mockData), undefined]
         returns: 'test html'

   'Mustache.to_html() template partial using $tag': do->
      calling_with '{{>CellName "$tag":"tr"}}', (mockData = {contextStuff:'stuff'}), (-> 'test html'),
         getPartial_receives: ['CellName', _equalObj(mockData), undefined, 'tr']
         returns: 'test html'

   'Mustache.to_html() template partial using $inherit-context:true': do->
      calling_with '{{>CellName "$inherit-context":true}}', (mockData = {mydata: {stuff:'stuff'}}), (-> 'test html'),
         getPartial_receives: ['CellName', _equalObj(mockData), undefined]
         returns: 'test html'

   'Mustache.to_html() template partial using $inherit-context:false': do->
      calling_with '{{>CellName "$inherit-context":false}}', (mockData = {mydata: {stuff:'stuff'}}), (-> 'test html'),
         getPartial_receives: ['CellName', _isEmptyObj, undefined]
         returns: 'test html'

   'Mustache.to_html() template partial $inherit-context NOT specified, same as $inherit-context:true': do->
      calling_with '{{>CellName}}', (mockData = {mydata: {stuff:'stuff'}}), (-> 'test html'),
         getPartial_receives: ['CellName', _equalObj(mockData), undefined]
         returns: 'test html'

   'Mustache.to_html() template partial using $inherit-context: <NOT BOOLEAN> is the same as true': do->
      calling_with '{{>CellName "$inherit-context":"asdf"}}', (mockData = {mydata: {stuff:'stuff'}}), (-> 'test html'),
         getPartial_receives: ['CellName', _equalObj(mockData), undefined]
         returns: 'test html'

   'Mustache.to_html() template partial using $id': do->
      calling_with '{{>CellName "$id":"myid"}}', (mockData = {contextStuff:'stuff'}), (-> 'test html'),
         getPartial_receives: ['CellName', _equalObj(mockData), 'myid']
         returns: 'test html'

   'Mustache.to_html() template partial with JSON data':
      calling_with '{{>CellName "mykey":"mydata", "mykey2":2}}', {contextStuff:'stuff'}, (-> 'test html'),
         getPartial_receives: ['CellName', _equalObj({contextStuff:'stuff', mykey:"mydata",mykey2:2}), undefined]
         returns: 'test html'

   'Mustache.to_html() template partial with JSON data and using $id':
      calling_with '{{>CellName "$id":"myid2", "mykey":"mydata", "mykey2":2}}', {contextStuff:'stuff'}, (-> 'test html'),
         getPartial_receives: ['CellName', _equalObj({contextStuff:'stuff', mykey:"mydata",mykey2:2}), "myid2"]
         returns: 'test html'

   'Mustache.to_html() template partial with JSON data and using $inherit-context:false':
      calling_with '{{>CellName "$inherit-context":false, "extraData":"yup", "someMore":"youGotIt"}}', {mydata: {stuff:'stuff'}}, (-> 'test html'),
         getPartial_receives: ['CellName', _equalObj({extraData:'yup',someMore:'youGotIt'}), undefined]
         returns: 'test html'

   'Mustache.to_html() template partial name with "/"': do->
      calling_with '{{>cells/CellName}}', (mockData = {contextStuff:'stuff'}), (-> 'test html'),
         getPartial_receives: ['cells/CellName', _equalObj(mockData), undefined]
         returns: 'test html'
