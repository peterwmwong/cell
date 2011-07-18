(function() {
  define(['cell!dir/B', 'cell!dir/C'], function(B, C) {
    return {
      render: function(R) {
        return [R('p', 'A'), R(B), R(C)];
      }
    };
  });
}).call(this);
