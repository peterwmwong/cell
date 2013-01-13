define (require)->
  Mock = require './Mock'
  $ = require 'jquery'
  Backbone = require 'backbone'
  Backbone.$ = $

  $(document.body).append new Mock().render().el