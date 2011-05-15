define({
  init: function(opts) {
    return this.initArg = opts;
  },
  render: function(R) {
    return "id: " + this.initArg.id + ", class: " + this.initArg["class"] + ", foo: " + this.initArg.foo + ", opts === initArgs: " + (this.initArg === this.options);
  }
});