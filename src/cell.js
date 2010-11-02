var cell;
require.def('cell',['cell/cell-require-plugin','cell/config'], function(cellReqPlug,config,undefined){
   cell = function(cellName,loadCallback){
      if(cellName !== undefined  || cellName.length > 0){
         return cellReqPlug.load(cellName,loadCallback);
      }
      throw 'cell(): must supply a Cell Name';
   }
   Object.defineProperty(cell,'configure',{
      enumerable: true,
      value: config.configure
   });
   return cell;
});

