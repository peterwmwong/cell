
  define(function() {
    return function(done) {
      var exists;
      var _this = this;
      exists = function(sel) {
        return ok(_this.$(".RenderCell > " + sel).length === 1);
      };
      exists('span.TagString');
      exists('p.class.TagStringWithAttrs[data-custom="customValue"]');
      exists('span.TagFunc');
      exists('p.class2.TagFuncWithAttrs[data-custom2="customValue2"]');
      return done();
    };
  });
