
  define(['cell!./dir/D'], function(D) {
    return {
      render: function(R) {
        return [R('p', 'B'), R(D)];
      }
    };
  });
