define(['underscore'], function(_) {
  'use strict';

  function arrayRemove(array, value) {
    var index = _.indexOf(array, value);
    if(index >= 0) array.splice(index, 1);
    return value;
  }

  function isDefined(value) {
    return typeof value != 'undefined';
  };

  function isWindow(obj) {
    return obj && obj.document && obj.location && obj.alert && obj.setInterval;
  };

  function lowercase(string) {
    return _.isString(string) ? string.toLowerCase() : string;
  };

  function trim(value) {
    return _.isString(value) ? value.replace(/^\s*/, '').replace(/\s*$/, '') : value;
  };

  function uppercase(string) {
    return _.isString(string) ? string.toUpperCase() : string;
  };

  function isUndefined(obj){
    return obj == null;
  };
  var msie = Number((/msie (\d+)/.exec(lowercase(navigator.userAgent)) || [])[1]);

  var domCache = DOM.cache = {},
    domExpandoAttr = DOM.expando = 'dom-' + new Date().getTime(),
    domId = 1,
    addEventListenerFn = (
      (window.document.addEventListener)
        ? function(element, type, fn) { element.addEventListener(type, fn, false); }
        : function(element, type, fn) { element.attachEvent('on' + type, fn); }
    ),
    removeEventListenerFn = (
      (window.document.removeEventListener)
        ? function(element, type, fn) { element.removeEventListener(type, fn, false); }
        : function(element, type, fn) { element.detachEvent('on' + type, fn); }
    );

  function domNextId() {
    return ++domId;
  }

  var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
  var MOZ_HACK_REGEXP = /^moz([A-Z])/;

  /**
   * Converts snake_case to camelCase.
   * Also there is special case for Moz prefix starting with upper case letter.
   * @param name Name to normalize
   */

  function camelCase(name) {
    return name.
      replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
        return offset ? letter.toUpperCase() : letter;}
      ).
      replace(MOZ_HACK_REGEXP, 'Moz$1');
  }


  /////////////////////////////////////////////

  function DOM(element) {
    if(element instanceof DOM) {
      return element;
    }
    if(!(this instanceof DOM)) {
      if(_.isString(element) && element.charAt(0) !== '<') {
        throw Error('selectors not implemented');
      }
      return new DOM(element);
    }

    if(_.isString(element)) {
      var div = document.createElement('div');
      // Read about the NoScope elements here:
      // http://msdn.microsoft.com/en-us/library/ms533897(VS.85).aspx
      div.innerHTML = '<div>&#160;</div>' + element; // IE insanity to make NoScope elements work!
      div.removeChild(div.firstChild); // remove the superfluous div
      DOMAddNodes(this, div.childNodes);
      this.remove(); // detach the elements from the temporary DOM div.
    } else {
      DOMAddNodes(this, element);
    }
  }
  var dom = DOM;

  function DOMClone(element) {
    return element.cloneNode(true);
  }

  function DOMDealoc(element) {
    DOMRemoveData(element);
    for(var i = 0, children = element.childNodes || []; i < children.length; i++) {
      DOMDealoc(children[i]);
    }
  }

  function DOMUnbindAllEvents(element,events){
    for (var type in events) {
      removeEventListenerFn(element, type, events[type]);
      delete events[type];
    };
  }

  function DOMUnbind(element, type, fn) {
    var handle = DOMExpandoStoreGet(element, 'handle'),
        events = DOMExpandoStoreGet(element, 'events');
    if(!handle) return; //no listeners registered
    if(isUndefined(type)) {
      DOMUnbindAllEvents(element,events);
    } else {
      if(isUndefined(fn)) {
        removeEventListenerFn(element, type, events[type]);
        delete events[type];
      } else {
        arrayRemove(events[type], fn);
      }
    }
  }

  function DOMRemoveData(element) {
    var expandoId = element[domExpandoAttr],
        expandoStore = domCache[expandoId];

    if(expandoStore) {
      if(expandoStore.handle) {
        DOMUnbindAllEvents(element,expandoStore.events);
      }
      delete domCache[expandoId];
      element[domExpandoAttr] = undefined; // ie does not allow deletion of attributes on elements.
    }
  }

  // Split DOMExpandoStore into Get/Set for perf (http://jsperf.com/expandostore-getset/2)
  function DOMExpandoStoreSet(element, key, value) {
    var expandoId = element[domExpandoAttr];
    ( (!expandoId)
        ? (element[domExpandoAttr] = expandoId = domNextId(), domCache[expandoId] = {})
        : domCache[expandoId]
    )[key] = value;
  }

  function DOMExpandoStoreGet(element, key) {
    var expandoId = element[domExpandoAttr];
    return expandoId && domCache[expandoId][key];
  }

  function DOMHasClass(element, selector) {
    return((" " + element.className + " ").replace(/[\n\t]/g, " ").
    indexOf(" " + selector + " ") > -1);
  }

  function DOMRemoveClass(element, cssClasses) {
    if(cssClasses) {
      _.each(cssClasses.split(' '), function(cssClass) {
        element.className = trim(
        (" " + element.className + " ").replace(/[\n\t]/g, " ").replace(" " + trim(cssClass) + " ", " "));
      });
    }
  }

  function DOMAddClass(element, cssClasses) {
    if(cssClasses) {
      _.each(cssClasses.split(' '), function(cssClass) {
        if(!DOMHasClass(element, cssClass)) {
          element.className = trim(element.className + ' ' + trim(cssClass));
        }
      });
    }
  }

  function DOMAddNodes(root, elements) {
    if(elements) {
      elements = (!elements.nodeName && isDefined(elements.length) && !isWindow(elements)) ? elements : [elements];
      for(var i = 0; i < elements.length; i++) {
        root.push(elements[i]);
      }
    }
  }

  //////////////////////////////////////////
  // Functions which are declared directly.
  //////////////////////////////////////////
  var DOMPrototype = DOM.prototype = {
    camelCase: camelCase,
    lowercase: lowercase,
    DOMExpandoStoreGet: DOMExpandoStoreGet,
    DOMExpandoStoreSet: DOMExpandoStoreSet,
    eq: function(index) {
      return(index >= 0) ? dom(this[index]) : dom(this[this.length + index]);
    },
    length: 0,
    push: [].push,
    sort: [].sort,
    splice: [].splice
  };

  //////////////////////////////////////////
  // Functions iterating getter/setters.
  // these functions return self on setter and
  // value on get.
  //////////////////////////////////////////
  DOM.prototype.BOOLEAN_ATTR = {
    multiple:true,
    selected:true,
    checked:true,
    disabled:true,
    readonly:true,
    required:true
  };

  var BOOLEAN_ELEMENTS = {
    INPUT:true,
    SELECT:true,
    OPTION:true,
    TEXTAREA:true,
    BUTTON:true,
    FORM:true
  };

  function createIter(body){
    return new Function('name',
      "for(var i=0,len=this.length;i<len;++i){"+
        body+
      "}"+
      "return this;"
    );
  }

  DOM.prototype.removeAttr = createIter("this[i].removeAttribute(name);");

  function createGetSetIter(name, desc){
    var before, loop, set = desc.set;

    // get
    DOM.prototype[name] = new Function('name',
      'var val,e=this[0];'+
      desc.get+
      'return val;'
    );

    // getAll
    DOM.prototype[name+'All'] = new Function('ns',
       'var n,v={};'+
       'for(var i=0;i<ns.length;++i){'+
         'n=ns[i];'+
         'v[n]=this.'+name+'(n);'+
       '}'+
       'return v;'
    );

    // set
    loop = (typeof set === 'string')
      ? set
      : (before = set.before, set.loop)

    DOM.prototype[name+'Set'] = new Function('name','val',
      'var e;'+
      (before || '')+
      'for(var i=0;i<this.length;++i){'+
        'e=this[i];'+
        loop+
      '}'+
      'return this;'
    );

    // setAll
    DOM.prototype[name+'SetAll'] = new Function('val',(
      (desc.setAll)
        ? desc.setAll
        : 'for(var n in val){'+
            'this.'+name+'Set(n,val[n]);'+
          '}'+
          'return this;'
    ));
  }

  createGetSetIter('css',{
    get: (
      "name=this.camelCase(name);"+
      ((msie <= 8)
        ? "val=e.currentStyle&&e.currentStyle[name];"+
          "if(val===''){val='auto;'}"+
          "val=val||e.styl[name];"
        : "val=e.style[name];")+
      ((msie <= 8)
        ? "val=(val==='')?void 0:val;"
        : "")
    ),
    set: {
      before: 'name=this.camelCase(name);',
      loop: "e.style[name]=val;"
    }
  });

  createGetSetIter('attr',{
    get: (
      "var lowercasedName=this.lowercase(name),item;"+
      "if(this.BOOLEAN_ATTR[lowercasedName]){"+
        "if(e[name]||((item=e.attributes.getNamedItem(name))&&item.specified)){"+
          "val=lowercasedName;"+
        "}"+
      "}else{"+
        // the extra argument "2" is to get the right thing for a.href in IE, see jQuery code
        // some elements (e.g. Document) don't have get attribute, so return undefined
        "val=e.getAttribute(name,2);"+
        "if(val===null){val=void 0;}"+
      "}"
    ),
    set: {
      before: "var lowercasedName=this.lowercase(name);",
      loop:
        "if(this.BOOLEAN_ATTR[lowercasedName]){"+
          "(!!val)?e.setAttribute(name,lowercasedName):e.removeAttribute(lowercasedName);"+
        "}else{"+
          "e.setAttribute(name,val)"+
        "}"
    }
  });


  createGetSetIter('data',{
    get: (
      "var d=this.DOMExpandoStoreGet(e,'data');"+
      "if(name==null){"+
        "val=(!d)"+
          "?(this.DOMExpandoStoreSet(e,'data',val={}),val)"+
          ":d;"+
      "}else{"+
        "val=d&&d[name];"+
      "}"
    ),
    set: (
      "var d=this.DOMExpandoStoreGet(e,'data');"+
      "if(!d){"+
        "this.DOMExpandoStoreSet(e,'data',d={});"+
      "}"+
      "d[name]=val;"
    ),
    setAll: (
      'for(var i=0,e;e=this[i],i<this.length;++i){'+
        "var d=this.DOMExpandoStoreGet(e,'data');"+
        "if(!d){"+
          "this.DOMExpandoStoreSet(e,'data',d={});"+
        "}"+
        "_.extend(d,val)"+
      '}'+
      'return this;'
    )
  });
  
  createGetSetIter('css',{
    get: (
      "name=this.camelCase(name);"+
      ((msie <= 8)
        ? "val=e.currentStyle&&e.currentStyle[name];"+
          "if(val===''){val='auto;'}"+
          "val=val||e.style[name];"
        : "val=e.style[name];")+
      ((msie <= 8)
        ? "val=(val==='')?void 0:val;"
        : "")
    ),
    set: {
      before: 'name=this.camelCase(name);',
      loop: "e.style[name]=val;"
    }
  });

  createGetSetIter('prop',{
    get: "val=e[name];",
    set: "e[name]=val;"
  });

  _.each({
    hasClass: DOMHasClass,
    text: _.extend(
      ((msie < 9)
        ? function(element, value) {
            if(element.nodeType == 1 /** Element */ ) {
              if(isUndefined(value)) return element.innerText;
              element.innerText = value;
            } else {
              if(isUndefined(value)) return element.nodeValue;
              element.nodeValue = value;
            }
          }
        : function(element, value) {
            if(isUndefined(value)) {
              return element.textContent;
            }
            element.textContent = value;
          }
      ),
      {$dv: ''}
    ),

    val: function(element, value) {
      if(isUndefined(value)) {
        return element.value;
      }
      element.value = value;
    },

    html: function(element, value) {
      if(isUndefined(value)) {
        return element.innerHTML;
      }
      for(var i = 0, childNodes = element.childNodes; i < childNodes.length; i++) {
        DOMDealoc(childNodes[i]);
      }
      element.innerHTML = value;
    }
  }, function(fn, name) {
    /**
     * Properties: writes return selection, reads return first value
     */
    DOM.prototype[name] = function(arg1, arg2) {
      var i, key;

      // DOMHasClass has only two arguments, but is a getter-only fn, so we need to special-case it
      // in a way that survives minification.
      if(((fn.length == 2 && (fn !== DOMHasClass)) ? arg1 : arg2) === undefined) {
        if(_.isObject(arg1)) {

          // we are a write, but the object properties are the key/values
          for(i = 0; i < this.length; i++) {
            if(fn === DOMData) {
              // data() takes the whole object in jQuery
              fn(this[i], arg1);
            } else {
              for(key in arg1) {
                fn(this[i], key, arg1[key]);
              }
            }
          }
          // return self for chaining
          return this;
        } else {
          // we are a read, so read the first child.
          if(this.length) return fn(this[0], arg1, arg2);
        }
      } else {
        // we are a write, so apply to all children
        for(i = 0; i < this.length; i++) {
          fn(this[i], arg1, arg2);
        }
        // return self for chaining
        return this;
      }
      return fn.$dv;
    };
  });

  function createEventHandler(element, events) {
    var eventHandler = function(event, type) {
        if(!event.preventDefault) {
          event.preventDefault = function() {
            event.returnValue = false; //ie
          };
        }

        if(!event.stopPropagation) {
          event.stopPropagation = function() {
            event.cancelBubble = true; //ie
          };
        }

        if(!event.target) {
          event.target = event.srcElement || document;
        }

        if(isUndefined(event.defaultPrevented)) {
          var prevent = event.preventDefault;
          event.preventDefault = function() {
            event.defaultPrevented = true;
            prevent.call(event);
          };
          event.defaultPrevented = false;
        }

        event.isDefaultPrevented = function() {
          return event.defaultPrevented;
        };

        _.each(events[type || event.type], function(fn) {
          fn.call(element, event);
        });

        // Remove monkey-patched methods (IE),
        // as they would cause memory leaks in IE8.
        if(msie <= 8) {
          // IE7/8 does not allow to delete property on native object
          event.preventDefault = null;
          event.stopPropagation = null;
          event.isDefaultPrevented = null;
        } else {
          // It shouldn't affect normal browsers (native methods are defined on prototype).
          delete event.preventDefault;
          delete event.stopPropagation;
          delete event.isDefaultPrevented;
        }
      };
    eventHandler.elem = element;
    return eventHandler;
  }

  //////////////////////////////////////////
  // Functions iterating traversal.
  // These functions chain results into a single
  // selector.
  //////////////////////////////////////////
  _.each({
    removeData: DOMRemoveData,

    dealoc: DOMDealoc,

    bind: function bindFn(element, type, fn) {
      var events = DOMExpandoStoreGet(element, 'events'),
        handle = DOMExpandoStoreGet(element, 'handle');

      if(!events) DOMExpandoStoreSet(element, 'events', events = {});
      if(!handle) DOMExpandoStoreSet(element, 'handle', handle = createEventHandler(element, events));

      _.each(type.split(' '), function(type) {
        var eventFns = events[type];

        if(!eventFns) {
          if(type == 'mouseenter' || type == 'mouseleave') {
            var counter = 0;

            events.mouseenter = [];
            events.mouseleave = [];

            bindFn(element, 'mouseover', function(event) {
              counter++;
              if(counter == 1) {
                handle(event, 'mouseenter');
              }
            });
            bindFn(element, 'mouseout', function(event) {
              counter--;
              if(counter == 0) {
                handle(event, 'mouseleave');
              }
            });
          } else {
            addEventListenerFn(element, type, handle);
            events[type] = [];
          }
          eventFns = events[type]
        }
        eventFns.push(fn);
      });
    },

    unbind: DOMUnbind,

    replaceWith: function(element, replaceNode) {
      var index, parent = element.parentNode;
      DOMDealoc(element);
      _.each(new DOM(replaceNode), function(node) {
        if(index) {
          parent.insertBefore(node, index.nextSibling);
        } else {
          parent.replaceChild(node, element);
        }
        index = node;
      });
    },

    children: function(element) {
      var children = [];
      _.each(element.childNodes, function(element) {
        if(element.nodeName != '#text') children.push(element);
      });
      return children;
    },

    contents: function(element) {
      return element.childNodes;
    },

    append: function(element, node) {
      _.each(new DOM(node), function(child) {
        if(element.nodeType === 1 || element.nodeType === 11) {
          element.appendChild(child);
        }
      });
    },

    prepend: function(element, node) {
      if(element.nodeType === 1) {
        var index = element.firstChild;
        _.each(new DOM(node), function(child) {
          if(index) {
            element.insertBefore(child, index);
          } else {
            element.appendChild(child);
            index = child;
          }
        });
      }
    },

    wrap: function(element, wrapNode) {
      wrapNode = dom(wrapNode)[0];
      var parent = element.parentNode;
      if(parent) {
        parent.replaceChild(wrapNode, element);
      }
      wrapNode.appendChild(element);
    },

    remove: function(element) {
      DOMDealoc(element);
      var parent = element.parentNode;
      if(parent) parent.removeChild(element);
    },

    after: function(element, newElement) {
      var index = element,
        parent = element.parentNode;
      _.each(new DOM(newElement), function(node) {
        parent.insertBefore(node, index.nextSibling);
        index = node;
      });
    },

    addClass: DOMAddClass,
    removeClass: DOMRemoveClass,

    toggleClass: function(element, selector, condition) {
      if(isUndefined(condition)) {
        condition = !DOMHasClass(element, selector);
      }
      (condition ? DOMAddClass : DOMRemoveClass)(element, selector);
    },

    parent: function(element) {
      var parent = element.parentNode;
      return parent && parent.nodeType !== 11 ? parent : null;
    },

    next: function(element) {
      return element.nextSibling;
    },

    find: function(element, selector) {
      return element.getElementsByTagName(selector);
    },

    clone: DOMClone,

    triggerHandler: function(element, eventName) {
      var eventFns = (DOMExpandoStoreGet(element, 'events') || {})[eventName];

      _.each(eventFns, function(fn) {
        fn.call(element, null);
      });
    }
  }, function(fn, name) {
    /**
     * chaining functions
     */
    DOM.prototype[name] = function(arg1, arg2) {
      var value;
      for(var i = 0; i < this.length; i++) {
        if(value == undefined) {
          value = fn(this[i], arg1, arg2);
          if(value !== undefined) {
            // any function which returns a value needs to be wrapped
            value = dom(value);
          }
        } else {
          DOMAddNodes(value, fn(this[i], arg1, arg2));
        }
      }
      return value == undefined ? this : value;
    };
  });

  return DOM;
});