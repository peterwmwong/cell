// Generated by CoffeeScript 1.6.2
define(['cell/util/extend', 'cell/util/spy'], function(extend, spy) {
  var Ext;

  Ext = function(options) {
    this.options = options != null ? options : {};
  };
  Ext.prototype.watch = function(v, callback) {
    spy.watch(this.view, v, callback, this);
  };
  Ext.prototype.run = function(el, view) {
    this.el = el;
    this.view = view;
    this.render();
  };
  Ext.extend = extend;
  return Ext;
});

/*
//@ sourceMappingURL=Ext.map
*/
