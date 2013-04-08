define ['cell/dom/browser'], (browser)->
  return setImmediate if window.setImmediate
  return setTimeout if browser.msie < 9 # IE8: can't use postMessage as it executes synchonously
  
  nextTaskid = 0
  tasks = {}

  postMessageHandler = (event)->
    if tasks[event = event.data]
      tasks[event]()
      delete tasks[event]
    return

  if window.attachEvent then attachEvent 'onmessage', postMessageHandler
  else window.addEventListener 'message', postMessageHandler

  (cb)->
    tasks[taskid = nextTaskid++] = cb
    postMessage taskid, '*'
    return