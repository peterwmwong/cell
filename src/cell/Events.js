// Generated by CoffeeScript 1.4.0
var __slice = [].slice;

define(['util/type', 'util/extend', 'util/ev'], function(type, extend, ev) {
  var Events, triggerHandlers;
  triggerHandlers = function(handlers, event, args) {
    var h;
    while ((h = handlers.pop())) {
      h[0].apply(h[1], [event].concat(args));
    }
  };
  Events = function() {
    this._e = {
      all: []
    };
  };
  Events.extend = extend;
  Events.prototype = {
    constructor: Events,
    on: function(event, fn, ctx) {
      var _base;
      if (this._e) {
        if ((type.isS(event)) && (type.isF(fn))) {
          ((_base = this._e)[event] || (_base[event] = [])).push([fn, ctx]);
          return true;
        }
      }
    },
    off: function(event, fn, ctx) {
      var events, eventsHash;
      if (this._e) {
        eventsHash = event != null ? {
          type: this._e[event]
        } : this._e;
        if (fn != null) {
          if (ctx == null) {
            ctx = 0;
          }
        } else if (ctx != null) {
          fn = ctx;
          ctx = 1;
        } else {
          return;
        }
        for (event in eventsHash) {
          if (events = eventsHash[event]) {
            ev.rm(events, fn, ctx);
          }
        }
      }
    },
    trigger: function() {
      var args, event;
      event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (this._e) {
        triggerHandlers(this._e.all.concat(this._e[event] || []), event, args);
      }
    },
    destroy: function() {
      var events;
      if (events = this._e) {
        delete this._e;
        triggerHandlers(events.all.concat(events.destroy || []), 'destroy', this);
      }
    }
  };
  return Events;
});
