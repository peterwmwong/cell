(function() {
  define({
    render: function(R) {
      return "" + (R.cell('./CellWithInit', {
        id: 'oneid',
        "class": 'one',
        foo: 'bar'
      })) + "\n" + (R.cell('./CellWithInit', {
        id: 'twoid',
        "class": 'two',
        foo: 'blarg'
      }));
    }
  });
}).call(this);
