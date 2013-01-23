define (require)->
  MockNested = require 'dir/MockNested'

  require('cell/defineView!')
    render: (__)-> [
      "Mock: "
      __ MockNested
    ]
