
require.def('cell/util/EventSource',
   [ 'cell/util/createClass' ],
   function(createClass){
   
   return createClass({
      'init':function(){
         var handlers = {};
         return {
           /**
            * Binds a handler to an event.
            * 
            * @param {String} evtype Event Type
            * @param {String=} evdata [OPTIONAL] Additional data 
            *    object to passed to the handler when the event 
            *    fires.
            * @param {function(event)} handler
            */
           'on': {'value':function(evtype,handler,evdata,once){
              if(evtype && typeof evtype === 'string' && handler && typeof handler === 'function'){
                 var theHandler = {'handler':handler, 'data':evdata, 'once':(once)?true:false};
                 if(!handlers[evtype]){
                    handlers[evtype] = [theHandler];
                 }else{
                    if( !handlers[evtype].some( function(el){return el.handler === handler;} ) ){
                       handlers[evtype].push(theHandler);
                    }
                 }
              }
           }},
           
           'once': {'value':function(evtype,handler,evdata){
              this.on(evtype,handler,evdata,true);
           }},
           
           /**
            * Triggers an event, invoking handlers of event.
            * 
            * @param {hela.Event} ev Event object
            * @param {Array} extraParams [OPTIONAL] Extra parameters passed to handlers  
            */
           'trigger': {'value':function(ev,extraParams){
              var event = (typeof ev === 'string') 
                             ? {type: ev}
                             : (typeof ev === 'object' && ev.type && typeof ev.type === 'string')
                                   ? ev
                                   : (function(){throw 'cell/util/EventSource.trigger(): event was not a string or object with type field, instead was '+ev;})();
              
              if(handlers[event.type]){
                 var eparams =
                    (extraParams) ? ((extraParams instanceof Array)
                                       ? extraParams
                                       : [extraParams])
                                  : [];
                    
                 handlers[event.type] = handlers[event.type].filter(function(el){
                    var handlerEvent = 
                       (el.data) ? Object.create(event,{'data': {value:el.data} })
                                 : event;
                    try{
                       el.handler.apply(el.handler, [handlerEvent].concat(eparams));
                    }catch(e){
                       console.log("hela.EventEmitter.trigger(): Exception thrown notifying handler("+el+") of event("+event.type+"). Exception="+e);
                    }
                    return !el.handler.once; // remove the once handlers
                 });
              }
           }},
           
           /**
            * Unbinds handler from event type.
            * If no handler is specified, all handlers for event 
            * type are are removed.
            * 
            * @param {String} evtype Event type
            * @param {function(event)} handler [OPTIONAL] Handler to be removed
            */
           'unbind': {'value':function(evtype, handler){
              if(evtype && typeof evtype === 'string'){
                 if(handler && typeof handler === 'function' && handlers[evtype]){
                    handlers[evtype] = handlers[evtype].filter(function(el){
                       return (el.handler !== handler); 
                    });
                 }else{
                    delete handlers[evtype];
                 }
              }
           }}
         };}
   });
});
