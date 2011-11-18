
  define(function() {
    var testRender;
    testRender = function(render, expectedInnerHTML) {
      var NewCell;
      NewCell = cell.extend({
        render: render
      });
      return strictEqual(new NewCell().el.innerHTML, expectedInnerHTML, "@el.innerHTML");
    };
    return {
      "called with cell renderHelper (cell::$R)": function() {
        var NewCell, instance, render;
        NewCell = cell.extend({
          render: render = sinon.spy()
        });
        instance = new NewCell();
        ok(render.calledOnce, 'render() called once');
        deepEqual(render.getCall(0).args[0], cell.prototype.$R, 'render() was passed cell.prototype.$R (cell render helper)');
        return ok(typeof render.getCall(0).args[1] === 'function', 'render() was passed a function (asynchronous render helpser)');
      },
      "-> <NOT AN ARRAY>": function() {
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
      "-> []": function() {
        return testRender((function() {
          return [];
        }), "");
      },
      "-> [ undefined, null, (->) ]": function() {
        return testRender((function() {
          return [void 0, null, (function() {})];
        }), "");
      },
      "-> [ <number>, <string> ]": function() {
        return testRender((function() {
          return [5, 'testString'];
        }), "5testString");
      },
      "-> [ <DOM NODE> ]": function() {
        return testRender((function() {
          return [document.createElement('a')];
        }), "<a></a>");
      },
      "-> [ <DOM NODE>, <string>, <number> ]": function() {
        return testRender((function() {
          return [document.createElement('a'), 'testString', 7];
        }), "<a></a>testString7");
      }
    };
  });
