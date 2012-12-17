// Generated by CoffeeScript 1.4.0

define(function(require) {
  var exports, nodeHTMLEquals, nodeToHTML, _;
  _ = require('underscore');
  return exports = {
    stringify: function(obj, excludeArrayBrackets) {
      var el, k, str, v;
      if (obj === void 0) {
        return "undefined";
      } else if (obj === null) {
        return "null";
      } else if ((obj.jquery != null) || _.isArray(obj)) {
        str = ((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = obj.length; _i < _len; _i++) {
            el = obj[_i];
            _results.push(exports.stringify(el));
          }
          return _results;
        })()).join(', ');
        if (excludeArrayBrackets) {
          return str;
        } else {
          return "[" + str + "]";
        }
      } else if (_.isElement(obj)) {
        return "<" + (obj.tagName.toLowerCase()) + "/>";
      } else if (_.isObject(obj)) {
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
      expect(node instanceof HTMLElement).toBe(true);
      return expect(nodeToHTML(node)).toBe(expectedHTML);
    },
    nodeToHTML: nodeToHTML = function(node) {
      var attr, child, html, list, name, value, _i, _j, _len, _len1, _ref, _ref1;
      if (node.tagName) {
        html = "<" + (node.tagName.toLowerCase());
        if (node.attributes.length > 0) {
          list = (function() {
            var _i, _len, _ref, _results;
            _ref = node.attributes;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              attr = _ref[_i];
              if (attr.name !== 'cellcid') {
                _results.push(attr);
              }
            }
            return _results;
          })();
          debugger;
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
            _ref = list[_i], name = _ref.name, value = _ref.value;
            html += " " + name + "=\"" + value + "\"";
          }
        }
        html += ">";
        _ref1 = $(node).contents();
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          child = _ref1[_j];
          html += nodeToHTML(child);
        }
        return html += "</" + (node.tagName.toLowerCase()) + ">";
      } else {
        return $(node).text();
      }
    }
  };
});
