define (require)->
  require('./bench-spy')
    setup:
      """
      var collectionData = [{a:'a'},{b:'b'},{c:'c'}],
          collectionBaseline = new CollectionBaseline(collectionData),
          collectionNow = new CollectionNow(collectionData),
          keyObjBaseline = {},
          keyObjNow= {},
          eamBaseline = spyBaseline._eam,
          eamNow = spyNow._eam,
          contextBaseline = spyBaseline.watch(
            keyObjBaseline,
            function() {
              return collectionBaseline.length();
            },
            function(){}),
          contextNow = spyNow.watch(
            keyObjNow,
            function() {
              return collectionNow.length();
            },
            function(){});
      """

    baseline:
      """
      eamBaseline(contextBaseline);
      """

    now:
      """
      eamNow(contextNow);
      """

    teardown:
      """
      spyBaseline.unwatch(keyObjBaseline);
      collectionBaseline.destroy();
      spyNow.unwatch(keyObjNow);
      collectionNow.destroy();
      """