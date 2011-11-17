(function() {
  var nodeToHTML;

  define({
    nodeToHTML: nodeToHTML = function(node) {
      var attr, child, html, list, name, value, _i, _j, _len, _len2, _ref, _ref2;
      if (node.tagName) {
        html = "<" + (node.tagName.toLowerCase());
        if (node.attributes.length > 1) {
          list = (function() {
            var _i, _len, _ref, _results;
            _ref = node.attributes;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              attr = _ref[_i];
              _results.push(attr);
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
            _ref = list[_i], name = _ref.name, value = _ref.value;
            html += " " + name + "=\"" + value + "\"";
          }
        }
        html += ">";
        _ref2 = $(node).contents();
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          child = _ref2[_j];
          html += nodeToHTML(child);
        }
        return html += "</" + (node.tagName.toLowerCase()) + ">";
      } else {
        return $(node).text();
      }
    }
  });

}).call(this);
