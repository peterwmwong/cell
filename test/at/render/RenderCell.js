(function() {
  define(['cell!AnotherCell'], function(AnotherCell) {
    return {
      render: function(R, A) {
        var inputList;
        return "<div class='booleanFalse'>" + (R(false)) + "</div>\n<div class='undefined'>" + (R(void 0 && "Shouldn't be rendered")) + "</div>\n<div class='null'>" + (R(null && "Shouldn't be rendered")) + "</div>\n<div class='number'>" + (R(5)) + "</div>\n<div class='numberZero'>" + (R(0)) + "</div>\n<ol class='list'>\n  " + (R(inputList = [10, 20, 30], function(el, pos, list) {
          return "<li class='li" + pos + "'>" + el + ", Passed input list: " + (list === inputList) + "</li>";
        })) + "\n</ol>\n" + (R(AnotherCell, {
          id: 'anotherCellId',
          "class": 'anotherCellClass',
          foo: 'bar',
          collection: 'collection_val',
          model: 'model_val'
        }));
      }
    };
  });
}).call(this);
