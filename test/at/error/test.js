(function() {
  define(function() {
    return function(done) {
      equal(this.$('body').html(), "Error was correct", "Error should have been passed to console.error");
      return done();
    };
  });
}).call(this);
