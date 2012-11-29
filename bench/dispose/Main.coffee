# Current Results (in milliseconds)
#
# WITH jQuery.cleanData extension
# -------------------------------
#
# 25.990100000199163
# 28.196309998893412
# 28.4769199998118
# 25.232889999024337
# 30.083310000336496
# 25.408260000986047
# 28.569839999836404
#
# AVG: 27.422518571298237
#
#
# WITHOUT jQuery.cleanData extensions
# -----------------------------------
#
# 15.827569999964908
# 12.65501999980188
# 11.930740001698723
# 11.69597000014619
# 12.588630000682315
# 14.157160000759177
# 13.37469000092824
#
# AVG: 13.175682857711633
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