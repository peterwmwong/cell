require.def('cell/util/renderCSS',
   [ 'cell/config' ], 
   function(config) {
   return function(cname, styling){
         if(styling){
            var styleTagId = 'cell_'+cname+'_styling';
            
            // CSS hasn't been rendered yet
            if(!document.getElementById(styleTagId)){
               var styleRenderer = config.defaultStyleRenderer.value;
               
               if(styleRenderer !== undefined){
                  styleRenderer(styling,function(css,err){                  
                     // If no errors and a style tag for this cell doesn't already exist 
                     if(!document.getElementById(styleTagId)){
                        if(!err){
                           var st = document.createElement('style');
                           st.id = styleTagId;
                           st.type = 'text/css';
                           
                           // IE special case
                           if (st.styleSheet) {
                              st.styleSheet.cssText = css;
                           } else {
                              var tt1 = document.createTextNode(css);
                              st.appendChild(tt1);
                           }
                           document.getElementsByTagName('head')[0].appendChild(st);
                        }else{
                           console.log('cell.Cell.renderStyling(): error thrown rendering style for "'+cname+'"',err);
                        }
                     }
                  });  
               }else{
                  console.log('cell.Cell.renderStyling(): No Style Renderer for "'+cname+'"');
               }
            }
         }
       };
});