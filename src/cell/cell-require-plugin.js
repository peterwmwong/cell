require.def('cell/cell-require-plugin',
   ['cell/Cell'], 
   function(Cell){
      var _this = {
            prefix : "cell",
   
            /**
             * This callback is prefix-specific, only gets called for this
             * prefix
             */
            require : function(name, deps, callback, context) {
               // No-op, require never gets these text items, they are always
               // a dependency, see load for the action.
            },
   
            /**
             * Called when a new context is defined. Use this to store
             * context-specific info on it.
             */
            newContext : function(context) {
               require.mixin(context, {
                  cells : {},
                  cellsWaiting : []
               });
            },
   
            /**
             * Called when a dependency needs to be loaded.
             */
            load : function(name, contextName, cellLoadCallback) {
               var context = require.s.contexts[contextName];
               // If cell has already been loaded
               if(context.cells[name] !== undefined){
                  return context.defined[name] = context.cells[name];
                  
               // ... if not
               }else if(context.cellsWaiting[name] === undefined){
                  context.loaded[name] = false;
                  var newCell = Cell(name, function(c,err){
                     if(typeof cellLoadCallback === 'function'){
                        try{ cellLoadCallback(c,err); }
                        catch(e){}
                     }
                     context.cells[name] = newCell;
                     context.loaded[name] = true;
                     delete context.cellsWaiting[name];
                     require.checkLoaded(contextName);
                  });
                  context.cellsWaiting[name] 
                     = context.cellsWaiting[context.cellsWaiting.push(newCell) - 1];
                  
                  return newCell;
               }
               return context.cellsWaiting[name];
            },
   
            /**
             * Called when the dependencies of a module are checked.
             */
            checkDeps : function(name, deps, context) {
               require(deps.map(function(d){return d.fullName;}), function(){}, context.contextName);
            },
   
            /**
             * Called to determine if a module is waiting to load.
             */
            isWaiting : function(context) {
               return !!context.cellsWaiting.length;
            },
   
            /**
             * Called when all modules have been loaded.
             */
            orderDeps : function(context) {
               // Clear up state since further processing could
               // add more things to fetch.
               var i = 0, dep, tWaitAry = context.cellsWaiting;
               context.cellsWaiting = [];
               while(dep = tWaitAry[i++]){
                  context.defined[dep.name] = dep;
               }
            }
         };
   
      require.plugin(_this);
      
      var __exports = {};
      Object.defineProperty(__exports,'load',{
         value:function(cellName,cellLoadCallback){
            return _this.load(cellName, require.s.ctxName, cellLoadCallback);
         }
      })
      return __exports;
   }
);

