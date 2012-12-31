define( [
  './utils/spec-utils',
  'underscore',
  'jquery',
  './utils/spec-matchers'
], function(specUtils, _, _jQuery, matchers) {
  var nodeHTMLEquals = specUtils.nodeHTMLEquals,
      stringify = specUtils.stringify,
      node = specUtils.node;

  return function(specContext) {
    var beforeEachRequire = specContext.beforeEachRequire;
    var dom, scope, a, b, c;
    var noop = function() {};
    var msie = Number((/msie (\d+)/.exec(lowercase(navigator.userAgent)) || [])[1]);
    function lowercase(string) { return _.isString(string) ? string.toLowerCase() : string; };
    function isElement(node) {
      return node &&
        (node.nodeName  // we are a direct element
        || (node.bind && node.find));  // we have a bind and find method part of jQuery API
    };

    if(msie < 9) {
      nodeName_ = function(element) {
        element = element.nodeName ? element : element[0];
        return(element.scopeName && element.scopeName != 'HTML') ? uppercase(element.scopeName + ':' + element.nodeName) : element.nodeName;
      };
    } else {
      nodeName_ = function(element) {
        return element.nodeName ? element.nodeName : element[0].nodeName;
      };
    }

    /**
     * Triggers a browser event. Attempts to choose the right event if one is
     * not specified.
     *
     * @param {Object} element Either a wrapped jQuery/dom node or a DOMElement
     * @param {string} type Optional event type.
     * @param {Array.<string>=} keys Optional list of pressed keys
     *        (valid values: 'alt', 'meta', 'shift', 'ctrl')
     */

    function browserTrigger(element, type, keys) {
      if(element && !element.nodeName) element = element[0];
      if(!element) return;
      if(!type) {
        type = {
          'text': 'change',
          'textarea': 'change',
          'hidden': 'change',
          'password': 'change',
          'button': 'click',
          'submit': 'click',
          'reset': 'click',
          'image': 'click',
          'checkbox': 'click',
          'radio': 'click',
          'select-one': 'change',
          'select-multiple': 'change'
        }[lowercase(element.type)] || 'click';
      }
      if(lowercase(nodeName_(element)) == 'option') {
        element.parentNode.value = element.value;
        element = element.parentNode;
        type = 'change';
      }

      keys = keys || [];

      function pressed(key) {
        return _.indexOf(keys, key) !== -1;
      }

      if(msie < 9) {
        switch(element.type) {
        case 'radio':
        case 'checkbox':
          element.checked = !element.checked;
          break;
        }
        // WTF!!! Error: Unspecified error.
        // Don't know why, but some elements when detached seem to be in inconsistent state and
        // calling .fireEvent() on them will result in very unhelpful error (Error: Unspecified error)
        // forcing the browser to compute the element position (by reading its CSS)
        // puts the element in consistent state.
        element.style.posLeft;

        // TODO(vojta): create event objects with pressed keys to get it working on IE<9
        var ret = element.fireEvent('on' + type);
        if(lowercase(element.type) == 'submit') {
          while(element) {
            if(lowercase(element.nodeName) == 'form') {
              element.fireEvent('onsubmit');
              break;
            }
            element = element.parentNode;
          }
        }
        return ret;
      } else {
        var evnt = document.createEvent('MouseEvents'),
          originalPreventDefault = evnt.preventDefault,
          iframe = _jQuery('#application iframe')[0],
          appWindow = iframe ? iframe.contentWindow : window,
          fakeProcessDefault = true,
          finalProcessDefault, angular = appWindow.angular || {};

        // igor: temporary fix for https://bugzilla.mozilla.org/show_bug.cgi?id=684208
        angular['ff-684208-preventDefault'] = false;
        evnt.preventDefault = function() {
          fakeProcessDefault = false;
          return originalPreventDefault.apply(evnt, arguments);
        };

        evnt.initMouseEvent(type, true, true, window, 0, 0, 0, 0, 0, pressed('ctrl'), pressed('alt'), pressed('shift'), pressed('meta'), 0, element);

        element.dispatchEvent(evnt);
        finalProcessDefault = !(angular['ff-684208-preventDefault'] || !fakeProcessDefault);

        delete angular['ff-684208-preventDefault'];

        return finalProcessDefault;
      }
    }

    function dealoc(obj) {
      var jqCache = dom.cache;
      if(obj) {
        if(isElement(obj)) {
          cleanup(dom(obj));
        } else {
          for(var key in jqCache) {
            var value = jqCache[key];
            if(value.data && value.data.$scope == obj) {
              delete jqCache[key];
            }
          }
        }
      }

      function cleanup(element) {
        element.unbind().removeData();
        for(var i = 0, children = element.children() || []; i < children.length; i++) {
          cleanup(dom(children[i]));
        }
      }
    };

    beforeEachRequire(['dom'], function(_dom) {
      dom = _dom;
      a = dom('<div>A</div>')[0];
      b = dom('<div>B</div>')[0];
      c = dom('<div>C</div>')[0];

      this.addMatchers({
        toDOMEqual: function(expected) {
          var msg = "Unequal length";
          this.message = function() {
            return msg;
          };

          var value = this.actual && expected && this.actual.length == expected.length;
          for(var i = 0; value && i < expected.length; i++) {
            var actual = dom(this.actual[i])[0];
            var expect = dom(expected[i])[0];
            value = value && _.isEqual(expect, actual);
            msg = "Not equal at index: " + i + " - Expected: " + expect + " - Actual: " + actual;
          }
          return value;
        }
      });

      this.addMatchers(matchers);

    });

    afterEach(function() {
      dealoc(a);
      dealoc(b);
      dealoc(c);
    });

    describe('construction', function() {
      it('should allow construction with text node', function() {
        var text = a.firstChild;
        var selected = dom(text);
        expect(selected.length).toEqual(1);
        expect(selected[0]).toEqual(text);
      });


      it('should allow construction with html', function() {
        var nodes = dom('<div>1</div><span>2</span>');
        expect(nodes.length).toEqual(2);
        expect(nodes[0].innerHTML).toEqual('1');
        expect(nodes[1].innerHTML).toEqual('2');
      });


      it('should allow creation of comment tags', function() {
        var nodes = dom('<!-- foo -->');
        expect(nodes.length).toBe(1);
        expect(nodes[0].nodeType).toBe(8);
      });


      it('should allow creation of script tags', function() {
        var nodes = dom('<script></script>');
        expect(nodes.length).toBe(1);
        expect(nodes[0].tagName.toUpperCase()).toBe('SCRIPT');
      });


      it('should wrap document fragment', function() {
        var fragment = dom(document.createDocumentFragment());
        expect(fragment.length).toBe(1);
        expect(fragment[0].nodeType).toBe(11);
      });
    });


    describe('data', function() {
      it('should set and get and remove data', function() {
        var selected = dom([a, b, c]);

        expect(selected.data('prop')).toBeUndefined();
        expect(selected.data('prop', 'value')).toBe(selected);
        expect(selected.data('prop')).toBe('value');
        expect(dom(a).data('prop')).toBe('value');
        expect(dom(b).data('prop')).toBe('value');
        expect(dom(c).data('prop')).toBe('value');

        dom(a).data('prop', 'new value');
        expect(dom(a).data('prop')).toBe('new value');
        expect(selected.data('prop')).toBe('new value');
        expect(dom(b).data('prop')).toBe('value');
        expect(dom(c).data('prop')).toBe('value');

        expect(selected.removeData('prop')).toBe(selected);
        expect(dom(a).data('prop')).toBeUndefined();
        expect(dom(b).data('prop')).toBeUndefined();
        expect(dom(c).data('prop')).toBeUndefined();
      });

      it('should retrieve all data if called without params', function() {
        var element = dom(a);
        expect(element.data()).toEqual({});

        element.data('foo', 'bar');
        expect(element.data()).toEqual({
          foo: 'bar'
        });

        element.data().baz = 'xxx';
        expect(element.data()).toEqual({
          foo: 'bar',
          baz: 'xxx'
        });
      });

      it('should create a new data object if called without args', function() {
        var element = dom(a),
          data = element.data();

        expect(data).toEqual({});
        element.data('foo', 'bar');
        expect(data).toEqual({
          foo: 'bar'
        });
      });

      it('should create a new data object if called with a single object arg', function() {
        var element = dom(a),
          newData = {
            foo: 'bar'
          };

        element.data(newData);
        expect(element.data()).toEqual({
          foo: 'bar'
        });
        expect(element.data()).not.toBe(newData); // create a copy
      });

      it('should merge existing data object with a new one if called with a single object arg', function() {
        var element = dom(a);
        element.data('existing', 'val');
        expect(element.data()).toEqual({
          existing: 'val'
        });

        var oldData = element.data(),
          newData = {
            meLike: 'turtles',
            'youLike': 'carrots'
          };

        expect(element.data(newData)).toBe(element);
        expect(element.data()).toEqual({
          meLike: 'turtles',
          youLike: 'carrots',
          existing: 'val'
        });
        expect(element.data()).toBe(oldData); // merge into the old object
      });

      describe('data cleanup', function() {
        it('should remove data on element removal', function() {
          var div = dom('<div><span>text</span></div>'),
            span = div.find('span');

          span.data('name', 'angular');
          span.remove();
          expect(span.data('name')).toBeUndefined();
        });

        it('should remove event listeners on element removal', function() {
          var div = dom('<div><span>text</span></div>'),
            span = div.find('span'),
            log = '';

          span.bind('click', function() {
            log += 'click;'
          });
          browserTrigger(span);
          expect(log).toEqual('click;');

          span.remove();

          browserTrigger(span);
          expect(log).toEqual('click;');
        });
      });
    });

    describe('attr*', function() {

      beforeEach(function(){
        this.selector = selector = dom([a, b]);
      });

      describe('removeAttr',function(){
        it('pending',function(){
          this.selector.removeAttr('prop');
          expect(dom(a).attr('prop')).toBeFalsy();
          expect(dom(b).attr('prop')).toBeFalsy();
        })
      });

      describe('attr() and attrSet()', function(){

        it('should get and set attributes',function(){
          var selector = dom([a, b]);

          expect(selector.attrSet('prop', 'value')).toEqual(selector);
          expect(dom(a).attr('prop')).toEqual('value');
          expect(dom(b).attr('prop')).toEqual('value');
        });

        it('should handle getting boolean attributes',function(){
          expect(dom('<select>').attr('multiple')).toBeUndefined();
          expect(dom('<select multiple>').attr('multiple')).toBe('multiple');
          expect(dom('<select multiple="">').attr('multiple')).toBe('multiple');
          expect(dom('<select multiple="x">').attr('multiple')).toBe('multiple');
        });

        it('should add/remove boolean attributes', function() {
          var select = dom('<select>');
          select.attrSet('multiple', false);
          expect(select.attr('multiple')).toBeUndefined();

          select.attrSet('multiple', true);
          expect(select.attr('multiple')).toBe('multiple');
        });

        it('should normalize the case of boolean attributes', function() {
          var input = dom('<input readonly>');
          expect(input.attr('readonly')).toBe('readonly');
          expect(input.attr('readOnly')).toBe('readonly');
          expect(input.attr('READONLY')).toBe('readonly');

          input.attrSet('readonly', false);

          // attr('readonly') fails in jQuery 1.6.4, so we have to bypass it
          //expect(input.attr('readOnly')).toBeUndefined();
          //expect(input.attr('readonly')).toBeUndefined();
          if(msie < 9) {
            expect(input[0].getAttribute('readonly')).toBe('');
          } else {
            expect(input[0].getAttribute('readonly')).toBe(null);
          }

          //expect('readOnly' in input[0].attributes).toBe(false);
          input.attrSet('readOnly', 'READonly');
          expect(input.attr('readonly')).toBe('readonly');
          expect(input.attr('readOnly')).toBe('readonly');
        });

        it('should return undefined for non-existing attributes', function() {
          var elm = dom('<div class="any">a</div>');
          expect(elm.attr('non-existing')).toBeUndefined();
        });

        it('should return undefined for non-existing attributes on input', function() {
          var elm = dom('<input>');
          expect(elm.attr('readonly')).toBeUndefined();
          expect(elm.attr('readOnly')).toBeUndefined();
          expect(elm.attr('disabled')).toBeUndefined();
        });

      });

      describe('attrAll() and attrSetAll()', function(){

        it('should get and set a bunch of attributes',function(){

          expect(selector.attrSetAll({
            'prop': 'new value',
            'prop2': '2new value'
          })).toEqual(selector);
          expect(dom(a).attr('prop')).toEqual('new value');
          expect(dom(a).attr('prop2')).toEqual('2new value');
          expect(dom(b).attr('prop')).toEqual('new value');
          expect(dom(b).attr('prop2')).toEqual('2new value');
          expect(dom(a).attrAll(['prop','prop2'])).toEqual({
            prop: 'new value',
            prop2: '2new value'
          });
          expect(dom(b).attrAll(['prop','prop2'])).toEqual({
            prop: 'new value',
            prop2: '2new value'
          });

          dom(b).attrSetAll({
            'prop': 'new value 2',
            'prop2': '2new value 2'
          });
          expect(dom(selector).attr('prop')).toEqual('new value');
          expect(dom(selector).attr('prop2')).toEqual('2new value');
          expect(dom(b).attr('prop')).toEqual('new value 2');
          expect(dom(b).attr('prop2')).toEqual('2new value 2');
          expect(dom(selector).attrAll(['prop','prop2'])).toEqual({
            prop: 'new value',
            prop2: '2new value'
          });
          expect(dom(b).attrAll(['prop','prop2'])).toEqual({
            prop: 'new value 2',
            prop2: '2new value 2'
          });
        });

      });

    });


    describe('prop', function() {
      it('should read element property', function() {
        var elm = dom('<div class="foo">a</div>');
        expect(elm.prop('className')).toBe('foo');
      });

      it('should set element property to a value', function() {
        var elm = dom('<div class="foo">a</div>');
        elm.prop('className', 'bar');
        expect(elm[0].className).toBe('bar');
        expect(elm.prop('className')).toBe('bar');
      });

      it('should set boolean element property', function() {
        var elm = dom('<input type="checkbox">');
        expect(elm.prop('checked')).toBe(false);

        elm.prop('checked', true);
        expect(elm.prop('checked')).toBe(true);

        elm.prop('checked', '');
        expect(elm.prop('checked')).toBe(false);

        elm.prop('checked', 'lala');
        expect(elm.prop('checked')).toBe(true);

        elm.prop('checked', null);
        expect(elm.prop('checked')).toBe(false);
      });
    });


    describe('class', function() {

      describe('hasClass', function() {
        it('should check class', function() {
          var selector = dom([a, b]);
          expect(selector.hasClass('abc')).toEqual(false);
        });


        it('should make sure that partial class is not checked as a subset', function() {
          var selector = dom([a, b]);
          selector.addClass('a');
          selector.addClass('b');
          selector.addClass('c');
          expect(selector.addClass('abc')).toEqual(selector);
          expect(selector.removeClass('abc')).toEqual(selector);
          expect(dom(a).hasClass('abc')).toEqual(false);
          expect(dom(b).hasClass('abc')).toEqual(false);
          expect(dom(a).hasClass('a')).toEqual(true);
          expect(dom(a).hasClass('b')).toEqual(true);
          expect(dom(a).hasClass('c')).toEqual(true);
        });
      });


      describe('addClass', function() {
        it('should allow adding of class', function() {
          var selector = dom([a, b]);
          expect(selector.addClass('abc')).toEqual(selector);
          expect(dom(a).hasClass('abc')).toEqual(true);
          expect(dom(b).hasClass('abc')).toEqual(true);
        });


        it('should ignore falsy values', function() {
          var domA = dom(a);
          expect(domA[0].className).toBe('');

          domA.addClass(undefined);
          expect(domA[0].className).toBe('');

          domA.addClass(null);
          expect(domA[0].className).toBe('');

          domA.addClass(false);
          expect(domA[0].className).toBe('');
        });


        it('should allow multiple classes to be added in a single string', function() {
          var domA = dom(a);
          expect(a.className).toBe('');

          domA.addClass('foo bar baz');
          expect(a.className).toBe('foo bar baz');
        });


        it('should not add duplicate classes', function() {
          var domA = dom(a);
          expect(a.className).toBe('');

          a.className = 'foo';
          domA.addClass('foo');
          expect(a.className).toBe('foo');

          domA.addClass('bar foo baz');
          expect(a.className).toBe('foo bar baz');
        });
      });


      describe('toggleClass', function() {
        it('should allow toggling of class', function() {
          var selector = dom([a, b]);
          expect(selector.toggleClass('abc')).toEqual(selector);
          expect(dom(a).hasClass('abc')).toEqual(true);
          expect(dom(b).hasClass('abc')).toEqual(true);

          expect(selector.toggleClass('abc')).toEqual(selector);
          expect(dom(a).hasClass('abc')).toEqual(false);
          expect(dom(b).hasClass('abc')).toEqual(false);

          expect(selector.toggleClass('abc'), true).toEqual(selector);
          expect(dom(a).hasClass('abc')).toEqual(true);
          expect(dom(b).hasClass('abc')).toEqual(true);

          expect(selector.toggleClass('abc'), false).toEqual(selector);
          expect(dom(a).hasClass('abc')).toEqual(false);
          expect(dom(b).hasClass('abc')).toEqual(false);

        });
      });


      describe('removeClass', function() {
        it('should allow removal of class', function() {
          var selector = dom([a, b]);
          expect(selector.addClass('abc')).toEqual(selector);
          expect(selector.removeClass('abc')).toEqual(selector);
          expect(dom(a).hasClass('abc')).toEqual(false);
          expect(dom(b).hasClass('abc')).toEqual(false);
        });


        it('should correctly remove middle class', function() {
          var element = dom('<div class="foo bar baz"></div>');
          expect(element.hasClass('bar')).toBe(true);

          element.removeClass('bar');

          expect(element.hasClass('foo')).toBe(true);
          expect(element.hasClass('bar')).toBe(false);
          expect(element.hasClass('baz')).toBe(true);
        });


        it('should remove multiple classes specified as one string', function() {
          var domA = dom(a);

          a.className = 'foo bar baz';
          domA.removeClass('foo baz noexistent');
          expect(a.className).toBe('bar');
        });
      });
    });


    describe('css*', function() {

      beforeEach(function(){
        this.selector = selector = dom([a, b]);
      });

      describe('css() and cssSet()',function(){

        it('should get and set css',function(){
          expect(this.selector.cssSet('margin', '1px')).toEqual(selector);
          expect(dom(a).css('margin')).toEqual('1px');
          expect(dom(b).css('margin')).toEqual('1px');

          selector.cssSet('margin', '');
          if(msie <= 8) {
            expect(dom(a).css('margin')).toBe('auto');
            expect(dom(b).css('margin')).toBe('auto');
          } else {
            expect(dom(a).css('margin')).toBeFalsy();
            expect(dom(b).css('margin')).toBeFalsy();
          }
        });

      });


      describe('cssAll() and cssSetAll()',function(){
        it('should get and set a bunch of css',function(){
          if(msie <= 8) {
            expect(dom(a).css('margin')).toBe('auto');
            expect(dom(a).css('padding')).toBe('0px');
            expect(dom(a).css('border')).toBeUndefined();
          } else {
            expect(dom(a).css('margin')).toBeFalsy();
            expect(dom(a).css('padding')).toBeFalsy();
            expect(dom(a).css('border')).toBeFalsy();
          }

          dom(a).cssSetAll({
            'margin': '1px',
            'padding': '2px',
            'border': ''
          });

          expect(dom(a).css('margin')).toBe('1px');
          expect(dom(a).css('padding')).toBe('2px');
          expect(dom(a).css('border')).toBeFalsy();

          var map = dom(a).cssAll(['margin','padding','border']);
          expect(map.margin).toBe('1px');
          expect(map.padding).toBe('2px');
          expect(map.border).toBeFalsy();
        });
      });


      it('should correctly handle dash-separated and camelCased properties', function() {
        var domA = dom(a);

        expect(domA.css('z-index')).toBeOneOf('', 'auto');
        expect(domA.css('zIndex')).toBeOneOf('', 'auto');

        domA.cssSetAll({
          'zIndex': 5
        });

        expect(domA.css('z-index')).toBeOneOf('5', 5);
        expect(domA.css('zIndex')).toBeOneOf('5', 5);

        domA.cssSetAll({
          'z-index': 7
        });

        expect(domA.css('z-index')).toBeOneOf('7', 7);
        expect(domA.css('zIndex')).toBeOneOf('7', 7);

        domA.cssSet('zIndex', 5);

        expect(domA.css('z-index')).toBeOneOf('5', 5);
        expect(domA.css('zIndex')).toBeOneOf('5', 5);

        domA.cssSet('z-index', 7);

        expect(domA.css('z-index')).toBeOneOf('7', 7);
        expect(domA.css('zIndex')).toBeOneOf('7', 7);

        expect(domA.cssAll(['z-index'])['z-index']).toBeOneOf('7', 7);
        expect(domA.cssAll(['zIndex'])['zIndex']).toBeOneOf('7', 7);
      });
    });


    describe('text', function() {
      it('should return null on empty', function() {
        expect(dom().length).toEqual(0);
        expect(dom().text()).toEqual('');
      });


      it('should read/write value', function() {
        var element = dom('<div>abc</div>');
        expect(element.length).toEqual(1);
        expect(element[0].innerHTML).toEqual('abc');
        expect(element.text()).toEqual('abc');
        expect(element.text('xyz') == element).toBeTruthy();
        expect(element.text()).toEqual('xyz');
      });
    });


    describe('val', function() {
      it('should read, write value', function() {
        var input = dom('<input type="text"/>');
        expect(input.val('abc')).toEqual(input);
        expect(input[0].value).toEqual('abc');
        expect(input.val()).toEqual('abc');
      });
    });


    describe('html', function() {
      it('should return null on empty', function() {
        expect(dom().length).toEqual(0);
        expect(dom().html()).toEqual(null);
      });


      it('should read/write value', function() {
        var element = dom('<div>abc</div>');
        expect(element.length).toEqual(1);
        expect(element[0].innerHTML).toEqual('abc');
        expect(element.html()).toEqual('abc');
        expect(element.html('xyz') == element).toBeTruthy();
        expect(element.html()).toEqual('xyz');
      });
    });


    describe('bind', function() {
      it('should bind to window on hashchange', function() {
        if(dom.fn) return; // don't run in jQuery
        var eventFn;
        var window = {
          document: {},
          location: {},
          alert: noop,
          setInterval: noop,
          length: 10,
          // pretend you are an array
          addEventListener: function(type, fn) {
            expect(type).toEqual('hashchange');
            eventFn = fn;
          },
          removeEventListener: noop,
          attachEvent: function(type, fn) {
            expect(type).toEqual('onhashchange');
            eventFn = fn;
          },
          detachEvent: noop
        };
        var log;
        var jWindow = dom(window).bind('hashchange', function() {
          log = 'works!';
        });
        eventFn({
          type: 'hashchange'
        });
        expect(log).toEqual('works!');
        dealoc(jWindow);
      });


      it('should bind to all elements and return functions', function() {
        var selected = dom([a, b]);
        var log = '';
        expect(selected.bind('click', function() {
          log += 'click on: ' + dom(this).text() + ';';
        })).toEqual(selected);
        browserTrigger(a, 'click');
        expect(log).toEqual('click on: A;');
        browserTrigger(b, 'click');
        expect(log).toEqual('click on: A;click on: B;');
      });

      it('should bind to all events separated by space', function() {
        var elm = dom(a),
          callback = jasmine.createSpy('callback');

        elm.bind('click keypress', callback);
        elm.bind('click', callback);

        browserTrigger(a, 'click');
        expect(callback).toHaveBeenCalled();
        expect(callback.callCount).toBe(2);

        callback.reset();
        browserTrigger(a, 'keypress');
        expect(callback).toHaveBeenCalled();
        expect(callback.callCount).toBe(1);
      });

      it('should set event.target on IE', function() {
        var elm = dom(a);
        elm.bind('click', function(event) {
          expect(event.target).toBe(a);
        });

        browserTrigger(a, 'click');
      });

      it('should have event.isDefaultPrevented method', function() {
        dom(a).bind('click', function(e) {
          expect(function() {
            expect(e.isDefaultPrevented()).toBe(false);
            e.preventDefault();
            expect(e.isDefaultPrevented()).toBe(true);
          }).not.toThrow();
        });

        browserTrigger(a, 'click');
      });

      describe('mouseenter-mouseleave', function() {
        var root, parent, sibling, child, log;

        beforeEach(function() {
          log = '';
          root = dom('<div>root<p>parent<span>child</span></p><ul></ul></div>');
          parent = root.find('p');
          sibling = root.find('ul');
          child = parent.find('span');

          parent.bind('mouseenter', function() {
            log += 'parentEnter;';
          });
          parent.bind('mouseleave', function() {
            log += 'parentLeave;';
          });
          parent.mouseover = function() {
            browserTrigger(parent, 'mouseover');
          };
          parent.mouseout = function() {
            browserTrigger(parent, 'mouseout');
          };

          child.bind('mouseenter', function() {
            log += 'childEnter;';
          });
          child.bind('mouseleave', function() {
            log += 'childLeave;';
          });
          child.mouseover = function() {
            browserTrigger(child, 'mouseover');
          };
          child.mouseout = function() {
            browserTrigger(child, 'mouseout');
          };
        });

        afterEach(function() {
          dealoc(root);
        });

        it('should fire mouseenter when coming from outside the browser window', function() {
          if(window.jQuery) return;
          parent.mouseover();
          expect(log).toEqual('parentEnter;');

          child.mouseover();
          expect(log).toEqual('parentEnter;childEnter;');
          child.mouseover();
          expect(log).toEqual('parentEnter;childEnter;');

          child.mouseout();
          expect(log).toEqual('parentEnter;childEnter;');
          child.mouseout();
          expect(log).toEqual('parentEnter;childEnter;childLeave;');
          parent.mouseout();
          expect(log).toEqual('parentEnter;childEnter;childLeave;parentLeave;');
        });
      });
    });


    describe('unbind', function() {
      it('should do nothing when no listener was registered with bound', function() {
        var aElem = dom(a);

        aElem.unbind();
        aElem.unbind('click');
        aElem.unbind('click', function() {});
      });


      it('should deregister all listeners', function() {
        var aElem = dom(a),
          clickSpy = jasmine.createSpy('click'),
          mouseoverSpy = jasmine.createSpy('mouseover');

        aElem.bind('click', clickSpy);
        aElem.bind('mouseover', mouseoverSpy);

        browserTrigger(a, 'click');
        expect(clickSpy).toHaveBeenCalledOnce();
        browserTrigger(a, 'mouseover');
        expect(mouseoverSpy).toHaveBeenCalledOnce();

        clickSpy.reset();
        mouseoverSpy.reset();

        aElem.unbind();

        browserTrigger(a, 'click');
        expect(clickSpy).not.toHaveBeenCalled();
        browserTrigger(a, 'mouseover');
        expect(mouseoverSpy).not.toHaveBeenCalled();
      });


      it('should deregister listeners for specific type', function() {
        var aElem = dom(a),
          clickSpy = jasmine.createSpy('click'),
          mouseoverSpy = jasmine.createSpy('mouseover');

        aElem.bind('click', clickSpy);
        aElem.bind('mouseover', mouseoverSpy);

        browserTrigger(a, 'click');
        expect(clickSpy).toHaveBeenCalledOnce();
        browserTrigger(a, 'mouseover');
        expect(mouseoverSpy).toHaveBeenCalledOnce();

        clickSpy.reset();
        mouseoverSpy.reset();

        aElem.unbind('click');

        browserTrigger(a, 'click');
        expect(clickSpy).not.toHaveBeenCalled();
        browserTrigger(a, 'mouseover');
        expect(mouseoverSpy).toHaveBeenCalledOnce();

        mouseoverSpy.reset();

        aElem.unbind('mouseover');
        browserTrigger(a, 'mouseover');
        expect(mouseoverSpy).not.toHaveBeenCalled();
      });


      it('should deregister specific listener', function() {
        var aElem = dom(a),
          clickSpy1 = jasmine.createSpy('click1'),
          clickSpy2 = jasmine.createSpy('click2');

        aElem.bind('click', clickSpy1);
        aElem.bind('click', clickSpy2);

        browserTrigger(a, 'click');
        expect(clickSpy1).toHaveBeenCalledOnce();
        expect(clickSpy2).toHaveBeenCalledOnce();

        clickSpy1.reset();
        clickSpy2.reset();

        aElem.unbind('click', clickSpy1);

        browserTrigger(a, 'click');
        expect(clickSpy1).not.toHaveBeenCalled();
        expect(clickSpy2).toHaveBeenCalledOnce();

        clickSpy2.reset();

        aElem.unbind('click', clickSpy2);
        browserTrigger(a, 'click');
        expect(clickSpy2).not.toHaveBeenCalled();
      });
    });


    describe('replaceWith', function() {
      it('should replaceWith', function() {
        var root = dom('<div>').html('before-<div></div>after');
        var div = root.find('div');
        expect(div.replaceWith('<span>span-</span><b>bold-</b>')).toEqual(div);
        expect(root.text()).toEqual('before-span-bold-after');
      });


      it('should replaceWith text', function() {
        var root = dom('<div>').html('before-<div></div>after');
        var div = root.find('div');
        expect(div.replaceWith('text-')).toEqual(div);
        expect(root.text()).toEqual('before-text-after');
      });
    });


    describe('children', function() {
      it('should select non-text children', function() {
        var root = dom('<div>').html('before-<div></div>after-<span></span>');
        var div = root.find('div');
        var span = root.find('span');
        expect(root.children()).toDOMEqual([div, span]);
      });
    });


    describe('contents', function() {
      it('should select all children nodes', function() {
        var root = dom('<div>').html('before-<div></div>after-<span></span>');
        var contents = root.contents();
        expect(contents.length).toEqual(4);
        expect(dom(contents[0]).text()).toEqual('before-');
      });
    });


    describe('append', function() {
      it('should append', function() {
        var root = dom('<div>');
        expect(root.append('<span>abc</span>')).toEqual(root);
        expect(root.html().toLowerCase()).toEqual('<span>abc</span>');
      });
      it('should append text', function() {
        var root = dom('<div>');
        expect(root.append('text')).toEqual(root);
        expect(root.html()).toEqual('text');
      });
      it('should append to document fragment', function() {
        var root = dom(document.createDocumentFragment());
        expect(root.append('<p>foo</p>')).toBe(root);
        expect(root.children().length).toBe(1);
      });
      it('should not append anything if parent node is not of type element or docfrag', function() {
        var root = dom('<p>some text node</p>').contents();
        expect(root.append('<p>foo</p>')).toBe(root);
        expect(root.children().length).toBe(0);
      });
    });


    describe('wrap', function() {
      it('should wrap text node', function() {
        var root = dom('<div>A&lt;a&gt;B&lt;/a&gt;C</div>');
        var text = root.contents();
        expect(text.wrap("<span>")[0]).toBe(text[0]);
        expect(root.find('span').text()).toEqual('A<a>B</a>C');
      });
      it('should wrap free text node', function() {
        var root = dom('<div>A&lt;a&gt;B&lt;/a&gt;C</div>');
        var text = root.contents();
        text.remove();
        expect(root.text()).toBe('');

        text.wrap("<span>");
        expect(text.parent().text()).toEqual('A<a>B</a>C');
      });
    });


    describe('prepend', function() {
      it('should prepend to empty', function() {
        var root = dom('<div>');
        expect(root.prepend('<span>abc</span>')).toEqual(root);
        expect(root.html().toLowerCase()).toEqual('<span>abc</span>');
      });
      it('should prepend to content', function() {
        var root = dom('<div>text</div>');
        expect(root.prepend('<span>abc</span>')).toEqual(root);
        expect(root.html().toLowerCase()).toEqual('<span>abc</span>text');
      });
      it('should prepend text to content', function() {
        var root = dom('<div>text</div>');
        expect(root.prepend('abc')).toEqual(root);
        expect(root.html().toLowerCase()).toEqual('abctext');
      });
    });


    describe('remove', function() {
      it('should remove', function() {
        var root = dom('<div><span>abc</span></div>');
        var span = root.find('span');
        expect(span.remove()).toEqual(span);
        expect(root.html()).toEqual('');
      });
    });


    describe('after', function() {
      it('should after', function() {
        var root = dom('<div><span></span></div>');
        var span = root.find('span');
        expect(span.after('<i></i><b></b>')).toEqual(span);
        expect(root.html().toLowerCase()).toEqual('<span></span><i></i><b></b>');
      });


      it('should allow taking text', function() {
        var root = dom('<div><span></span></div>');
        var span = root.find('span');
        span.after('abc');
        expect(root.html().toLowerCase()).toEqual('<span></span>abc');
      });
    });


    describe('parent', function() {
      it('should return parent or an empty set when no parent', function() {
        var parent = dom('<div><p>abc</p></div>'),
          child = parent.find('p');

        expect(parent.parent()).toBeTruthy();
        expect(parent.parent().length).toEqual(0);

        expect(child.parent().length).toBe(1);
        expect(child.parent()[0]).toBe(parent[0]);
      });


      it('should return empty set when no parent', function() {
        var element = dom('<div>abc</div>');
        expect(element.parent()).toBeTruthy();
        expect(element.parent().length).toEqual(0);
      });


      it('should return empty dom object when parent is a document fragment', function() {
        //this is quite unfortunate but jQuery 1.5.1 behaves this way
        var fragment = document.createDocumentFragment(),
          child = dom('<p>foo</p>');

        fragment.appendChild(child[0]);
        expect(child[0].parentNode).toBe(fragment);
        expect(child.parent().length).toBe(0);
      });
    });


    describe('next', function() {
      it('should return next sibling', function() {
        var element = dom('<div><b>b</b><i>i</i></div>');
        var b = element.find('b');
        var i = element.find('i');
        expect(b.next()).toDOMEqual([i]);
      });
    });


    describe('find', function() {
      it('should find child by name', function() {
        var root = dom('<div><div>text</div></div>');
        var innerDiv = root.find('div');
        expect(innerDiv.length).toEqual(1);
        expect(innerDiv.html()).toEqual('text');
      });
    });


    describe('eq', function() {
      it('should select the nth element ', function() {
        var element = dom('<div><span>aa</span></div><div><span>bb</span></div>');
        expect(element.find('span').eq(0).html()).toBe('aa');
        expect(element.find('span').eq(-1).html()).toBe('bb');
        expect(element.find('span').eq(20).length).toBe(0);
      });
    });


    describe('triggerHandler', function() {
      it('should trigger all registered handlers for an event', function() {
        var element = dom('<span>poke</span>'),
          pokeSpy = jasmine.createSpy('poke'),
          clickSpy1 = jasmine.createSpy('clickSpy1'),
          clickSpy2 = jasmine.createSpy('clickSpy2');

        element.bind('poke', pokeSpy);
        element.bind('click', clickSpy1);
        element.bind('click', clickSpy2);

        expect(pokeSpy).not.toHaveBeenCalled();
        expect(clickSpy1).not.toHaveBeenCalled();
        expect(clickSpy2).not.toHaveBeenCalled();

        element.triggerHandler('poke');
        expect(pokeSpy).toHaveBeenCalledOnce();
        expect(clickSpy1).not.toHaveBeenCalled();
        expect(clickSpy2).not.toHaveBeenCalled();

        element.triggerHandler('click');
        expect(clickSpy1).toHaveBeenCalledOnce();
        expect(clickSpy2).toHaveBeenCalledOnce();
      });
    });


    describe('camelCase', function() {

      it('should leave non-dashed strings alone', function() {
        expect(dom.prototype.camelCase('foo')).toBe('foo');
        expect(dom.prototype.camelCase('')).toBe('');
        expect(dom.prototype.camelCase('fooBar')).toBe('fooBar');
      });


      it('should covert dash-separated strings to camelCase', function() {
        expect(dom.prototype.camelCase('foo-bar')).toBe('fooBar');
        expect(dom.prototype.camelCase('foo-bar-baz')).toBe('fooBarBaz');
        expect(dom.prototype.camelCase('foo:bar_baz')).toBe('fooBarBaz');
      });


      it('should covert browser specific css properties', function() {
        expect(dom.prototype.camelCase('-moz-foo-bar')).toBe('MozFooBar');
        expect(dom.prototype.camelCase('-webkit-foo-bar')).toBe('webkitFooBar');
        expect(dom.prototype.camelCase('-webkit-foo-bar')).toBe('webkitFooBar');
      })
    });

  }
});