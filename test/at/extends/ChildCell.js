(function() {
  define({
    "extends": './ParentCell',
    childOption: "from childOption",
    renderChild: function() {
      return "from renderChild";
    },
    bind: {
      afterRender: function() {
        return $(this.el).append("<div class='childAfterRender'>from child afterRender</div>");
      }
    }
  });
}).call(this);
