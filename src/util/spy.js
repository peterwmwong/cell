// Generated by CoffeeScript 1.6.3
define(['cell/util/hash', 'cell/util/fn', 'cell/util/type', 'cell/util/defer'], function(hash, fn, type, defer) {
  var Scope, allChanges, evaluateAndMonitor, logStack, onChange, onChangeCalled, prevScope, scope, watches, _onChange;
  logStack = [];
  onChangeCalled = false;
  prevScope = scope = void 0;
  allChanges = {};
  watches = {};
  _onChange = function() {
    var changes, key;
    onChangeCalled = false;
    changes = allChanges;
    allChanges = {};
    for (key in changes) {
      evaluateAndMonitor(changes[key]);
    }
  };
  onChange = function() {
    allChanges[this.$$hashkey || hash(this)] = this;
    if (this.scope.imm) {
      evaluateAndMonitor(this);
    } else if (!onChangeCalled) {
      onChangeCalled = true;
      defer(_onChange);
    }
  };
  Scope = function(imm) {
    this.imm = imm;
    this.sig = '';
    this.log = {};
    this.col = {};
  };
  return {
    _eam: evaluateAndMonitor = function(context) {
      var eventKey, log, plog, suspendedScope, value;
      suspendedScope = scope;
      prevScope = context.scope;
      scope = new Scope(prevScope.imm);
      value = context.e();
      if (scope.sig !== prevScope.sig) {
        plog = prevScope.log;
        log = scope.log;
        for (eventKey in scope.col) {
          log["add" + eventKey] = {
            o: scope.col[eventKey],
            e: 'add'
          };
          log["remove" + eventKey] = {
            o: scope.col[eventKey],
            e: 'remove'
          };
        }
        for (eventKey in log) {
          if (plog[eventKey]) {
            delete plog[eventKey];
          } else {
            log[eventKey].o.on(log[eventKey].e, onChange, context);
          }
        }
        for (eventKey in plog) {
          plog[eventKey].o.off(plog[eventKey].e, void 0, context);
        }
        context.scope = scope;
      }
      scope = suspendedScope;
      context.f(value);
    },
    addResStatus: function() {
      var eventKey;
      if (scope && !scope.log[eventKey = "status" + this.$$hashkey]) {
        scope.sig += eventKey;
        scope.log[eventKey] = {
          o: this,
          e: eventKey
        };
      }
    },
    addParent: function(obj) {
      var eventKey;
      if (scope && !scope.log[eventKey = "parent" + obj.$$hashkey]) {
        scope.sig += eventKey;
        scope.log[eventKey] = {
          o: obj,
          e: eventKey
        };
      }
    },
    addCol: function() {
      var key;
      if (scope && !scope.col[key = this.$$hashkey]) {
        scope.sig += key;
        scope.col[key] = this;
      }
    },
    addModel: function(event) {
      var eventKey, key, obj;
      if (scope) {
        eventKey = event + ((obj = this.parent()) && scope.col[key = obj.$$hashkey] ? key : (obj = this).$$hashkey);
        if (!scope.log[eventKey]) {
          scope.sig += eventKey;
          scope.log[eventKey] = {
            o: obj,
            e: event
          };
        }
      }
    },
    suspendWatch: function(f) {
      var suspendedScope;
      suspendedScope = scope;
      scope = void 0;
      try {
        f();
      } catch (_error) {}
      scope = suspendedScope;
    },
    unwatch: function(key) {
      var context, i, w;
      if (w = watches[key = hash(key)]) {
        delete watches[key];
        i = 0;
        while ((context = w[i++])) {
          for (key in context.scope.log) {
            context.scope.log[key].o.off(void 0, void 0, context);
          }
        }
      }
    },
    watch: function(keyObj, e, f, callContext, immediate) {
      var context, key;
      callContext || (callContext = keyObj);
      if (!type.isF(e)) {
        f.call(callContext, e);
      } else {
        (watches[key = hash(keyObj)] || (watches[key] = [])).push(context = {
          e: fn.b0(e, keyObj),
          f: fn.b1(f, callContext),
          scope: new Scope(immediate)
        });
        evaluateAndMonitor(context);
        return context;
      }
    }
  };
});

/*
//@ sourceMappingURL=spy.map
*/