
  define(function() {
    var isCellInstance;
    isCellInstance = function(instance) {
      ok(instance instanceof cell, 'instance is an instanceof cell');
      ok(instance.el instanceof HTMLElement, 'instance.el is an HTMLElement');
      equal(instance.el.tagName.toUpperCase(), 'DIV', 'instance.el is <div>');
      equal(instance.el.innerHTML, '', 'instance.el is an empty <div>');
      return ok(instance.$el instanceof jQuery, 'instance.$el is jQuery object');
    };
    return {
      $beforeEach: function() {
        return this.testCell = cell.extend;
      },
      'cell.extend()': function() {
        return ok(cell.extend().prototype instanceof cell, 'prototype is an instanceof cell');
      },
      'cell constructor() creates instance of cell': function() {
        var instance, newCell;
        newCell = cell.extend();
        instance = new newCell();
        isCellInstance(instance);
        return deepEqual(instance.options, {}, 'instance.options is empty object (not specified in constructor)');
      },
      'cell constructor(options:&lt;object&gt;) creates instance of cell with options': function() {
        var instance, newCell, options;
        newCell = cell.extend();
        options = {
          a: 1,
          b: '2',
          c: (function() {
            return 3;
          })
        };
        instance = new newCell(options);
        isCellInstance(instance);
        return deepEqual(instance.options, options, 'instance.options the object passed into constructor');
      },
      'cell.extend({init:&lt;function&gt;,render:&gt;function>})': function() {
        var NewCell, callOrder, order;
        order = 0;
        callOrder = {};
        NewCell = cell.extend({
          init: (function() {
            return callOrder.init = order++;
          })
        });
        ok(NewCell.prototype instanceof cell, 'prototype is an instanceof cell');
        return ok(new NewCell() instanceof cell, 'instance is an instanceof cell');
      }
    };
  });
