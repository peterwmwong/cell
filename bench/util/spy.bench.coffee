define (require)->
  require('./bench-spy')
    setup:
      """
      var modelData = {a:'a',b:'b',c:'c'},
          modelBaseline = new ModelBaseline(modelData),
          modelNow = new ModelNow(modelData),
          keyObj = {},
          contextBaseline = spyBaseline.watch(
            keyObj,
            function() {
              return modelBaseline.get('a')+modelBaseline.get('b')+modelBaseline.get('c');
            },
            function(){}),
          contextNow = spyNow.watch(
            keyObj,
            function() {
              return modelNow.get('a')+modelNow.get('b')+modelNow.get('c');
            },
            function(){});
      """

    baseline:
      """
      spyBaseline._eam(contextBaseline);
      """

    now:
      """
      spyNow._eam(contextNow);
      """

    teardown:
      """
      spyBaseline.unwatch(keyObj);
      modelBaseline.destroy();
      spyNow.unwatch(keyObj);
      modelNow.destroy();
      """