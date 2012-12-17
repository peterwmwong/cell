define (require)->
  __ = require '__'
  Mock = require './Mock'

  $ ->
    $('body').append new Mock().render().el