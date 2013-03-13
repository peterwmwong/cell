define (require)->
  require('./bench-spy')
    setup:
      """
      var collectionData = [{key:'a'},{key:'b'},{key:'c'}],
          collectionBaseline = new CollectionBaseline(collectionData),
          collectionNow = new CollectionNow(collectionData),
          mapFun = function(el){return el.get('key');};
          keyObj = {},
          contextBaseline = spyBaseline.watch(
            keyObj,
            function() {
              return collectionBaseline.map(mapFun);
            },
            function(){}),
          contextNow = spyNow.watch(
            keyObj,
            function() {
              return collectionNow.map(mapFun);
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