// Generated by CoffeeScript 1.4.0

define(['backbone', 'jquery'], function(Backbone, $) {
  var cidMap, module, origCleanData;
  cidMap = {};
  origCleanData = $.cleanData;
  $.cleanData = function(elems, acceptData) {
    var cell, cid, elem, i;
    i = 0;
    while (elem = elems[i++]) {
      origCleanData([elem], acceptData);
      if (cid = elem.getAttribute('cellcid')) {
        cell = cidMap[cid];
        cell.$el = void 0;
        cell.remove();
      }
    }
  };
  return module = {
    Cell: Backbone.View.extend({
      remove: function() {
        delete cidMap[this.cid];
        this.el.removeAttribute('cellcid');
        if (this.$el) {
          this.$el.remove();
        }
        this.stopListening();
        this.model = this.collection = this.el = this.$el = this.$ = void 0;
      },
      _setElement: Backbone.View.prototype.setElement,
      setElement: function(element, delegate) {
        this._setElement(element, delegate);
        cidMap[this.cid] = this;
        this.el.setAttribute('cell', this._cellName);
        this.el.setAttribute('cellcid', this.cid);
        return this;
      },
      render: function() {
        this.el.innerHTML = this.renderEl();
        this.afterRender();
        return this;
      },
      renderEl: $.noop,
      afterRender: $.noop
    }),
    pluginBuilder: 'cell-builder-plugin',
    load: function(name, req, load, config) {
      var el;
      if (!(module._installed || (module._installed = {}))[name]) {
        module._installed[name] = true;
        el = document.createElement('link');
        el.href = req.toUrl(name + ".css");
        el.rel = 'stylesheet';
        el.type = 'text/css';
        document.head.appendChild(el);
      }
      name = /(.*\/)?(.*)$/.exec(name)[2];
      load(function(proto, statics) {
        proto || (proto = {});
        proto.className = proto._cellName = name;
        return module.Cell.extend(proto, statics);
      });
    }
  };
});
