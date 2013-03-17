define (require)->
  require('./bench-spy')
    setup:
      """
      var model = new this.Model({a:'a',b:'b',c:'c'}),
          keyObj = {},
          spy = this.spy,
          context = spy.watch(
            keyObj,
            function() {
              return model.get('a')+model.get('b')+model.get('c');
            },
            function(){});
      """

    both: "spy._eam(context);"

    teardown:
      """
      spy.unwatch(keyObj);
      model.destroy();
      """