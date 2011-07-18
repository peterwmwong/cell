(function() {
  define(['cell!AnotherCell'], function(AnotherCell) {
    return {
      render: function(R, A) {
        var el, pos;
        return [
          R('.booleanFalse', false), R('.undefined', void 0), R('.null', null), R('.number', 5), R('.numberZero', 0), R('ol.list', (function() {
            var _len, _ref, _results;
            _ref = [10, 20, 30];
            _results = [];
            for (pos = 0, _len = _ref.length; pos < _len; pos++) {
              el = _ref[pos];
              _results.push(R("li.li" + pos, el));
            }
            return _results;
          })()), R('.node', $('<a href="www.google.com">blargo</div>')[0]), R(AnotherCell, {
            id: 'anotherCellId',
            "class": 'anotherCellClass',
            foo: 'bar',
            collection: 'collection_val',
            model: 'model_val'
          })
        ];
      },
      bind: {
        afterRender: function() {
          return $(this.el).append("<div class='afterRender'>afterRender</div>");
        }
      }
    };
  });
}).call(this);
