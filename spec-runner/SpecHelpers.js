// Generated by CoffeeScript 1.4.0

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
