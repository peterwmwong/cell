var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
define(['cell!./AsyncRender', 'cell!./SyncRender'], function(Async, Sync) {
  return {
    render: function(R, A) {
      var a, s;
      s = new Sync();
      s.ready(__bind(function() {
        return this.$el.append(s.el);
      }, this));
      s.ready(__bind(function() {
        return this.$el.append("<a class='one'>one</a>");
      }, this));
      a = new Async();
      a.ready(__bind(function() {
        return this.$el.append(a.el);
      }, this));
      a.ready(__bind(function() {
        return this.$el.append("<a class='two'>two</a>");
      }, this));
    }
  };
});