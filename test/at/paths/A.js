(function() {
  define({
    render: function(R) {
      return "<p>A</p>" + (R.cell('dir/B')) + (R.cell('dir/C'));
    }
  });
}).call(this);
