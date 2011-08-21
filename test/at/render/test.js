(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  define(function() {
    return function(done) {
      var html;
      html = __bind(function(sel) {
        return this.$(".RenderCell > " + sel).html();
      }, this);
      equal(html('.booleanFalse'), "");
      equal(html('.undefined'), "");
      equal(html('.null'), "");
      equal(html('.number'), "5");
      equal(html('.numberZero'), "0");
      equal(this.$('.RenderCell > .list > li').length, 3);
      equal(html('.list > .li0'), "10");
      equal(html('.list > .li1'), "20");
      equal(html('.list > .li2'), "30");
      equal(html('.htmlNode.anotherClass'), '<a href="http://www.yahoo.com">foobar</a>');
      equal(this.$('.RenderCell > .htmlNode.anotherClass').css('background-color'), 'rgb(255, 0, 0)');
      equal(this.$('.RenderCell > .htmlNode.anotherClass').attr('data-custom'), 'something');
      equal(html('#selID1'), 'Selector id');
      equal(this.$('#ignoredID1')[0], void 0);
      equal(html('#optionID1.optionClass1'), 'Selector id, option id, option class, option data-custom attribute');
      equal(this.$('#ignoredID2')[0], void 0);
      equal(html('#selID2'), 'Multiple Selector ids');
      equal(html('.selClass1.selClass2'), 'Multiple Selector classes');
      equal(html('#optionID2.selClass3.optionClass2'), 'Selector class, option id, option class, option data-custom attribute');
      equal(html('#anotherCellId.AnotherCell.anotherCellClass'), 'options.foo:bar');
      equal(html('.afterRender'), 'afterRender');
      return done();
    };
  });
}).call(this);
