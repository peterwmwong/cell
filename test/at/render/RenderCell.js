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
          })()), _('.node', _(document.createElement('table'))), _("<div class='htmlNode anotherClass' style='background-color:#F00;' data-custom='something'>", _('a', {
            href: 'http://www.yahoo.com'
          }, 'foobar')), _('#selID1', 'Selector id'), _('#ignoredID1', {
            id: 'optionID1',
            "class": 'optionClass1',
            'data-custom': 'customValue'
          }, 'Selector id, option id, option class, option data-custom attribute'), _('#ignoredID2#selID2', 'Multiple Selector ids'), _('.selClass1.selClass2', 'Multiple Selector classes'), _('.selClass3', {
            id: 'optionID2',
            "class": 'optionClass2',
            'data-custom': 'customValue'
          }, 'Selector class, option id, option class, option data-custom attribute'), _(AnotherCell, {
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
