
require.def('cell/integration/templating/mustache-template-renderer',
   ['cell/config'],
   function(config){
   var __absURLRegex = /^([A-z][A-z0-9+-.]:)|[\/]/,
       __pkgRegex = /(.*)\/.+/;
       __domParser = new DOMParser(),
       __xmlSerializer = new XMLSerializer(),
       __tmpNodeID = 0;
       __renderer = function(cell,container,data,attachCallback){
         var nested = [],
             renderedCompSrc
                =  Mustache.to_html(
                      cell.template,   
                      data,
                         
                      // Get nested cells to render
                      { 'getPartial': function(cname, ndata, id){
                            
                            // Because the nested cell may need to be loaded,
                            // render an invisible tmp DOM Node (div) to be replaced
                            // when the nested cell has been loaded.
                            var tmpNodeID = 'cellTmpNode' + __tmpNodeID++; 
                            
                            // Load nested cell
                            require(['cell!'+cname],function(NewCell){
                               var tmpNode = (container.node)
                                                ? container.node.querySelectorAll('#'+tmpNodeID)
                                                : null;

                               // Container and temp nodes have already 
                               // been attached to DOM, render now.
                               if(tmpNode && tmpNode.length === 1){
                                  NewCell.render(tmpNode[0],true,ndata,undefined, id);
                                     
                               // ... Otherwise, render later
                               }else if(nested !== undefined){
                                  nested.push({cell:NewCell,data:ndata,tmpNodeID:tmpNodeID,id:id});
                               }
                               
                            });
                            
                            // HTML Source for temp node 
                            return '<div id="'+tmpNodeID+'" style="display:none"> </div>';                
                      }});
         
 
         // Make sure src url's are all relative to the component resource base url
         var templateRoot = (config.resourceBasePaths.template.value || config.resourceBasePaths.all.value),
             tmpNode = document.createElement('div'),
             doc = __domParser.parseFromString(
                  '<div id="'+container.id+'" class="'+container.className+'">'+renderedCompSrc+'</div>',"text/xml"
               ),
             cellPkg = __pkgRegex.exec(cell.name);

         if(cellPkg){
            templateRoot+='/'+cellPkg[1];
         }
         
         Array.prototype.slice.call(doc.querySelectorAll('[src]')).forEach(function(node){
            var srcAttr = node.getAttribute('src');
            if(!__absURLRegex.test(srcAttr)){
               node.setAttribute('src',templateRoot+'/'+srcAttr);
            }
         });
         
         tmpNode.innerHTML = __xmlSerializer.serializeToString(doc);
         
         container.node = tmpNode.childNodes[0];

         // Tell Cell to attach the container to the document  
         attachCallback();
         
         delete tmpNode;
         
         // Render any nested cells waiting for Container and 
         // temp nodes to be attached
         nested.forEach(function(nc){
            nc.cell.render(container.node.querySelector('#'+nc.tmpNodeID),true,nc.data,nc.id);
         });
         nested = undefined;
      };
      
      return __renderer;
   }
);

// Attach renderer as default template renderer
require(['cell/config','cell/integration/templating/mustache-template-renderer'],function(config,mtr){
   config.defaultTemplateRenderer.value = mtr;
});
