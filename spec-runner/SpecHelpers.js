// Generated by CoffeeScript 1.6.2
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

/*
//@ sourceMappingURL=SpecHelpers.map
*/
