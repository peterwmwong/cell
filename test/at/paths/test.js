(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  define(function() {
    return function(done) {
      var hasOneOfEach;
      hasOneOfEach = __bind(function(sels) {
        var s, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = sels.length; _i < _len; _i++) {
          s = sels[_i];
          _results.push(equal(this.$(s).length, 1, "Expected " + s));
        }
        return _results;
      }, this);
      hasOneOfEach(['body > .A', 'body > .A > .B', 'body > .A > .B > .D', 'body > .A > .B > .D > .E', 'body > .A > .C', 'body > .A > .C > .D', 'body > .A > .C > .D > .E']);
      equal(this.$('body > .A > .B > .D > p').html(), "D(0)");
      equal(this.$('body > .A > .B > .D > .E > p').html(), "E(0)");
      equal(this.$('body > .A > .C > .D > p').html(), "D(1)");
      equal(this.$('body > .A > .C > .D > .E > p').html(), "E(1)");
      hasOneOfEach(['head > link[href="./A.css"]', 'head > link[href="./dir/B.css"]', 'head > link[href="./dir/C.css"]', 'head > link[href="./dir/dir/D.css"]', 'head > link[href="./E.css"]']);
      return done();
    };
  });
}).call(this);
