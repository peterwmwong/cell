(function() {
  define(function() {
    return function(done) {
      this.$('.CellThatBinds .clickable').click().click();
      equal(this.$('body #clickcount').html(), "2", "Click count should have been incremented twice");
      this.$('.clickable.not').click();
      equal(this.$('body #clickcount').html(), "2", "Bind selector is limited to cell's DOM");
      return done();
    };
  });
}).call(this);
