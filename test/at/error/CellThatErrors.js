(function() {
  define(function() {
    throw (window.TEST_error = new Error());
  });
}).call(this);
