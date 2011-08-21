(function() {
  define(function() {
    return function(done) {
      equal(this.$('.ChildCell.ParentCell > .childOption').html(), "from childOption");
      equal(this.$('.ChildCell.ParentCell > .renderChild').html(), "from renderChild");
      equal(this.$('.ChildCell.ParentCell > .parentAfterRender').html(), "from parent afterRender");
      return done();
    };
  });
}).call(this);
