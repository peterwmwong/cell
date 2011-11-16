
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
      'cell.extend(<NOT AN OBJECT>) throws an error': function() {
        var invalid, whenStr, _i, _len, _ref, _results;
        _ref = [7, "string", (function() {})];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          invalid = _ref[_i];
          whenStr = "expected error thrown, when argument is " + invalid;
          try {
            cell.extend(invalid);
            _results.push(ok(false, whenStr));
          } catch (e) {
            _results.push(equal(e, "cell.extend(): expects an object {render,init,name}", whenStr));
          }
        }
        return _results;
      },
      'cell.extend({init:<function>,render:<function>,name:String}): init, render, name are optional': function() {
        var NewCell, init, name, render, whenStr, _i, _len, _ref, _results;
        _ref = [void 0, null, "exampleName"];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          name = _ref[_i];
          _results.push((function() {
            var _j, _len2, _ref2, _results2;
            _ref2 = [void 0, null, (function() {})];
            _results2 = [];
            for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
              init = _ref2[_j];
              _results2.push((function() {
                var _k, _len3, _ref3, _results3;
                _ref3 = [void 0, null, (function() {})];
                _results3 = [];
                for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
                  render = _ref3[_k];
                  whenStr = "when " + (JSON.stringify({
                    init: init,
                    render: render,
                    name: name
                  }));
                  NewCell = cell.extend({
                    init: init,
                    render: render,
                    name: name
                  });
                  ok(NewCell.prototype instanceof cell, "prototype is an instanceof cell, " + whenStr);
                  equal(NewCell.prototype.name, name, "prototype.name is the name passed in cell.extend(" + whenStr + ")");
                  equal(NewCell.prototype.init, init, "prototype.init is the init function passed in cell.extend(" + whenStr + ")");
                  equal(NewCell.prototype.render, render, "prototype.render is the render function passed in cell.extend(" + whenStr + ")");
                  _results3.push(ok((new NewCell()) instanceof cell, "instance is an instanceof newly created cell, when cell.extend(" + whenStr + ")"));
                }
                return _results3;
              })());
            }
            return _results2;
          })());
        }
        return _results;
      },
      'cell.extend({init:<NOT A FUNCTION>, render:<NOT A FUNCTION>}), throws an error': function() {
        var init, render, vals, whenStr, _i, _len, _results;
        vals = [5, "string", [], {}, (function() {}), void 0, null];
        _results = [];
        for (_i = 0, _len = vals.length; _i < _len; _i++) {
          init = vals[_i];
          _results.push((function() {
            var _j, _len2, _results2;
            _results2 = [];
            for (_j = 0, _len2 = vals.length; _j < _len2; _j++) {
              render = vals[_j];
              if (!(!((typeof init === 'function' || (init === null || init === (void 0))) && (typeof render === 'function' || (render === null || render === (void 0)))))) {
                continue;
              }
              whenStr = "expected error thrown, when typeof init == " + (typeof init) + " and typeof render == " + (typeof render);
              try {
                cell.extend({
                  init: init,
                  render: render
                });
                _results2.push(ok(false, whenStr));
              } catch (e) {
                _results2.push(equal(e, "cell.extend(): expects {render,init} to be functions", whenStr));
              }
            }
            return _results2;
          })());
        }
        return _results;
      },
      'cell constructor() creates instance of cell': function() {
        var NewCell, instance;
        NewCell = cell.extend();
        instance = new NewCell();
        isCellInstance(instance);
        return deepEqual(instance.options, {}, 'instance.options is empty object (not specified in constructor)');
      },
      'cell constructor(options:<object>) creates instance of cell with options': function() {
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
      'cell constructor(options:<object>) calls init() then render()': function() {
        var NewCell, init, instance, options, render;
        NewCell = cell.extend({
          init: init = sinon.spy(),
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
        ok(render.calledOnce, 'render() called once');
        deepEqual(render.getCall(0).args[0], cell.prototype.$R, 'render() was passed cell.prototype.$R (cell render helper)');
        return ok(typeof render.getCall(0).args[1] === 'function', 'render() was passed a function (asynchronous render helpser)');
      }
    };
  });
