// Generated by CoffeeScript 1.4.0

define(function() {
  var hashuid;
  hashuid = 0;
  return function(obj) {
    var objType;
    return (objType = typeof obj) + ':' + ((objType === 'object') && (obj !== null) ? obj.$$hashkey || (obj.$$hashkey = (++hashuid).toString(36)) : obj);
  };
});
