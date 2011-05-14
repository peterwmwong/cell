(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  define(function() {
    return function(done) {
      var html;
      html = __bind(function(sel) {
        return this.$(sel).html();
      }, this);
      equal(html('.RenderCell > .booleanFalse'), "");
      equal(html('.RenderCell > .undefined'), "");
      equal(html('.RenderCell > .null'), "");
      equal(html('.RenderCell > .number'), "5");
      equal(html('.RenderCell > .numberZero'), "0");
      equal(this.$('.RenderCell > .list > li').length, 3);
      equal(html('.RenderCell > .list > .li0'), "10, Passed input list: true");
      equal(html('.RenderCell > .list > .li1'), "20, Passed input list: true");
      equal(html('.RenderCell > .list > .li2'), "30, Passed input list: true");
      equal(html('.AnotherCell.anotherCellClass'), "bar");
      return done();
    };
  });
}).call(this);
