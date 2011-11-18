
  define(function() {
    return {
      "Event/Selector Handler '<event> <selector>': (ev:<Event>)->": function() {
        var NewCell, event, handler, instance, target;
        target = void 0;
        NewCell = cell.extend({
          render: function(_) {
            return [_('div', _('a#myId'), _('.myClass', (target = _('a#myId'))))];
          },
          on: {
            'click div > .myClass > a#myId': handler = sinon.spy()
          }
        });
        instance = new NewCell();
        $(target).trigger(event = $.Event('click'));
        ok(handler.calledOnce, 'called once');
        ok(handler.calledWith(event), 'called with click event');
        return strictEqual(event.target, target, 'called with correct click event target');
      },
      "Event (on cell.el) Handler '<event>': (ev:<Event>)->": function() {
        var NewCell, event, handler, instance, target;
        target = void 0;
        NewCell = cell.extend({
          render: function(_) {
            return [_('div', _('.myClass', (target = _('a#myId'))))];
          },
          on: {
            'click': handler = sinon.spy()
          }
        });
        instance = new NewCell();
        target = instance.el;
        $(target).trigger(event = $.Event('click'));
        ok(handler.calledOnce, 'called once');
        ok(handler.getCall(0).calledWith(event), 'called with click event');
        strictEqual(event.target, target, 'called with correct click event target');
        $(target).trigger(event = $.Event('click'));
        ok(handler.calledTwice, 'called twice');
        ok(handler.getCall(1).calledWith(event), 'called with click event');
        return strictEqual(event.target, target, 'called with correct click event target');
      },
      "Multiple handlers '<event>': (ev:<Event>)->": function() {
        var NewCell, clickEvent, clickHandler, clickTarget, instance, mouseoverEvent, mouseoverHandler;
        clickTarget = void 0;
        NewCell = cell.extend({
          render: function(_) {
            return [_('div', _('.myClass', (clickTarget = _('a#myId'))))];
          },
          on: {
            'mouseover': mouseoverHandler = sinon.spy(),
            'click div > .myClass > a#myId': clickHandler = sinon.spy()
          }
        });
        instance = new NewCell();
        $(clickTarget).trigger(clickEvent = $.Event('click'));
        $(instance.el).trigger(mouseoverEvent = $.Event('mouseover'));
        ok(clickHandler.calledOnce, 'clickHandler called once');
        ok(clickHandler.calledWith(clickEvent), 'clickHandler called with click event');
        strictEqual(clickEvent.target, clickTarget, 'clickHandler called with correct click event target');
        ok(mouseoverHandler.calledOnce, 'mouseoverHandler called once');
        ok(mouseoverHandler.calledWith(mouseoverEvent), 'mouseoverHandler called with click event');
        return strictEqual(mouseoverEvent.target, instance.el, 'mouseoverHandler called with correct click event target');
      }
    };
  });
