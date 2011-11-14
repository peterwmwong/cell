
  define(function() {
    return function(done) {
      equal(this.$('.Container > .CellWithInit.one').html(), "id: oneid\nclass: one\nmodel: oneModel\nfoo: bar\nopts === initArgs: true\nthis.cell.prototype.name: CellWithInit");
      equal(this.$('.Container > .CellWithInit.two').html(), "id: twoid\nclass: two\nmodel: twoModel\nfoo: blarg\nopts === initArgs: true\nthis.cell.prototype.name: CellWithInit");
      return done();
    };
  });
