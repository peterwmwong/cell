// Generated by CoffeeScript 1.6.2
define(['dom/data'], function(data) {
  var dealloc;

  dealloc = function(element) {
    var children, i, len;

    if (element.nodeType !== 3) {
      data.remove(element);
      children = element.children;
      len = children.length;
      i = -1;
      while (++i < len) {
        dealloc(children[i]);
      }
    }
  };
  return {
    remove: function(element) {
      var parent;

      dealloc(element);
      if (parent = element.parentNode) {
        parent.removeChild(element);
      }
    }
  };
});

/*
//@ sourceMappingURL=mutate.map
*/
