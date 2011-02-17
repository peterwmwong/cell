define ->
   waitdo = (delay,f)-> setTimeout f,delay
   test = (f)-> (require,get,done)-> get ->
      f (new Function(@testName))(), done

   $testObj: 'Cell'
   $beforeTest: (require,done)->
      delete window.Cell
      done()

   ### 
   """
   var desc = {
         'render <span class="myclass" id="theId" style="background-color:#FFF; display:block">': function(){
            return "testRender";
         }
       };
   Cell.prototype.__addRenderProps.call(desc);
   return desc;
   """: test ({__renderTagName,__render,__renderOuterHTML},done)->
      strictEqual __renderTagName, 'span', '.__renderTag'
      strictEqual __render?(), 'testRender', '.__render()'
      strictEqual __renderOuterHTML, '<span class="myclass" id="theId" style="background-color:#FFF; display:block"></span>', '.__renderOuterHTML'
      done()

   """
   var desc = {
         'render <span>': function(){ return "testRender"; }
       };
   Cell.prototype.__addRenderProps.call(desc);
   return desc;
   """: test ({__renderTagName,__render,__renderOuterHTML},done)->
      strictEqual __renderTagName, 'span', '.__renderTag'
      strictEqual __render?(), 'testRender', '.__render()'
      strictEqual __renderOuterHTML, '<span></span>', '.__renderOuterHTML'
      done()
   """

   var desc = {
         'render <span': function(){ return "testRender"; }
       };
   Cell.prototype.__addRenderProps.call(desc);
   return desc;
   """: test ({__renderTagName,__render,__renderOuterHTML},done)->
      strictEqual __renderTagName, 'div', '.__renderTag'
      strictEqual __render?(), 'testRender', '.__render()'
      strictEqual __renderOuterHTML, '<div></div>', '.__renderOuterHTML'
      done()

   """
   var desc = {
         'render': function(){ return "testRender"; }
       };
   Cell.prototype.__addRenderProps.call(desc);
   return desc;
   """: test ({__renderTagName,__render,__renderOuterHTML},done)->
      strictEqual __renderTagName, 'div', '.__renderTag'
      strictEqual __render?(), 'testRender', '.__render()'
      strictEqual __renderOuterHTML, '<div></div>', '.__renderOuterHTML'
      done()

   """
   var desc = {
         'rende': function(){} 
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
   ###

   """
   // Sync Render
   var MyCell = Cell.extend({
      render: function(options,render){
         return options.key;
      }
   });
   return new MyCell({key:'value'});
   """: test (_,done)->
      strictEqual _.node.innerHTML, 'value'
      done()

   """
   // Async Render
   var MyCell = Cell.extend({
      render: function(options,render){
         return options.key;
      }
   });
   return new MyCell({key:'value'});
   """: test (_,done)->
      strictEqual _.node.innerHTML, 'value'
      done()


   """
   // Deferred Async Render
   var MyCell = Cell.extend({
      render: function(options,render){
         setTimeout(function(){
            render.async(options.key);
         },100);
      }
   });
   return new MyCell({key:'value'});
   """: test (_,done)->
      strictEqual _.node.innerHTML, ''
      waitdo 101, ->
         strictEqual _.node.innerHTML, 'value'
         done()


   """
   // render.node((cellType:Cell, [model:Object])*)
   var MyCell = Cell.extend({
      render: function(options,render){
         var nestedNode = document.createElement('div');
         nestedNode.id = "id";
         nestedNode.innerHTML = "text";
         return render.node(nestedNode);
      }
   });
   return new MyCell();
   """: test (_,done)->
      strictEqual _.node.innerHTML, "<div id=\"id\">text</div>"
      done()

   """
   // All combinations rendering nested Cells asynchronously, deferred asynchronously, and synchronously
   var DeferAsync = Cell.extend({
      render:function(options,render){
         setTimeout(function(){
            render.async("DeferAsync: "+options.from);
         },100);
      }
   });
   var Async = Cell.extend({
      render:function(options,render){
         render.async("Async: "+options.from);
      }
   });
   var Sync = Cell.extend({
      render:function(options){
         return "Sync: "+options.from;
      }
   });

   function renderAll(options,render){
      return render.cells( [Sync,options], [Async,options], [DeferAsync,options] );
   }

   return {
      DeferAsyncParent: new (Cell.extend({
         render: function(options,render){
            setTimeout(function(){
               render.async(renderAll(options,render));
            },100);
         }
      }))({from:'DeferAsyncParent'}).node,

      AsyncParent: new (Cell.extend({
         render:function(options,render){
            render.async(renderAll(options,render));
         }
      }))({from:'AsyncParent'}).node,

      SyncParent: new (Cell.extend({
         render: renderAll
      }))({from:'SyncParent'}).node,
   };
   """: test ({DeferAsyncParent, AsyncParent, SyncParent},done)->
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
               '<div>Sync: DeferAsyncParent</div><div>Async: DeferAsyncParent</div><div>DeferAsync: DeferAsyncParent</div>',
               'DeferAsyncParent innerHTML should have rendered Sync, Async, and DeferAsync Cells'
            done()
