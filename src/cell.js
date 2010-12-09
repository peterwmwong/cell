var cell;
require.def('cell',['cell/cell-require-plugin','cell/config'], function(cellReqPlug,config,undefined){

   var isString = function(v){return typeof v === 'string';},
       appendPrefix = function(c){return 'cell!'+c;};

   cell = function(cellName,cellLoadCallback){
            if(cellLoadCallback && typeof cellLoadCallback === 'function'){
               var cellsToLoad = (cellName instanceof Array && cellName) || [cellName];

               if(cellsToLoad.length > 0){
                  if(!cellsToLoad.every(isString)){
                     throw new Error('cell(): only accepts cell name or array of cell names');
                  }

                  cellsToLoad = cellsToLoad.map(appendPrefix);
                  require(cellsToLoad,cellLoadCallback);
               }
            }else{
               throw new Error('cell(cell name | [cell names], callback function)');
            }
   }
   Object.defineProperty(cell,'configure',{
      enumerable: true,
      value: config.configure
   });
   return cell;
});

