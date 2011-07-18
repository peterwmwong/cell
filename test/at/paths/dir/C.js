(function() {
  define(['cell!dir/dir/D'], function(D) {
    return {
      render: function(R) {
        return [R('p', 'C'), R(D)];
      }
    };
  });
}).call(this);
