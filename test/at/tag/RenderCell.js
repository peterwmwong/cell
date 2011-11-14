
  define({
    render: function(_) {
      return [
        _(cell.extend({
          tag: '<span>'
        }, 'TagString')), _(cell.extend({
          tag: '<p class="class" data-custom="customValue">'
        }, 'TagStringWithAttrs')), _(cell.extend({
          tag: (function() {
            return '<span>';
          })
        }, 'TagFunc')), _(cell.extend({
          tag: (function() {
            return '<p class="class2" data-custom2="customValue2">';
          })
        }, 'TagFuncWithAttrs'))
      ];
    }
  });
