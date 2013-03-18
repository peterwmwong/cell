// Generated by CoffeeScript 1.6.2
define(function(require) {
  return require('./bench-spy')({
    setup: "var collection = new this.Collection([{key:'a'},{key:'b'},{key:'c'}]),\n    keyObj = {},\n    spy = this.spy,\n    context = spy.watch(\n      keyObj,\n      function() {\n        return collection.length();\n      },\n      function(){});",
    both: "spy._eam(context);",
    teardown: "spy.unwatch(keyObj);\ncollection.destroy();"
  });
});

/*
//@ sourceMappingURL=spy-evaluateAndMonitor-Collections.bench.map
*/
