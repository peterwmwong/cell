// Generated by CoffeeScript 1.3.3

define(['./spec-utils'], function(_arg) {
  var node, nodeHTMLEquals, stringify;
  nodeHTMLEquals = _arg.nodeHTMLEquals, stringify = _arg.stringify, node = _arg.node;
  return function(_arg1) {
    var beforeEachRequire;
    beforeEachRequire = _arg1.beforeEachRequire;
    beforeEachRequire(['cell'], function(cell) {
      this.cell = cell;
    });
    return describe('jQuery Extensions', function() {
      beforeEach(function() {
        var _this = this;
        this.$testEl = $("<div id='one'>\n  <div id='two' cell='two'>\n    <div id='four' cell='four'></div>\n    <div id='five'></div>\n  </div>\n  <div id='three'></div>\n</div>");
        $('body').append(this.$testEl);
        this.removeHandlers = {};
        return _(['one', 'two', 'three', 'four', 'five']).each(function(elId) {
          return $("#" + elId).on('cell-remove', _this.removeHandlers[elId] = jasmine.createSpy("'" + elId + " remove spy'"));
        });
      });
      afterEach(function() {
        return this.$testEl.remove();
      });
      return describe('jQuery.remove() extension', function() {
        describe("when jQuery.remove() is called", function() {
          beforeEach(function() {
            return this.$testEl.remove();
          });
          it("trigger's 'cell-remove' event on elements or descendant elements that have cell attribute", function() {
            var _this = this;
            return _(['two', 'four']).each(function(elId) {
              return expect(_this.removeHandlers[elId].callCount).toBe(1);
            });
          });
          return it("'cell-remove' event is NOT triggered on elements or descendant elements that do NOT HAVE cell attribute", function() {
            var _this = this;
            return _(['one', 'three', 'five']).each(function(elId) {
              return expect(_this.removeHandlers[elId]).not.toHaveBeenCalled();
            });
          });
        });
        return describe("when jQuery.detach() is called", function() {
          beforeEach(function() {
            return this.$testEl.detach();
          });
          return it("no 'cell-remove' handler is triggered", function() {
            var _this = this;
            return _(['one', 'two', 'three', 'four', 'five']).each(function(elId) {
              return expect(_this.removeHandlers[elId]).not.toHaveBeenCalled();
            });
          });
        });
      });
    });
  };
});
