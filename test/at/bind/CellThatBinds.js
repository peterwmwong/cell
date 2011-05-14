(function() {
  define(function() {
    return {
      initialize: function() {
        return this.clickcount = 0;
      },
      render: function(R) {
        return "Click Count: <span id='clickcount'>" + this.clickcount + "</span>\n<div class='foo'>\n  <div id='bar'>\n    <button type=\"button\" class='clickable'>Add One</a>\n  </div>\n</div>";
      },
      bind: {
        'click .foo > #bar > .clickable': function() {
          return this.$('#clickcount').html(++this.clickcount);
        }
      }
    };
  });
}).call(this);
