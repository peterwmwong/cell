define ->
   waitdo = (delay,f)-> setTimeout f,delay
   test = (f)-> (require,get,done)-> get ->
      f (new Function(@testName))(), done

   $testObj: 'Cell'
   $beforeTest: (require,done)->
      delete window.Cell
      done()
   
   """
   /* Sync Render */
   var MyCell = Cell.extend({
      render: function(options,render){
         return options.key;
      }
   });
   return new MyCell({key:'value'}).node;
   """: test (_,done)->
      strictEqual _.innerHTML, 'value'

   """
   /* AsyncSync Render */
   var MyCell = Cell.extend({
      render: function(options,render){
         return options.key;
      }
   });
   return new MyCell({key:'value'}).node;
   """: test (_,done)->
      strictEqual _.innerHTML, 'value'


   ###
   """

   return Cell.extend({
      'render <span>':function(options,render){
         render.async(options.key);
      }
   }).render({key:"value"}).node;
   """: test (_,done)->
      strictEqual _, "<span>value</span>"
      done()

   """
   // All combinations rendering a nested Cells asynchronously, deferred asynchronously, and synchronously
   var DeferAsync = Cell.extend({
      render:function(options,render){
         setTimeout(function(){
            render.async("DeferAsync: "+options);
         },100);
      }
   });
   var Async = Cell.extend({
      render:function(options,render){
         render.async("Async: "+options);
      }
   });
   var Sync = Cell.extend({
      render:function(options){
         return "Sync: "+options;
      }
   });

   function renderAll(options,render){
      return render.cells( [Sync,options], [Async,options], [DeferAsync,options] );
   }

   return {
      DeferAsyncParent: Cell.extend({
         render: function(options,render){
            setTimeout(function(){
               render.async(renderAll(options,render));
            },100);
         }
      }).render('DeferAsyncParent').node,

      AsyncParent: Cell.extend({
         render:function(options,render){
            render.async(renderAll(options,render));
         }
      }).render('AsyncParent').node,

      SyncParent: Cell.extend({
         render: renderAll
      }).render('SyncParent').node,
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
