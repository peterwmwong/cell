(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  define(function() {
    return function(done) {
      var html;
      html = __bind(function(sel) {
        return this.$(sel).html();
      }, this);
      return setTimeout(function() {
        equal(html('.App > .AsyncRender'), "Async");
        equal(html('.App > .SyncRender'), "Sync");
        equal(html('.App > a.one'), "one");
        equal(html('.App > a.two'), "two");
        return done();
      }, 100);
    };
  });
}).call(this);
