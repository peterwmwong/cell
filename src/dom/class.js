// Generated by CoffeeScript 1.6.2
define(function() {
  var rclass, trim;

  rclass = /[\t\r\n]/g;
  trim = function(s) {
    return s && s.replace(/^\s+|\s+$/g, '');
  };
  return {
    add: function(element, className) {
      var cur;

      if (className) {
        element.className = element.className ? (cur = (" " + element.className + " ").replace(rclass, ' '), cur.indexOf((" " + className + " ") < 0) ? trim(cur + className) : element.className) : className;
      }
    },
    remove: function(element, className) {
      var rx;

      if (className && element.className) {
        rx = new RegExp(" " + className, 'g');
        element.className = trim((" " + element.className + " ").replace(rx, ''));
      }
    },
    has: function(element, className) {
      return (" " + element.className + " ").replace(rclass, ' ').indexOf(" " + className + " ") > -1;
    }
  };
});

/*
//@ sourceMappingURL=class.map
*/
