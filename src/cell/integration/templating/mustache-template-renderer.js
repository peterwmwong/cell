
require.def('cell/integration/templating/mustache-template-renderer',
   ['cell/config'],
   function(config){
   var __absURLRegex = /^[A-z][A-z0-9+-.]:/,
       __tmpNodeID = 0;
       __renderer = function(template,containerDOMNode,data,attachCallback){
         var nested = [],
             renderedCompSrc
                =  Mustache.to_html(
                      template,   
                      data,
                         
                      // Get nested cells to render
                      { 'getPartial': function(cname, ndata, id){
                         
                            // Because the nested cell may need to be loaded,
                            // render an invisible tmp DOM Node (div) to be replaced
                            // when the nested cell has been loaded.
                            var tmpNodeID = 'cellTmpNode' + __tmpNodeID++; 
                            
                            // Load nested cell
                            require(['cell!'+cname],function(NewCell){
                               var tmpNode = containerDOMNode.querySelectorAll('#'+tmpNodeID);
                               
                               // Outer cell was already been rendered
                               if(tmpNode.length == 1){
                                  NewCell.render(tmpNode[0],true,ndata,undefined, id);
                                  
                               // Outer cell has NOT been rendered yet,
                               // add it to the list (nested) of cells 
                               // to render afterwards 
                               }else if(nested !== undefined){
                                  nested.push({cell:NewCell,data:ndata,tmpNodeID:tmpNodeID,id:id});
                               }
                            });
                            
                            // HTML Source for tmp DOM Node 
                            return '<div id="'+tmpNodeID+'" style="display:none"></div>';                
                      }});
          
         // Make sure src url's are all relative to the component resource base url
         var templateRoot = (config.resourceBasePaths.template.value || config.resourceBasePaths.all.value);
         containerDOMNode.innerHTML = renderedCompSrc;
         Array.prototype.slice(containerDOMNode.querySelectorAll('[src]')).forEach(function(node){
            __absURLRegex.test(node.src)
               && node.src = templateRoot+a;
         });
         
         // Tell Cell to attach the containerDOMNode to the document  
         attachCallback();
         
         // Render any nested cells
         nested.forEach(function(nc){
            nc.cell.render(containerDOMNode.querySelectorAll('#'+nc.tmpNodeID)[0],true,nc.data,nc.id);
         });
         nested = [];
      };
      
      return __renderer;
   }
);

// Attach renderer as default template renderer
require(['cell/config','cell/integration/templating/mustache-template-renderer'],function(config,mtr){
   config.defaultTemplateRenderer.value = mtr;
});
