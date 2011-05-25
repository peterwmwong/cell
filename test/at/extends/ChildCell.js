(function() {
  define({
    "extends": './ParentCell',
    childOption: "from childOption",
    renderChild: function() {
      return "from renderChild";
    }
  });
}).call(this);
