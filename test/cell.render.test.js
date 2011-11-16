
  define(function() {
    var testRender;
    testRender = function(render, expectedInnerHTML) {
      var NewCell;
      NewCell = cell.extend({
        render: render
      });
      return equal(new NewCell().el.innerHTML, expectedInnerHTML, "@el.innerHTML");
    };
    return {
      "cell.render = -> <NOT AN ARRAY>": function() {
        var invalid, _i, _len, _ref, _results;
        _ref = [void 0, null, (function() {}), 5, 'testString', document.createElement('a')];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          invalid = _ref[_i];
          _results.push((function(invalid) {
            return testRender((function() {
              return invalid;
            }), "");
          })(invalid));
        }
        return _results;
      },
      "cell.render = -> []": function() {
        return testRender((function() {
          return [];
        }), "");
      },
      "cell.render = -> [ undefined, null, (->) ]": function() {
        return testRender((function() {
          return [void 0, null, (function() {})];
        }), "");
      },
      "cell.render = -> [ <number>, <string> ]": function() {
        return testRender((function() {
          return [5, 'testString'];
        }), "5testString");
      },
      "cell.render = -> [ <DOM NODE> ]": function() {
        return testRender((function() {
          return [document.createElement('a')];
        }), "<a></a>");
      },
      "cell.render = -> [ <DOM NODE>, <string>, <number> ]": function() {
        return testRender((function() {
          return [document.createElement('a'), 'testString', 7];
        }), "<a></a>testString7");
      }
    };
  });
