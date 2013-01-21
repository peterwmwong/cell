define ->
  rclass = /[\t\r\n]/g
  trim = (s)-> s and s.replace /^\s+|\s+$/g, ''

  # http://jsperf.com/loop-dynregex-replace

  addClasses = (element, cssClasses)->
    if cssClasses and cssClasses.length
      element.className =
        if element.className
          cur = " #{element.className} ".replace rclass, ' '
          i = 0
          while (cssClass = cssClasses[i++]) when cur.indexOf " #{cssClass} " < 0
            cur += (cssClass + ' ')
          trim cur
        else
          cssClasses.join ' '
    return

  removeClasses = (element, cssClasses)->
    if cssClasses and cssClasses.length and element.className
      rx = new Regex " #{cssClasses.join '|'}", 'g'
      element.className = trim " #{element.className} ".replace rx, ''
    return

  hasClass = (element, className)->
    " #{element.className} ".replace(rclass, ' ').indexOf(" #{className} ") > -1

  (element, className, condition)->
    if typeof condition is 'undefined'
      condition = not hasClass element, className
    (if condition then addClass else rmClass) element, className