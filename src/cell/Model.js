// Generated by CoffeeScript 1.4.0

define(['util/hash', 'util/type', 'cell/Events'], function(hash, type, Events) {
  var Model, spy;
  spy = {
    add: function(model, key) {
      var entry, hashkey;
      if (this.l) {
        if (!(entry = this.l[hashkey = hash(model)])) {
          entry = this.l[hashkey] = {
            model: model,
            props: {}
          };
        }
        return entry.props[key] = 1;
      }
    },
    start: function() {
      this.l = {};
    },
    stop: function() {
      var log;
      log = this.l;
      this.l = void 0;
      return log;
    }
  };
  Model = Events.extend({
    constructor: function(attributes) {
      this._a = attributes || {};
    },
    get: function(key) {
      spy.add(this, key);
      return this._a[key];
    },
    set: function(key, value) {
      var old_value;
      if ((type.isS(key)) && (this._a[key] !== value)) {
        old_value = this._a[key];
        this.trigger("change:" + key, this, (this._a[key] = value), old_value);
        return true;
      }
    },
    onChangeAndDo: function(key, cb, ctx) {
      if (this.on("change:" + key, cb, ctx)) {
        cb("initial:" + key, this, this.get(key));
      }
    }
  });
  Model._spy = spy;
  return Model;
});
