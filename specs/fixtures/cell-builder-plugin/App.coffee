define (require)->
  Mock = require './Mock'

  $ ->
    $('body').append new Mock().render().el