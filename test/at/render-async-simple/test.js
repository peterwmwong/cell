(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  define(function() {
    return function(done) {
      return setTimeout((__bind(function() {
        equal(this.$('body .RenderAsyncCell').html(), "Foo Bar");
        return done();
      }, this)), 100);
    };
  });
}).call(this);
