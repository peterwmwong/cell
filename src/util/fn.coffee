define
  b: (f,o)-> -> f.apply o, arguments
  b0: (f,o)-> -> f.call o
  b1: (f,o)-> (a1)-> f.call o, a1
  b2: (f,o)-> (a1,a2)-> f.call o, a1, a2