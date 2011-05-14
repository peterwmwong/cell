(function() {
  define(['cell!dir/dir/D'], function(D) {
    return {
      render: function(R) {
        return "<p>C</p>" + (R(D));
      }
    };
  });
}).call(this);
