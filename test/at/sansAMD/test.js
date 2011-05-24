(function() {
  define(function() {
    return function(done) {
      equal(this.$('body').html().trim(), "<div>hello world</div>");
      return done();
    };
  });
}).call(this);
