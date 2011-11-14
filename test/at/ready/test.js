
  define(function() {
    return function(done) {
      var html;
      var _this = this;
      html = function(sel) {
        return _this.$(sel).html();
      };
      return setTimeout(function() {
        equal(html('.App > .AsyncRender'), "Async");
        equal(html('.App > .SyncRender'), "Sync");
        equal(html('.App > a.one'), "one");
        equal(html('.App > a.two'), "two");
        return done();
      }, 100);
    };
  });
