// Generated by CoffeeScript 1.3.1
(function() {

  define({
    spyOnAll: function(o) {
      var k, v;
      for (k in o) {
        v = o[k];
        spyOn(o, k).andCallThrough();
      }
      return o;
    }
  });

}).call(this);
