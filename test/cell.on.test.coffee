define ->

  "Event/Selector Handler '<event> <selector>': (ev:<Event>)->": ->
    target = undefined
    NewCell = cell.extend
      render: (_)-> [
        _ 'div',
          _ 'a#myId'
          _ '.myClass',
            (target = _ 'a#myId')
      ]
      on:
        'click div > .myClass > a#myId': handler = sinon.spy()

    instance = new NewCell()
    $(target).trigger event = $.Event('click')
    ok handler.calledOnce, 'called once'
    ok handler.calledWith(event), 'called with click event'
    strictEqual event.target, target, 'called with correct click event target'


  "Event (on cell.el) Handler '<event>': (ev:<Event>)->": ->
    target = undefined
    NewCell = cell.extend
      render: (_)-> [
        _ 'div',
          _ '.myClass',
            (target = _ 'a#myId')
      ]
      on:
        'click': handler = sinon.spy()

    instance = new NewCell()

    target = instance.el
    $(target).trigger event = $.Event('click')
    ok handler.calledOnce, 'called once'
    ok handler.alwaysCalledOn(instance), 'called with "this" set to cell instance'
    ok handler.getCall(0).calledWith(event), 'called with click event'
    strictEqual event.target, target, 'called with correct click event target'
    
    # Events bubble up as you would expect
    $(target).trigger event = $.Event('click')
    ok handler.calledTwice, 'called twice'
    ok handler.alwaysCalledOn(instance), 'called with "this" set to cell instance'
    ok handler.getCall(1).calledWith(event), 'called with click event'
    strictEqual event.target, target, 'called with correct click event target'


  "Multiple handlers '<event>': (ev:<Event>)->": ->
    clickTarget = undefined
    NewCell = cell.extend
      render: (_)-> [
        _ 'div',
          _ '.myClass',
            (clickTarget = _ 'a#myId')
      ]
      on:
        'mouseover': mouseoverHandler = sinon.spy()
        'click div > .myClass > a#myId': clickHandler = sinon.spy()

    instance = new NewCell()

    $(clickTarget).trigger clickEvent = $.Event('click')
    $(instance.el).trigger mouseoverEvent = $.Event('mouseover')

    ok clickHandler.calledOnce, 'clickHandler called once'
    ok clickHandler.calledWith(clickEvent), 'clickHandler called with click event'
    ok clickHandler.alwaysCalledOn(instance), 'called with "this" set to cell instance'
    strictEqual clickEvent.target, clickTarget, 'clickHandler called with correct click event target'
    
    ok mouseoverHandler.calledOnce, 'mouseoverHandler called once'
    ok mouseoverHandler.calledWith(mouseoverEvent), 'mouseoverHandler called with click event'
    ok mouseoverHandler.alwaysCalledOn(instance), 'called with "this" set to cell instance'
    strictEqual mouseoverEvent.target, instance.el, 'mouseoverHandler called with correct click event target'

