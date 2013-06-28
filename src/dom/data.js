// Generated by CoffeeScript 1.6.3
define(function() {
  var domCache, domExpandoAttr, nextId;
  nextId = 1;
  domCache = {};
  domExpandoAttr = "dom-" + (new Date().getTime());
  return {
    get: function(element, key) {
      var expandoId, expandoStore, noKey;
      noKey = key == null;
      if (expandoId = element[domExpandoAttr]) {
        expandoStore = domCache[expandoId];
      } else if (noKey) {
        domCache[element[domExpandoAttr] = nextId++] = expandoStore = {};
      }
      if (expandoStore) {
        if (noKey) {
          return expandoStore;
        } else {
          return expandoStore[key];
        }
      }
    },
    set: function(element, key, value) {
      var expandoId, result;
      if (expandoId = element[domExpandoAttr]) {
        domCache[expandoId][key] = value;
      } else {
        domCache[element[domExpandoAttr] = nextId++] = result = {};
        result[key] = value;
      }
    },
    remove: function(element, key) {
      var expandoId, expandoStore;
      if ((expandoId = element[domExpandoAttr]) && (expandoStore = domCache[expandoId])) {
        if (key != null) {
          delete expandoStore[key];
        } else {
          delete domCache[expandoId];
          if ((key = expandoStore.cellRef) && key.destroy) {
            try {
              key.destroy();
            } catch (_error) {}
          }
          if ((key = expandoStore.handle) && key.destroy) {
            try {
              key.destroy();
            } catch (_error) {}
          }
          element[domExpandoAttr] = void 0;
        }
      }
    }
  };
});

/*
//@ sourceMappingURL=data.map
*/
