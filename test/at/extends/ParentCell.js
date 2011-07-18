(function() {
  define({
    render: function(R) {
      return [R('.childOption', this.childOption), R('.renderChild', this.renderChild())];
    },
    bind: {
      afterRender: function() {
        return $(this.el).append("<div class='parentAfterRender'>from parent afterRender</div>");
      }
    }
  });
}).call(this);
