(function() {
  define({
    render: function(R, A) {
      return ["id:" + this.id + " class:" + this["class"] + " options.foo:" + this.options.foo + " collection:" + this.collection + " model:" + this.model];
    }
  });
}).call(this);
