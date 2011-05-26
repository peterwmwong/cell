(function() {
  define({
    render: function(R) {
      return "<div class='childOption'>" + this.childOption + "</div>\n<div class='renderChild'>" + (this.renderChild()) + "</div>";
    },
    bind: {
      afterRender: function() {
        return $(this.el).append("<div class='parentAfterRender'>from parent afterRender</div>");
      }
    }
  });
}).call(this);
