(function() {
  define(function() {
    var id;
    id = 0;
    return {
      render: function(R) {
        return [R('p', "E(" + (id++) + ")")];
      }
    };
  });
}).call(this);
