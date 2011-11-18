
  define(['./util/helpers'], function(_arg) {
    var nodeHTMLEquals, testTag;
    nodeHTMLEquals = _arg.nodeHTMLEquals;
    testTag = function(tag, expectedElHTML) {
      var NewCell, node;
      NewCell = cell.extend({
        tag: tag
      });
      node = (new NewCell()).el;
      return nodeHTMLEquals(node, expectedElHTML);
    };
    return {
      'undefined, null, <array> or <number> defaults to <div>': function() {
        var invalid, _i, _len, _ref, _results;
        _ref = [void 0, null, [], 5];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          invalid = _ref[_i];
          _results.push(testTag(invalid, "<div></div>"));
        }
        return _results;
      },
      'Bad Tag String defaults to <div>': function() {
        return testTag('blarg', '<div></div>');
      },
      'Tag String <p data-custom="myAttr" class="myClass" id="myId">': function() {
        return testTag('<p data-custom="myAttr" class="myClass" id="myId">', '<p class="myClass" data-custom="myAttr" id="myId"></p>');
      },
      'Tag Function (-> <p data-custom="myAttr" class="myClass" id="myId">)': function() {
        return testTag((function() {
          return '<p data-custom="myAttr" class="myClass" id="myId">';
        }), '<p class="myClass" data-custom="myAttr" id="myId"></p>');
      },
      'Bad Tag Function': function() {
        return testTag((function() {
          return 'blarg';
        }), '<div></div>');
      }
    };
  });
