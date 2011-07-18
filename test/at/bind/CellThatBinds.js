(function() {
  define({
    init: function() {
      return this.clickcount = 0;
    },
    render: function(R) {
      return [
        'Click Count: ', R('#clickcount', this.clickcount), R('.foo', R('#bar', R('input.add', {
          type: 'button',
          value: 'Add'
        }), R('input.remove', {
          type: 'button',
          value: 'Remove'
        })))
      ];
    },
    bind: {
      'click .foo > #bar > .add': function() {
        return this.$('#clickcount').html(++this.clickcount);
      },
      'click .foo > #bar > .remove': function() {
        return this.$('#clickcount').html(--this.clickcount);
      }
    }
  });
}).call(this);
