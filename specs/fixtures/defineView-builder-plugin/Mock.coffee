define (require)->
  MockNested = require 'dir/MockNested'

  require('cell/defineView!')
    renderEl: (__)-> [
      "Mock: "
      __ MockNested
    ]
