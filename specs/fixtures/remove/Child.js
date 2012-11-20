// Generated by CoffeeScript 1.3.3

define(function(require) {
  return {
    initialize: function() {
      this.model.on('flash', this.onFlash, this);
      return this.collection.on('flash', this.onFlash, this);
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
  };
});
