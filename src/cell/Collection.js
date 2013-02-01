// Generated by CoffeeScript 1.4.0

define(['util/type', 'cell/Events', 'cell/Model'], function(type, Events, Model) {
  var filterMatch;
  filterMatch = function(matcher, attr) {
    var expected_value, k;
    for (k in matcher) {
      if (((expected_value = matcher[k]) != null) && (expected_value !== attr[k])) {
        return false;
      }
    }
    return true;
  };
  return Events.extend({
    constructor: function(array) {
      this._i = array || [];
    },
    model: Model,
    add: function(models) {
      var i, item, len, model;
      if (models) {
        if (!type.isA(models)) {
          models = [models];
        }
        len = models.length;
        i = -1;
        while (++i < len) {
          model = (item = models[i]) instanceof Model ? item : new this.model(item);
        }
      }
    },
    filterBy: function(matcherHash) {
      var cur_items, i, item, len, _results;
      if (!(len = (cur_items = this._i).length)) {
        return cur_items;
      }
      i = -1;
      _results = [];
      while (++i < len) {
        if (filterMatch(matcherHash, (item = cur_items[i]))) {
          _results.push(item);
        }
      }
      return _results;
    },
    length: function() {
      return this._i.length;
    }
  });
});
