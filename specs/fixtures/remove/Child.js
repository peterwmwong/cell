// Generated by CoffeeScript 1.6.2
define(function(require) {
  return require('cell/defineView!')({
    initialize: function() {
      this.listenTo(this.model, 'flash', this.onFlash);
      return this.listenTo(this.collection, 'flash', this.onFlash);
    },
    render_el: function() {
      return 'Child';
    },
    onFlash: function(modelOrCollection) {
      return ++modelOrCollection.child;
    },
    events: {
      'click': function() {
        this.model.child_el++;
        return false;
      }
    }
  });
});

/*
//@ sourceMappingURL=Child.map
*/
