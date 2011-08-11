(function() {
  define(['cell!AnotherCell'], function(AnotherCell) {
    return {
      render: function(_, A) {
        var el, pos;
        return [
          _('.booleanFalse', false), _('.undefined', void 0), _('.null', null), _('.number', 5), _('.numberZero', 0), _('ol.list', (function() {
            var _len, _ref, _results;
            _ref = [10, 20, 30];
            _results = [];
            for (pos = 0, _len = _ref.length; pos < _len; pos++) {
              el = _ref[pos];
              _results.push(_("li.li" + pos, el));
            }
            return _results;
          })()), _("<div class='htmlNode anotherClass' style='background-color:#F00;' data-custom='something'>", _('a', {
            href: 'http://www.yahoo.com'
          }, 'foobar')), _('.node', {
            "class": 'anotherClass'
          }, $('<a href="http://www.google.com">blargo</a>')[0]), _('#idnode', {
            "class": 'anotherClass'
          }, $('<a href="http://www.bing.com">pwn</a>')[0]), _(AnotherCell, {
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
