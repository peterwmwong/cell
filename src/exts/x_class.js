// Generated by CoffeeScript 1.6.3
define(['cell/Ext', 'cell/util/fn', 'cell/util/type', 'cell/dom/class'], function(Ext, fn, type, cls) {
  return Ext.extend({
    render: function() {
      var k, opts, v, _fn,
        _this = this;
      opts = this.options;
      if (opts && opts.constructor === Object) {
        _fn = function(k) {
          _this.watch(v, function(value) {
            (value ? cls.add : cls.remove)(this.el, k);
          });
        };
        for (k in opts) {
          v = opts[k];
          _fn(k);
        }
      }
    }
  });
});

/*
//@ sourceMappingURL=x_class.map
*/