define (require)->
  require('./bench-spy')
    setup:
      """
      var collectionData = [{key:'a'},{key:'b'},{key:'c'}],
          collectionBaseline = new CollectionBaseline(collectionData),
          collectionNow = new CollectionNow(collectionData),
          mapFun = function(el){return el.get('key');},
          keyObjBaseline = {},
          keyObjNow= {},
          eamBaseline = spyBaseline._eam,
          eamNow = spyNow._eam,
          contextBaseline = spyBaseline.watch(
            keyObjBaseline,
            function() {
              return collectionBaseline.map(mapFun);
            },
            function(){}),
          contextNow = spyNow.watch(
            keyObjNow,
            function() {
              return collectionNow.map(mapFun);
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