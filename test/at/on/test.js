(function() {
  define(function() {
    return function(done) {
      this.$('.CellThatBinds .add').click().click();
      equal(this.$('body #clickcount').html(), "2", "Click count should have been incremented twice");
      this.$('.add.not').click();
      equal(this.$('body #clickcount').html(), "2", "Bind selector is limited to cell's DOM");
      this.$('.CellThatBinds .remove').click().click().click();
      this.$('.add.not').click();
      equal(this.$('body #clickcount').html(), "-1", "Click count should have been decremented three times");
      return done();
    };
  });
}).call(this);
