define ->
   waitdo = (delay,f)-> setTimeout f,delay
   test = (f)-> (require,get,done)-> get ->
      f (new Function(@testName))(), done

   $testObj: 'Cell'
   $beforeTest: (require,done)->
      delete window.Cell
      done()
   
   """
   return Cell.extend({render:function(){return 'testRender';}});
   """: test (_,done)->
      done()


   """
   var desc = {
         'render <span class="myclass" id="theId" style="background-color:#FFF; display:block">': function(){
            return "testRender";
         }
       };
   Cell.prototype.__addRenderProps.call(desc);
   return desc;
   """: test ({__renderTag,__render,__renderTagId,__renderStartTag,__renderEndTag},done)->
      strictEqual __renderTag, 'span', '.__renderTag'
      strictEqual __render?(), 'testRender', '.__render()'
      strictEqual __renderStartTag, '<span class="myclass" id="theId" style="background-color:#FFF; display:block">', '.__renderStartTag'
      strictEqual __renderEndTag, '</span>', '.__renderEndTag'
      done()

   """
   var desc = {
         'render <span>': function(){ return "testRender"; }
       };
   Cell.prototype.__addRenderProps.call(desc);
   return desc;
   """: test ({__renderTag,__render,__renderStartTag,__renderEndTag},done)->
      strictEqual __renderTag, 'span', '.__renderTag'
      strictEqual __render?(), 'testRender', '.__render()'
      strictEqual __renderStartTag, '<span>', '.__renderStartTag'
      strictEqual __renderEndTag, '</span>', '.__renderEndTag'
      done()
   """

   var desc = {
         'render <span': function(){ return "testRender"; }
       };
   Cell.prototype.__addRenderProps.call(desc);
   return desc;
   """: test ({__renderTag,__render,__renderStartTag,__renderEndTag},done)->
      strictEqual __renderTag, 'div', '.__renderTag'
      strictEqual __render?(), 'testRender', '.__render()'
      strictEqual __renderStartTag, '<div>', '.__renderStartTag'
      strictEqual __renderEndTag, '</div>', '.__renderEndTag'
      done()

   """
   var desc = {
         'render': function(){ return "testRender"; }
       };
   Cell.prototype.__addRenderProps.call(desc);
   return desc;
   """: test ({__renderTag,__render,__renderStartTag,__renderEndTag},done)->
      strictEqual __renderTag, 'div', '.__renderTag'
      strictEqual __render?(), 'testRender', '.__render()'
      strictEqual __renderStartTag, '<div>', '.__renderStartTag'
      strictEqual __renderEndTag, '</div>', '.__renderEndTag'
      done()

   """
   var desc = {
         'rende': function(){ return "testRender"; }
       };
   Cell.prototype.__addRenderProps.call(desc);
   return desc;
   """: test ({__renderTag,__render,__renderStartTag,__renderEndTag},done)->
      strictEqual __renderTag, undefined, '.__renderTag'
      strictEqual __render?(), undefined, '.__render()'
      strictEqual __renderStartTag, undefined, '.__renderStartTag'
      strictEqual __renderEndTag, undefined, '.__renderEndTag'
      done()

   """
   var desc = {
         'render': []
       };
   try {
      Cell.prototype.__addRenderProps.call({render:[]});
   }catch(e){
      return true;
   }
   """: test (_,done)->
      strictEqual _, true, 'Should throw error if render function is NOT a function'
      done()

   """
   var ExtCell = Cell.extend({
         render:function(){ return 'testRender'; }
       }),
       parentNode = document.createElement('div');
   return { cell: new ExtCell(parentNode), parentNode: parentNode }
   """: test ({cell,parentNode},done)->
      ok cell instanceof Cell, 'should be an instanceof Cell'
      strictEqual cell.node, parentNode.children[0], 'should have rendered node to parentNode'
      done()

   ###
   """
   return Cell.extend({
      'render <span>':function(options,done){
         done(options.key);
      }
   }).renderHTML({key:"value"});
   """: test (_,done)->
      strictEqual _, "<span>value</span>"
      done()

   """
   // All combinations rendering a nested Cells asynchronously, deferred asynchronously, and synchronously
   var DeferAsync = Cell.extend({
      render:function(options,done){
         setTimeout(function(){
            done("DeferAsync: "+options);
         },100);
      }
   });
   var Async = Cell.extend({
      render:function(options,done){
         done("Async: "+options);
      }
   });
   var Sync = Cell.extend({
      render:function(options,done){
         return "Sync: "+options;
      }
   });

   function renderAll(options){
      return Sync.renderHTML(options)+Async.renderHTML(options)+DeferAsync.renderHTML(options);
   }

   return {
      DeferAsyncParent: Cell.extend({
         render: function(options,done){
            setTimeout(function(){
               debugger;
               done(renderAll(options));
            },100);
         }
      }).renderElement('DeferAsyncParent'),

      AsyncParent: Cell.extend({
         render:function(options,done){
            done(renderAll(options));
         }
      }).renderElement('AsyncParent'),

      SyncParent: Cell.extend({
         render: renderAll
      }).renderElement('SyncParent'),
   };
   """: test ({DeferAsyncParent, AsyncParent, SyncParent},done)->
      window.DeferAsyncParent = DeferAsyncParent
      window.AsyncParent = AsyncParent
      window.SyncParent = SyncParent
      strictEqual DeferAsyncParent.innerHTML, '', 'DeferAsyncParent innerHTML should be empty'
      strictEqual AsyncParent.innerHTML, '<div>Sync: AsyncParent</div><div>Async: AsyncParent</div><div id="__cell_4__"></div>', 'AsyncParent innerHTML should have rendered Sync and Async Cells'
      strictEqual SyncParent.innerHTML,  '<div>Sync: SyncParent</div><div>Async: SyncParent</div><div id="__cell_8__"></div>',   'SyncParent innerHTML should have rendered Sync and Async Cells'

      # Wait for DeferAsync to render
      waitdo 101, ->
         strictEqual DeferAsyncParent.innerHTML, '<div>Sync: DeferAsyncParent</div><div>Async: DeferAsyncParent</div><div id="__cell_11__"></div>', 'DeferAsyncParent innerHTML should have rendered Sync and Async Cells'
         strictEqual AsyncParent.innerHTML,      '<div>Sync: AsyncParent</div><div>Async: AsyncParent</div><div>DeferAsync: AsyncParent</div>',         'AsyncParent innerHTML should have rendered Sync, Async, and DeferAsync Cells'
         strictEqual SyncParent.innerHTML,       '<div>Sync: SyncParent</div><div>Async: SyncParent</div><div>DeferAsync: SyncParent</div>',            'SyncParent innerHTML should have rendered Sync, Async, and DeferAsync Cells'

         # Wait for DeferAsync to render
         waitdo 101, ->
            strictEqual DeferAsyncParent.innerHTML,
               '<div>Sync: DeferAsyncParent</div><div>Async: DeferAsyncParent</div>DeferAsync: DeferAsyncParent</div>',
               'DeferAsyncParent innerHTML should have rendered Sync, Async, and DeferAsync Cells'
            done()
   ###
