
  define(['cell!./AsyncRender', 'cell!./SyncRender'], function(Async, Sync) {
    return {
      render: function(R, A) {
        var a, s;
        var _this = this;
        s = new Sync();
        s.ready(function() {
          return _this.$el.append(s.el);
        });
        s.ready(function() {
          return _this.$el.append("<a class='one'>one</a>");
        });
        a = new Async();
        a.ready(function() {
          return _this.$el.append(a.el);
        });
        a.ready(function() {
          return _this.$el.append("<a class='two'>two</a>");
        });
      }
    };
  });
