(function() {
  define(function() {
    var id;
    id = 0;
    return {
      render: function() {
        return "<p>E(" + (id++) + ")</p>";
      }
    };
  });
}).call(this);
