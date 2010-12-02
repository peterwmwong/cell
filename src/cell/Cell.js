require.def('cell/Cell',
   [ 'cell/util/createClass',
     'cell/util/EventSource',
     'cell/util/Delegator',
     'cell/CellInstance',
     'cell/util/isHTMLNode',
     'cell/util/loadComponents',
     'cell/util/renderCSS',
     'cell/config' ], 
   function(createClass, EventSource, Delegator, CellInstance, isHTMLNode, loadComponents, renderCSS, config){
   var __render = function(cell, ctx, domNodes, replaceNodes, data, cb, id){
          if(!domNodes){
             console.log("cell.Cell.render(): domNodes must be a DOM Node or an Array of DOM nodes");
          }else if(!(domNodes instanceof Array)){
             domNodes = [domNodes];
          }
          
          domNodes.forEach(function(node){
             if(isHTMLNode(node)){
                CellInstance( cell,
                              (typeof id === 'string') ? id : ctx.renderedInstances++,
                              ctx.delegator,
                              node,replaceNodes,data,
                              function(cellInst){
                                 ctx.events.trigger({
                                    type:'render',
                                    node:cellInst.node,
                                    data:cellInst.data,
                                    cell:cellInst
                                 });
                                 try{
                                    if(cb && typeof cb === 'function'){
                                       cb(cellInst);
                                    }
                                 }catch(e){
                                    console.log("cell.Cell.render(): callback(",cb,") threw an error:",e);
                                 }
                              }
                );
             }
          });
       },
       __loadComplete = function(ctx,errors){
          ctx.status = (errors)?'error':'loaded';
         
          if(!errors){
            try{
               // Execute controller's creation code, with:
               //    * an empty ExecutionContext ThisBinding
               //    * free variables: on, delegate
               (new Function('on','delegate',ctx.controllerSrc)).call(
                     ctx.cell,
                     ctx.events.on,
                     ctx.delegator.delegate);
            }catch(e2){
               var theError = new Error("cell.Cell.<init>(): Controller for Cell("+qname+") from url("+u+"), threw error=");
               theError.stack = e2;
               errors.push(theError);
            }finally{
               delete ctx.controllerSrc;
            }
         }
 
          // Log Load Errors
          if(errors){
             errors.forEach(function(err){
                console.log(err);
             });
          }
          
          // Call Load Callback passing reference to Cell and errors 
          try{
             if(typeof ctx.loadCb === 'function'){
               ctx.loadCb(errors);
             }
          }catch(e){
             console.log('cell.Cell.resumeLoad(): error thrown calling Load Callback for "'+ctx.cell.name+'" Cell',e);
          }
          delete ctx.loadCb;
          
          // Render template if there were requests while loading Cell  
          if(ctx.cell.template){
             
             // Render styling
             if(ctx.cell.styling){
                renderCSS(ctx.cell.name, ctx.cell.styling);
             }
             
             ctx.renderRequests.forEach(function(req){
                try{
                   __render(ctx.cell,
                            ctx,
                            req.domNodes, 
                            req.replaceNodes,
                            req.data,
                            req.cb,
                            req.id);
                }catch(e){
                   console.log('cell.Cell.resumeLoad(): error thrown rendering "'+ctx.cell.name+'" Cell',req,e.stack);
                }
             });
             
             delete ctx.renderRequests;
          }
          
       };
       
   return createClass({
      'init': function(qname, loadCb){
         var _this = this,
             _template, _styling,
             _loadCbs = loadCb ? [loadCb] : [],
             _loadCbFun = function(errors){
                   _loadCbs.forEach(function(cb){
                      try{
                         cb(_this,errors);
                      }catch(e){
                         console.log(e);
                      }
                   });
               },
             _ctx = {
                   cell:_this,
                   renderedInstances: 0,
                   controllerSrc : null,
                   status: 'loading',
                   events: EventSource(),
                   delegator: Delegator({
                      // Let CellInstance default the value.
                      // (should use cell/config.defaultTemplateRenderer)
                      'templateRenderer' : undefined,
                      'getRenderData': function(data,returns){ returns(data); }
                   }),
                   
                   // Temporary, will be removed during load
                   renderRequests: [],
                   loadCb: _loadCbFun
                };
         
         loadCb = undefined;
         
         loadComponents(
            qname,
            // Load Controller
            function(r,u){ _ctx.controllerSrc = r; },
            // Load Template
            function(r,u){ _template = r; },
            // Load Styling
            function(r,u){ _styling = r; },
            // Load Complete
            __loadComplete.bind(_this,_ctx)
         );
         
         
         return {
            'addLoadCallback': {value: function(cb){
                _loadCbs.push(cb);
             }},
            'name'      : {enumerable:true, get:function(){return qname;}},

            'status'    : {enumerable:true, get:function(){return _ctx.status;}},
            
            'template'  : {enumerable:true, get:function(){return _template;}},

            'styling'   : {enumerable:true, get:function(){return _styling;}},
            
            'render'    : {value:function(domNodes, replaceNodes, data, cb, id){
               if(_ctx.status === 'loaded' && _ctx.renderRequests === undefined){
                  __render(_this, _ctx, domNodes, replaceNodes, data, cb, id);
               }else{
                  _ctx.renderRequests.push({
                     'domNodes': domNodes,
                     'replaceNodes' : replaceNodes,
                     'data' : data,
                     'cb' : cb,
                     'id' : id
                  });
               }
            }}
         };
      }
   });
});
