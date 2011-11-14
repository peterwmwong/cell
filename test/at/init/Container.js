
  define(['cell!./CellWithInit'], function(CellWithInit) {
    return {
      render: function(R) {
        return [
          R(CellWithInit, {
            id: 'oneid',
            "class": 'one',
            model: 'oneModel',
            foo: 'bar'
          }), R(CellWithInit, {
            id: 'twoid',
            "class": 'two',
            model: 'twoModel',
            foo: 'blarg'
          })
        ];
      }
    };
  });
