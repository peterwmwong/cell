
require.def('cell/util/Delegator',
   [ 'cell/util/createClass' ],
   function(createClass){
      var __getProp = function(name){
         return this[name];
      };
      return createClass({
         'init':function(delMap){
            var _this = this,
                _delMap = {};
            
            Object.keys(delMap).forEach(function(delName){
               _delMap[delName] = delMap[delName];
               
               // Create proxy getter for delegate
               // to internal delegate map (_delMap)
               Object.defineProperty(_this,delName,{
                  enumerable: true,
                  configurable: false,
                  get: __getProp.bind(_delMap,delName)
               });
            });
            
            delMap = undefined;
            
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
              'delegate': {'value':function(type,handler){
                 if(typeof type === 'string' 
                       && type in _delMap  
                       && typeof handler === 'function'){
                    _delMap[type] = handler;
                 }
              }}
            };
         }
      });
   }
);
