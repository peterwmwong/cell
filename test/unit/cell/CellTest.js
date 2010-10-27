unitTest(
   'cell/Cell',
   
   (function(){
      // Mock Objects
      var MockCell = function(){
                return {name:'something/TestCellName', template:{}};
             },
          MockTargetNode = function(){
                var _replaceChild = function(n){_this.test_replaceChild = n;}, 
                    _this = {
                       appendChild:function(n){_this.test_appendChild = n;},
                    };
                
                Object.defineProperty(_this,'parentNode',{
                   get:function(){
                      return {replaceChild:_replaceChild};
                   }
                });
                return _this;
             },
          MockCallback = function(){
             var _this = function(cell){
                _this.test_args = arguments;
                _this.test_cell = cell;
                ++_this.test_callCount;
             };
             _this.test_callCount = 0;
             return _this;
          },
          MockTemplateRenderer = function(){
             var _this = function(template,target,data,cb){
                   _this.test_args     = arguments;
                   _this.test_template = template;
                   _this.test_target   = target;
                   _this.test_data     = data;
                   _this.test_cb       = cb;
                   cb();
                };             
             return _this;
          },
          MockGetRenderData = function(){
             var _this = function(data,cb){
                _this.test_args = arguments;
                _this.test_data = data;
                cb(data);
             }
             return _this;
          }
      
      // Tests
      return {
         'Fields are correct' : function(require, getTestObj){
         
            getTestObj(function(Cell){
               var mCellName = 'mock/MockCell'
               var c = Cell(mCellName,function(cell){
                  same(cell.name,mCellName,'name field');
                  start();
               });
            });
         },

         'Loading bogus cell' : function(require, getTestObj){
         
            getTestObj(function(Cell){
               var mCellName = 'mock/BoGuSCell'
               var c = Cell(mCellName,function(cell){
                  same(cell.name,mCellName,'name field');
                  start();
               });
            });
         }
      };
   })()
);
