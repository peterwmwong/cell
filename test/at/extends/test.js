(function() {
  define(function() {
    return function(done) {
      equal(this.$('.ChildCell.ParentCell > .childOption').html(), "from childOption");
      equal(this.$('.ChildCell.ParentCell > .renderChild').html(), "from renderChild");
      return done();
    };
  });
}).call(this);
