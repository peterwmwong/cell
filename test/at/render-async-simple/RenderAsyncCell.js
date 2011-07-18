(function() {
  define({
    render: function(R, A) {
      return setTimeout((function() {
        return A(['Foo Bar']);
      }), 100);
    }
  });
}).call(this);
