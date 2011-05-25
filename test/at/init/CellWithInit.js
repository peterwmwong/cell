(function() {
  define({
    init: function(opts) {
      return this.initArg = opts;
    },
    render: function(R) {
      return "id: " + this.initArg.id + "\nclass: " + this.initArg["class"] + "\nfoo: " + this.initArg.foo + "\nopts === initArgs: " + (this.initArg === this.options) + "\nthis.cell.prototype.name: " + this.cell.prototype.name;
    }
  });
}).call(this);
