(function() {
  define({
    render: function(R, A) {
      return ["options.foo:" + this.options.foo];
    }
  });
}).call(this);
