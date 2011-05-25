(function() {
  define({
    render: function(R) {
      return "<div class='childOption'>" + this.childOption + "</div>\n<div class='renderChild'>" + (this.renderChild()) + "</div>";
    }
  });
}).call(this);
