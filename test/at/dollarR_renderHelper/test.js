(function() {
  define(function() {
    return function(done) {
      equal(this.$(".RenderCell").html().trim(), 'true');
      return done();
    };
  });
}).call(this);
