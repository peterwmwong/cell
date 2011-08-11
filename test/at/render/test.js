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
      equal(html('.node.anotherClass'), '<a href="http://www.google.com">blargo</a>');
      equal(html('#idnode.anotherClass'), '<a href="http://www.bing.com">pwn</a>');
      equal(html('#anotherCellId.AnotherCell.anotherCellClass'), "id:anotherCellId class:anotherCellClass options.foo:bar collection:collection_val model:model_val");
      equal(html('.afterRender'), 'afterRender');
      return done();
    };
  });
}).call(this);
