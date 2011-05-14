(function() {
  define(['cell!../../E'], function(E) {
    var id;
    id = 0;
    return {
      render: function(R) {
        return "<p>D(" + (id++) + ")</p>" + (R(E));
      }
    };
  });
}).call(this);
