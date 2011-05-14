(function() {
  var S, doDefine;
  S = function(s) {
    return s || "";
  };
  doDefine = function() {
    return {
      start: function() {},
      done: function(_arg) {
        var fail, pass;
        pass = _arg.pass, fail = _arg.fail;
        return "==================================================\nFAIL: " + fail + "  PASS: " + pass + "\n==================================================";
      },
      'test.start': function(_arg) {
        var name;
        name = _arg.test.name;
        return "--------------------------------------------------\n-> " + name + "\n--------------------------------------------------";
      },
      'test.done': function(_arg) {
        var fail, pass, test;
        test = _arg.test, pass = _arg.pass, fail = _arg.fail;
        return "--------------------------------------------------\n<- " + test + "  FAIL: " + fail + "  PASS: " + pass + "\n--------------------------------------------------\n";
      },
      'test.assert': function(_arg) {
        var actual, assert, expected, isPass, name, suite;
        suite = _arg.suite, name = _arg.test.name, assert = _arg.assert, isPass = _arg.isPass, expected = _arg.expected, actual = _arg.actual;
        if (!isPass) {
          return "    X " + (S(assert)) + "  " + (S(expected && ("\n      Expected: " + expected + "\n      Actual:   " + actual)));
        }
      }
    };
  };
  if (typeof define !== "undefined" && define !== null) {
    define(doDefine);
  } else {
    module.exports = doDefine();
  }
}).call(this);
