// Generated by CoffeeScript 1.6.2
define(['cell/dom/events', 'cell/Ext'], function(events, Ext) {
  var ModelElement, text;

  ModelElement = {
    input: {
      text: text = {
        e: 'keyup',
        g: 'value',
        s: function(value) {
          if (value != null) {
            this.el[this.a] = value;
          }
        }
      },
      checkbox: {
        e: 'change',
        g: 'checked',
        s: function(value) {
          this.el[this.a] = !!value;
        }
      }
    },
    select: {
      e: 'change',
      g: text.g,
      s: text.s
    },
    textarea: text
  };
  return Ext.extend({
    constructor: function(prop, model) {
      this.prop = prop;
      this.model = model;
      Ext.call(this);
    },
    render: function() {
      var el, model, modelEl, prop, tag;

      el = this.el;
      model = this.model || this.view.model;
      prop = this.prop;
      if (modelEl = ModelElement[tag = el.tagName.toLowerCase()]) {
        if (tag === 'input') {
          modelEl = modelEl[el.type];
        }
      }
      if (modelEl) {
        this.a = modelEl.g;
        events.on(el, modelEl.e, function() {
          model.set(prop, el[modelEl.g]);
        });
        this.watch((function() {
          return model.get(prop);
        }), modelEl.s);
      }
    }
  });
});

/*
//@ sourceMappingURL=x_model.map
*/
