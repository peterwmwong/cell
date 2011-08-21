(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  define(function() {
    return function(done) {
      var exists;
      exists = __bind(function(sel) {
        return ok(this.$(".RenderCell > " + sel).length === 1);
      }, this);
      exists('span.TagString');
      exists('p.class.TagStringWithAttrs[data-custom="customValue"]');
      exists('span.TagFunc');
      exists('p.class2.TagFuncWithAttrs[data-custom2="customValue2"]');
      return done();
    };
  });
}).call(this);
