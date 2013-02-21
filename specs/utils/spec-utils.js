// Generated by CoffeeScript 1.4.0

define(['jquery'], function($) {
  var exports, indexOf, lowercase, msie, nodeHTMLEquals, nodeName_, nodeToHTML, uppercase;
  indexOf = Array.prototype.indexOf ? function(arr, el) {
    return arr.indexOf(el);
  } : function(arr, el) {
    var i;
    i = 0;
    while (i < arr.length) {
      if (arr[i] === el) {
        return i;
      } else {
        ++i;
      }
    }
    return -1;
  };
  msie = Number((/msie (\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]);
  lowercase = function(s) {
    if (s) {
      return s.toLowerCase();
    }
  };
  uppercase = function(s) {
    if (s) {
      return s.toUpperCase();
    }
  };
  nodeName_ = msie < 9 ? function(element) {
    element = element.nodeName ? element : element[0];
    if (element.scopeName && element.scopeName !== 'HTML') {
      return uppercase(element.scopeName + ':' + element.nodeName);
    } else {
      return element.nodeName;
    }
  } : function(element) {
    if (element.nodeName) {
      return element.nodeName;
    } else {
      return element[0].nodeName;
    }
  };
  return exports = {
    msie: msie,
    waitOne: function(expectCallback) {
      var done;
      done = false;
      runs(function() {
        return setTimeout((function() {
          return done = true;
        }), 17);
      });
      waitsFor(function() {
        return done;
      });
      return runs(expectCallback);
    },
    browserTrigger: function(element, type, keys) {
      var evnt, fakeProcessDefault, finalProcessDefault, originalPreventDefault, pressed, ret, _ref;
      if (element && !element.nodeName) {
        element = element[0];
      }
      if (!element) {
        return;
      }
      if (!type) {
        type = {
          'text': 'change',
          'textarea': 'change',
          'hidden': 'change',
          'password': 'change',
          'button': 'click',
          'submit': 'click',
          'reset': 'click',
          'image': 'click',
          'checkbox': 'click',
          'radio': 'click',
          'select-one': 'change',
          'select-multiple': 'change'
        }[lowercase(element.type)] || 'click';
      }
      if (lowercase(nodeName_(element)) === 'option') {
        element.parentNode.value = element.value;
        element = element.parentNode;
        type = 'change';
      }
      keys || (keys = []);
      pressed = function(key) {
        return indexOf(keys, key) !== -1;
      };
      if (msie < 9) {
        if ((_ref = element.type) === 'radio' || _ref === 'checkbox') {
          element.checked = !element.checked;
        }
        element.style.posLeft;
        ret = element.fireEvent("on" + type);
        if (lowercase(element.type) === 'submit') {
          while (element) {
            if (lowercase(element.nodeName) === 'form') {
              element.fireEvent('onsubmit');
              break;
            }
            element = element.parentNode;
          }
        }
        return ret;
      } else {
        evnt = document.createEvent('MouseEvents');
        originalPreventDefault = evnt.preventDefault;
        fakeProcessDefault = true;
        finalProcessDefault = void 0;
        evnt.preventDefault = function() {
          fakeProcessDefault = false;
          return originalPreventDefault.apply(evnt, arguments);
        };
        evnt.initMouseEvent(type, true, true, window, 0, 0, 0, 0, 0, pressed('ctrl'), pressed('alt'), pressed('shift'), pressed('meta'), 0, element);
        element.dispatchEvent(evnt);
        finalProcessDefault = fakeProcessDefault;
        return finalProcessDefault;
      }
    },
    stringify: function(obj, excludeArrayBrackets) {
      var k, o, str, v;
      if (obj === void 0) {
        return "undefined";
      } else if (obj === null) {
        return "null";
      } else if ((obj.jquery != null) || obj instanceof Array) {
        str = ((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = obj.length; _i < _len; _i++) {
            o = obj[_i];
            _results.push(exports.stringify(o));
          }
          return _results;
        })()).join(', ');
        if (excludeArrayBrackets) {
          return str;
        } else {
          return "[" + str + "]";
        }
      } else if (obj.nodeType === 1) {
        return "<" + (obj.tagName.toLowerCase()) + "/>";
      } else if ((obj != null ? obj.constructor : void 0) === Object) {
        return "{" + (((function() {
          var _results;
          _results = [];
          for (k in obj) {
            v = obj[k];
            _results.push("" + k + ":" + (exports.stringify(v)));
          }
          return _results;
        })()).join(',')) + "}";
      } else {
        return JSON.stringify(obj);
      }
    },
    node: function(tag) {
      return document.createElement(tag);
    },
    nodeHTMLEquals: nodeHTMLEquals = function(node, expectedHTML) {
      if (msie < 9) {
        expect(node && typeof node === "object" && node.nodeType === 1 && typeof node.nodeName === "string").toBe(true);
      } else {
        expect(node instanceof HTMLElement).toBe(true);
      }
      return expect(nodeToHTML(node)).toBe(expectedHTML);
    },
    nodeToHTML: nodeToHTML = function(node) {
      var attr, el, html, list, _i, _j, _len, _len1, _ref;
      if (node.tagName) {
        html = "<" + (node.tagName.toLowerCase());
        if (node.attributes.length > 0) {
          list = (function() {
            var _i, _len, _ref, _results;
            _ref = node.attributes;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              attr = _ref[_i];
              if (attr.specified && !/^dom-\d+/.test(attr.name)) {
                _results.push(attr);
              }
            }
            return _results;
          })();
          list.sort(function(a, b) {
            if (a.name === b.name) {
              return 0;
            } else if (a.name < b.name) {
              return -1;
            } else {
              return 1;
            }
          });
          for (_i = 0, _len = list.length; _i < _len; _i++) {
            el = list[_i];
            html += " " + el.name + "=\"" + el.value + "\"";
          }
        }
        html += ">";
        _ref = $(node).contents();
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          el = _ref[_j];
          html += nodeToHTML(el);
        }
        return html += "</" + (node.tagName.toLowerCase()) + ">";
      } else {
        return $(node).text();
      }
    }
  };
});
