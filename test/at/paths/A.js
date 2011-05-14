(function() {
  define(['cell!dir/B', 'cell!./dir/C'], function(B, C) {
    return {
      render: function(R) {
        return "<p>A</p>" + (R(B)) + (R(C));
      }
    };
  });
}).call(this);
