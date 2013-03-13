
/**
 * almond 0.2.4 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);

            // cell patch
            if (!name) {
                name = relName;
            }
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        return req;
    };

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../../../src/almond", function(){});

// Generated by CoffeeScript 1.6.1

define('cell/defineView',['cell/View'], function(View) {
  var dfi;
  dfi = window.__installedViews || {};
  return {
    pluginBuilder: 'cell/defineView-builder-plugin',
    load: function(name, req, load, config) {
      var el;
      if (!dfi[name]) {
        dfi = true;
        el = document.createElement('link');
        el.href = req.toUrl(name + ".css");
        el.rel = 'stylesheet';
        el.type = 'text/css';
        (document.head || document.getElementsByTagName('head')[0]).appendChild(el);
      }
      load(function(proto) {
        proto || (proto = {});
        proto.className = proto._cellName = /(.*\/)?(.*)$/.exec(name)[2];
        return View.extend(proto);
      });
    }
  };
});

// Generated by CoffeeScript 1.6.1

define('util/hash',[],function() {
  var hashuid;
  hashuid = 0;
  return function(obj) {
    var objType;
    if (((objType = typeof obj) === 'object') && obj !== null) {
      return obj.$$hashkey || (obj.$$hashkey = "" + (++hashuid));
    } else {
      return objType + ':' + obj;
    }
  };
});

// Generated by CoffeeScript 1.6.1

define('util/type',{
  isA: Array.isArray || function(o) {
    return o instanceof Array;
  },
  isS: function(o) {
    return typeof o === 'string';
  },
  isF: function(o) {
    return typeof o === 'function';
  }
});

// Generated by CoffeeScript 1.6.1

define('util/fn',{
  b: function(f, o) {
    return function() {
      return f.apply(o, arguments);
    };
  },
  b0: function(f, o) {
    return function() {
      return f.call(o);
    };
  },
  b1: function(f, o) {
    return function(a1) {
      return f.call(o, a1);
    };
  },
  b2: function(f, o) {
    return function(a1, a2) {
      return f.call(o, a1, a2);
    };
  }
});

// Generated by CoffeeScript 1.6.1

define('dom/data',[],function() {
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
          if (expandoStore.handle && expandoStore.handle.destroy) {
            expandoStore.handle.destroy();
          }
          delete domCache[expandoId];
          element[domExpandoAttr] = void 0;
        }
      }
    }
  };
});

// Generated by CoffeeScript 1.6.1

define('util/ev',{
  rm: function(events, fn, whichOrCtx) {
    var ev, i, isWhich;
    i = -1;
    isWhich = typeof whichOrCtx === 'number';
    while (ev = events[++i]) {
      if ((isWhich ? ev[whichOrCtx] === fn : (ev[0] === fn) && (ev[1] === whichOrCtx))) {
        events.splice(i--, 1);
      }
    }
  }
});

// Generated by CoffeeScript 1.6.1

define('dom/browser',{
  msie: +(/msie (\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]
});

// Generated by CoffeeScript 1.6.1

define('dom/events',['util/ev', 'dom/browser', 'dom/data'], function(ev, browser, data) {
  var DOMUnbindAllEvents, addEventListenerFn, createEventHandler, eventHandlerDestroy, onFn, removeEventListenerFn;
  addEventListenerFn = window.document.addEventListener ? function(element, type, fn) {
    element.addEventListener(type, fn, false);
  } : function(element, type, fn) {
    element.attachEvent("on" + type, fn);
  };
  removeEventListenerFn = window.document.removeEventListener ? function(element, type, fn) {
    element.removeEventListener(type, fn, false);
  } : function(element, type, fn) {
    element.detachEvent("on" + type, fn);
  };
  eventHandlerDestroy = function() {
    DOMUnbindAllEvents(this.elem, this.events);
  };
  createEventHandler = function(element, events) {
    var eventHandler;
    eventHandler = function(event, type) {
      var evs, fc, prevent, _i, _len;
      if (!event.preventDefault) {
        event.preventDefault = function() {
          event.returnValue = false;
        };
      }
      if (!event.stopPropagation) {
        event.stopPropagation = function() {
          event.cancelBubble = true;
        };
      }
      if (!event.target) {
        event.target = event.srcElement || document;
      }
      if (event.defaultPrevented == null) {
        prevent = event.preventDefault;
        event.preventDefault = function() {
          event.defaultPrevented = true;
          prevent.call(event);
        };
        event.defaultPrevented = false;
      }
      event.isDefaultPrevented = function() {
        return event.defaultPrevented;
      };
      if (evs = events[type || event.type]) {
        for (_i = 0, _len = evs.length; _i < _len; _i++) {
          fc = evs[_i];
          fc[0].call(fc[1] || element, event);
        }
      }
      if (browser.msie <= 8) {
        event.preventDefault = null;
        event.stopPropagation = null;
        event.isDefaultPrevented = null;
      } else {
        delete event.preventDefault;
        delete event.stopPropagation;
        delete event.isDefaultPrevented;
      }
    };
    eventHandler.elem = element;
    eventHandler.events = events;
    eventHandler.destroy = eventHandlerDestroy;
    return eventHandler;
  };
  DOMUnbindAllEvents = function(element, events) {
    var type;
    for (type in events) {
      removeEventListenerFn(element, type, events[type]);
      delete events[type];
    }
  };
  return {
    on: onFn = function(element, type, fn, ctx) {
      var counter, eventFns, events, handle;
      if (!(events = data.get(element, 'events'))) {
        data.set(element, 'events', events = {});
      }
      if (!(handle = data.get(element, 'handle'))) {
        data.set(element, 'handle', handle = createEventHandler(element, events));
      }
      if (!(eventFns = events[type])) {
        if (type === 'mouseenter' || type === 'mouseleave') {
          counter = 0;
          events.mouseenter = [];
          events.mouseleave = [];
          onFn(element, 'mouseover', function(event) {
            counter++;
            if (counter === 1) {
              return handle(event, 'mouseenter');
            }
          });
          onFn(element, 'mouseout', function(event) {
            counter--;
            if (counter === 0) {
              return handle(event, 'mouseleave');
            }
          });
        } else {
          addEventListenerFn(element, type, handle);
          events[type] = [];
        }
        eventFns = events[type];
      }
      eventFns.push([fn, ctx]);
    },
    off: function(element, type, fn) {
      var events;
      if (events = data.get(element, 'events')) {
        if (type != null) {
          if (fn != null) {
            ev.rm(events[type], fn, 0);
          } else {
            removeEventListenerFn(element, type, events[type]);
            delete events[type];
          }
        } else {
          DOMUnbindAllEvents(element, events);
        }
      }
    }
  };
});

// Generated by CoffeeScript 1.6.1

define('dom/mutate',['dom/data'], function(data) {
  var dealloc;
  dealloc = function(element) {
    var children, i, len;
    data.remove(element);
    children = element.children;
    len = children.length;
    i = -1;
    while (++i < len) {
      dealloc(children[i]);
    }
  };
  return {
    remove: function(element) {
      var parent;
      dealloc(element);
      if (parent = element.parentNode) {
        parent.removeChild(element);
      }
    }
  };
});

// Generated by CoffeeScript 1.6.1

define('util/extend',[],function() {
  var constrProp, protoProp;
  constrProp = 'constructor';
  protoProp = 'prototype';
  return function(proto) {
    var Child, ChildSurrogate, Parent, Surrogate, childConstructor, childProto, k;
    Parent = this;
    Child = function() {
      if (!(this instanceof Child)) {
        return Child.apply(new ChildSurrogate(), arguments);
      }
      Parent.apply(this, arguments);
      if (childConstructor) {
        childConstructor.apply(this, arguments);
      }
      return this;
    };
    Child.extend = Parent.extend;
    Surrogate = function() {};
    Surrogate[protoProp] = Parent[protoProp];
    ChildSurrogate = function() {};
    childProto = ChildSurrogate[protoProp] = Child[protoProp] = new Surrogate();
    if (proto) {
      childConstructor = proto[constrProp];
      for (k in proto) {
        childProto[k] = proto[k];
      }
      if (childConstructor) {
        childProto[constrProp] = childConstructor;
      }
    }
    return Child;
  };
});

// Generated by CoffeeScript 1.6.1
var __slice = [].slice;

define('cell/Events',['util/type', 'util/extend', 'util/ev'], function(type, extend, ev) {
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

// Generated by CoffeeScript 1.6.1

define('util/defer',['dom/browser'], function(browser) {
  var nextTaskid, postMessageHandler, tasks;
  if (window.setImmediate) {
    return setImmediate;
  }
  if (browser.msie < 9) {
    return setTimeout;
  }
  nextTaskid = 0;
  tasks = {};
  postMessageHandler = function(event) {
    if (tasks[event = event.data]) {
      tasks[event]();
      delete tasks[event];
    }
  };
  if (window.attachEvent) {
    attachEvent('onmessage', postMessageHandler);
  } else {
    window.addEventListener('message', postMessageHandler);
  }
  return function(cb) {
    var taskid;
    tasks[taskid = nextTaskid++] = cb;
    postMessage(taskid, '*');
  };
});

// Generated by CoffeeScript 1.6.1

define('cell/util/spy',['util/hash', 'util/fn', 'util/type', 'util/defer'], function(hash, fn, type, defer) {
  var addLog, allChanges, evaluateAndMonitor, log, logStack, onChange, onChangeCalled, watches, _onChange;
  logStack = [];
  onChangeCalled = log = false;
  addLog = function(obj, event) {
    var key;
    if (!log.l[key = event + (obj.$$hashkey || hash(obj))]) {
      log.s += key;
      log.l[key] = {
        o: obj,
        e: event
      };
    }
  };
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
    allChanges[hash(this)] = this;
    if (!onChangeCalled) {
      onChangeCalled = true;
      defer(_onChange);
    }
  };
  return {
    _eam: evaluateAndMonitor = function(context) {
      var curLog, eventKey, prevLog, value;
      logStack.push(log);
      log = {
        s: '',
        l: curLog = {},
        c: {}
      };
      value = context.e();
      if (log.s !== context.s) {
        if (prevLog = context.l) {
          for (eventKey in prevLog) {
            if (curLog[eventKey]) {
              delete curLog[eventKey];
            } else {
              prevLog[eventKey].o.off(prevLog[eventKey].e, void 0, context);
            }
          }
        }
        for (eventKey in curLog) {
          curLog[eventKey].o.on(curLog[eventKey].e, onChange, context);
        }
        context.s = log.s;
        context.l = curLog;
      }
      log = logStack.pop();
      context.f(value);
    },
    addCol: function() {
      if (log) {
        log.c[this.$$hashkey || hash(this)] = true;
        addLog(this, 'add');
        addLog(this, 'remove');
      }
    },
    addModel: function(key) {
      var obj;
      if (log) {
        addLog(((obj = this.collection) && log.c[obj.$$hashkey || hash(obj)] ? obj : this), (key ? "change:" + key : 'all'));
      }
    },
    unwatch: function(key) {
      var context, i, w;
      if (w = watches[key = hash(key)]) {
        delete watches[key];
        i = 0;
        while ((context = w[i++])) {
          for (key in context.l) {
            context.l[key].o.off(void 0, void 0, context);
          }
        }
      }
    },
    watch: function(keyObj, e, f, callContext) {
      var context, key;
      callContext || (callContext = keyObj);
      if (!type.isF(e)) {
        f.call(callContext, e);
      } else {
        (watches[key = hash(keyObj)] || (watches[key] = [])).push(context = {
          e: fn.b0(e, keyObj),
          f: fn.b1(f, callContext)
        });
        evaluateAndMonitor(context);
        return context;
      }
    }
  };
});

// Generated by CoffeeScript 1.6.1

define('cell/Model',['util/type', 'cell/Events', 'cell/util/spy'], function(type, Events, spy) {
  var Model;
  Model = Events.extend({
    constructor: function(attributes) {
      this._a = attributes || {};
    },
    attributes: function() {
      var attr, result;
      if (this._a) {
        this._s();
        result = {};
        for (attr in this._a) {
          result[attr] = this._a[attr];
        }
        return result;
      }
    },
    get: function(key) {
      if (this._a) {
        this._s(key);
        return this._a[key];
      }
    },
    set: function(key, value) {
      var collection, event, old_value;
      if (this._a) {
        if ((type.isS(key)) && (this._a[key] !== value)) {
          old_value = this._a[key];
          this.trigger((event = "change:" + key), this, (this._a[key] = value), old_value);
          if (collection = this.collection) {
            collection.trigger(event, this, value, old_value);
          }
          return true;
        }
      }
    },
    onChangeAndDo: function(key, cb, ctx) {
      if (this._a) {
        if (this.on("change:" + key, cb, ctx)) {
          cb("initial:" + key, this, this.get(key));
        }
      }
    },
    destroy: function() {
      if (this._a) {
        Events.prototype.destroy.call(this);
        if (this.collection) {
          this.collection.remove([this]);
        }
        delete this._a;
      }
    },
    _s: spy.addModel
  });
  return Model;
});

// Generated by CoffeeScript 1.6.1

define('cell/Collection',['cell/Events', 'util/type', 'cell/Model', 'cell/util/spy'], function(Events, type, Model, spy) {
  var Collection, iter;
  iter = function(str, before, after) {
    return Function.call(void 0, 'f', 'c', 'd', "if(this._i){" + "this._s();" + "if(f==null)return;" + ("var i=-1,t=this,l=t.length(),e" + (before || '') + ";") + "while(++i<l){" + "e=t._i[i];" + str + ("}" + (after || '') + "}"));
  };
  return Collection = Events.extend({
    constructor: function(array) {
      this._i = [];
      this.add(array);
    },
    model: Model,
    at: function(index) {
      if (this._i) {
        this._s();
        return this._i[index];
      }
    },
    length: function() {
      if (this._i) {
        this._s();
        return this._i.length;
      }
    },
    indexOf: Array.prototype.indexOf ? function(model) {
      if (this._i) {
        this._s();
        return this._i.indexOf(model);
      }
    } : iter('if(e===f){return i}', '', 'return -1'),
    toArray: function() {
      if (this._i) {
        this._s();
        return this._i.slice();
      }
    },
    each: iter('if(f.call(c,e,i,t)===!1)i=l'),
    map: iter('r.push(f.call(c,e,i,t))', ',r=[]', 'return r'),
    reduce: iter('f=c.call(d,f,e,i,t)', '', 'return f'),
    filterBy: iter('for(k in f)' + 'if((v=f[k])==null||v===(x=e.get(k))||(typeof v=="function"&&v(x)))' + 'r.push(e)', ',k,v,x,r=[]', 'return r'),
    pipe: function(pipes) {
      var cur, pipe, _i, _len;
      if (this._i) {
        cur = this;
        for (_i = 0, _len = pipes.length; _i < _len; _i++) {
          pipe = pipes[_i];
          if (type.isA((cur = pipe.run(cur)))) {
            cur = new Collection(cur);
          }
        }
        return cur;
      }
    },
    add: function(models, index) {
      var i, len;
      if (this._i && models) {
        models = type.isA(models) ? models.slice() : [models];
        i = -1;
        len = models.length;
        if (index == null) {
          index = this.length();
        }
        while (++i < len) {
          this._i.splice(index++, 0, (models[i] = this._toM(models[i])));
        }
        this.trigger('add', models, this, index - len);
      }
    },
    remove: function(models) {
      var i, index, indices, len, model, removedModels;
      if (this._i && models) {
        if (!type.isA(models)) {
          models = [models];
        }
        i = -1;
        len = models.length;
        removedModels = [];
        indices = [];
        while (++i < len) {
          model = models[i];
          if ((index = this.indexOf(model)) > -1) {
            delete model.collection;
            removedModels.push(model);
            indices.push(index);
            this._i.splice(index, 1);
          }
        }
        if (indices.length) {
          this.trigger('remove', removedModels, this, indices);
        }
      }
    },
    destroy: function() {
      if (this._i) {
        Events.prototype.destroy.call(this);
        delete this._i;
      }
    },
    _toM: function(o) {
      o = o instanceof this.model ? o : new Model(o);
      o.collection = this;
      return o;
    },
    _s: spy.addCol
  });
});

// Generated by CoffeeScript 1.6.1

define('cell/Ext',['util/extend', 'cell/util/spy'], function(extend, spy) {
  var Ext;
  Ext = function(options) {
    this.options = options != null ? options : {};
  };
  Ext.prototype.watch = function(v, callback) {
    spy.watch(this.view, v, callback, this);
  };
  Ext.prototype.run = function(element, view) {
    this.view = view;
    this.el = element;
    this.render();
  };
  Ext.extend = extend;
  return Ext;
});

// Generated by CoffeeScript 1.6.1

define('cell/View',['util/hash', 'util/type', 'util/fn', 'dom/data', 'dom/events', 'dom/mutate', 'cell/Model', 'cell/Collection', 'cell/Ext', 'cell/util/spy'], function(hash, _arg, fn, data, events, mutate, Model, Collection, Ext, _arg1) {
  var Bind, EachBind, HashQueue, IfBind, View, constrProp, d, isA, isF, isS, noop, protoProp, removeChildren, render, setElAttribute, unwatch, watch, __;
  isA = _arg.isA, isF = _arg.isF, isS = _arg.isS;
  watch = _arg1.watch, unwatch = _arg1.unwatch;
  protoProp = 'prototype';
  constrProp = 'constructor';
  noop = function() {};
  d = document;
  removeChildren = function(parent, children) {
    var node;
    while ((node = children.pop())) {
      parent.removeChild(node);
    }
  };
  render = function(parent, view, renderValue, prevNodes) {
    var newNodes;
    if (renderValue == null) {
      renderValue = [d.createTextNode('')];
    }
    newNodes = view._rcs(renderValue, parent, prevNodes[0]);
    removeChildren(parent, prevNodes);
    return newNodes;
  };
  Bind = function(view, expr) {
    this.r = function(parent) {
      var nodes;
      nodes = [];
      watch(view, expr, function(renderValue) {
        nodes = render(parent, view, renderValue, nodes);
      });
    };
  };
  IfBind = function(view, cond, thnElse) {
    this.r = function(parent) {
      var nodes;
      nodes = [];
      watch(view, cond, function(condValue) {
        nodes = render(parent, view, view.__["if"](condValue, thnElse), nodes);
      });
    };
  };
  HashQueue = function() {
    this.h = {};
  };
  HashQueue[protoProp] = {
    push: function(key, val) {
      var entry, _base;
      entry = ((_base = this.h)[key] || (_base[key] = []));
      entry.push(val);
    },
    shift: function(key) {
      var entry;
      if (entry = this.h[key]) {
        if (entry.lengh === 1) {
          delete this.h[key];
          return entry[0];
        } else {
          return entry.shift();
        }
      }
    }
  };
  EachBind = function(view, expr, itemRenderer) {
    var itemhash;
    itemhash = new HashQueue;
    this.r = function(parent) {
      watch(view, expr, function(value) {
        var i, item, key, len, newEls, newItemHash, prevItemEl;
        newEls = [];
        newItemHash = new HashQueue;
        i = 0;
        len = value.length;
        while (i < len) {
          if (!(prevItemEl = itemhash.shift(key = hash(item = value[i++])))) {
            prevItemEl = itemRenderer[protoProp] instanceof View ? new itemRenderer({
              model: item
            }).el : itemRenderer.call(view, item);
          }
          newItemHash.push(key, prevItemEl);
          newEls.push(prevItemEl);
        }
        for (key in itemhash.h) {
          removeChildren(parent, itemhash.h[key]);
        }
        itemhash = newItemHash;
        i = 0;
        len = newEls.length;
        while (i < len) {
          parent.appendChild(newEls[i++]);
        }
      });
    };
  };
  EachBind[protoProp][constrProp] = IfBind[protoProp][constrProp] = Bind;
  setElAttribute = function(el, key, value) {
    if (key === 'innerHTML') {
      el.innerHTML = value;
    } else {
      el.setAttribute(key, value);
    }
  };
  __ = function(viewOrHAML, optionsOrFirstChild) {
    var children, classes, exts, i, k, len, m, match, options, parent, v;
    children = [].slice.call(arguments, 1);
    i = -1;
    len = children.length;
    while (++i < len) {
      if (!(children[i] instanceof Ext)) {
        break;
      }
    }
    exts = children.splice(0, i);
    options = children.length && children[0] && children[0][constrProp] === Object ? children.shift() : {};
    if (isS(viewOrHAML)) {
      if (m = /^(\w+)?(#([\w\-]+))?(\.[\w\.\-]+)?$/.exec(viewOrHAML)) {
        parent = d.createElement(m[1] || 'div');
        if (m[3]) {
          parent.setAttribute('id', m[3]);
        }
        if (m[4]) {
          classes = m[4].slice(1).replace(/\./g, ' ');
          options["class"] = options["class"] ? classes + (" " + options["class"]) : classes;
        }
        for (k in options) {
          v = options[k];
          if (match = /^on(\w+)/.exec(k)) {
            events.on(parent, match[1], v, this);
          } else {
            watch(this, v, (function(k) {
              return function(value) {
                setElAttribute(parent, k, value);
              };
            })(k));
          }
        }
      }
    } else if (viewOrHAML && viewOrHAML[protoProp] instanceof View) {
      parent = new viewOrHAML(options).el;
    }
    if (parent) {
      this._rcs(children, parent);
      i = exts.length;
      while (i--) {
        exts[i].run(parent, this);
      }
      return parent;
    }
  };
  __["if"] = function(condition, thenElse) {
    var _ref;
    if (isF(condition)) {
      return new IfBind(this.view, condition, thenElse);
    } else {
      return (_ref = thenElse[condition ? 'then' : 'else']) != null ? _ref.call(this.view) : void 0;
    }
  };
  __.each = function(col, renderer) {
    var i, len, results;
    if (col) {
      if (col instanceof Collection) {
        col = fn.b0(col.toArray, col);
      }
      if (isF(col)) {
        return new EachBind(this.view, col, renderer);
      } else {
        len = col.length;
        i = -1;
        results = [];
        while (++i < len) {
          results.push((renderer[protoProp] instanceof View ? new renderer({
            model: col[i]
          }).el : renderer.call(this.view, col[i], i, col)));
        }
        return results;
      }
    }
  };
  return View = Model.extend({
    constructor: function(options) {
      var cellName, cls, el, t, _;
      t = this;
      t.options = options ? (t.model = options.model, t.collection = options.collection, delete options.model, delete options.collection, options) : {};
      __ = View[protoProp].__;
      _ = t.__ = fn.b(__, t);
      _["if"] = __["if"];
      _.each = __.each;
      _.view = t;
      t.beforeRender();
      t.el = el = t.renderEl(_);
      cellName = t._cellName;
      el.className = (cls = el.className) ? cls + ' ' + cellName : cellName;
      data.set(el, 'cellRef', t);
      el.setAttribute('cell', cellName);
      t._rcs(t.render(this.__), el);
      t.afterRender();
    },
    beforeRender: noop,
    renderEl: function() {
      return d.createElement('div');
    },
    render: noop,
    afterRender: noop,
    watch: function(expr, callback) {
      watch(this, expr, callback);
    },
    __: __,
    destroy: function() {
      if (this.el) {
        Model[protoProp].destroy.call(this);
        unwatch(this);
        mutate.remove(this.el);
        delete this.el;
      }
    },
    _rc: function(n, parent, insertBeforeNode, rendered) {
      var _ref;
      if (isF(n)) {
        n = new Bind(this, n);
      }
      if (n[constrProp] === Bind) {
        n.r(parent);
      } else if ((_ref = n.nodeType) === 1 || _ref === 3) {
        rendered.push(parent.insertBefore(n, insertBeforeNode));
      } else if (isA(n)) {
        this._rcs(n, parent, insertBeforeNode, rendered);
      } else {
        rendered.push(parent.insertBefore(d.createTextNode(n), insertBeforeNode));
      }
    },
    _rcs: function(nodes, parent, insertBeforeNode, rendered) {
      var n, _i, _len;
      if (insertBeforeNode == null) {
        insertBeforeNode = null;
      }
      if (rendered == null) {
        rendered = [];
      }
      if (nodes == null) {
        return rendered;
      }
      if (!isA(nodes)) {
        nodes = [nodes];
      }
      for (_i = 0, _len = nodes.length; _i < _len; _i++) {
        n = nodes[_i];
        if (n != null) {
          this._rc(n, parent, insertBeforeNode, rendered);
        }
      }
      return rendered;
    }
  });
});

// Generated by CoffeeScript 1.6.1

define('dir/MockNested',['require','cell/defineView!'],function(require) {
  return require('cell/defineView!')({
    render: function() {
      return ["MockNested"];
    }
  });
});

;window.__installedViews = {"dir/MockNested":1,"Mock":1};
// Generated by CoffeeScript 1.6.1

define('Mock',['require','dir/MockNested','cell/defineView!'],function(require) {
  var MockNested;
  MockNested = require('dir/MockNested');
  return require('cell/defineView!')({
    render: function(__) {
      return ["Mock: ", __(MockNested)];
    }
  });
});

// Generated by CoffeeScript 1.6.1

define('App',['require','./Mock'],function(require) {
  var Mock;
  Mock = require('./Mock');
  return document.body.appendChild(new Mock().el);
});
require('App');