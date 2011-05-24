(function() {
  define(function() {
    return function(done) {
      equal('<div class=" Mock">Mock: <div class=" MockNested">MockNested</div> </div>', this.$('body').html().trim(), "Should render Mock and MockNested Cells");
      equal('rgb(0, 0, 255)', this.$('.Mock').css('color'), "Should apply Mock css from all.css");
      equal('rgb(255, 0, 0)', this.$('.MockNested').css('color'), "Should apply MockNested css from all.css");
      equal(0, this.$('head > link[href*="Mock.css"]').length, "Should NOT attach <link> for Mock.css");
      equal(0, this.$('head > link[href*="MockNested.css"]').length, "Should NOT attach <link> for MockNested.css");
      return done();
    };
  });
}).call(this);
