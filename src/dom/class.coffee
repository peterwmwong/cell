define ->
  rclass = /[\t\r\n]/g
  trim = (s)-> s and s.replace /^\s+|\s+$/g, ''

  addClass: (element, className)->
    if className
      element.className =
        if element.className
          cur = " #{element.className} ".replace rclass, ' '
          if cur.indexOf " #{className} " < 0
            trim cur + className
          else
            element.className
        else
          className
    return

  removeClass: (element, className)->
    if className and element.className
      # http://jsperf.com/loop-dynregex-replace
      rx = new RegExp " #{className}", 'g'
      element.className = trim " #{element.className} ".replace rx, ''
    return

  hasClass: (element, className)->
    " #{element.className} ".replace(rclass, ' ').indexOf(" #{className} ") > -1
