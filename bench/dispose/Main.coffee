# Current Results (in milliseconds)
#
# WITH jQuery.cleanData extension
# -------------------------------
#
# 14.162520001700614
# 15.044810003601015
# 15.577769999508746
# 15.544000000518281
# 17.44920000055572
# 16.09385999996448
# 15.450130001700018
#
# AVG: 15.617470001078411
#
#
# WITHOUT jQuery.cleanData extensions
# -----------------------------------
#
# 11.041529997892212
# 11.21322999970289
# 12.42052999761654
# 11.271249997953419
# 11.384460000263061
# 14.26771000114968
# 15.733910000999458
#
# AVG: 12.476088570796751
#
# 
# OVERALL
# -------
#
# 2.081 times slower with extension
#
define (require)->
  Backbone = require 'backbone'
  cell = require 'cell'
  $ = require 'jquery'

  times = []

  benchModel = new Backbone.Model key1: 'val1'
  benchCollection = new Backbone.Collection()
  Bench1Cell = cell.Cell.extend
    name: 'Bench1'
    after_render: ->
      @model.on 'change:key1', (-> 'pww: model change:key1'), @
      @collection.on 'reset', (-> 'pww: collection reset'), @
    events:
      'click': -> 'pww: click event'

  run = (doTime)->
    $container = $ '<div>'
    # TODO: Does attaching it the document actually make a difference?
    #       There doesn't appear to be much difference in time on Chrome.
    # $('body').append $container

    i=1000
    while i-- > 0
      $container.append (new Bench1Cell model: benchModel, collection: benchCollection).render().$el

    start = window.performance.now()

    $container.remove()

    delta = window.performance.now() - start

    console.log delta
    times.push delta if doTime

  $ ->
    # debugger # Take Memory Snapshot Here!

    # Warmup
    j=10
    run false while j-- > 0

    # Go to work...
    j=100
    run true while j-- > 0

    $('body').html _.reduce(times, ((sum,el)-> sum+el), 0)/times.length

    return

  1