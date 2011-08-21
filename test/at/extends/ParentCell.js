(function() {
  define({
    render: function(_) {
      return [_('.childOption', this.childOption), _('.renderChild', this.renderChild())];
    },
    afterRender: function() {
      return this.$el.append("<div class='parentAfterRender'>from parent afterRender</div>");
    }
  });
}).call(this);
