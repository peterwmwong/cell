
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
      "cell.render = -> []": function() {
        return testRender((function() {
          return [];
        }), "");
      },
      "cell.render = -> undefined": function() {
        return testRender((function() {
          return;
        }), "");
      },
      "cell.render = -> null": function() {
        return testRender((function() {
          return null;
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
      }
    };
  });
