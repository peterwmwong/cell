define (require)->
  require('./bench-spy')
    setup:
      """
      var modelBaseline = new ModelBaseline({a:'a',b:'b',c:'c'}),
          modelNow = new ModelNow({a:'a',b:'b',c:'c'}),
          keyObjBaseline = {},
          keyObjNow= {},
          eamBaseline = spyBaseline._eam,
          eamNow = spyNow._eam,
          contextBaseline = spyBaseline.watch(
            keyObjBaseline,
            function() {
              return modelBaseline.get('a')+modelBaseline.get('b')+modelBaseline.get('c');
            },
            function(){}),
          contextNow = spyNow.watch(
            keyObjNow,
            function() {
              return modelNow.get('a')+modelNow.get('b')+modelNow.get('c');
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
      modelBaseline.destroy();
      spyNow.unwatch(keyObjNow);
      modelNow.destroy();
      """