// Generated by CoffeeScript 1.6.3
define(['cell/util/type', 'cell/Events', 'cell/util/spy'], function(type, Events, spy) {
  var Model;
  Model = Events.extend({
    constructor: function(_a) {
      var key, value, _ref;
      this._a = _a != null ? _a : {};
      Events.call(this);
      _ref = this._a;
      for (key in _ref) {
        value = _ref[key];
        if (value instanceof Events) {
          value._setParent(this);
        }
      }
    },
    attributes: function() {
      var attr, result;
      this._s('all');
      result = {};
      for (attr in this._a) {
        result[attr] = this._a[attr];
      }
      return result;
    },
    get: function(key) {
      this._s("change:" + key);
      return this._a[key];
    },
    set: function(key, value) {
      var old_value;
      old_value = this._a[key];
      if ((type.isS(key)) && (old_value !== value)) {
        if (old_value instanceof Events) {
          old_value._setParent(void 0);
        }
        if (value instanceof Events) {
          value._setParent(this);
        }
        this.trigger("change:" + key, this, (this._a[key] = value), old_value);
        return true;
      }
    },
    destroy: function() {
      var _ref;
      Events.prototype.destroy.call(this);
      if (this._parent) {
        if ((_ref = this._parent) != null) {
          if (typeof _ref.remove === "function") {
            _ref.remove([this]);
          }
        }
      }
      delete this._a;
      this.destroy = this.attributes = this.get = this.set = function() {};
    },
    _s: spy.addModel
  });
  return Model;
});

/*
//@ sourceMappingURL=Model.map
*/