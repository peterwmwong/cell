(function() {
  define(['cell!./dir/MockNested'], function(MockNested) {
    return {
      render: function(_) {
        return ["Mock: ", _(MockNested)];
      }
    };
  });
}).call(this);
