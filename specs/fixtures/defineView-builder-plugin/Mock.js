// Generated by CoffeeScript 1.6.3
define(function(require) {
  var MockNested;
  MockNested = require('dir/MockNested');
  return require('cell/defineView!')({
    render: function(__) {
      return ["Mock: ", __(MockNested)];
    }
  });
});

/*
//@ sourceMappingURL=Mock.map
*/