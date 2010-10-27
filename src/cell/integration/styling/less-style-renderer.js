
require.def('cell/integration/styling/less-style-renderer',
   ['cell/config'],
   function(config){
      var _renderer = function(styling, returnCSS){
         var cbps = config.resourceBasePaths;
         window.less.Parser({
            'paths': [ cbps.styling.value || cbps.all.value ]
         }).parse(
            styling,
            function(err, root){
               returnCSS(root.toCSS(),err);
            }
         );
      }
      return _renderer;
   }
);

// Attach renderer as default style renderer
require(['cell/config','cell/integration/styling/less-style-renderer'],function(config,mtr){
   config.defaultStyleRenderer.value = mtr;
});
