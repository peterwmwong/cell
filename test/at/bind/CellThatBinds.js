(function() {
  define({
    init: function() {
      return this.clickcount = 0;
    },
    render: function(R) {
      return "Click Count: <span id='clickcount'>" + this.clickcount + "</span>\n<div class='foo'>\n  <div id='bar'>\n    <button type=\"button\" class='add'>Add</button>\n    <button type=\"button\" class='remove'>Remove</button>\n  </div>\n</div>";
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
