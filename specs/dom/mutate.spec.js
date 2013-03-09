// Generated by CoffeeScript 1.6.1

define(['../utils/spec-utils', '../utils/spec-matchers'], function(_arg, matchers) {
  var browserTrigger, node;
  node = _arg.node, browserTrigger = _arg.browserTrigger;
  return function(_arg1) {
    var beforeEachRequire;
    beforeEachRequire = _arg1.beforeEachRequire;
    beforeEachRequire(['dom/mutate', 'dom/events'], function(mutate, events) {
      this.mutate = mutate;
      this.events = events;
      this.addMatchers(matchers);
      return this.element = node('div');
    });
    return describe('data cleanup', function() {
      beforeEach(function() {
        this.element.innerHTML = '<span></span>';
        return this.span = this.element.children[0];
      });
      return it('should remove event listeners on element removal', function() {
        var log;
        log = [];
        this.events.on(this.span, 'click', function() {
          return log.push('click');
        });
        browserTrigger(this.span, 'click');
        expect(log).toEqual(['click']);
        this.mutate.remove(this.element);
        log = [];
        browserTrigger(this.span, 'click');
        return expect(log).toEqual([]);
      });
    });
  };
});
