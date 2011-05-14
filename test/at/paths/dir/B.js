(function() {
  define(['cell!./dir/D'], function(D) {
    return {
      render: function(R) {
        return "<p>B</p>" + (R(D));
      }
    };
  });
}).call(this);
