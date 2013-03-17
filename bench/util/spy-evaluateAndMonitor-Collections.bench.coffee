define (require)->
  require('./bench-spy')
    setup:
      """
      var collection = new this.Collection([{key:'a'},{key:'b'},{key:'c'}]),
          keyObj = {},
          spy = this.spy,
          context = spy.watch(
            keyObj,
            function() {
              return collection.length();
            },
            function(){});
      """

    both: "spy._eam(context);"

    teardown:
      """
      spy.unwatch(keyObj);
      collection.destroy();
      """