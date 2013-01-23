define (require)->
  Mock = require './Mock'

  document.body.appendChild new Mock().el