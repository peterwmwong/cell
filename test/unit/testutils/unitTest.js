var unitTest = function(testObjName, tests){
   module(testObjName);
   
   // Cycle through each test
   for(var testName in tests){
      if(typeof test === 'function'){
         asyncTest(testName,(function(testName,test){
            // Create a new requirejs context
            require(
               {  baseUrl: '/src',
                  context: testObjName+': '+testName  },
               ['require'],
               function(require){
                  try{
                     test( require,
                           // Wrap 'getTestObject' function to catch
                           // any errors so QUnit doesn't hang
                           function(testObjectCallback){
                              require([testObjName],function(tobj){
                                 try{
                                    testObjectCallback(tobj);
                                 }catch(e){
                                    ok(false,'TEST EXCEPTION: '+e);
                                    start();
                                 }
                              });
                           }
                     );
                  }catch(e){
                     //catch any errors so QUnit doesn't hang
                     ok(false,'TEST EXCEPTION: '+e);
                     start();
                  }
               }
            );
         }).bind({},testName,tests[testName]));
      }
   }
};
