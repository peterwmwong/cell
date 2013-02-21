define
  isA: Array.isArray or (o)-> o instanceof Array
  isS: (o)-> typeof o is 'string'
  isF: (o)-> typeof o is 'function'
