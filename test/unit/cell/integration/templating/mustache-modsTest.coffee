define ->

   # Helper functions to verify data object passed to getPartial
   _isEmptyObj = (o)->
      typeof o == 'object' and Object.getOwnPropertyNames(o).length == 0

   _strictEqual = (expObj)->
      (o)-> expObj == o

   _equalObj = (expObj)->
      (o)->
         typeof o == 'object' and JSON.stringify(o) == JSON.stringify(expObj)

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

   'Mustache.to_html()':
      calling_with '{{>CellName}}', {contextStuff:'stuff'}, (-> 'test html'),
         getPartial_receives: ['CellName', _isEmptyObj, undefined]
         returns: 'test html'

   'Mustache.to_html() template partial using $tag': do->
      calling_with '{{>CellName "$tag":"tr"}}', {contextStuff:'stuff'}, (-> 'test html'),
         getPartial_receives: ['CellName', _isEmptyObj, undefined, 'tr']
         returns: 'test html'

   'Mustache.to_html() template partial using $data': do->
      calling_with '{{>CellName "$data":"mydata"}}', {mydata: mockData = {stuff:'stuff'}}, (-> 'test html'),
         getPartial_receives: ['CellName', _strictEqual(mockData), undefined]
         returns: 'test html'

   'Mustache.to_html() template partial using $data="."': do->
      calling_with '{{>CellName "$data":"."}}', mockData = {contextStuff:'stuff'}, (-> 'test html'),
         getPartial_receives: ['CellName', _strictEqual(mockData), undefined]
         returns: 'test html'

   'Mustache.to_html() template partial using $id':
      calling_with '{{>CellName "$id":"myid"}}', {contextStuff:'stuff'}, (-> 'test html'),
         getPartial_receives: ['CellName', _isEmptyObj, 'myid']
         returns: 'test html'

   'Mustache.to_html() template partial with JSON data':
      calling_with '{{>CellName "mykey":"mydata", "mykey2":2}}', {contextStuff:'stuff'}, (-> 'test html'),
         getPartial_receives: ['CellName', _equalObj({mykey:"mydata",mykey2:2}), undefined]
         returns: 'test html'

   'Mustache.to_html() template partial with JSON data and using $id':
      calling_with '{{>CellName "$id":"myid2", "mykey":"mydata", "mykey2":2}}', {contextStuff:'stuff'}, (-> 'test html'),
         getPartial_receives: ['CellName', _equalObj({mykey:"mydata",mykey2:2}), "myid2"]
         returns: 'test html'

   'Mustache.to_html() template partial with JSON data and using $data': do->
      calling_with '{{>CellName "$data":"mydata", "dataThatWont":"beUsed", "because":"$dataTakesPrecedence"}}', {mydata: mockData = {stuff:'stuff'}}, (-> 'test html'),
         getPartial_receives: ['CellName', _strictEqual(mockData), undefined]
         returns: 'test html'

   'Mustache.to_html() template partial name with "/"':
      calling_with '{{>cells/CellName}}', {contextStuff:'stuff'}, (-> 'test html'),
         getPartial_receives: ['cells/CellName', _isEmptyObj, undefined]
         returns: 'test html'
