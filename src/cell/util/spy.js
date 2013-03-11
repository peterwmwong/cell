// Generated by CoffeeScript 1.6.1

define(['util/hash', 'util/fn', 'util/type'], function(hash, fn, type) {
  var addLog, allChanges, doAfter, log, logObjMap, onChange, onChangeCalled, watches, _onChange;
  onChangeCalled = logObjMap = log = false;
  addLog = function(obj, event) {
    var key;
    (log[key = hash(obj)] || (log[key] = {}))[event] = 1;
    logObjMap[key] = obj;
  };
  doAfter = window.requestAnimationFrame || setTimeout;
  allChanges = {};
  watches = {};
  _onChange = function() {
    var changes, context, key;
    onChangeCalled = false;
    changes = allChanges;
    allChanges = {};
    for (key in changes) {
      context = changes[key];
      context.f(context.e());
    }
  };
  onChange = function() {
    allChanges[hash(this)] = this;
    if (!onChangeCalled) {
      onChangeCalled = true;
      doAfter(_onChange);
    }
  };
  return {
    addCol: function() {
      if (log) {
        addLog(this, 'add');
        addLog(this, 'remove');
      }
    },
    addModel: function(key) {
      if (log) {
        addLog((this.collection && logObjMap[hash(this.collection)] ? this.collection : this), key && ("change:" + key) || 'all');
      }
    },
    unwatch: function(key) {
      var observed, w, watch, _i, _len, _ref;
      if (w = watches[key = hash(key)]) {
        for (_i = 0, _len = w.length; _i < _len; _i++) {
          watch = w[_i];
          _ref = watch.w;
          for (key in _ref) {
            observed = _ref[key];
            observed.off(void 0, void 0, watch);
          }
        }
      }
    },
    watch: function(key, e, f, callContext) {
      var accesslog, accesslogObjMap, context, event, obj, value, w;
      callContext || (callContext = key);
      if (!type.isF(e)) {
        f.call(callContext, e);
      } else {
        e = fn.b0(e, key);
        f = fn.b1(f, callContext);
        key = hash(key);
        ((w = watches[key]) ? w : (watches[key] = [])).push(context = {
          e: e,
          f: f,
          w: {}
        });
        log = {};
        logObjMap = {};
        try {
          value = e();
        } catch (_error) {}
        accesslog = log;
        accesslogObjMap = logObjMap;
        logObjMap = log = false;
        context.w = accesslogObjMap;
        for (key in accesslog) {
          obj = accesslogObjMap[key];
          for (event in accesslog[key]) {
            obj.on(event, onChange, context);
          }
        }
        f(value);
      }
    }
  };
});
