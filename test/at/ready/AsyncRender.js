
  define({
    render: function(R, A) {
      return setTimeout(function() {
        return A(['Async']);
      }, 90);
    }
  });
