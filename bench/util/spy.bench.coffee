define (require)->
  require('./bench-spy')
    both:
      """
      var model = new Model({
            a:'a',
            b:'b',
            c:'c'
          }),
          keyObj = {};
      spy.watch(
        keyObj,
        function() {
          return model.get('a')+model.get('b')+model.get('c');
        },
        function(){});
      spy.unwatch(keyObj);
      """