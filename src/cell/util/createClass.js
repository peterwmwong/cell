
require.def('cell/util/createClass',[],function(){
   return function(cdesc) {
      var extend = cdesc.extend, 
          initializer = cdesc.init,
          initializerFunc = (typeof initializer === 'object')
                               ? function(){return initializer;}
                               : (typeof initializer === 'function')
                                    ? initializer
                                    : doerror('cell/util/createClass(): initializer was not a function or object (property definitions), instead was'+initializer),
          protoInitializer = cdesc.protoInit,
          prototype = Object.create((extend && extend.prototype) || Object.prototype);

      if (protoInitializer){
         try{
            Object.defineProperties(
               prototype, 
               (typeof protoInitializer === 'function')
                  ? protoInitializer.apply(prototype)
                  : (typeof protoInitializer === 'object')
                       ? protoInitializer
                       : (function(){throw 'cell/util/createClass(): protoInitializer was not a function or object (property definitions), instead was'+protoInitializer;})()
            );
         }catch(e){
            console.log('cell/util/createClass():',e);
         }
      }
      
      var construct = function(that, args) {
         if (typeof initializer === 'function'){
            if (typeof extend === 'function' && extend.internalConstruct && typeof extend.internalConstruct === 'function'){
               that.callSuper = function(){
                  var superInstanceProps = extend.internalConstruct.apply(that, [that].concat(arguments));
                  // Prevent multiple calls to super constructor
                  delete that.callSuper;
               };
            }
         }
         var props = initializerFunc.apply(that,args);
         if(props){
            Object.defineProperties(that, props);
         }
         delete that.callSuper;
         return that;
      };
      
      var func = function() {
         return construct(Object.create(prototype),arguments);
      };

      // Allows instanceof to work
      func.prototype = prototype;
      prototype.constructor = func;
      func.internalConstruct = construct;
      return func;
   };
});

