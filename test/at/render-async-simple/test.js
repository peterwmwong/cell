
  define(function() {
    return function(done) {
      var _this = this;
      return setTimeout((function() {
        equal(_this.$('body .RenderAsyncCell').html(), "Foo Bar");
        return done();
      }), 100);
    };
  });
