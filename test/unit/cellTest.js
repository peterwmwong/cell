unitTest(
   'cell',
   
   (function(){
      return {
         'cell() one cell': function(req,getCell){
            getCell(function(cell){
               cell('mock/mockCellOne',function(One){
                  ok(One,'Should find mock/mockCellOne');
                  ok(One.presenter.forAssert === 777,'Verify mockCellOne');
                  start();
               });
            });
         },

         'cell() multiple cells': function(req,getCell){
            getCell(function(cell){
               cell(['mock/mockCellOne','mock/mockCellTwo'],function(One,Two){
                  ok(One,'Should find mock/mockCellOne')
                  ok(One.presenter.forAssert === 777,'Verify mockCellOne');
                  ok(Two,'Should find mock/mockCellTwo')
                  ok(Two.presenter.forAssert === 888,'Verify mockCellOne');
                  start();
               });
            });
         }
      };
   })()
);

