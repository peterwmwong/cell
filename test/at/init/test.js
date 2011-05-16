(function() {
  define(function() {
    return function(done) {
      equal(this.$('.Container > .CellWithInit.one').html(), "id: oneid, class: one, foo: bar, opts === initArgs: true");
      equal(this.$('.Container > .CellWithInit.two').html(), "id: twoid, class: two, foo: blarg, opts === initArgs: true");
      return done();
    };
  });
}).call(this);
