(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __slice = Array.prototype.slice;
  (function() {
    var Cell, getDOMID, nextUID, tmpNode;
    nextUID = 0;
    tmpNode = document.createElement('div');
    getDOMID = function(uid) {
      return "__cell_" + uid + "__";
    };
    Cell = window.Cell = function(options) {
      var innerHTML, renderHelpers, renderInnerHTML, _rcell;
      this.options = options;
      this.cid = _.uniqueId('view');
      this._configure(options || {});
      this._renderQ = {};
      this._onrender = options && options.onrender;
      tmpNode.innerHTML = this.__renderOuterHTML;
      this.el = tmpNode.children[0];
      renderInnerHTML = this.__renderInnerHTML.bind(this);
      renderHelpers = {
        node: __bind(function(node) {
          var uid;
          if (!(node instanceof HTMLElement)) {
            throw new Error("render.node(node:HTMLElement) was expecting an HTMLElement");
          } else if (this._renderQ) {
            this._renderQ[uid = nextUID++] = node;
            return "<" + node.tagName + " id='" + (getDOMID(uid)) + "'></" + node.tagName + ">";
          }
        }, this),
        cells: __bind(function() {
          var CellType, cellOptionArrays, option, result, _i, _len, _ref;
          cellOptionArrays = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          if (this._renderQ) {
            if (!(cellOptionArrays instanceof Array || cellOptionArrays === void 0)) {
              throw new Error('render.cells( (cell:Cell,options:Object)* ) expects an Array');
            }
            result = "";
            for (_i = 0, _len = cellOptionArrays.length; _i < _len; _i++) {
              _ref = cellOptionArrays[_i], CellType = _ref[0], option = _ref[1];
              result += _rcell(CellType, option);
            }
            return result;
          }
        }, this),
        cell: _rcell = __bind(function(CellType, options) {
          var cell;
          if (this._renderQ) {
            cell = new CellType(Object.create(options || {}, {
              onrender: {
                value: __bind(function(cell) {
                  var pc;
                  if (this._renderQ) {
                    this._renderQ[cell.cid] = cell;
                  } else if (pc = this.el.querySelector("#" + (getDOMID(cell.cid)))) {
                    pc.parentNode.replaceChild(cell.el, pc);
                  }
                  try {
                    return options.onrender && options.onrender(cell);
                  } catch (_e) {}
                }, this)
              }
            }));
            return "<" + cell.__renderTagName + " id='" + (getDOMID(cell.cid)) + "'></" + cell.__renderTagName + ">";
          }
        }, this),
        async: renderInnerHTML,
        each: function(list, func) {
          var l;
          return ((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = list.length; _i < _len; _i++) {
              l = list[_i];
              _results.push(func(l));
            }
            return _results;
          })()).join('\n');
        }
      };
      innerHTML = this.__render(options, renderHelpers);
      if (typeof innerHTML === 'string') {
        return renderInnerHTML(innerHTML);
      }
    };
    Cell.extend = function(protoProps) {
      var NewCell;
      NewCell = Backbone.View.extend.call(this, protoProps);
      Cell.prototype.__addRenderProps.call(NewCell.prototype);
      return NewCell;
    };
    return _.extend(Cell.prototype, Backbone.View.prototype, {
      __onrender: function() {
        this.delegateEvents();
        this.initialize(this.options);
        try {
          return this._onrender && this._onrender(this);
        } catch (_e) {}
      },
      __addRenderProps: (function() {
        var renderFuncNameRegex;
        renderFuncNameRegex = /render( <(\w+)([ ]+.*)*>)*/;
        return function() {
          var func, match, p, _i, _len, _ref;
          _ref = Object.getOwnPropertyNames(this);
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            p = _ref[_i];
            if (match = renderFuncNameRegex.exec(p)) {
              if (typeof (func = this[p]) !== 'function') {
                throw new Error("Cell.extend expects '" + p + "' to be a function");
              }
              this.__render = this[p];
              this.__renderTagName = match[2] || 'div';
              this.__renderOuterHTML = "<" + this.__renderTagName + (match[3] || "") + "></" + this.__renderTagName + ">";
              return;
            }
          }
          throw new Error('Cell.extend([constructor:Function],prototypeMembers:Object): could not find a render function in prototypeMembers');
        };
      })(),
      __renderInnerHTML: function(innerHTML) {
        var child, pc, pcid, _ref;
        if (this._renderQ) {
          this.el.innerHTML = innerHTML;
          _ref = this._renderQ;
          for (pcid in _ref) {
            child = _ref[pcid];
            try {
              if (pc = this.el.querySelector("#" + (getDOMID(pcid)))) {
                pc.parentNode.replaceChild((child instanceof HTMLElement && child) || child.el, pc);
              }
            } catch (_e) {}
          }
          delete this._renderQ;
          return this.__onrender();
        }
      }
    });
  })();
}).call(this);
