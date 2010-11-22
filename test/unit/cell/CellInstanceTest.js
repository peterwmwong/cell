unitTest(
   'cell/CellInstance',
   
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
             var _this = function(){_this.test_args = arguments; ++_this.test_callCount;};
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
                _this.test_sendData = {};
                cb(_this.test_sentData);
             }
             return _this;
          }
      
      // Tests
      return {
         'Fields are correct' : function(require, getTestObj){
            require.def('cell/config',[],function(){
               return {
                  defaultTemplateRenderer: {value:MockTemplateRenderer()}
               };
            });
            
            getTestObj(function(CellInstance){

               var mCell = MockCell(),
                   mInstId = 0,
                   mTargetNode = MockTargetNode(),
                   mReplaceNode = false,
                   mCallBack = MockCallback(),
                   mData = {};
                 
               var ci = CellInstance( 
                           mCell, mInstId, undefined, mTargetNode,
                           mReplaceNode, mData, mCallBack);
   
               same(ci.cell, mCell, 
                    'cell field');
               same(ci.data, mData, 
                    'data field');
   
               start();
            });
         },
   
         'Using cell/config defaultTemplateRenderer' : function(require, getTestObj){
            var mTplRenderer = MockTemplateRenderer();
            require.def('cell/config',[],function(){
               return {
                  defaultTemplateRenderer: {value: mTplRenderer}
               };
            });
            
            getTestObj(function(CellInstance){
               var mCell = MockCell(),
                   mInstId = 0,
                   mTargetNode = MockTargetNode(),
                   mReplaceNode = false,
                   mCallBack = MockCallback(),
                   mData = {};
                   
               var ci = CellInstance( 
                           mCell, mInstId, undefined, mTargetNode,
                           mReplaceNode, mData, mCallBack);
               
               ok(mTplRenderer.test_args !== undefined, 
                  'cell/config defaultTemplateRenderer called');
               
               same(mTplRenderer.test_template,mCell,
                  'template argument');
               
               same(mTplRenderer.test_data,mData,
                  'data argument');
   
               same(mTplRenderer.test_target.className, 'something_TestCellName',
                  'target argument has correct className');
               
               same(mCallBack.test_callCount,1,
                  'callback argument called once');
               ok(mCallBack.test_args.length === 1, 
                  'callback argument passed 1 argument');
               same(mCallBack.test_args[0],ci, 
                  'callback argument passed CellInstance');
               
               start();
            });
         },

         'Using Delegate templateRenderer' : function(require, getTestObj){
            var mConfig_TplRenderer = MockTemplateRenderer();
            // Define cell/config with mock config 
            require.def('cell/config',[],function(){
               return {
                  defaultTemplateRenderer: {value: mConfig_TplRenderer}
               };
            });
            
            
            getTestObj(function(CellInstance){
               var mCell = MockCell(),
                   mInstId = 0,
                   mTargetNode = MockTargetNode(),
                   mReplaceNode = false,
                   mCallBack = MockCallback(),
                   mDelegates = {
                      templateRenderer: MockTemplateRenderer(),
                      getRenderData: MockGetRenderData()
                   },
                   mData = {};
               
               var ci = CellInstance( 
                           mCell, mInstId, mDelegates, mTargetNode,
                           mReplaceNode, mData, mCallBack);
               
               ok(mConfig_TplRenderer.test_args === undefined, 
                  'cell/config defaultTemplateRenderer should NOT be called');
               
               same(mDelegates.templateRenderer.test_template,mCell,
                  'Delegate templateRenderer passed correct template argument');
               
               same(mDelegates.templateRenderer.test_data,mDelegates.getRenderData.test_sentData,
                  'Delegate templateRenderer passed correct data argument');
   
               same(mDelegates.templateRenderer.test_target.className, 'something_TestCellName',
                  'Delegate templateRenderer passed correct target argument (className attribute === mangled cell name)');
               
               ok(mCallBack.test_callCount === 1,
                  'callback called once');
               ok(mCallBack.test_args.length === 1, 
                  'callback passed 1 argument');
               same(mCallBack.test_args[0],ci, 
                  'callback passed CellInstance');
               
               start();
            });
         },
         
         'Using Delegate getRenderData' : function(require, getTestObj){
            getTestObj(function(CellInstance){
               var mCell = MockCell(),
                   mInstId = 0,
                   mTargetNode = MockTargetNode(),
                   mReplaceNode = false,
                   mCallBack = MockCallback(),
                   mDelegates = {
                      templateRenderer: MockTemplateRenderer(),
                      getRenderData: MockGetRenderData()
                   },
                   mData = {};
               
               var ci = CellInstance( 
                           mCell, mInstId, mDelegates, mTargetNode,
                           mReplaceNode, mData, mCallBack);
                              
               same(mDelegates.getRenderData.test_args.length,2,
                  'Delegate getRenderData passed 2 arguments');
               
               same(mDelegates.getRenderData.test_data,mData,
                  'Delegate getRenderData passed correct data argument');
               
               same(ci.data,mDelegates.getRenderData.test_sentData,
                  'Data from Delegate getRenderData used by CellInstance');

               same(mDelegates.templateRenderer.test_data,mDelegates.getRenderData.test_sentData,
                  'Data from Delegate getRenderData passed to Delegate templateRenderer');
   
               start();
            });
         },

         'Can appended to Target Node' : function(require, getTestObj){
            getTestObj(function(CellInstance){
               var mCell = MockCell(),
                   mInstId = 0,
                   mTargetNode = MockTargetNode(),
                   mReplaceNode = false,
                   mCallBack = MockCallback(),
                   mDelegates = {
                      templateRenderer: MockTemplateRenderer(),
                      getRenderData: MockGetRenderData()
                   },
                   mData = {};
               
               var ci = CellInstance( 
                           mCell, mInstId, mDelegates, mTargetNode,
                           mReplaceNode, mData, mCallBack);
               
               ok(mTargetNode.test_replaceChild === undefined,
                  'Replace Target Node was NOT attempted');
               same(mTargetNode.test_appendChild,ci.node,
                  'Node appended to Target Node');
   
               start();
            });
         },
         
         'Can replace Target Node' : function(require, getTestObj){
            getTestObj(function(CellInstance){
               var mCell = MockCell(),
                   mInstId = 0,
                   mTargetNode = MockTargetNode(),
                   mReplaceNode = true,
                   mCallBack = MockCallback(),
                   mDelegates = {
                      templateRenderer: MockTemplateRenderer(),
                      getRenderData: MockGetRenderData()
                   },
                   mData = {};
               
               var ci = CellInstance( 
                           mCell, mInstId, mDelegates, mTargetNode,
                           mReplaceNode, mData, mCallBack);
               
               ok(mTargetNode.test_appendChild === undefined,
                  'Append to Target Node was NOT attempted');
               same(mTargetNode.test_replaceChild,ci.node,
                  'Node replaced Target Node');
   
               start();
            });
         }
      };
   })()
);
