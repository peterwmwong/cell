define (require)->
  require('./bench-spy')
    setup:
      """
      var collectionData = [{a:'a'},{b:'b'},{c:'c'}],
          collectionBaseline = new CollectionBaseline(collectionData),
          collectionNow = new CollectionNow(collectionData),
          keyObj = {},
          contextBaseline = spyBaseline.watch(
            keyObj,
            function() {
              return collectionBaseline.length();
            },
            function(){}),
          contextNow = spyNow.watch(
            keyObj,
            function() {
              return collectionNow.length();
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
      collectionBaseline.destroy();
      spyNow.unwatch(keyObj);
      collectionNow.destroy();
      """