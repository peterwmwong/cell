(function() {
  define(['cell!./dir/MockNested'], function(MockNested) {
    return {
      render: function(R) {
        return "Mock: " + (R.cell(MockNested)) + " ";
      }
    };
  });
}).call(this);
