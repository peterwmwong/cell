
  define(['./util/helpers'], function(_arg) {
    var $R, NODE, nodeHTMLEquals, nodeToHTML, normalizeNode;
    nodeToHTML = _arg.nodeToHTML, normalizeNode = _arg.normalizeNode;
    $R = cell.prototype.$R;
    NODE = function(tag) {
      return document.createElement(tag);
    };
    nodeHTMLEquals = function(node, expectedHTML) {
      ok(node instanceof HTMLElement, "expected HTMLElement");
      return equal(nodeToHTML(node), expectedHTML, "expected " + expectedHTML);
    };
    return {
      "$R(<empty string, undefined, null, or function>)": function() {
        var invalid, _i, _len, _ref, _results;
        _ref = ['', void 0, null, (function() {})];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          invalid = _ref[_i];
          _results.push(equal($R(invalid), void 0, "" + (invalid === '' && '""' || invalid) + " results to undefined"));
        }
        return _results;
      },
      "$R(htmlTagString:<string>) HTML tag with attributes": function() {
        return nodeHTMLEquals($R('<p id="myid" class="myclass" data-custom="myattr">'), '<p class="myclass" data-custom="myattr" id="myid"></p>');
      },
      "$R(htmlTagString:<string>, children...:<DOM Nodes, strings, numbers, or arrays>) with children": function() {
        var child;
        return nodeHTMLEquals($R('<div>', NODE('span'), 'hello', (function() {
          var _i, _len, _ref, _results;
          _ref = [NODE('table'), 'world', 5, [NODE('div')]];
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            child = _ref[_i];
            _results.push(child);
          }
          return _results;
        })(), 0, NODE('a')), "<div><span></span>hello<table></table>world5<div></div>0<a></a></div>");
      },
      "$R(HAMLString:<string>) tag name, id, multiple classes": function() {
        return nodeHTMLEquals($R('p#myid.myclass.myclass2'), '<p class=" myclass myclass2" id="myid"></p>');
      },
      "$R(HAMLString:<string>, children...:<DOM Nodes, strings, numbers, or arrays>) with children": function() {
        var child;
        return nodeHTMLEquals($R('p#myid.myclass.myclass2', NODE('span'), 'hello', (function() {
          var _i, _len, _ref, _results;
          _ref = [NODE('table'), 'world', 5, [NODE('div')]];
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            child = _ref[_i];
            _results.push(child);
          }
          return _results;
        })(), 0, NODE('a')), '<p class=" myclass myclass2" id="myid"><span></span>hello<table></table>world5<div></div>0<a></a></p>');
      },
      "$R(HAMLString:<string>, children...:<NOT DOM NODES, STRINGS, NUMBERS, or ARRAYS>)": function() {
        return nodeHTMLEquals($R('p#myid.myclass.myclass2', void 0, null, (function() {})), '<p class=" myclass myclass2" id="myid"></p>');
      },
      "$R(HAMLString:<string>, attrMap:<object>) with attribute map": function() {
        return nodeHTMLEquals($R('p#myid.myclass.myclass2', {
          'data-custom': 'myattr',
          'data-custom2': 'myattr2'
        }), '<p class=" myclass myclass2" data-custom="myattr" data-custom2="myattr2" id="myid"></p>');
      },
      "$R(HAMLString:<string>, attrMap:<object>, children...:<DOM Nodes, strings, numbers, or arrays>) with attribute map and children": function() {
        var child;
        return nodeHTMLEquals($R('p', {
          'data-custom': 'myattr',
          'data-custom2': 'myattr2'
        }, NODE('span'), 'hello', (function() {
          var _i, _len, _ref, _results;
          _ref = [NODE('table'), 'world', 5, [NODE('div')]];
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            child = _ref[_i];
            _results.push(child);
          }
          return _results;
        })(), 0, NODE('a')), '<p data-custom="myattr" data-custom2="myattr2"><span></span>hello<table></table>world5<div></div>0<a></a></p>');
      },
      "$R(HAMLString:<string>, attrMap:<object>, children...:<NOT DOM NODES, STRINGS, NUMBERS, or ARRAYS>)": function() {
        return nodeHTMLEquals($R('p', {
          'data-custom': 'myattr',
          'data-custom2': 'myattr2'
        }, void 0, null, (function() {})), '<p data-custom="myattr" data-custom2="myattr2"></p>');
      }
    };
  });
