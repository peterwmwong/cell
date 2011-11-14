
  define(['cell!../../E'], function(E) {
    var id;
    id = 0;
    return {
      render: function(R) {
        return [R('p', "D(" + (id++) + ")"), R(E)];
      }
    };
  });
