(function() {
  define(function() {
    var id;
    id = 0;
    return {
      render: function(R) {
        return "<p>D(" + (id++) + ")</p>" + (R.cell('../../E'));
      }
    };
  });
}).call(this);
