// Generated by CoffeeScript 1.6.1

define(function(require) {
  var Parent;
  Parent = require('./Parent');
  return require('cell/defineView!')({
    initialize: function() {
      this.listenTo(this.model, 'flash', this.onFlash);
      this.listenTo(this.collection, 'flash', this.onFlash);
      return this.parent = new Parent({
        model: this.model,
        collection: this.collection
      });
    },
    render: function() {
      this.$el.append(this.parent.render().el);
      return this;
    },
    onFlash: function(modelOrCollection) {
      return ++modelOrCollection.root;
    },
    events: {
      'click': function() {
        this.model.root_el++;
        return false;
      }
    }
  });
});
