define (require)->
  MockNested = require 'dir/MockNested'

  require('cell!')
    renderEl: (__)-> [
      "Mock: "
      __ MockNested
    ]
