
  define(['./util/helpers'], function(_arg) {
    var isCellInstance, nodeHTMLEquals;
    nodeHTMLEquals = _arg.nodeHTMLEquals;
    isCellInstance = function(instance) {
      ok(instance instanceof cell, 'instance is an instanceof cell');
      ok(instance.el instanceof HTMLElement, 'instance.el is an HTMLElement');
      strictEqual(instance.el.tagName.toUpperCase(), 'DIV', 'instance.el is <div>');
      strictEqual(instance.el.innerHTML, '', 'instance.el is an empty <div>');
      return ok(instance.$el instanceof jQuery, 'instance.$el is jQuery object');
    };
    return {
      'constructor() creates instance of cell': function() {
        var NewCell, instance;
        NewCell = cell.extend();
        instance = new NewCell();
        isCellInstance(instance);
        return deepEqual(instance.options, {}, 'instance.options is empty object (not specified in constructor)');
      },
      'constructor({id:<string>}) id overrides cell::tag': function() {
        var NewCell;
        NewCell = cell.extend({
          tag: "<p id=\'testId\'>"
        });
        debugger;
        return nodeHTMLEquals(new NewCell({
          id: 'overrideID'
        }).el, '<p id="overrideID"></p>');
      },
      'constructor({class:<string>}) class is used IN ADDITION to classes specified by cell::tag': function() {
        var NewCell;
        NewCell = cell.extend({
          tag: "<p class=\'testClass\'>"
        });
        return nodeHTMLEquals(new NewCell({
          "class": 'extraClass extraClass2'
        }).el, '<p class="testClass extraClass extraClass2"></p>');
      },
      'constructor(options:<object>) creates instance of cell with options': function() {
        var NewCell, instance, options;
        NewCell = cell.extend();
        options = {
          a: 1,
          b: '2',
          c: (function() {
            return 3;
          })
        };
        instance = new NewCell(options);
        isCellInstance(instance);
        return deepEqual(instance.options, options, 'instance.options the object passed into constructor');
      },
      'constructor(options:<object>) calls init(), then tag(), and finally render()': function() {
        var NewCell, init, instance, options, render, tag;
        NewCell = cell.extend({
          init: init = sinon.spy(),
          tag: tag = sinon.spy(),
          render: render = sinon.spy()
        });
        options = {
          a: 1,
          b: '2',
          c: (function() {
            return 3;
          })
        };
        instance = new NewCell(options);
        ok(init.calledOnce, 'init() called once');
        deepEqual(init.getCall(0).args, [options], 'init() was passed options');
        ok(tag.calledOnce, 'tag() called once');
        ok(render.calledOnce, 'render() called once');
        deepEqual(render.getCall(0).args[0], cell.prototype.$R, 'render() was passed cell.prototype.$R (cell render helper)');
        ok(typeof render.getCall(0).args[1] === 'function', 'render() was passed a function (asynchronous render helper)');
        ok(init.calledBefore(tag), 'init() called before tag()');
        return ok(tag.calledBefore(render), 'tag() called before render()');
      }
    };
  });
